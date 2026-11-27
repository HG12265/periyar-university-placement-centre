/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - JOB VALIDATION & HELPERS
 * ============================================================================
 * 
 * Provides:
 * - Prisma query includes for job records.
 * - Eligibility filters for students.
 * - Validation logic for job creation/editing (salary range, future deadline, department targets).
 * - Target relation creators and updater transactions for Prisma.
 */

import { db, fail, listOf, required, integer, toDate, cleaned } from './core.js';
import { canViewJob } from './policies.js';

/**
 * Standard Prisma include query for job records.
 */
export const jobInclude = {
  company: {
    select: {
      id: true,
      name: true,
      logoFileId: true
    }
  },
  departments: true,
  programmes: true,
  years: true
};

/**
 * Database filter for live, active, and approved jobs.
 */
export const availableJobsWhere = () => ({
  approval: 'APPROVED',
  active: true,
  archived: false,
  deadline: { gte: new Date() }
});

/**
 * Generates Prisma where clause to filter jobs matching a student's academic profile.
 */
export const studentEligibility = (student) => ({
  OR: [
    { departments: { none: {} } },
    { departments: { some: { departmentId: student.departmentId } } }
  ],
  AND: [
    {
      OR: [
        { programmes: { none: {} } },
        { programmes: { some: { programmeId: student.programmeId } } }
      ]
    },
    {
      OR: [
        { years: { none: {} } },
        { years: { some: { year: student.passingYear } } }
      ]
    }
  ]
});

export const eligible = canViewJob;

/**
 * Validates and cleans job creation and update request payloads.
 */
export async function validateJob(body) {
  const departmentIds = listOf(body.departmentIds);
  const programmeIds = listOf(body.programmeIds);
  const years = listOf(body.years).map((n) => integer(n, 'Graduation year'));

  const deadline = /^\d{4}-\d{2}-\d{2}$/.test(String(body.deadline || ''))
    ? toDate(`${body.deadline}T18:29:59.999Z`)
    : toDate(body.deadline);

  if (deadline < new Date()) {
    fail(400, 'Deadline must be in the future');
  }

  const departments = departmentIds.length
    ? await db.department.findMany({ where: { id: { in: departmentIds }, active: true } })
    : [];

  const programmes = programmeIds.length
    ? await db.programme.findMany({
        where: { id: { in: programmeIds }, active: true },
        include: { department: true }
      })
    : [];

  if (departments.length !== departmentIds.length || programmes.length !== programmeIds.length) {
    fail(400, 'Invalid department or programme');
  }

  if (
    programmes.some(
      (p) => !p.department.active || (departmentIds.length && !departmentIds.includes(p.departmentId))
    )
  ) {
    fail(400, 'Programme does not match target departments');
  }

  if (years.some((y) => y < 2000 || y > 2120)) {
    fail(400, 'Invalid graduation year');
  }

  const min = body.salaryMin === '' || body.salaryMin == null ? null : Number(body.salaryMin);
  const max = body.salaryMax === '' || body.salaryMax == null ? null : Number(body.salaryMax);

  if (
    [min, max].some((n) => n != null && (!Number.isFinite(n) || n < 0)) ||
    (min != null && max != null && max < min)
  ) {
    fail(400, 'Invalid salary range');
  }

  return {
    data: {
      title: required(body.title, 'Job title'),
      description: required(body.description, 'Description', 20000),
      jobType: ['Full Time', 'Internship'].includes(body.jobType) ? body.jobType : 'Full Time',
      salaryMin: min,
      salaryMax: max,
      salaryUnit: cleaned(body.salaryUnit || 'LPA', 30),
      location: required(body.location, 'Location'),
      workMode: ['On-site', 'Hybrid', 'Remote'].includes(body.workMode) ? body.workMode : 'On-site',
      deadline,
      skills: listOf(body.skills).slice(0, 30),
      attachmentFileId: body.attachmentFileId ? String(body.attachmentFileId).slice(0, 36) : null,
      attachmentName: body.attachmentName ? String(body.attachmentName).slice(0, 255) : null,
      attachmentMime: body.attachmentMime ? String(body.attachmentMime).slice(0, 120) : null
    },
    departmentIds,
    programmeIds,
    years
  };
}

/**
 * Creates nested Prisma insert structure for job targeting relations.
 */
export function targetCreates(input) {
  return {
    departments: {
      create: input.departmentIds.map((departmentId) => ({ departmentId }))
    },
    programmes: {
      create: input.programmeIds.map((programmeId) => ({ programmeId }))
    },
    years: {
      create: input.years.map((year) => ({ year }))
    }
  };
}

/**
 * Updates job target relations within a database transaction.
 */
export async function updateTargets(tx, jobId, input) {
  await tx.jobDepartment.deleteMany({ where: { jobId } });
  await tx.jobProgramme.deleteMany({ where: { jobId } });
  await tx.jobYear.deleteMany({ where: { jobId } });

  if (input.departmentIds.length) {
    await tx.jobDepartment.createMany({
      data: input.departmentIds.map((departmentId) => ({ jobId, departmentId }))
    });
  }
  if (input.programmeIds.length) {
    await tx.jobProgramme.createMany({
      data: input.programmeIds.map((programmeId) => ({ jobId, programmeId }))
    });
  }
  if (input.years.length) {
    await tx.jobYear.createMany({
      data: input.years.map((year) => ({ jobId, year }))
    });
  }
}
