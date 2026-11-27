/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - COORDINATOR ROUTES
 * ============================================================================
 * 
 * Provides:
 * - GET    /api/coordinator/dashboard              - Department placement stats and metrics.
 * - GET    /api/coordinator/students               - Department student directory.
 * - POST   /api/coordinator/students               - Register single student candidate.
 * - PATCH  /api/coordinator/students/:id           - Update student academic / contact details.
 * - DELETE /api/coordinator/students/:id           - Cascade-delete student candidate.
 * - POST   /api/coordinator/students/:id/reset-password - Reset password to university reg no.
 * - GET    /api/coordinator/jobs                   - Eligible drives targeting this department.
 * - GET    /api/coordinator/applied-students       - Department candidate applications.
 * - GET    /api/coordinator/selected-students-report - Selected candidates report.
 * - GET    /api/coordinator/applied-students/export - Export department applications (.xlsx).
 * - GET    /api/coordinator/selected-students-report/export - Export selected candidates (.xlsx).
 * - CRUD   /api/coordinator/announcements          - Department-level student announcements.
 * - GET    /api/coordinator/admin-announcements    - Notices received from placement administration.
 * - Bulk Import:
 *   - GET  /upload/template                        - Download blank .xlsx import template.
 *   - POST /upload/preview                         - Upload and parse batch with in-memory validation.
 *   - POST /upload/confirm/:id                     - Commit batch with parallel password hashing.
 *   - GET  /upload/history                         - List past import batches.
 *   - GET  /upload/errors/:id                      - Export error report (.xlsx).
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';
import multer from 'multer';
import {
  db,
  asyncRoute,
  fail,
  required,
  emailOf,
  cleaned,
  integer,
  audit
} from '../lib/core.js';
import { coordinatorDept } from '../middleware/auth.js';
import { makeStudentActivation } from './auth.js';
import {
  workbookResponse,
  loadWorkbook,
  studentHeaders,
  applicationRow,
  applicationInclude
} from '../lib/excel.js';
import { availableJobsWhere, jobInclude } from '../lib/jobs.js';
import {
  announcementInclude,
  coordinatorAdminAnnouncementsWhere,
  cleanupFileAsset
} from '../lib/announcements.js';

const r = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }
});

const studentInclude = {
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true
    }
  },
  department: true,
  programme: true,
  _count: {
    select: { applications: true }
  }
};

/**
 * Validates a single student row from manual entry or Excel spreadsheet import.
 */
function validateStudent(row, programmes, department) {
  const errors = [];
  let email = '';
  let registrationNo = '';
  let name = '';
  let phone = '';
  let passingYear = 0;
  let level = '';
  let programmeId = '';

  try {
    registrationNo = required(row.UniversityRegNo, 'Registration number', 50);
  } catch (e) {
    errors.push(e.message);
  }

  try {
    name = required(row.Name, 'Name', 191);
  } catch (e) {
    errors.push(e.message);
  }

  try {
    email = emailOf(row.Email);
  } catch (e) {
    errors.push(e.message);
  }

  phone = cleaned(row.Phone, 30);
  level = cleaned(row['UG/PG'], 2).toUpperCase();

  if (!['UG', 'PG'].includes(level)) {
    errors.push('UG/PG must be UG or PG');
  }

  passingYear = Number(row.PassedOutYear);
  if (!Number.isInteger(passingYear) || passingYear < 2000 || passingYear > 2120) {
    errors.push('Invalid passing-out year');
  }

  const givenDept = cleaned(row.Department).toLowerCase();
  if (
    givenDept &&
    givenDept !== department.name.toLowerCase() &&
    givenDept !== (department.code || '').toLowerCase()
  ) {
    errors.push('Wrong department');
  }

  const programme = programmes.find(
    (p) =>
      p.name.toLowerCase() === cleaned(row.Programme).toLowerCase() ||
      (p.code && p.code.toLowerCase() === cleaned(row.Programme).toLowerCase())
  );

  if (!programme || programme.level !== level) {
    errors.push('Programme does not belong to your department or level');
  } else {
    programmeId = programme.id;
  }

  return {
    registrationNo,
    name,
    email,
    phone,
    passingYear,
    level,
    programmeId,
    errors
  };
}

/**
 * Persists a new student user and student record into the database.
 */
async function createStudent(tx, row, departmentId, customPassword = null, precomputedHash = null) {
  const tempPassword = String(customPassword || row.password || row.registrationNo);
  const passwordHash = precomputedHash || (await bcrypt.hash(tempPassword, 10));

  const user = await tx.user.create({
    data: {
      email: row.email,
      fullName: row.name,
      role: 'STUDENT',
      status: 'ACTIVE',
      passwordHash,
      mustChangePassword: true,
      student: {
        create: {
          registrationNo: row.registrationNo,
          departmentId,
          programmeId: row.programmeId,
          level: row.level,
          passingYear: row.passingYear,
          phone: row.phone || null
        }
      }
    }
  });

  return {
    id: user.id,
    registrationNo: row.registrationNo,
    email: row.email,
    tempPassword
  };
}

// ----------------------------------------------------------------------------
// 1. COORDINATOR DASHBOARD
// ----------------------------------------------------------------------------
r.get(
  '/dashboard',
  asyncRoute(async (req, res) => {
    const dept = coordinatorDept(req);
    const [students, applications, selected, programmes, eligibleJobs] = await Promise.all([
      db.student.count({ where: { departmentId: dept } }),
      db.application.count({ where: { student: { departmentId: dept } } }),
      db.application.findMany({
        where: { status: 'SELECTED', student: { departmentId: dept } },
        include: { student: true }
      }),
      db.programme.findMany({ where: { departmentId: dept } }),
      db.job.findMany({
        where: {
          ...availableJobsWhere(),
          OR: [{ departments: { none: {} } }, { departments: { some: { departmentId: dept } } }]
        },
        include: { programmes: true, years: true }
      })
    ]);

    const studentRows = await db.student.findMany({
      where: { departmentId: dept },
      select: { id: true, programmeId: true, passingYear: true }
    });

    const eligibleStudents = studentRows.filter((s) =>
      eligibleJobs.some(
        (j) =>
          (!j.programmes.length || j.programmes.some((p) => p.programmeId === s.programmeId)) &&
          (!j.years.length || j.years.some((y) => y.year === s.passingYear))
      )
    ).length;

    const placed = new Set(selected.map((a) => a.studentId));

    res.json({
      stats: {
        students,
        applications,
        placed: placed.size,
        eligibleStudents,
        activeJobs: eligibleJobs.length,
        placementPercentage: students ? Math.round((placed.size / students) * 10000) / 100 : 0
      },
      byProgramme: programmes.map((p) => ({
        name: p.name,
        students: studentRows.filter((s) => s.programmeId === p.id).length,
        placed: new Set(
          selected.filter((a) => a.student.programmeId === p.id).map((a) => a.studentId)
        ).size
      }))
    });
  })
);

// ----------------------------------------------------------------------------
// 2. STUDENT DIRECTORY & CRUD
// ----------------------------------------------------------------------------
r.get(
  '/students',
  asyncRoute(async (req, res) => {
    const students = await db.student.findMany({
      where: { departmentId: coordinatorDept(req) },
      include: studentInclude,
      orderBy: { user: { fullName: 'asc' } }
    });
    res.json(students);
  })
);

r.post(
  '/students',
  asyncRoute(async (req, res) => {
    const dept = coordinatorDept(req);
    const department = await db.department.findUnique({
      where: { id: dept },
      include: { programmes: { where: { active: true } } }
    });

    const programme = department.programmes.find((p) => p.id === req.body.programmeId);
    const validated = validateStudent(
      {
        ...req.body,
        UniversityRegNo: req.body.registrationNo,
        Name: req.body.name,
        Email: req.body.email,
        Phone: req.body.phone,
        PassedOutYear: req.body.passingYear,
        'UG/PG': req.body.level,
        Programme: programme?.name,
        Department: department.name
      },
      department.programmes,
      department
    );

    if (validated.errors.length) {
      fail(400, validated.errors.join('; '));
    }

    const result = await db.$transaction((tx) =>
      createStudent(tx, validated, dept, req.body.password)
    );

    await audit(req.user.id, 'CREATE', 'student', result.id);
    res.status(201).json({
      message: `Student added successfully. Initial temporary password is: ${result.tempPassword}. First-time login will prompt password change.`,
      ...result
    });
  })
);

r.patch(
  '/students/:id',
  asyncRoute(async (req, res) => {
    const dept = coordinatorDept(req);
    const student = await db.student.findFirst({
      where: { id: req.params.id, departmentId: dept }
    });
    if (!student) fail(404, 'Student not found');

    const programme = await db.programme.findFirst({
      where: { id: req.body.programmeId, departmentId: dept, active: true }
    });
    if (!programme || programme.level !== req.body.level) {
      fail(400, 'Programme/level mismatch');
    }

    await db.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: student.id },
        data: {
          registrationNo: required(req.body.registrationNo, 'Registration number', 50),
          programmeId: programme.id,
          passingYear: integer(req.body.passingYear, 'Year'),
          level: programme.level,
          phone: cleaned(req.body.phone, 30)
        }
      });
      await tx.user.update({
        where: { id: student.userId },
        data: {
          fullName: required(req.body.name, 'Name'),
          email: emailOf(req.body.email),
          ...(req.body.status === 'DISABLED' ? { status: 'DISABLED' } : {})
        }
      });
    });

    await audit(req.user.id, 'UPDATE', 'student', student.id);
    res.json({ message: 'Student updated' });
  })
);

r.delete(
  '/students/:id',
  asyncRoute(async (req, res) => {
    const student = await db.student.findFirst({
      where: { id: req.params.id, departmentId: coordinatorDept(req) }
    });
    if (!student) fail(404, 'Student not found');

    await db.$transaction(async (tx) => {
      const apps = await tx.application.findMany({
        where: { studentId: student.id },
        select: { id: true }
      });
      if (apps.length) {
        await tx.applicationHistory.deleteMany({
          where: { applicationId: { in: apps.map((a) => a.id) } }
        });
        await tx.application.deleteMany({
          where: { id: { in: apps.map((a) => a.id) } }
        });
      }
      await tx.education.deleteMany({ where: { studentId: student.id } });
      await tx.studentSkill.deleteMany({ where: { studentId: student.id } });
      await tx.studentProject.deleteMany({ where: { studentId: student.id } });
      await tx.internship.deleteMany({ where: { studentId: student.id } });
      await tx.experience.deleteMany({ where: { studentId: student.id } });
      await tx.certificate.deleteMany({ where: { studentId: student.id } });
      await tx.resume.deleteMany({ where: { studentId: student.id } });
      await tx.fileAsset.deleteMany({
        where: { OR: [{ ownerType: 'STUDENT' }, { ownerId: student.id }] }
      });
      await tx.student.delete({ where: { id: student.id } });
      await tx.user.delete({ where: { id: student.userId } });
    });

    await audit(req.user.id, 'DELETE', 'student', student.id);
    res.json({ message: 'Student record deleted successfully' });
  })
);

r.post(
  '/students/:id/reset-password',
  asyncRoute(async (req, res) => {
    const student = await db.student.findFirst({
      where: { id: req.params.id, departmentId: coordinatorDept(req) },
      include: { user: true }
    });
    if (!student) fail(404, 'Student not found');

    const tempPassword = student.registrationNo;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await db.user.update({
      where: { id: student.userId },
      data: { passwordHash, mustChangePassword: true, status: 'ACTIVE' }
    });

    await audit(req.user.id, 'RESET_PASSWORD', 'student', student.id);
    res.json({ message: `Password reset to registration number: ${tempPassword}` });
  })
);

r.post(
  '/students/:id/reissue-activation',
  asyncRoute(async (req, res) => {
    const student = await db.student.findFirst({
      where: { id: req.params.id, departmentId: coordinatorDept(req) },
      include: { user: true }
    });
    if (!student) fail(404, 'Student not found');

    const tempPassword = student.registrationNo;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await db.user.update({
      where: { id: student.userId },
      data: { passwordHash, mustChangePassword: true, status: 'ACTIVE' }
    });

    await audit(req.user.id, 'RESET_PASSWORD', 'student', student.id);
    res.json({ message: `Password reset to registration number: ${tempPassword}` });
  })
);

// ----------------------------------------------------------------------------
// 3. DEPARTMENT JOBS & APPLICATIONS
// ----------------------------------------------------------------------------
r.get(
  '/jobs',
  asyncRoute(async (req, res) => {
    const dept = coordinatorDept(req);
    const jobs = await db.job.findMany({
      where: {
        ...availableJobsWhere(),
        OR: [{ departments: { none: {} } }, { departments: { some: { departmentId: dept } } }]
      },
      include: jobInclude,
      orderBy: { deadline: 'asc' }
    });
    res.json(jobs);
  })
);

r.get(
  '/applied-students',
  asyncRoute(async (req, res) => {
    const applications = await db.application.findMany({
      where: { student: { departmentId: coordinatorDept(req) } },
      include: applicationInclude,
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  })
);

r.get(
  '/selected-students-report',
  asyncRoute(async (req, res) => {
    const rows = await db.application.findMany({
      where: { status: 'SELECTED', student: { departmentId: coordinatorDept(req) } },
      include: applicationInclude,
      orderBy: { selectedAt: 'desc' }
    });

    res.json({
      uniquePlaced: new Set(rows.map((a) => a.studentId)).size,
      totalOffers: rows.length,
      rows: rows.map((a) => ({
        ...applicationRow(a),
        id: a.id,
        package: a.job.salaryMax
      }))
    });
  })
);

r.get(
  '/applied-students/export',
  asyncRoute(async (req, res) => {
    const apps = await db.application.findMany({
      where: { student: { departmentId: coordinatorDept(req) } },
      include: applicationInclude
    });
    await workbookResponse(res, 'department_applied_students', studentHeaders, apps.map(applicationRow));
  })
);

r.get(
  '/selected-students-report/export',
  asyncRoute(async (req, res) => {
    const apps = await db.application.findMany({
      where: { status: 'SELECTED', student: { departmentId: coordinatorDept(req) } },
      include: applicationInclude
    });
    await workbookResponse(res, 'department_selected_students', studentHeaders, apps.map(applicationRow));
  })
);

// ----------------------------------------------------------------------------
// 4. ANNOUNCEMENTS
// ----------------------------------------------------------------------------
async function resolveAttachment(attachmentFileId, userId) {
  if (!attachmentFileId) {
    return { attachmentFileId: null, attachmentName: null, attachmentMime: null };
  }
  const file = await db.fileAsset.findFirst({
    where: { id: String(attachmentFileId), purpose: 'announcement', ownerId: userId }
  });
  if (!file) fail(400, 'Attached file not found or invalid');
  return {
    attachmentFileId: file.id,
    attachmentName: file.originalName,
    attachmentMime: file.mimeType
  };
}

r.get(
  '/announcements',
  asyncRoute(async (req, res) => {
    const announcements = await db.announcement.findMany({
      where: { audience: 'DEPARTMENT_STUDENTS', departmentId: coordinatorDept(req) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(announcements);
  })
);

r.post(
  '/announcements',
  asyncRoute(async (req, res) => {
    const attachment = await resolveAttachment(req.body.attachmentFileId, req.user.id);
    const a = await db.announcement.create({
      data: {
        audience: 'DEPARTMENT_STUDENTS',
        authorUserId: req.user.id,
        departmentId: coordinatorDept(req),
        title: required(req.body.title, 'Title'),
        body: required(req.body.body, 'Message', 10000),
        published: req.body.published !== false,
        ...attachment
      }
    });
    res.status(201).json(a);
  })
);

r.patch(
  '/announcements/:id',
  asyncRoute(async (req, res) => {
    const a = await db.announcement.findFirst({
      where: {
        id: req.params.id,
        authorUserId: req.user.id,
        departmentId: coordinatorDept(req),
        audience: 'DEPARTMENT_STUDENTS'
      }
    });
    if (!a) fail(404, 'Announcement not found');

    const attachment = await resolveAttachment(req.body.attachmentFileId, req.user.id);
    const oldFileId =
      a.attachmentFileId && a.attachmentFileId !== attachment.attachmentFileId
        ? a.attachmentFileId
        : null;

    const updated = await db.announcement.update({
      where: { id: a.id },
      data: {
        title: required(req.body.title, 'Title'),
        body: required(req.body.body, 'Message', 10000),
        published: req.body.published !== false,
        ...attachment
      }
    });

    if (oldFileId) {
      await cleanupFileAsset(oldFileId);
    }

    res.json(updated);
  })
);

r.delete(
  '/announcements/:id',
  asyncRoute(async (req, res) => {
    const a = await db.announcement.findFirst({
      where: {
        id: req.params.id,
        authorUserId: req.user.id,
        departmentId: coordinatorDept(req),
        audience: 'DEPARTMENT_STUDENTS'
      }
    });
    if (!a) fail(404, 'Announcement not found');

    const oldFileId = a.attachmentFileId;
    await db.announcement.delete({ where: { id: a.id } });
    if (oldFileId) {
      await cleanupFileAsset(oldFileId);
    }
    res.json({ message: 'Deleted' });
  })
);

r.get(
  '/admin-announcements',
  asyncRoute(async (req, res) => {
    const announcements = await db.announcement.findMany({
      where: coordinatorAdminAnnouncementsWhere(coordinatorDept(req)),
      include: {
        ...announcementInclude,
        reads: { where: { userId: req.user.id } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(announcements);
  })
);

// ----------------------------------------------------------------------------
// 5. BULK EXCEL STUDENT IMPORT
// ----------------------------------------------------------------------------
r.get(
  '/upload/template',
  asyncRoute(async (req, res) => {
    const dept = await db.department.findUnique({
      where: { id: coordinatorDept(req) },
      include: { programmes: true }
    });

    await workbookResponse(
      res,
      'student_import_template',
      [
        ['UniversityRegNo', 'UniversityRegNo', 24],
        ['Name', 'Name', 24],
        ['UG/PG', 'UG/PG', 12],
        ['Department', 'Department', 25],
        ['Programme', 'Programme', 26],
        ['Email', 'Email', 30],
        ['Phone', 'Phone', 17],
        ['PassedOutYear', 'PassedOutYear', 18]
      ],
      [
        {
          UniversityRegNo: 'SAMPLE001',
          Name: 'Sample Student',
          'UG/PG': dept.programmes[0]?.level || 'PG',
          Department: dept.name,
          Programme: dept.programmes[0]?.name || 'Set up programmes',
          Email: 'sample@example.com',
          Phone: '9876543210',
          PassedOutYear: 2027
        }
      ]
    );
  })
);

r.post(
  '/upload/preview',
  upload.single('file'),
  asyncRoute(async (req, res) => {
    if (!req.file?.originalname.toLowerCase().endsWith('.xlsx')) {
      fail(400, 'Upload an .xlsx file');
    }

    const dept = await db.department.findUnique({
      where: { id: coordinatorDept(req) },
      include: { programmes: { where: { active: true } } }
    });

    const book = await loadWorkbook(req.file.buffer);
    const sheet = book.worksheets[0];
    if (!sheet) fail(400, 'Empty Excel workbook');

    const headers = sheet.getRow(1).values.slice(1).map((v) => String(v || '').trim());
    const expected = [
      'UniversityRegNo',
      'Name',
      'UG/PG',
      'Department',
      'Programme',
      'Email',
      'Phone',
      'PassedOutYear'
    ];

    if (expected.some((h) => !headers.includes(h))) {
      fail(400, `Missing columns. Required: ${expected.join(', ')}`);
    }

    const inputs = [];
    sheet.eachRow((r, n) => {
      if (n === 1) return;
      const obj = {};
      headers.forEach((h, i) => (obj[h] = r.getCell(i + 1).text.trim()));
      if (Object.values(obj).some(Boolean)) {
        inputs.push({ row: n, data: obj });
      }
    });

    if (inputs.length > 1000) {
      fail(400, 'Maximum 1000 student rows per upload');
    }

    const existing = await db.student.findMany({
      where: {
        OR: [
          { registrationNo: { in: inputs.map((x) => cleaned(x.data.UniversityRegNo, 50)) } },
          { user: { email: { in: inputs.map((x) => cleaned(x.data.Email).toLowerCase()) } } }
        ]
      },
      include: { user: true }
    });

    const seenReg = new Set();
    const seenEmail = new Set();

    const rows = inputs.map(({ row, data }) => {
      const item = validateStudent(data, dept.programmes, dept);
      if (seenReg.has(item.registrationNo)) {
        item.errors.push('Duplicate registration number in file');
      }
      if (seenEmail.has(item.email)) {
        item.errors.push('Duplicate email in file');
      }
      if (
        existing.some(
          (s) => s.registrationNo === item.registrationNo || s.user.email === item.email
        )
      ) {
        item.errors.push('Already exists in database');
      }
      seenReg.add(item.registrationNo);
      seenEmail.add(item.email);
      return { row, ...item };
    });

    const batch = await db.studentImportBatch.create({
      data: {
        coordinatorId: req.user.coordinator.id,
        payload: rows,
        validCount: rows.filter((r) => !r.errors.length).length,
        errorCount: rows.filter((r) => r.errors.length).length
      }
    });

    res.json({
      batchId: batch.id,
      total: rows.length,
      valid: batch.validCount,
      errors: batch.errorCount,
      rows
    });
  })
);

r.post(
  '/upload/confirm/:id',
  asyncRoute(async (req, res) => {
    const batch = await db.studentImportBatch.findFirst({
      where: {
        id: req.params.id,
        coordinatorId: req.user.coordinator.id,
        stage: { in: ['PREVIEW', 'IMPORTING'] }
      }
    });
    if (!batch) fail(404, 'Import preview not found or already imported');

    const rows = batch.payload;
    const created = [];
    const skipped = [];
    const validRows = rows.filter((r) => !r.errors?.length);

    // Pre-hash passwords in parallel outside the database transaction for high throughput
    const hashes = await Promise.all(
      validRows.map((r) => bcrypt.hash(String(r.password || r.registrationNo), 10))
    );
    const hashMap = new Map(validRows.map((r, i) => [r.row, hashes[i]]));

    // Batch query existing records in one fast check
    const existing = await db.student.findMany({
      where: {
        OR: [
          { registrationNo: { in: validRows.map((r) => r.registrationNo) } },
          { user: { email: { in: validRows.map((r) => r.email.toLowerCase()) } } }
        ]
      },
      select: {
        registrationNo: true,
        user: { select: { email: true } }
      }
    });
    const existingRegs = new Set(existing.map((s) => s.registrationNo));
    const existingEmails = new Set(existing.map((s) => s.user.email.toLowerCase()));

    const dept = coordinatorDept(req);

    await db.$transaction(
      async (tx) => {
        await tx.studentImportBatch.updateMany({
          where: { id: batch.id, stage: { in: ['PREVIEW', 'IMPORTING'] } },
          data: { stage: 'IMPORTING' }
        });

        for (const row of rows) {
          if (row.errors?.length) {
            skipped.push({ row: row.row, error: row.errors.join('; ') });
            continue;
          }
          if (
            existingRegs.has(row.registrationNo) ||
            existingEmails.has(row.email.toLowerCase())
          ) {
            skipped.push({ row: row.row, error: 'Already exists in database' });
            continue;
          }
          existingRegs.add(row.registrationNo);
          existingEmails.add(row.email.toLowerCase());

          const s = await createStudent(tx, row, dept, null, hashMap.get(row.row));
          created.push(s);
        }

        await tx.studentImportBatch.update({
          where: { id: batch.id },
          data: {
            stage: 'DONE',
            validCount: created.length,
            errorCount: skipped.length,
            importedAt: new Date(),
            payload: { rows, skipped }
          }
        });
      },
      { timeout: 120000, maxWait: 10000 }
    );

    await audit(req.user.id, 'IMPORT', 'student-import', batch.id, {
      created: created.length,
      skipped: skipped.length
    });

    res.json({
      created,
      skipped,
      message: `Imported ${created.length} students. Students can now directly sign in using their registered email and Registration Number as temporary password.`
    });
  })
);

r.get(
  '/upload/history',
  asyncRoute(async (req, res) => {
    const history = await db.studentImportBatch.findMany({
      where: { coordinatorId: req.user.coordinator.id },
      select: {
        id: true,
        stage: true,
        validCount: true,
        errorCount: true,
        createdAt: true,
        importedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(history);
  })
);

r.get(
  '/upload/errors/:id',
  asyncRoute(async (req, res) => {
    const batch = await db.studentImportBatch.findFirst({
      where: { id: req.params.id, coordinatorId: req.user.coordinator.id }
    });
    if (!batch) fail(404, 'Import not found');

    const content =
      batch.stage === 'DONE'
        ? batch.payload?.skipped
        : (batch.payload || [])
          .filter((r) => r.errors?.length)
          .map((r) => ({ row: r.row, error: r.errors.join('; ') }));

    await workbookResponse(
      res,
      'student_import_errors',
      [
        ['row', 'Excel Row', 14],
        ['error', 'Validation Error', 70]
      ],
      content || []
    );
  })
);

export default r;
