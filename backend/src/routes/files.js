/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - FILE ASSET ROUTES
 * ============================================================================
 * 
 * Provides secure handling for:
 * - Profile photos (students)
 * - Corporate brand logos (companies)
 * - Candidate resumes (PDF, DOC, DOCX up to 10 MB)
 * - Course and achievement certificates (PDF, JPG, PNG)
 * 
 * Security features:
 * - Magic number / signature byte validation.
 * - Strict mime type checks.
 * - Path traversal mitigation with absolute canonical check.
 * - Scoped role and authorization verification on read.
 * - Retention locks (resumes attached to job applications cannot be deleted).
 */

import { Router } from 'express';
import multer from 'multer';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { db, asyncRoute, fail, audit } from '../lib/core.js';
import { requireAuth, csrf, assertPasswordUpdated } from '../middleware/auth.js';
import { canUserReadAnnouncement } from '../lib/announcements.js';

const r = Router();
const root = path.resolve(process.env.UPLOAD_DIR || './uploads');

// Multer memory storage (files are verified in-memory before saving to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Purpose configuration registry
const types = {
  photo: {
    role: 'STUDENT',
    folder: 'students/profile-photos',
    limit: 5 * 1024 * 1024,
    extensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  logo: {
    role: 'COMPANY',
    folder: 'companies/logos',
    limit: 5 * 1024 * 1024,
    extensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  resume: {
    role: 'STUDENT',
    folder: 'students/resumes',
    limit: 10 * 1024 * 1024,
    extensions: ['.pdf', '.doc', '.docx']
  },
  certificate: {
    role: 'STUDENT',
    folder: 'students/certificates',
    limit: 10 * 1024 * 1024,
    extensions: ['.pdf', '.jpg', '.jpeg', '.png']
  },
  announcement: {
    roles: ['UNIVERSITY_ADMIN', 'DEPARTMENT_COORDINATOR'],
    folder: 'announcements',
    limit: 10 * 1024 * 1024,
    extensions: ['.pdf', '.jpg', '.jpeg', '.png', '.webp']
  },
  job_attachment: {
    role: 'COMPANY',
    folder: 'jobs/attachments',
    limit: 10 * 1024 * 1024,
    extensions: ['.pdf', '.jpg', '.jpeg', '.png', '.webp']
  }
};

const extMime = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

/**
 * Validates file magic bytes against the declared file extension.
 */
function signatureValid(buf, ext) {
  const hex = buf.subarray(0, 12).toString('hex').toUpperCase();

  if (ext === '.jpg' || ext === '.jpeg') return hex.startsWith('FFD8FF');
  if (ext === '.png') return hex.startsWith('89504E470D0A1A0A');
  if (ext === '.webp') return buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP';
  if (ext === '.pdf') return buf.subarray(0, 5).toString() === '%PDF-';
  if (ext === '.docx') return hex.startsWith('504B0304');
  if (ext === '.doc') return hex.startsWith('D0CF11E0A1B11AE1');

  return false;
}

/**
 * Enforces ownership and access permissions before serving confidential files.
 */
async function canRead(req, file) {
  // Public avatars and brand logos
  if (file.purpose === 'logo' || file.purpose === 'photo') return true;

  const user = req.user;
  if (!user) return false;

  // Placement Admin can access all student files for placement governance
  if (user.role === 'UNIVERSITY_ADMIN') return true;

  if (file.ownerType === 'STUDENT') {
    // Student owns the file
    if (user.role === 'STUDENT') return user.student?.id === file.ownerId;

    // Department Coordinator can view students in their department
    if (user.role === 'DEPARTMENT_COORDINATOR') {
      return !!(await db.student.findFirst({
        where: { id: file.ownerId, departmentId: user.coordinator?.departmentId }
      }));
    }

    // Company can view resume if student applied to one of their jobs
    if (user.role === 'COMPANY') {
      return !!(await db.application.findFirst({
        where: { studentId: file.ownerId, job: { companyId: user.company?.id } }
      }));
    }
  }

  // Recruitment drive attachments (posters/flyers/PDF documents) are viewable by all authenticated users
  if (file.purpose === 'job_attachment' || file.ownerType === 'JOB') return true;

  if (file.ownerType === 'COMPANY') {
    return user.role === 'COMPANY' && user.company?.id === file.ownerId;
  }

  if (file.purpose === 'announcement' || file.ownerType === 'ANNOUNCEMENT') {
    if (file.ownerId === user.id) return true;
    const announcement = await db.announcement.findFirst({
      where: { attachmentFileId: file.id },
      include: { targetDepartments: true }
    });
    if (!announcement) return false;
    return canUserReadAnnouncement(user, announcement);
  }

  return false;
}

// ----------------------------------------------------------------------------
// POST /api/files/upload/:purpose
// ----------------------------------------------------------------------------
r.post(
  '/upload/:purpose',
  requireAuth,
  csrf,
  assertPasswordUpdated,
  upload.single('file'),
  asyncRoute(async (req, res) => {
    const purpose = req.params.purpose;
    const config = types[purpose];
    const allowedRole = config
      ? config.roles
        ? config.roles.includes(req.user.role)
        : req.user.role === config.role
      : false;

    if (!config || !allowedRole) {
      fail(403, 'Upload type not allowed for your account');
    }

    if (!req.file) {
      fail(400, 'Choose a file');
    }

    const ext = path.extname(req.file.originalname).toLowerCase();

    if (
      !config.extensions.includes(ext) ||
      req.file.size > config.limit ||
      !signatureValid(req.file.buffer, ext)
    ) {
      fail(400, 'Invalid file type, signature, or size');
    }

    if (
      req.file.mimetype !== extMime[ext] &&
      !(ext === '.jpg' && req.file.mimetype === 'image/jpg')
    ) {
      fail(400, 'File MIME type mismatch');
    }

    const ownerType =
      purpose === 'logo'
        ? 'COMPANY'
        : purpose === 'announcement'
        ? 'ANNOUNCEMENT'
        : purpose === 'job_attachment'
        ? 'JOB'
        : 'STUDENT';
    const ownerId =
      purpose === 'logo' || purpose === 'job_attachment'
        ? req.user.company.id
        : purpose === 'announcement'
        ? req.user.id
        : req.user.student.id;

    const priorOwner =
      purpose === 'logo'
        ? await db.company.findUnique({ where: { id: ownerId } })
        : purpose === 'photo'
        ? await db.student.findUnique({ where: { id: ownerId } })
        : null;

    const oldFileId =
      purpose === 'logo'
        ? priorOwner?.logoFileId
        : purpose === 'photo'
        ? priorOwner?.photoFileId
        : null;

    const oldFile = oldFileId
      ? await db.fileAsset.findFirst({ where: { id: oldFileId, ownerId } })
      : null;

    const rel = path.posix.join(config.folder, crypto.randomUUID() + ext);
    const abs = path.resolve(root, rel);

    if (!abs.startsWith(root + path.sep)) {
      fail(400, 'Invalid path');
    }

    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, req.file.buffer, { flag: 'wx', mode: 0o600 });

    let item;
    try {
      item = await db.$transaction(async (tx) => {
        const created = await tx.fileAsset.create({
          data: {
            ownerType,
            ownerId,
            purpose,
            diskPath: rel,
            originalName: path.basename(req.file.originalname).slice(0, 255),
            mimeType: extMime[ext],
            size: req.file.size
          }
        });

        if (purpose === 'photo') {
          await tx.student.update({ where: { id: ownerId }, data: { photoFileId: created.id } });
        }
        if (purpose === 'logo') {
          await tx.company.update({ where: { id: ownerId }, data: { logoFileId: created.id } });
        }
        if (oldFile) {
          await tx.fileAsset.deleteMany({ where: { id: oldFile.id, ownerId } });
        }
        if (purpose === 'resume') {
          await tx.resume.updateMany({
            where: { studentId: ownerId, isPrimary: true },
            data: { isPrimary: false }
          });
          await tx.resume.create({
            data: { studentId: ownerId, fileId: created.id, isPrimary: true }
          });
        }

        return created;
      });
    } catch (e) {
      await fs.unlink(abs).catch(() => {});
      throw e;
    }

    if (oldFile) {
      const oldAbs = path.resolve(root, oldFile.diskPath);
      if (oldAbs.startsWith(root + path.sep)) {
        await fs.unlink(oldAbs).catch(() => {});
      }
    }

    await audit(req.user.id, 'UPLOAD', 'file', item.id, { purpose, size: item.size });

    res.status(201).json({
      id: item.id,
      name: item.originalName,
      mimeType: item.mimeType,
      size: item.size,
      url: `/api/files/${item.id}`
    });
  })
);

// ----------------------------------------------------------------------------
// GET /api/files/:id
// ----------------------------------------------------------------------------
r.get(
  '/:id',
  asyncRoute(async (req, res) => {
    const f = await db.fileAsset.findUnique({ where: { id: req.params.id } });
    if (!f) fail(404, 'File not found');

    const isImage = ['logo', 'photo'].includes(f.purpose);

    if (!isImage) {
      const token = req.cookies?.pu_placement_session;
      if (!token) fail(401, 'Sign in to access this file');

      const { sha256 } = await import('../lib/core.js');
      const session = await db.session.findUnique({
        where: { tokenHash: sha256(token) },
        include: {
          user: {
            include: { student: true, company: true, coordinator: true }
          }
        }
      });

      if (!session || session.expiresAt < new Date() || session.user.status !== 'ACTIVE') {
        fail(401, 'Session expired');
      }

      req.user = session.user;
      if (!(await canRead(req, f))) {
        fail(403, 'File access denied');
      }
    }

    const abs = path.resolve(root, f.diskPath);
    if (!abs.startsWith(root + path.sep)) {
      fail(400, 'Invalid stored path');
    }

    try {
      await fs.access(abs);
    } catch {
      fail(404, 'File missing on local storage');
    }

    res.setHeader('Content-Type', f.mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const isPreviewable =
      isImage ||
      ((f.mimeType === 'application/pdf' || f.mimeType.startsWith('image/')) &&
        req.query.preview === '1');

    if (isImage) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
      res.setHeader('Cache-Control', 'private, no-store');
      if (f.mimeType === 'application/pdf' && req.query.preview === '1') {
        res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'self'");
      } else {
        res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      }
    }

    res.setHeader(
      'Content-Disposition',
      `${isPreviewable ? 'inline' : 'attachment'}; filename="${f.originalName.replace(/["\\\r\n]/g, '_')}"`
    );

    res.sendFile(abs);
  })
);

// ----------------------------------------------------------------------------
// DELETE /api/files/:id
// ----------------------------------------------------------------------------
r.delete(
  '/:id',
  requireAuth,
  csrf,
  assertPasswordUpdated,
  asyncRoute(async (req, res) => {
    const f = await db.fileAsset.findUnique({ where: { id: req.params.id } });
    if (!f) fail(404, 'File not found');

    if (f.purpose === 'announcement') {
      const canDel =
        req.user.role === 'UNIVERSITY_ADMIN' ||
        (req.user.role === 'DEPARTMENT_COORDINATOR' && f.ownerId === req.user.id);
      if (!canDel) fail(403, 'Cannot delete this file');
    } else {
      const ownerId = f.purpose === 'logo' ? req.user.company?.id : req.user.student?.id;
      if (f.ownerId !== ownerId || f.ownerType !== (f.purpose === 'logo' ? 'COMPANY' : 'STUDENT')) {
        fail(403, 'Cannot delete this file');
      }
    }

    if (await db.application.findFirst({ where: { resumeFileId: f.id } })) {
      fail(409, 'Resume is attached to application history and must be retained');
    }

    const ownerId = f.purpose === 'logo' ? req.user.company?.id : req.user.student?.id;

    await db.$transaction(async (tx) => {
      if (f.purpose === 'announcement') {
        await tx.announcement.updateMany({
          where: { attachmentFileId: f.id },
          data: { attachmentFileId: null, attachmentName: null, attachmentMime: null }
        });
      }
      if (f.purpose === 'photo') {
        await tx.student.updateMany({
          where: { id: ownerId, photoFileId: f.id },
          data: { photoFileId: null }
        });
      }
      if (f.purpose === 'logo') {
        await tx.company.updateMany({
          where: { id: ownerId, logoFileId: f.id },
          data: { logoFileId: null }
        });
      }
      if (f.purpose === 'resume') {
        const removed = await tx.resume.findFirst({
          where: { fileId: f.id, studentId: ownerId }
        });
        await tx.resume.deleteMany({
          where: { fileId: f.id, studentId: ownerId }
        });
        if (removed?.isPrimary) {
          const older = await tx.resume.findFirst({
            where: { studentId: ownerId },
            orderBy: { createdAt: 'desc' }
          });
          if (older) {
            await tx.resume.update({ where: { id: older.id }, data: { isPrimary: true } });
          }
        }
      }
      if (f.purpose === 'certificate') {
        await tx.certificate.updateMany({
          where: { fileId: f.id, studentId: ownerId },
          data: { fileId: null }
        });
      }
      await tx.fileAsset.delete({ where: { id: f.id } });
    });

    const abs = path.resolve(root, f.diskPath);
    if (abs.startsWith(root + path.sep)) {
      await fs.unlink(abs).catch(() => {});
    }

    res.json({ message: 'File deleted' });
  })
);

export default r;
