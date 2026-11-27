/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - STUDENT ROUTES
 * ============================================================================
 * 
 * Provides:
 * - GET    /api/student/dashboard             - Profile completion, eligible jobs, applications, and announcements.
 * - GET    /api/student/profile               - Current student profile details.
 * - PATCH  /api/student/profile               - Update editable profile fields (about, phone, social links).
 * - Dynamic sub-collections (CRUD):
 *   - /api/student/education                  - Academic qualifications (10th, 12th, UG, PG).
 *   - /api/student/skills                     - Technical and career skills.
 *   - /api/student/projects                   - Showcase projects with repository and live URLs.
 *   - /api/student/internships                - Internship history and work experience.
 *   - /api/student/certificates               - Certifications with uploaded file attachments.
 * - GET    /api/student/resumes               - Primary and historical uploaded resumes.
 * - GET    /api/student/jobs                  - Matched, approved, active recruitment opportunities.
 * - GET    /api/student/jobs/:id              - Individual job details with eligibility check.
 * - POST   /api/student/jobs/:id/apply        - Submit application with cover letter and placement cap check.
 * - GET    /api/student/applications          - List submitted applications and timeline milestones.
 * - GET    /api/student/announcements         - Department placement announcements with read tracking.
 */

import { Router } from 'express';
import {
  db,
  asyncRoute,
  fail,
  required,
  cleaned,
  integer,
  urlOf,
  audit,
  notify
} from '../lib/core.js';
import { studentId } from '../middleware/auth.js';
import {
  availableJobsWhere,
  studentEligibility,
  jobInclude,
  eligible
} from '../lib/jobs.js';
import { canAcceptOffer } from '../lib/policies.js';
import {
  announcementInclude,
  studentAnnouncementsWhere
} from '../lib/announcements.js';

const r = Router();

const studentProfileInclude = {
  user: {
    select: {
      fullName: true,
      email: true,
      status: true
    }
  },
  department: true,
  programme: true,
  education: true,
  skills: true,
  projects: true,
  internships: true,
  experiences: true,
  certificates: true,
  resumes: true
};

/**
 * Retrieves the currently authenticated student entity with related records.
 */
async function studentFor(req) {
  const student = await db.student.findUnique({
    where: { id: studentId(req) },
    include: studentProfileInclude
  });
  if (!student) fail(404, 'Student not found');
  return student;
}

// ----------------------------------------------------------------------------
// 1. STUDENT DASHBOARD
// ----------------------------------------------------------------------------
r.get(
  '/dashboard',
  asyncRoute(async (req, res) => {
    const student = await studentFor(req);

    const [jobs, applications, selected, announcements] = await Promise.all([
      db.job.count({
        where: {
          ...availableJobsWhere(),
          ...studentEligibility(student)
        }
      }),
      db.application.findMany({
        where: { studentId: student.id },
        include: { job: { include: { company: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      db.application.count({
        where: { studentId: student.id, status: 'SELECTED' }
      }),
      db.announcement.findMany({
        where: studentAnnouncementsWhere(student.departmentId),
        include: announcementInclude,
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const complete = [
      student.about,
      student.phone,
      student.photoFileId,
      student.education.length,
      student.skills.length,
      student.projects.length,
      student.internships.length,
      student.certificates.length,
      student.resumes.length
    ].filter(Boolean).length;

    res.json({
      stats: {
        profileCompletion: Math.round((complete / 9) * 100),
        eligibleJobs: jobs,
        applications: applications.length,
        shortlisted: applications.filter((a) => a.status === 'SHORTLISTED').length,
        selected
      },
      recentApplications: applications.slice(0, 5),
      announcements
    });
  })
);

// ----------------------------------------------------------------------------
// 2. STUDENT PROFILE
// ----------------------------------------------------------------------------
r.get(
  '/profile',
  asyncRoute(async (req, res) => {
    res.json(await studentFor(req));
  })
);

r.patch(
  '/profile',
  asyncRoute(async (req, res) => {
    const allowed = {
      about: cleaned(req.body.about, 4000),
      phone: cleaned(req.body.phone, 30) || null,
      linkedin: urlOf(req.body.linkedin),
      github: urlOf(req.body.github),
      portfolio: urlOf(req.body.portfolio),
      twitter: urlOf(req.body.twitter)
    };

    const student = await db.student.update({
      where: { id: studentId(req) },
      data: allowed
    });

    res.json(student);
  })
);

// ----------------------------------------------------------------------------
// 3. STUDENT COLLECTIONS (EDUCATION, SKILLS, PROJECTS, INTERNSHIPS, CERTS)
// ----------------------------------------------------------------------------
const collections = {
  education: {
    model: 'education',
    fields: (b) => {
      const score = Number(b.score);
      const year = integer(b.passingYear, 'Passing year');
      const scale = required(b.scale || 'Percentage', 'Scale', 20);
      const scoreMax =
        scale === 'CGPA 10' ? 10 : scale === 'CGPA 4' ? 4 : scale === 'Percentage' ? 100 : null;

      if (scoreMax === null || !Number.isFinite(score) || score < 0 || score > scoreMax) {
        fail(400, 'Score exceeds the selected percentage or CGPA scale');
      }
      if (year < 1950 || year > 2120) {
        fail(400, 'Invalid year');
      }

      return {
        qualification: required(b.qualification, 'Qualification'),
        institution: required(b.institution, 'Institution'),
        board: required(b.board, 'Board'),
        passingYear: year,
        score,
        scale
      };
    }
  },
  skills: {
    model: 'studentSkill',
    fields: (b) => ({
      name: required(b.name, 'Skill', 100)
    })
  },
  projects: {
    model: 'studentProject',
    fields: (b) => ({
      title: required(b.title, 'Title'),
      description: required(b.description, 'Description', 5000),
      technologies: cleaned(b.technologies, 500) || '',
      github: urlOf(b.github),
      liveUrl: urlOf(b.liveUrl)
    })
  },
  internships: {
    model: 'internship',
    fields: (b) => {
      const startDate = new Date(b.startDate);
      const endDate = new Date(b.endDate);
      if (
        !Number.isFinite(startDate.valueOf()) ||
        !Number.isFinite(endDate.valueOf()) ||
        endDate < startDate
      ) {
        fail(400, 'Invalid internship dates');
      }
      return {
        companyName: required(b.companyName, 'Company'),
        domain: required(b.domain, 'Domain'),
        startDate,
        endDate,
        description: required(b.description, 'Description', 5000)
      };
    }
  },
  experiences: {
    model: 'experience',
    fields: (b) => {
      const startDate = new Date(b.startDate);
      if (!Number.isFinite(startDate.valueOf())) {
        fail(400, 'Invalid start date');
      }
      const currentlyWorking = Boolean(b.currentlyWorking);
      let endDate = null;
      if (!currentlyWorking && b.endDate) {
        endDate = new Date(b.endDate);
        if (!Number.isFinite(endDate.valueOf()) || endDate < startDate) {
          fail(400, 'End date must be on or after start date');
        }
      }
      return {
        companyName: required(b.companyName, 'Company name'),
        role: required(b.role, 'Role / Designation'),
        employmentType: cleaned(b.employmentType, 60) || null,
        location: cleaned(b.location, 191) || null,
        startDate,
        endDate,
        currentlyWorking,
        description: required(b.description, 'Work description', 5000)
      };
    }
  },
  certificates: {
    model: 'certificate',
    fields: (b) => ({
      title: required(b.title, 'Title'),
      issuer: required(b.issuer, 'Issuer'),
      year: integer(b.year, 'Year'),
      fileId: cleaned(b.fileId, 36) || null
    })
  }
};

for (const [path, { model, fields }] of Object.entries(collections)) {
  r.get(
    `/${path}`,
    asyncRoute(async (req, res) => {
      res.json(await db[model].findMany({ where: { studentId: studentId(req) } }));
    })
  );

  r.post(
    `/${path}`,
    asyncRoute(async (req, res) => {
      const data = fields(req.body);
      if (model === 'certificate' && data.fileId) {
        const f = await db.fileAsset.findFirst({
          where: {
            id: data.fileId,
            ownerType: 'STUDENT',
            ownerId: studentId(req),
            purpose: 'certificate'
          }
        });
        if (!f) fail(403, 'Certificate file not accessible');
      }

      const item = await db[model].create({
        data: { ...data, studentId: studentId(req) }
      });
      res.status(201).json(item);
    })
  );

  r.patch(
    `/${path}/:id`,
    asyncRoute(async (req, res) => {
      const record = await db[model].findFirst({
        where: { id: req.params.id, studentId: studentId(req) }
      });
      if (!record) fail(404, 'Record not found');

      const data = fields(req.body);
      if (model === 'certificate' && data.fileId) {
        const f = await db.fileAsset.findFirst({
          where: {
            id: data.fileId,
            ownerType: 'STUDENT',
            ownerId: studentId(req),
            purpose: 'certificate'
          }
        });
        if (!f) fail(403, 'Invalid certificate file');
      }

      res.json(await db[model].update({ where: { id: record.id }, data }));
    })
  );

  r.delete(
    `/${path}/:id`,
    asyncRoute(async (req, res) => {
      const record = await db[model].findFirst({
        where: { id: req.params.id, studentId: studentId(req) }
      });
      if (!record) fail(404, 'Record not found');

      await db[model].delete({ where: { id: record.id } });
      res.json({ message: 'Deleted' });
    })
  );
}

// ----------------------------------------------------------------------------
// 4. RESUMES
// ----------------------------------------------------------------------------
r.get(
  '/resumes',
  asyncRoute(async (req, res) => {
    const resumes = await db.resume.findMany({
      where: { studentId: studentId(req) },
      orderBy: { createdAt: 'desc' }
    });
    const assets = await db.fileAsset.findMany({
      where: { id: { in: resumes.map((r) => r.fileId) } }
    });
    res.json(resumes.map((r) => ({ ...r, file: assets.find((a) => a.id === r.fileId) || null })));
  })
);

// ----------------------------------------------------------------------------
// 5. JOBS & ELIGIBILITY
// ----------------------------------------------------------------------------
r.get(
  '/jobs',
  asyncRoute(async (req, res) => {
    const student = await studentFor(req);
    const jobs = await db.job.findMany({
      where: {
        approval: 'APPROVED',
        active: true,
        archived: false,
        ...studentEligibility(student)
      },
      include: {
        ...jobInclude,
        applications: {
          where: { studentId: student.id },
          select: { id: true, status: true, createdAt: true }
        }
      },
      orderBy: { deadline: 'desc' }
    });
    res.json(
      jobs.map(({ applications, ...job }) => ({
        ...job,
        applied: applications.length > 0,
        myApplication: applications[0] || null
      }))
    );
  })
);

r.get(
  '/jobs/:id',
  asyncRoute(async (req, res) => {
    const student = await studentFor(req);
    const job = await db.job.findUnique({
      where: { id: req.params.id },
      include: {
        ...jobInclude,
        company: {
          select: {
            id: true,
            name: true,
            logoFileId: true,
            website: true,
            address: true,
            industry: true,
            employeeSize: true,
            foundedYear: true,
            description: true,
            linkedin: true,
            twitter: true,
            contactName: true,
            contactPhone: true,
            contactEmail: true,
            contactDesignation: true
          }
        },
        applications: {
          where: { studentId: student.id },
          select: { id: true, status: true, createdAt: true }
        }
      }
    });

    if (!job || !eligible(student, job)) {
      fail(404, 'Job not available or student not eligible');
    }

    const { applications, ...rest } = job;
    res.json({
      ...rest,
      applied: applications.length > 0,
      myApplication: applications[0] || null
    });
  })
);

// ----------------------------------------------------------------------------
// 6. APPLY FOR JOB
// ----------------------------------------------------------------------------
r.post(
  '/jobs/:id/apply',
  asyncRoute(async (req, res) => {
    const student = await studentFor(req);

    const application = await db.$transaction(
      async (tx) => {
        // Lock student record to prevent race conditions exceeding 2 offer policy
        await tx.$queryRaw`SELECT id FROM Student WHERE id = ${student.id} FOR UPDATE`;

        const selected = await tx.application.count({
          where: { studentId: student.id, status: 'SELECTED' }
        });
        if (!canAcceptOffer(selected)) {
          fail(409, 'Two selected offers reached. Further applications are not allowed');
        }

        const job = await tx.job.findUnique({
          where: { id: req.params.id },
          include: {
            ...jobInclude,
            company: { select: { id: true, userId: true, name: true } }
          }
        });
        if (!job || !eligible(student, job)) {
          fail(403, 'This job is not currently available to you');
        }

        if (new Date(job.deadline) < new Date()) {
          fail(403, 'Application deadline has passed. Applications are closed for this recruitment drive.');
        }

        const exists = await tx.application.findUnique({
          where: { studentId_jobId: { studentId: student.id, jobId: job.id } }
        });
        if (exists) {
          fail(409, 'You have already applied to this job');
        }

        const resumes = await tx.resume.findMany({
          where: { studentId: student.id },
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }]
        });
        const validFiles = resumes.length
          ? await tx.fileAsset.findMany({
            where: { id: { in: resumes.map((x) => x.fileId) } },
            select: { id: true }
          })
          : [];
        const resume = resumes.find((x) => validFiles.some((f) => f.id === x.fileId));
        if (!resume) {
          fail(400, 'Upload a resume before applying');
        }

        const created = await tx.application.create({
          data: {
            studentId: student.id,
            jobId: job.id,
            coverLetter: cleaned(req.body.coverLetter, 5000),
            resumeFileId: resume.fileId,
            history: {
              create: {
                actorUserId: req.user.id,
                toStatus: 'APPLIED'
              }
            }
          }
        });

        await notify(job.company.userId, `New application for ${job.title}`, tx);
        return created;
      },
      { isolationLevel: 'Serializable', timeout: 15000 }
    );

    await audit(req.user.id, 'APPLY', 'application', application.id);
    res.status(201).json(application);
  })
);

// ----------------------------------------------------------------------------
// 7. TRACK APPLICATIONS
// ----------------------------------------------------------------------------
r.get(
  '/applications',
  asyncRoute(async (req, res) => {
    const applications = await db.application.findMany({
      where: { studentId: studentId(req) },
      include: {
        job: { include: { company: true } },
        history: { orderBy: { createdAt: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  })
);

// ----------------------------------------------------------------------------
// 8. ANNOUNCEMENTS
// ----------------------------------------------------------------------------
r.get(
  '/announcements',
  asyncRoute(async (req, res) => {
    const student = await studentFor(req);
    const announcements = await db.announcement.findMany({
      where: studentAnnouncementsWhere(student.departmentId),
      include: {
        ...announcementInclude,
        reads: { where: { userId: req.user.id } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(announcements);
  })
);

export default r;
