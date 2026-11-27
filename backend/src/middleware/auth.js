/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - AUTH & SECURITY MIDDLEWARE
 * ============================================================================
 * 
 * Provides:
 * - Session cookie settings and duration helpers.
 * - `requireAuth`: Authenticates HTTP-only session cookies and attaches the user model.
 * - `roles`: Role-based access control (RBAC) guard.
 * - `csrf`: Cross-Site Request Forgery header validation for state mutations.
 * - `assertPasswordUpdated`: Enforces mandatory initial password change.
 * - Helpers to extract scoped entity IDs (`studentId`, `companyId`, `coordinatorDept`).
 */

import { db, sha256, fail, asyncRoute } from '../lib/core.js';

export const cookieName = 'pu_placement_session';

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
};

/**
 * Returns session duration in hours, bounded between 1 and 168 (1 week).
 */
export const sessionHours = () =>
  Math.max(1, Math.min(Number(process.env.SESSION_HOURS) || 24, 168));

/**
 * Authenticates user from HTTP-only session cookie.
 */
export const requireAuth = asyncRoute(async (req, res, next) => {
  const token = req.cookies?.[cookieName];
  if (!token) {
    fail(401, 'Sign in to continue');
  }

  const session = await db.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: {
      user: {
        include: {
          student: true,
          company: true,
          coordinator: true
        }
      }
    }
  });

  if (!session || session.expiresAt < new Date() || session.user.status !== 'ACTIVE') {
    fail(401, 'Session expired. Please sign in again');
  }

  req.session = session;
  req.user = session.user;
  next();
});

class ErrorWithStatus extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Guard that verifies the authenticated user has one of the allowed roles.
 */
export const roles = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.user?.role)) {
    return next(new ErrorWithStatus(403, 'Access denied'));
  }
  next();
};

/**
 * Validates CSRF token header on mutating HTTP requests.
 */
export const csrf = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  if (req.headers['x-csrf-token'] !== req.session?.csrfToken) {
    return next(new ErrorWithStatus(403, 'Session verification failed. Refresh the page'));
  }
  next();
};

/**
 * Ensures user has changed their default/provisional password before accessing services.
 */
export const assertPasswordUpdated = (req, res, next) => {
  if (req.user?.mustChangePassword) {
    return next(new ErrorWithStatus(403, 'Change your initial password before continuing'));
  }
  next();
};

/**
 * Helper to retrieve current student ID or throw 403.
 */
export const studentId = (req) => {
  if (!req.user.student) {
    fail(403, 'Student account required');
  }
  return req.user.student.id;
};

/**
 * Helper to retrieve current company ID or throw 403.
 */
export const companyId = (req) => {
  if (!req.user.company) {
    fail(403, 'Company account required');
  }
  return req.user.company.id;
};

/**
 * Helper to retrieve current coordinator's department ID or throw 403.
 */
export const coordinatorDept = (req) => {
  if (!req.user.coordinator) {
    fail(403, 'Coordinator account required');
  }
  return req.user.coordinator.departmentId;
};
