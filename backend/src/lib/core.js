/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - CORE UTILITIES & HELPERS
 * ============================================================================
 * 
 * Provides:
 * - Prisma client singleton.
 * - HTTP error generation and async route error forwarding.
 * - Cryptographic helpers (sha256, secretToken).
 * - Input validation and cleaning helpers (email, url, integers, strings).
 * - Pagination helpers.
 * - Audit logging and in-app notification helpers.
 * - Public user object serializer.
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

// Singleton instance of Prisma Client
export const db = new PrismaClient();

/**
 * Standard HTTP Error with status code
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Throws an HttpError with the given status code and message.
 */
export const fail = (code, message) => {
  throw new HttpError(code, message);
};

/**
 * Wraps an async express route handler to forward errors to next().
 */
export const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Computes SHA-256 hash in hexadecimal.
 */
export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

/**
 * Generates a high-entropy URL-safe base64 token.
 */
export const secretToken = () => crypto.randomBytes(32).toString('base64url');

/**
 * Validates and converts input to Date object.
 */
export const toDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    fail(400, 'Invalid date');
  }
  return d;
};

/**
 * Validates that input is a valid integer.
 */
export const integer = (v, label = 'Value') => {
  const n = Number(v);
  if (!Number.isInteger(n)) {
    fail(400, `${label} must be an integer`);
  }
  return n;
};

/**
 * Trims and limits string length.
 */
export const cleaned = (v, max = 200) => String(v ?? '').trim().slice(0, max);

/**
 * Validates that a string is present, trimmed, and within max bounds.
 */
export const required = (v, label, max = 200) => {
  const s = cleaned(v, max);
  if (!s) {
    fail(400, `${label} is required`);
  }
  return s;
};

/**
 * Validates and normalizes email addresses.
 */
export const emailOf = (value) => {
  const e = required(value, 'Email', 191).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    fail(400, 'Invalid email address');
  }
  return e;
};

/**
 * Validates and returns an absolute HTTP/HTTPS URL.
 */
export const urlOf = (value) => {
  if (!value) return null;
  try {
    const u = new URL(value);
    if (!['http:', 'https:'].includes(u.protocol)) {
      throw new Error();
    }
    return u.href.slice(0, 500);
  } catch {
    fail(400, 'Use an http:// or https:// URL');
  }
};

/**
 * Converts input to a unique array of non-empty strings.
 */
export const listOf = (input) =>
  Array.isArray(input) ? [...new Set(input.filter(Boolean).map(String))] : [];

/**
 * Standard pagination parameter extractor from query string.
 */
export const pageOf = (req) => {
  const page = Math.min(Math.max(Number(req.query.page) || 1, 1), 100000);
  const take = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  return { skip: (page - 1) * take, take, page };
};

/**
 * Records an immutable administrative audit log entry.
 */
export async function audit(actorUserId, action, resource, resourceId = null, details = null, tx = db) {
  await tx.auditLog.create({
    data: {
      actorUserId,
      action,
      resource,
      resourceId,
      details
    }
  });
}

/**
 * Creates an in-app user notification.
 */
export async function notify(userId, message, tx = db) {
  return tx.notification.create({
    data: {
      userId,
      message: message.slice(0, 500)
    }
  });
}

/**
 * Serializes a user record safe for client delivery (excludes passwordHash, tokens).
 */
export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  fullName: u.fullName,
  role: u.role,
  status: u.status,
  mustChangePassword: u.mustChangePassword,
  student: u.student
    ? {
        id: u.student.id,
        departmentId: u.student.departmentId,
        programmeId: u.student.programmeId
      }
    : null,
  company: u.company
    ? {
        id: u.company.id,
        name: u.company.name
      }
    : null,
  coordinator: u.coordinator
    ? {
        id: u.coordinator.id,
        departmentId: u.coordinator.departmentId
      }
    : null
});
