/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - PUBLIC API ROUTES
 * ============================================================================
 * 
 * Unauthenticated endpoints for public visitors:
 * - GET /api/public/live-drives : Approved live recruitment drives for homepage ticker
 */

import { Router } from 'express';
import { db, asyncRoute } from '../lib/core.js';
import { availableJobsWhere } from '../lib/jobs.js';

const r = Router();

/**
 * GET /api/public/live-drives
 * Returns active, approved recruitment drives with company info for public ticker.
 */
r.get(
  '/live-drives',
  asyncRoute(async (req, res) => {
    // Strictly fetch ONLY active, approved jobs whose application deadline is in the future
    const jobs = await db.job.findMany({
      where: {
        approval: 'APPROVED',
        active: true,
        archived: false,
        deadline: { gte: new Date() }
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoFileId: true
          }
        },
        departments: {
          include: {
            department: {
              select: { name: true }
            }
          }
        },
        years: true
      },
      orderBy: { createdAt: 'desc' },
      take: 12
    });

    res.json(jobs);
  })
);

export default r;
