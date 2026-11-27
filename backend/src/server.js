/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - BACKEND SERVER ENTRYPOINT
 * ============================================================================
 * 
 * Express API server configuration:
 * - Helmet for security headers and CORS isolation.
 * - Cookie parser for HTTP-only session tokens.
 * - Centralized Prisma database connection.
 * - Role-Based Access Control (RBAC) middleware per router mount.
 * - Global error handling and health-check monitoring endpoint.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// Route Handlers
import auth from './routes/auth.js';
import admin from './routes/admin.js';
import coordinator from './routes/coordinator.js';
import student from './routes/student.js';
import company from './routes/company.js';
import files from './routes/files.js';
import common from './routes/common.js';
import publicRoutes from './routes/public.js';

// Security and RBAC Middleware
import { requireAuth, roles, csrf, assertPasswordUpdated } from './middleware/auth.js';
import { db } from './lib/core.js';

const app = express();

// Security and Header Controls
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS configuration for local development and deployed frontend URLs
app.use(
  cors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(','),
    credentials: true
  })
);

// Body Parsing & Cookie Middleware
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Central API Router (Supports standard /api, /placement_api, and direct mounts)
const apiRouter = express.Router();

// Health Check Endpoint
apiRouter.get('/health', async (req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

// Unprotected / Public Auth Routes (Login, Activation, Password Reset)
apiRouter.use('/auth', auth);

// Public Unauthenticated Endpoints (Approved Live Drives for Homepage Ticker)
apiRouter.use('/public', publicRoutes);

// File Download and Upload Endpoint (Protected internally per operation)
apiRouter.use('/files', files);

// Common Lookup Endpoints (Departments, Notifications, Current Profile)
apiRouter.use('/common', requireAuth, csrf, assertPasswordUpdated, common);

// University Administrator Routes (Departments, Companies, Coordinators, Approvals)
apiRouter.use(
  '/admin',
  requireAuth,
  roles('UNIVERSITY_ADMIN'),
  csrf,
  assertPasswordUpdated,
  admin
);

// Department Placement Coordinator Routes (Student Bulk Import, Job Approval Tracking)
apiRouter.use(
  '/coordinator',
  requireAuth,
  roles('DEPARTMENT_COORDINATOR'),
  csrf,
  assertPasswordUpdated,
  coordinator
);

// Student Candidate Routes (Profile, Portfolio, Applications, Eligible Jobs)
apiRouter.use(
  '/student',
  requireAuth,
  roles('STUDENT'),
  csrf,
  assertPasswordUpdated,
  student
);

// Recruiter / Company Routes (Job Postings, Candidate Screening, Selections)
apiRouter.use(
  '/company',
  requireAuth,
  roles('COMPANY'),
  csrf,
  assertPasswordUpdated,
  company
);

// Mount API Router on /placement_api, /api, and root / so all cPanel configurations work seamlessly
app.use('/placement_api', apiRouter);
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Root Health Check routes for Passenger and Load Balancers
app.get('/', (req, res) => {
  res.status(200).send('Periyar University Placement Portal API is running');
});
app.get('/placement_api', (req, res) => {
  res.status(200).send('Periyar University Placement Portal API is running');
});

// 404 Fallback Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = status === 500 ? 'Unexpected server error' : err.message;

  // Prisma Known Request Errors
  if (err.code === 'P2002') {
    status = 409;
    message = 'This record already exists';
  }
  if (err.code === 'P2003') {
    status = 400;
    message = 'Invalid reference or foreign key constraint failed';
  }

  // Multer File Upload Errors
  if (err.name === 'MulterError') {
    status = 400;
    message = err.message;
  }

  if (status >= 500) {
    console.error('[Server Error]', err);
  }

  res.status(status).json({ error: message });
});

// Start HTTP Server (supports numeric ports and cPanel Passenger Unix socket paths)
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Periyar Placement API listening on ${port} [SMTP configured]`);
});

export default app;
