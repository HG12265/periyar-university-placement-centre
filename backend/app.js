/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - CPANEL STARTUP ENTRYPOINT
 * ============================================================================
 * CloudLinux cPanel Passenger Node.js Application Runner
 */

import fs from 'node:fs';

// Catch and log uncaught exceptions so they are visible in File Manager
process.on('uncaughtException', (err) => {
  const msg = `[${new Date().toISOString()}] Uncaught Exception: ${err.stack || err}\n`;
  console.error(msg);
  try {
    fs.appendFileSync('server_error.log', msg);
  } catch (_) {}
});

process.on('unhandledRejection', (reason) => {
  const msg = `[${new Date().toISOString()}] Unhandled Rejection: ${reason?.stack || reason}\n`;
  console.error(msg);
  try {
    fs.appendFileSync('server_error.log', msg);
  } catch (_) {}
});

import app from './src/server.js';

export default app;
