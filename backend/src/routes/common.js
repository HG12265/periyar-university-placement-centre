/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - COMMON SHARED ENDPOINTS
 * ============================================================================
 * 
 * Provides:
 * - GET  /api/common/departments            - Active university departments and programmes lookup.
 * - GET  /api/common/notifications          - Recent 50 in-app notifications for authenticated user.
 * - POST /api/common/notifications/:id/read - Marks an in-app notification as read.
 * - POST /api/common/announcements/:id/read - Marks an announcement as read with audience check.
 */

import { Router } from 'express';
import { db, asyncRoute, fail } from '../lib/core.js';
import { canUserReadAnnouncement } from '../lib/announcements.js';

const r = Router();

// ----------------------------------------------------------------------------
// GET /api/common/departments
// ----------------------------------------------------------------------------
r.get(
  '/departments',
  asyncRoute(async (req, res) => {
    const departments = await db.department.findMany({
      where: { active: true },
      include: {
        programmes: {
          where: { active: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(departments);
  })
);

// ----------------------------------------------------------------------------
// GET /api/common/notifications
// ----------------------------------------------------------------------------
r.get(
  '/notifications',
  asyncRoute(async (req, res) => {
    const notifications = await db.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(notifications);
  })
);

// ----------------------------------------------------------------------------
// POST /api/common/notifications/:id/read
// ----------------------------------------------------------------------------
r.post(
  '/notifications/:id/read',
  asyncRoute(async (req, res) => {
    const result = await db.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true }
    });

    if (!result.count) {
      fail(404, 'Notification not found');
    }

    res.json({ message: 'Marked read' });
  })
);

// ----------------------------------------------------------------------------
// POST /api/common/announcements/:id/read
// ----------------------------------------------------------------------------
r.post(
  '/announcements/:id/read',
  asyncRoute(async (req, res) => {
    const announcement = await db.announcement.findUnique({
      where: { id: req.params.id },
      include: { targetDepartments: true }
    });

    if (!announcement?.published) {
      fail(404, 'Announcement not found');
    }

    if (!canUserReadAnnouncement(req.user, announcement)) {
      fail(403, 'Announcement is not for your account');
    }

    await db.announcementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId: announcement.id,
          userId: req.user.id
        }
      },
      create: {
        announcementId: announcement.id,
        userId: req.user.id
      },
      update: {
        readAt: new Date()
      }
    });

    res.json({ message: 'Marked read' });
  })
);

export default r;
