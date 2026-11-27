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
    // 1. Try to fetch currently active approved jobs (deadline in future)
    let jobs = await db.job.findMany({
      where: availableJobsWhere(),
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

    // 2. Fallback to latest approved jobs if all deadlines expired in dev/test environment
    if (!jobs.length) {
      jobs = await db.job.findMany({
        where: {
          approval: 'APPROVED',
          active: true,
          archived: false
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
        take: 6
      });
    }

    res.json(jobs);
  })
);

export default r;
