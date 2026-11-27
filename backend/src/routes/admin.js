/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - PLACEMENT ADMIN ROUTES
 * ============================================================================
 * 
 * Provides:
 * - GET    /api/admin/dashboard             - University-wide placement statistics and departmental breakdown.
 * - GET    /api/admin/departments           - Active departments, associated programmes, and student counts.
 * - POST   /api/admin/departments           - Create new academic department.
 * - PATCH  /api/admin/departments/:id       - Update department name/code/status.
 * - POST   /api/admin/departments/:id/programmes - Add programme (UG/PG) under department.
 * - PATCH  /api/admin/programmes/:id        - Update programme.
 * - GET    /api/admin/companies             - List registered recruiters and posted job counts.
 * - POST   /api/admin/companies             - Provision recruiter account.
 * - PATCH  /api/admin/companies/:id         - Update recruiter profile / active status.
 * - GET    /api/admin/coordinators          - List department placement coordinators.
 * - POST   /api/admin/coordinators          - Provision department coordinator.
 * - PATCH  /api/admin/coordinators/:id       - Update coordinator assignment / status.
 * - GET    /api/admin/jobs                  - List all posted drives.
 * - PATCH  /api/admin/jobs/:id/review       - Approve or reject job postings with reasons.
 * - GET    /api/admin/reports               - Placement analytics and filterable selected student records.
 * - GET    /api/admin/reports/export        - Export full university placement report (.xlsx).
 * - CRUD   /api/admin/announcements         - Circulars broadcasted to department coordinators.
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  db,
  asyncRoute,
  fail,
  required,
  emailOf,
  cleaned,
  integer,
  audit,
  pageOf
} from '../lib/core.js';
import { strongPassword } from './auth.js';
import { jobInclude } from '../lib/jobs.js';
import {
  ADMIN_AUDIENCES,
  announcementInclude,
  cleanupFileAsset
} from '../lib/announcements.js';
import {
  workbookResponse,
  studentHeaders,
  applicationRow,
  applicationInclude
} from '../lib/excel.js';

const r = Router();

const reportRows = async (where = {}) =>
  db.application.findMany({
    where: { status: 'SELECTED', ...where },
    include: applicationInclude,
    orderBy: { selectedAt: 'desc' }
  });

// ----------------------------------------------------------------------------
// 1. DASHBOARD ANALYTICS
// ----------------------------------------------------------------------------
r.get(
  '/dashboard',
  asyncRoute(async (req, res) => {
    const [
      students,
      companies,
      jobs,
      approved,
      pending,
      applications,
      depts,
      selected
    ] = await Promise.all([
      db.student.count(),
      db.company.count(),
      db.job.count(),
      db.job.count({ where: { approval: 'APPROVED' } }),
      db.job.count({ where: { approval: 'PENDING' } }),
      db.application.count(),
      db.department.findMany({ select: { id: true, name: true } }),
      reportRows()
    ]);

    const unique = new Set(selected.map((a) => a.studentId));
    const byDepartment = depts.map((d) => ({
      name: d.name,
      placed: new Set(
        selected.filter((a) => a.student.departmentId === d.id).map((a) => a.studentId)
      ).size
    }));

    const monthly = {};
    for (const a of selected) {
      const m = a.selectedAt?.toISOString().slice(0, 7) || 'Unknown';
      monthly[m] = (monthly[m] || 0) + 1;
    }

    res.json({
      stats: {
        students,
        companies,
        jobs,
        approved,
        pending,
        applications,
        placed: unique.size,
        offers: selected.length
      },
      byDepartment,
      monthly: Object.entries(monthly).map(([month, count]) => ({ month, count }))
    });
  })
);

// ----------------------------------------------------------------------------
// 2. ACADEMIC DEPARTMENTS & PROGRAMMES
// ----------------------------------------------------------------------------
r.get(
  '/departments',
  asyncRoute(async (req, res) => {
    const departments = await db.department.findMany({
      include: {
        programmes: true,
        _count: { select: { students: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  })
);

r.post(
  '/departments',
  asyncRoute(async (req, res) => {
    const item = await db.department.create({
      data: {
        name: required(req.body.name, 'Department'),
        code: cleaned(req.body.code, 20) || null
      }
    });

    await audit(req.user.id, 'CREATE', 'department', item.id);
    res.status(201).json(item);
  })
);

r.patch(
  '/departments/:id',
  asyncRoute(async (req, res) => {
    const item = await db.department.update({
      where: { id: req.params.id },
      data: {
        name: required(req.body.name, 'Department'),
        code: cleaned(req.body.code, 20) || null,
        active: req.body.active !== false
      }
    });

    await audit(req.user.id, 'UPDATE', 'department', item.id);
    res.json(item);
  })
);

r.delete(
  '/departments/:id',
  asyncRoute(async (req, res) => {
    const dept = await db.department.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { students: true } },
        coordinators: true,
        programmes: true
      }
    });
    if (!dept) fail(404, 'Department not found');

    if (dept._count.students > 0) {
      fail(
        400,
        `Cannot delete department "${dept.name}": ${dept._count.students} student(s) are currently enrolled. Please transfer or remove students first.`
      );
    }

    await db.$transaction(async (tx) => {
      // 1. Delete all coordinators and their user accounts in this department
      for (const coord of dept.coordinators) {
        await tx.studentImportBatch.deleteMany({ where: { coordinatorId: coord.id } });
        await tx.coordinator.delete({ where: { id: coord.id } });
        await tx.user.delete({ where: { id: coord.userId } });
      }

      // 2. Delete JobDepartment mappings
      await tx.jobDepartment.deleteMany({ where: { departmentId: dept.id } });

      // 3. Delete JobProgramme mappings
      const progIds = dept.programmes.map((p) => p.id);
      if (progIds.length > 0) {
        await tx.jobProgramme.deleteMany({ where: { programmeId: { in: progIds } } });
      }

      // 4. Delete programmes
      await tx.programme.deleteMany({ where: { departmentId: dept.id } });

      // 5. Delete department announcement targets and department announcements
      await tx.announcementDepartment.deleteMany({ where: { departmentId: dept.id } });
      const announcements = await tx.announcement.findMany({
        where: { departmentId: dept.id },
        select: { id: true }
      });
      const annIds = announcements.map((a) => a.id);
      if (annIds.length > 0) {
        await tx.announcementRead.deleteMany({ where: { announcementId: { in: annIds } } });
        await tx.announcement.deleteMany({ where: { id: { in: annIds } } });
      }

      // 6. Delete the department itself
      await tx.department.delete({ where: { id: dept.id } });
    });

    await audit(req.user.id, 'DELETE', 'department', dept.id, { name: dept.name });
    res.json({ message: `Department "${dept.name}" permanently deleted` });
  })
);

r.post(
  '/departments/:id/programmes',
  asyncRoute(async (req, res) => {
    const dept = await db.department.findUnique({ where: { id: req.params.id } });
    if (!dept?.active) fail(400, 'Department not active');

    const level = req.body.level;
    if (!['UG', 'PG'].includes(level)) fail(400, 'Choose UG or PG');

    const item = await db.programme.create({
      data: {
        departmentId: dept.id,
        name: required(req.body.name, 'Programme'),
        code: cleaned(req.body.code, 30) || null,
        level
      }
    });

    await audit(req.user.id, 'CREATE', 'programme', item.id);
    res.status(201).json(item);
  })
);

r.patch(
  '/programmes/:id',
  asyncRoute(async (req, res) => {
    const data = {
      name: required(req.body.name, 'Programme'),
      code: cleaned(req.body.code, 30) || null,
      active: req.body.active !== false
    };

    if (!['UG', 'PG'].includes(req.body.level)) fail(400, 'Choose UG or PG');
    data.level = req.body.level;

    const item = await db.programme.update({
      where: { id: req.params.id },
      data
    });

    res.json(item);
  })
);

r.delete(
  '/programmes/:id',
  asyncRoute(async (req, res) => {
    const prog = await db.programme.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { students: true } } }
    });
    if (!prog) fail(404, 'Programme not found');

    if (prog._count.students > 0) {
      fail(
        400,
        `Cannot delete programme "${prog.name}": ${prog._count.students} student(s) are currently enrolled.`
      );
    }

    await db.$transaction(async (tx) => {
      await tx.jobProgramme.deleteMany({ where: { programmeId: prog.id } });
      await tx.programme.delete({ where: { id: prog.id } });
    });

    await audit(req.user.id, 'DELETE', 'programme', prog.id, { name: prog.name });
    res.json({ message: `Programme "${prog.name}" permanently deleted` });
  })
);

// ----------------------------------------------------------------------------
// 3. RECRUITING COMPANIES
// ----------------------------------------------------------------------------
r.get(
  '/companies',
  asyncRoute(async (req, res) => {
    const companies = await db.company.findMany({
      include: {
        user: {
          select: { id: true, email: true, status: true }
        },
        _count: { select: { jobs: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json(companies);
  })
);

r.post(
  '/companies',
  asyncRoute(async (req, res) => {
    const email = emailOf(req.body.email);
    const name = required(req.body.name, 'Company name');
    const passwordHash = await bcrypt.hash(strongPassword(req.body.password), 12);

    const item = await db.user.create({
      data: {
        email,
        fullName: name,
        role: 'COMPANY',
        status: 'ACTIVE',
        passwordHash,
        mustChangePassword: true,
        company: { create: { name } }
      },
      include: { company: true }
    });

    await audit(req.user.id, 'CREATE', 'company', item.company.id);
    res.status(201).json({ id: item.company.id, name, email });
  })
);

r.patch(
  '/companies/:id',
  asyncRoute(async (req, res) => {
    const item = await db.company.findUnique({ where: { id: req.params.id } });
    if (!item) fail(404, 'Company not found');

    await db.$transaction(async (tx) => {
      await tx.company.update({
        where: { id: item.id },
        data: { name: required(req.body.name, 'Company name') }
      });
      if (req.body.status && ['ACTIVE', 'DISABLED'].includes(req.body.status)) {
        await tx.user.update({
          where: { id: item.userId },
          data: { status: req.body.status }
        });
      }
    });

    await audit(req.user.id, 'UPDATE', 'company', item.id);
    res.json({ message: 'Company updated' });
  })
);

r.delete(
  '/companies/:id',
  asyncRoute(async (req, res) => {
    const item = await db.company.findUnique({
      where: { id: req.params.id },
      include: { jobs: { select: { id: true } } }
    });
    if (!item) fail(404, 'Company not found');

    await db.$transaction(async (tx) => {
      const jobIds = item.jobs.map((j) => j.id);
      if (jobIds.length > 0) {
        const apps = await tx.application.findMany({
          where: { jobId: { in: jobIds } },
          select: { id: true }
        });
        const appIds = apps.map((a) => a.id);
        if (appIds.length > 0) {
          await tx.applicationHistory.deleteMany({
            where: { applicationId: { in: appIds } }
          });
          await tx.application.deleteMany({
            where: { id: { in: appIds } }
          });
        }
        await tx.jobDepartment.deleteMany({ where: { jobId: { in: jobIds } } });
        await tx.jobProgramme.deleteMany({ where: { jobId: { in: jobIds } } });
        await tx.jobYear.deleteMany({ where: { jobId: { in: jobIds } } });
        await tx.job.deleteMany({ where: { id: { in: jobIds } } });
      }

      await tx.fileAsset.deleteMany({
        where: { OR: [{ ownerType: 'COMPANY' }, { ownerId: item.id }] }
      });

      await tx.company.delete({ where: { id: item.id } });
      await tx.user.delete({ where: { id: item.userId } });
    });

    await audit(req.user.id, 'DELETE', 'company', item.id, { name: item.name });
    res.json({ message: `Company "${item.name}" and recruiter account permanently deleted` });
  })
);

// ----------------------------------------------------------------------------
// 4. DEPARTMENT PLACEMENT COORDINATORS
// ----------------------------------------------------------------------------
r.get(
  '/coordinators',
  asyncRoute(async (req, res) => {
    const coordinators = await db.coordinator.findMany({
      include: {
        user: {
          select: { id: true, fullName: true, email: true, status: true }
        },
        department: true
      }
    });
    res.json(coordinators);
  })
);

r.post(
  '/coordinators',
  asyncRoute(async (req, res) => {
    const department = await db.department.findUnique({
      where: { id: req.body.departmentId }
    });
    if (!department?.active) fail(400, 'Select an active department');

    const email = emailOf(req.body.email);
    const fullName = required(req.body.fullName, 'Name');
    const passwordHash = await bcrypt.hash(strongPassword(req.body.password), 12);

    const item = await db.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role: 'DEPARTMENT_COORDINATOR',
        status: 'ACTIVE',
        mustChangePassword: true,
        coordinator: { create: { departmentId: department.id } }
      },
      include: { coordinator: true }
    });

    await audit(req.user.id, 'CREATE', 'coordinator', item.coordinator.id);
    res.status(201).json({ id: item.coordinator.id, fullName, email });
  })
);

r.patch(
  '/coordinators/:id',
  asyncRoute(async (req, res) => {
    const item = await db.coordinator.findUnique({ where: { id: req.params.id } });
    if (!item) fail(404, 'Coordinator not found');

    if (!await db.department.findFirst({ where: { id: req.body.departmentId, active: true } })) {
      fail(400, 'Invalid department');
    }

    await db.$transaction(async (tx) => {
      await tx.coordinator.update({
        where: { id: item.id },
        data: { departmentId: req.body.departmentId }
      });
      await tx.user.update({
        where: { id: item.userId },
        data: {
          fullName: required(req.body.fullName, 'Name'),
          status: req.body.status === 'DISABLED' ? 'DISABLED' : 'ACTIVE'
        }
      });
    });

    await audit(req.user.id, 'UPDATE', 'coordinator', item.id);
    res.json({ message: 'Coordinator updated' });
  })
);

r.delete(
  '/coordinators/:id',
  asyncRoute(async (req, res) => {
    const item = await db.coordinator.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    if (!item) fail(404, 'Coordinator not found');

    await db.$transaction(async (tx) => {
      await tx.studentImportBatch.deleteMany({ where: { coordinatorId: item.id } });
      await tx.coordinator.delete({ where: { id: item.id } });
      await tx.user.delete({ where: { id: item.userId } });
    });

    await audit(req.user.id, 'DELETE', 'coordinator', item.id, {
      name: item.user?.fullName
    });
    res.json({ message: `Coordinator "${item.user?.fullName}" permanently deleted` });
  })
);

// ----------------------------------------------------------------------------
// 5. JOB APPROVALS & REVIEWS
// ----------------------------------------------------------------------------
r.get(
  '/jobs',
  asyncRoute(async (req, res) => {
    const jobs = await db.job.findMany({
      include: jobInclude,
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  })
);

r.patch(
  '/jobs/:id/review',
  asyncRoute(async (req, res) => {
    const approval = req.body.approval;
    if (!['APPROVED', 'REJECTED'].includes(approval)) {
      fail(400, 'Choose APPROVED or REJECTED');
    }

    const job = await db.job.findUnique({
      where: { id: req.params.id },
      include: { company: true }
    });
    if (!job) fail(404, 'Job not found');
    if (job.approval !== 'PENDING') fail(409, 'Only pending jobs can be reviewed');

    const rejectionReason =
      approval === 'REJECTED' ? required(req.body.reason, 'Rejection reason', 1000) : null;

    const updated = await db.job.update({
      where: { id: job.id },
      data: {
        approval,
        rejectionReason,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      }
    });

    await db.notification.create({
      data: {
        userId: job.company.userId,
        message: `Job "${job.title}" ${approval.toLowerCase()}${rejectionReason ? `: ${rejectionReason}` : ''}`.slice(0, 500)
      }
    });

    await audit(req.user.id, 'REVIEW_JOB', 'job', job.id, { approval });
    res.json(updated);
  })
);

r.delete(
  '/jobs/:id',
  asyncRoute(async (req, res) => {
    const job = await db.job.findUnique({
      where: { id: req.params.id },
      select: { id: true, title: true }
    });
    if (!job) fail(404, 'Job not found');

    await db.$transaction(async (tx) => {
      const apps = await tx.application.findMany({
        where: { jobId: job.id },
        select: { id: true }
      });
      if (apps.length > 0) {
        const appIds = apps.map((a) => a.id);
        await tx.applicationHistory.deleteMany({
          where: { applicationId: { in: appIds } }
        });
        await tx.application.deleteMany({
          where: { id: { in: appIds } }
        });
      }
      await tx.jobDepartment.deleteMany({ where: { jobId: job.id } });
      await tx.jobProgramme.deleteMany({ where: { jobId: job.id } });
      await tx.jobYear.deleteMany({ where: { jobId: job.id } });
      await tx.job.delete({ where: { id: job.id } });
    });

    await audit(req.user.id, 'DELETE', 'job', job.id, { title: job.title });
    res.json({ message: `Job "${job.title}" permanently deleted` });
  })
);

// ----------------------------------------------------------------------------
// 5.5. UNIVERSITY-WIDE STUDENT DIRECTORY & PROFILES
// ----------------------------------------------------------------------------
const adminStudentInclude = {
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      role: true
    }
  },
  department: true,
  programme: true,
  education: {
    orderBy: { passingYear: 'desc' }
  },
  skills: true,
  projects: true,
  internships: true,
  experiences: true,
  certificates: true,
  resumes: {
    orderBy: { createdAt: 'desc' }
  },
  _count: {
    select: { applications: true }
  }
};

const studentDirectoryHeaders = [
  ['registrationNo', 'Registration Number', 24],
  ['name', 'Student Name', 28],
  ['email', 'Email Address', 32],
  ['phone', 'Phone Number', 18],
  ['department', 'Department', 26],
  ['programme', 'Programme', 28],
  ['year', 'Passing Year', 16],
  ['status', 'Account Status', 16],
  ['applicationsCount', 'Total Applications', 18]
];

r.get(
  '/students',
  asyncRoute(async (req, res) => {
    const where = {};
    if (req.query.departmentId && req.query.departmentId !== 'ALL') {
      where.departmentId = req.query.departmentId;
    }
    if (req.query.programmeId && req.query.programmeId !== 'ALL') {
      where.programmeId = req.query.programmeId;
    }
    if (req.query.passingYear && req.query.passingYear !== 'ALL') {
      where.passingYear = integer(req.query.passingYear, 'Passing Year');
    }

    const students = await db.student.findMany({
      where,
      include: adminStudentInclude,
      orderBy: { registrationNo: 'asc' }
    });

    res.json(students);
  })
);

r.get(
  '/students/export',
  asyncRoute(async (req, res) => {
    const where = {};
    if (req.query.departmentId && req.query.departmentId !== 'ALL') {
      where.departmentId = req.query.departmentId;
    }
    if (req.query.programmeId && req.query.programmeId !== 'ALL') {
      where.programmeId = req.query.programmeId;
    }
    if (req.query.passingYear && req.query.passingYear !== 'ALL') {
      where.passingYear = integer(req.query.passingYear, 'Passing Year');
    }

    const students = await db.student.findMany({
      where,
      include: adminStudentInclude,
      orderBy: { registrationNo: 'asc' }
    });

    const rows = students.map((s) => ({
      registrationNo: s.registrationNo,
      name: s.user?.fullName || '',
      email: s.user?.email || '',
      phone: s.phone || '',
      department: s.department?.name || '',
      programme: s.programme?.name || '',
      year: s.passingYear || '',
      status: s.user?.status || 'ACTIVE',
      applicationsCount: s._count?.applications || 0
    }));

    await workbookResponse(
      res,
      'periyar_university_students_directory',
      studentDirectoryHeaders,
      rows
    );
  })
);

r.get(
  '/students/:id',
  asyncRoute(async (req, res) => {
    const student = await db.student.findUnique({
      where: { id: req.params.id },
      include: adminStudentInclude
    });
    if (!student) fail(404, 'Student not found');
    res.json(student);
  })
);

r.post(
  '/students/:id/reset-password',
  asyncRoute(async (req, res) => {
    const student = await db.student.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    if (!student) fail(404, 'Student not found');

    const newPassword = student.registrationNo;
    const hash = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: student.userId },
      data: { passwordHash: hash }
    });

    await audit(req.user.id, 'RESET_PASSWORD', 'student', student.id, {
      regNo: student.registrationNo
    });

    res.json({
      message: `Password reset successfully to registration number "${student.registrationNo}"`
    });
  })
);

r.delete(
  '/students/:id',
  asyncRoute(async (req, res) => {
    const student = await db.student.findUnique({
      where: { id: req.params.id },
      include: { user: true }
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

    await audit(req.user.id, 'DELETE', 'student', student.id, {
      regNo: student.registrationNo
    });
    res.json({ message: `Student "${student.registrationNo}" permanently deleted` });
  })
);

// ----------------------------------------------------------------------------
// 6. REPORTS & EXPORTS
// ----------------------------------------------------------------------------
r.get(
  '/reports',
  asyncRoute(async (req, res) => {
    const departmentId = req.query.departmentId;
    const programmeId = req.query.programmeId;
    const year = req.query.year;

    const departments = await db.department.findMany({
      where: { active: true },
      include: { programmes: true },
      orderBy: { name: 'asc' }
    });

    const where = {};
    if (departmentId) where.student = { ...(where.student || {}), departmentId };
    if (programmeId) where.student = { ...(where.student || {}), programmeId };
    if (year) where.student = { ...(where.student || {}), passingYear: integer(year, 'Year') };

    const selected = await reportRows(where);
    const allSelected = await reportRows();

    const counts = departments.map((d) => ({
      id: d.id,
      name: d.name,
      programmes: d.programmes.map((p) => ({
        id: p.id,
        name: p.name,
        years: [
          ...new Set(
            allSelected
              .filter((a) => a.student.programmeId === p.id)
              .map((a) => a.student.passingYear)
          )
        ].sort((a, b) => b - a),
        placed: new Set(
          allSelected
            .filter((a) => a.student.programmeId === p.id)
            .map((a) => a.studentId)
        ).size
      })),
      placed: new Set(
        allSelected
          .filter((a) => a.student.departmentId === d.id)
          .map((a) => a.studentId)
      ).size
    }));

    res.json({
      departments: counts,
      uniquePlaced: new Set(selected.map((a) => a.studentId)).size,
      selectedOffers: selected.length,
      rows: selected.map((a) => ({
        ...applicationRow(a),
        id: a.id,
        selectedAt: a.selectedAt
      }))
    });
  })
);

r.get(
  '/reports/export',
  asyncRoute(async (req, res) => {
    const where = {};
    if (req.query.departmentId || req.query.programmeId || req.query.year) {
      where.student = {
        ...(req.query.departmentId ? { departmentId: String(req.query.departmentId) } : {}),
        ...(req.query.programmeId ? { programmeId: String(req.query.programmeId) } : {}),
        ...(req.query.year ? { passingYear: integer(req.query.year) } : {})
      };
    }

    const rows = (await reportRows(where)).map(applicationRow);

    await audit(req.user.id, 'EXPORT', 'placement-report', null, { records: rows.length });
    await workbookResponse(res, 'university_placement_report', studentHeaders, rows);
  })
);

// ----------------------------------------------------------------------------
// 7. PLACEMENT ADMIN ANNOUNCEMENTS (FULL TARGETING + PDF/IMAGE ATTACHMENTS)
// ----------------------------------------------------------------------------
async function validateAdminAnnouncementPayload(body) {
  const title = required(body.title, 'Title');
  const messageBody = required(body.body, 'Message', 10000);
  const published = body.published !== false;

  const audience = body.audience || 'COORDINATORS';
  if (!ADMIN_AUDIENCES.includes(audience)) {
    fail(400, 'Choose audience: COORDINATORS, STUDENTS, or BOTH');
  }

  let departmentIds = [];
  if (Array.isArray(body.departmentIds)) {
    departmentIds = [...new Set(body.departmentIds.map((id) => String(id).trim()).filter(Boolean))];
  }

  if (departmentIds.length > 0) {
    const validDepts = await db.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true }
    });
    if (validDepts.length !== departmentIds.length) {
      fail(400, 'One or more selected departments are invalid');
    }
  }

  let attachment = {
    attachmentFileId: null,
    attachmentName: null,
    attachmentMime: null
  };

  if (body.attachmentFileId) {
    const file = await db.fileAsset.findFirst({
      where: { id: String(body.attachmentFileId), purpose: 'announcement' }
    });
    if (!file) fail(400, 'Attached file not found or invalid');
    attachment = {
      attachmentFileId: file.id,
      attachmentName: file.originalName,
      attachmentMime: file.mimeType
    };
  }

  return { title, body: messageBody, published, audience, departmentIds, attachment };
}

r.get(
  '/announcements',
  asyncRoute(async (req, res) => {
    const announcements = await db.announcement.findMany({
      where: { audience: { in: ADMIN_AUDIENCES } },
      include: {
        ...announcementInclude,
        _count: { select: { reads: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(announcements);
  })
);

r.post(
  '/announcements',
  asyncRoute(async (req, res) => {
    const input = await validateAdminAnnouncementPayload(req.body);

    const item = await db.announcement.create({
      data: {
        authorUserId: req.user.id,
        audience: input.audience,
        title: input.title,
        body: input.body,
        published: input.published,
        ...input.attachment,
        ...(input.departmentIds.length > 0
          ? {
              targetDepartments: {
                create: input.departmentIds.map((departmentId) => ({ departmentId }))
              }
            }
          : {})
      },
      include: {
        ...announcementInclude,
        _count: { select: { reads: true } }
      }
    });

    await audit(req.user.id, 'CREATE', 'announcement', item.id, {
      audience: item.audience,
      departments: input.departmentIds.length || 'ALL'
    });
    res.status(201).json(item);
  })
);

r.patch(
  '/announcements/:id',
  asyncRoute(async (req, res) => {
    const item = await db.announcement.findFirst({
      where: { id: req.params.id, audience: { in: ADMIN_AUDIENCES } }
    });
    if (!item) fail(404, 'Announcement not found');

    const input = await validateAdminAnnouncementPayload(req.body);
    const oldFileId =
      item.attachmentFileId && item.attachmentFileId !== input.attachment.attachmentFileId
        ? item.attachmentFileId
        : null;

    const updated = await db.$transaction(async (tx) => {
      await tx.announcementDepartment.deleteMany({
        where: { announcementId: item.id }
      });

      return tx.announcement.update({
        where: { id: item.id },
        data: {
          audience: input.audience,
          title: input.title,
          body: input.body,
          published: input.published,
          ...input.attachment,
          ...(input.departmentIds.length > 0
            ? {
                targetDepartments: {
                  create: input.departmentIds.map((departmentId) => ({ departmentId }))
                }
              }
            : {})
        },
        include: {
          ...announcementInclude,
          _count: { select: { reads: true } }
        }
      });
    });

    if (oldFileId) {
      await cleanupFileAsset(oldFileId);
    }

    await audit(req.user.id, 'UPDATE', 'announcement', item.id, {
      audience: updated.audience,
      departments: input.departmentIds.length || 'ALL'
    });
    res.json(updated);
  })
);

r.delete(
  '/announcements/:id',
  asyncRoute(async (req, res) => {
    const item = await db.announcement.findFirst({
      where: { id: req.params.id, audience: { in: ADMIN_AUDIENCES } }
    });
    if (!item) fail(404, 'Announcement not found');

    const oldFileId = item.attachmentFileId;
    await db.announcement.delete({ where: { id: item.id } });
    if (oldFileId) {
      await cleanupFileAsset(oldFileId);
    }

    await audit(req.user.id, 'DELETE', 'announcement', item.id);
    res.json({ message: 'Announcement deleted' });
  })
);

export default r;
