/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - RECRUITER / COMPANY ROUTES
 * ============================================================================
 * 
 * Provides:
 * - GET    /api/company/dashboard            - Company recruitment statistics and applicants per job.
 * - GET    /api/company/profile              - Recruiter company details.
 * - PATCH  /api/company/profile              - Update corporate profile (website, industry, size, links).
 * - GET    /api/company/jobs                 - List company's posted recruitment drives.
 * - POST   /api/company/jobs                 - Create new job drive (enters PENDING approval).
 * - PATCH  /api/company/jobs/:id             - Edit job details and reset to PENDING re-approval.
 * - PATCH  /api/company/jobs/:id/status      - Activate, deactivate, or archive job postings.
 * - GET    /api/company/applicants           - List applicant candidates with deep academic/portfolio data.
 * - PATCH  /api/company/applications/:id/status - Progress candidate (SHORTLISTED, SELECTED, REJECTED).
 * - GET    /api/company/applicants/export    - Export applicant list (.xlsx).
 * - GET    /api/company/report               - Hiring summary analytics by job drive.
 * - GET    /api/company/report/export        - Export recruitment summary report (.xlsx).
 */

import { Router } from 'express';
import {
  db,
  asyncRoute,
  fail,
  required,
  cleaned,
  emailOf,
  urlOf,
  audit,
  notify
} from '../lib/core.js';
import { companyId } from '../middleware/auth.js';
import {
  validateJob,
  targetCreates,
  updateTargets,
  jobInclude
} from '../lib/jobs.js';
import {
  workbookResponse,
  studentHeaders,
  applicationRow,
  applicationInclude
} from '../lib/excel.js';
import { canTransition, canAcceptOffer } from '../lib/policies.js';

const r = Router();

const applicantInclude = {
  ...applicationInclude,
  history: {
    orderBy: { createdAt: 'asc' }
  },
  student: {
    include: {
      user: { select: { fullName: true, email: true } },
      department: true,
      programme: true,
      education: true,
      skills: true,
      projects: true,
      internships: true,
      experiences: true,
      certificates: true,
      resumes: true
    }
  }
};

// ----------------------------------------------------------------------------
// 1. RECRUITMENT DASHBOARD
// ----------------------------------------------------------------------------
r.get(
  '/dashboard',
  asyncRoute(async (req, res) => {
    const id = companyId(req);
    const jobs = await db.job.findMany({
      where: { companyId: id },
      select: { id: true, approval: true, title: true }
    });

    const apps = await db.application.findMany({
      where: { job: { companyId: id } },
      select: { status: true, jobId: true }
    });

    const stats = {
      jobs: jobs.length,
      approved: jobs.filter((j) => j.approval === 'APPROVED').length,
      pending: jobs.filter((j) => j.approval === 'PENDING').length,
      applicants: apps.length,
      shortlisted: apps.filter((a) => a.status === 'SHORTLISTED').length,
      selected: apps.filter((a) => a.status === 'SELECTED').length
    };

    res.json({
      stats,
      byJob: jobs.map((j) => ({
        name: j.title,
        applicants: apps.filter((a) => a.jobId === j.id).length
      }))
    });
  })
);

// ----------------------------------------------------------------------------
// 2. COMPANY PROFILE
// ----------------------------------------------------------------------------
r.get(
  '/profile',
  asyncRoute(async (req, res) => {
    const profile = await db.company.findUnique({
      where: { id: companyId(req) },
      include: {
        user: { select: { email: true, status: true } }
      }
    });
    res.json(profile);
  })
);

r.patch(
  '/profile',
  asyncRoute(async (req, res) => {
    const b = req.body;
    const item = await db.company.update({
      where: { id: companyId(req) },
      data: {
        website: urlOf(b.website),
        address: cleaned(b.address, 2000),
        industry: cleaned(b.industry),
        employeeSize: cleaned(b.employeeSize, 100),
        foundedYear: b.foundedYear ? Number(b.foundedYear) : null,
        description: cleaned(b.description, 7000),
        linkedin: urlOf(b.linkedin),
        twitter: urlOf(b.twitter),
        contactName: cleaned(b.contactName, 191) || null,
        contactPhone: cleaned(b.contactPhone, 30) || null,
        contactEmail: cleaned(b.contactEmail, 191) ? emailOf(b.contactEmail) : null,
        contactDesignation: cleaned(b.contactDesignation, 191) || null
      }
    });
    res.json(item);
  })
);

// ----------------------------------------------------------------------------
// 3. JOB POSTINGS & MANAGEMENT
// ----------------------------------------------------------------------------
r.get(
  '/jobs',
  asyncRoute(async (req, res) => {
    const jobs = await db.job.findMany({
      where: { companyId: companyId(req) },
      include: {
        ...jobInclude,
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  })
);

r.post(
  '/jobs',
  asyncRoute(async (req, res) => {
    const input = await validateJob(req.body);
    const item = await db.job.create({
      data: {
        companyId: companyId(req),
        ...input.data,
        ...targetCreates(input)
      },
      include: jobInclude
    });

    await audit(req.user.id, 'CREATE_JOB', 'job', item.id);
    res.status(201).json(item);
  })
);

r.patch(
  '/jobs/:id',
  asyncRoute(async (req, res) => {
    const original = await db.job.findFirst({
      where: { id: req.params.id, companyId: companyId(req) }
    });
    if (!original) fail(404, 'Job not found');
    if (original.archived) fail(409, 'Archived jobs cannot be edited');

    const input = await validateJob(req.body);

    const item = await db.$transaction(async (tx) => {
      const job = await tx.job.update({
        where: { id: original.id },
        data: {
          ...input.data,
          approval: 'PENDING',
          rejectionReason: null,
          reviewedAt: null,
          reviewedBy: null
        }
      });
      await updateTargets(tx, job.id, input);
      return job;
    });

    await audit(req.user.id, 'UPDATE_JOB', 'job', item.id);
    res.json(item);
  })
);

r.patch(
  '/jobs/:id/status',
  asyncRoute(async (req, res) => {
    const original = await db.job.findFirst({
      where: { id: req.params.id, companyId: companyId(req) }
    });
    if (!original) fail(404, 'Job not found');

    const action = req.body.action;
    if (!['activate', 'deactivate', 'archive'].includes(action)) {
      fail(400, 'Invalid action');
    }

    const data =
      action === 'archive'
        ? { archived: true, active: false }
        : { active: action === 'activate' };

    const updated = await db.job.update({
      where: { id: original.id },
      data
    });

    res.json(updated);
  })
);

r.delete(
  '/jobs/:id',
  asyncRoute(async (req, res) => {
    const original = await db.job.findFirst({
      where: { id: req.params.id, companyId: companyId(req) }
    });
    if (!original) fail(404, 'Job not found');

    await db.$transaction(async (tx) => {
      const apps = await tx.application.findMany({
        where: { jobId: original.id },
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
      await tx.jobDepartment.deleteMany({ where: { jobId: original.id } });
      await tx.jobProgramme.deleteMany({ where: { jobId: original.id } });
      await tx.jobYear.deleteMany({ where: { jobId: original.id } });
      await tx.job.delete({ where: { id: original.id } });
    });

    await audit(req.user.id, 'DELETE_JOB', 'job', original.id, { title: original.title });
    res.json({ message: `Job "${original.title}" permanently deleted` });
  })
);

// ----------------------------------------------------------------------------
// 4. CANDIDATE APPLICANTS & SCREENING
// ----------------------------------------------------------------------------
r.get(
  '/applicants',
  asyncRoute(async (req, res) => {
    const where = { job: { companyId: companyId(req) } };
    if (req.query.jobId) {
      where.jobId = String(req.query.jobId);
    }

    const apps = await db.application.findMany({
      where,
      include: applicantInclude,
      orderBy: { createdAt: 'desc' }
    });

    // Collect all candidate resume file IDs to verify they exist in FileAsset
    const allFileIds = new Set();
    for (const a of apps) {
      if (a.resumeFileId) allFileIds.add(a.resumeFileId);
      for (const r of a.student?.resumes || []) {
        if (r.fileId) allFileIds.add(r.fileId);
      }
    }
    const existingFiles = allFileIds.size
      ? new Set(
          (
            await db.fileAsset.findMany({
              where: { id: { in: [...allFileIds] } },
              select: { id: true }
            })
          ).map((f) => f.id)
        )
      : new Set();

    const resolved = apps.map((a) => {
      const sortedResumes = [...(a.student?.resumes || [])].sort(
        (x, y) => Number(y.isPrimary) - Number(x.isPrimary) || new Date(y.createdAt) - new Date(x.createdAt)
      );
      const validPrimary = sortedResumes.find((r) => existingFiles.has(r.fileId));
      const effectiveResumeFileId = existingFiles.has(a.resumeFileId)
        ? a.resumeFileId
        : validPrimary?.fileId || null;

      return {
        ...a,
        resumeFileId: effectiveResumeFileId || a.resumeFileId,
        hasValidResume: Boolean(effectiveResumeFileId)
      };
    });

    res.json(resolved);
  })
);

r.patch(
  '/applications/:id/status',
  asyncRoute(async (req, res) => {
    const status = req.body.status;
    if (!['SHORTLISTED', 'SELECTED', 'REJECTED'].includes(status)) {
      fail(400, 'Invalid application status');
    }

    const original = await db.application.findFirst({
      where: { id: req.params.id, job: { companyId: companyId(req) } },
      include: { job: true, student: true }
    });
    if (!original) fail(404, 'Applicant not found');

    if (!canTransition(original.status, status)) {
      fail(409, `Cannot change ${original.status} to ${status}`);
    }

    const updated = await db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM Student WHERE id = ${original.studentId} FOR UPDATE`;

        const app = await tx.application.findUnique({ where: { id: original.id } });
        if (!canTransition(app.status, status)) {
          fail(409, 'Application status changed. Refresh and retry');
        }

        if (status === 'SELECTED') {
          const count = await tx.application.count({
            where: { studentId: original.studentId, status: 'SELECTED' }
          });
          if (!canAcceptOffer(count)) {
            fail(409, 'Selection blocked: student already holds two confirmed offers');
          }
        }

        const next = await tx.application.update({
          where: { id: original.id },
          data: {
            status,
            selectedAt: status === 'SELECTED' ? new Date() : null,
            history: {
              create: {
                fromStatus: app.status,
                toStatus: status,
                actorUserId: req.user.id
              }
            }
          }
        });

        await notify(
          original.student.userId,
          `Your ${original.job.title} application is ${status.toLowerCase()}`,
          tx
        );
        return next;
      },
      { isolationLevel: 'Serializable', timeout: 15000 }
    );

    await audit(req.user.id, 'APPLICATION_STATUS', 'application', original.id, {
      from: original.status,
      to: status
    });

    res.json(updated);
  })
);

r.get(
  '/applicants/export',
  asyncRoute(async (req, res) => {
    const where = { job: { companyId: companyId(req) } };
    if (req.query.jobId) {
      where.jobId = String(req.query.jobId);
    }

    const apps = await db.application.findMany({
      where,
      include: applicationInclude
    });

    await workbookResponse(res, 'company_applicants', studentHeaders, apps.map(applicationRow));
  })
);

// ----------------------------------------------------------------------------
// 5. HIRING REPORTS & ANALYTICS
// ----------------------------------------------------------------------------
r.get(
  '/report',
  asyncRoute(async (req, res) => {
    const jobs = await db.job.findMany({
      where: { companyId: companyId(req) },
      include: {
        _count: { select: { applications: true } },
        applications: { select: { status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      rows: jobs.map((j) => ({
        id: j.id,
        job: j.title,
        approval: j.approval,
        jobType: j.jobType,
        active: j.active,
        archived: j.archived,
        deadline: j.deadline,
        createdAt: j.createdAt,
        applications: j.applications.length,
        shortlisted: j.applications.filter((a) => a.status === 'SHORTLISTED').length,
        selected: j.applications.filter((a) => a.status === 'SELECTED').length,
        rejected: j.applications.filter((a) => a.status === 'REJECTED').length
      }))
    });
  })
);

r.get(
  '/report/export',
  asyncRoute(async (req, res) => {
    const jobs = await db.job.findMany({
      where: { companyId: companyId(req) },
      include: {
        applications: { select: { status: true } }
      }
    });

    const headers = [
      ['job', 'Job Title', 35],
      ['approval', 'Approval', 18],
      ['applications', 'Applications', 18],
      ['shortlisted', 'Shortlisted', 18],
      ['selected', 'Selected', 18],
      ['rejected', 'Rejected', 18]
    ];

    const rows = jobs.map((j) => ({
      job: j.title,
      approval: j.approval,
      applications: j.applications.length,
      shortlisted: j.applications.filter((a) => a.status === 'SHORTLISTED').length,
      selected: j.applications.filter((a) => a.status === 'SELECTED').length,
      rejected: j.applications.filter((a) => a.status === 'REJECTED').length
    }));

    await workbookResponse(res, 'company_recruitment_summary', headers, rows);
  })
);

export default r;
