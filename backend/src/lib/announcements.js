/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - ANNOUNCEMENT HELPERS
 * ============================================================================
 *
 * Shared audience/department matching, Prisma query filters, and attachment cleanup
 * used across Admin, Coordinator, Student, Common, and Files routers.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { db } from './core.js';

const uploadRoot = path.resolve(process.env.UPLOAD_DIR || './uploads');

export const ADMIN_AUDIENCES = ['COORDINATORS', 'STUDENTS', 'BOTH'];

export const announcementInclude = {
  department: { select: { id: true, name: true, code: true } },
  targetDepartments: {
    include: {
      department: { select: { id: true, name: true, code: true } }
    }
  }
};

/**
 * Checks whether an announcement applies to a given department ID.
 * If no specific targetDepartments or departmentId are set, it applies to ALL departments.
 */
export function matchesDepartment(announcement, deptId) {
  const targets = announcement.targetDepartments || [];
  if (targets.length > 0) {
    return Boolean(deptId && targets.some((t) => t.departmentId === deptId));
  }
  if (announcement.departmentId) {
    return announcement.departmentId === deptId;
  }
  return true;
}

/**
 * Authorizes whether a user can read an announcement (and its attachment).
 */
export function canUserReadAnnouncement(user, announcement) {
  if (!user || !announcement) return false;
  if (user.role === 'UNIVERSITY_ADMIN') return true;
  if (announcement.authorUserId === user.id) return true;
  if (!announcement.published) return false;

  if (user.role === 'DEPARTMENT_COORDINATOR') {
    return (
      ['COORDINATORS', 'BOTH'].includes(announcement.audience) &&
      matchesDepartment(announcement, user.coordinator?.departmentId)
    );
  }

  if (user.role === 'STUDENT') {
    return (
      ['DEPARTMENT_STUDENTS', 'STUDENTS', 'BOTH'].includes(announcement.audience) &&
      matchesDepartment(announcement, user.student?.departmentId)
    );
  }

  return false;
}

/**
 * Prisma WHERE clause for all published announcements visible to a Student.
 */
export function studentAnnouncementsWhere(departmentId) {
  return {
    published: true,
    OR: [
      { audience: 'DEPARTMENT_STUDENTS', departmentId },
      {
        audience: { in: ['STUDENTS', 'BOTH'] },
        OR: [
          { targetDepartments: { none: {} }, departmentId: null },
          { targetDepartments: { some: { departmentId } } },
          { departmentId }
        ]
      }
    ]
  };
}

/**
 * Prisma WHERE clause for all published Admin announcements visible to a Coordinator.
 */
export function coordinatorAdminAnnouncementsWhere(departmentId) {
  return {
    published: true,
    audience: { in: ['COORDINATORS', 'BOTH'] },
    OR: [
      { targetDepartments: { none: {} }, departmentId: null },
      { targetDepartments: { some: { departmentId } } },
      { departmentId }
    ]
  };
}

/**
 * Safely deletes a FileAsset record and removes its physical file from upload storage.
 */
export async function cleanupFileAsset(fileId) {
  if (!fileId) return;
  const f = await db.fileAsset.findUnique({ where: { id: fileId } });
  if (!f) return;

  await db.fileAsset.delete({ where: { id: f.id } }).catch(() => {});
  const abs = path.resolve(uploadRoot, f.diskPath);
  if (abs.startsWith(uploadRoot + path.sep)) {
    await fs.unlink(abs).catch(() => {});
  }
}
