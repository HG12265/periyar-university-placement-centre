/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - CPANEL PASSENGER LOADER
 * ============================================================================
 * Phusion Passenger in cPanel uses CommonJS require() to boot Node.js apps.
 * This loader bridges CommonJS Passenger to ES Modules (import/export) and
 * automatically handles Prisma Client generation and comprehensive logging.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const errorLogPath = path.join(__dirname, 'server_error.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(line);
  try {
    fs.appendFileSync(errorLogPath, line);
  } catch (_) {}
}

// Global exception catchers
process.on('uncaughtException', (err) => {
  log(`[Uncaught Exception] ${err?.stack || err}`);
});

process.on('unhandledRejection', (reason) => {
  log(`[Unhandled Rejection] ${reason?.stack || reason}`);
});

// Ensure Prisma Client is generated on the host Linux OS
function ensurePrismaClient() {
  try {
    // Test if Prisma Client can be required/resolved
    require('@prisma/client');
    log('Prisma Client is already available.');
  } catch (err) {
    log(`Prisma Client not initialized: ${err.message}. Attempting automatic generation...`);
    try {
      const localPrismaBin = path.join(__dirname, 'node_modules', '.bin', 'prisma');
      const cmd = fs.existsSync(localPrismaBin)
        ? `"${localPrismaBin}" generate`
        : 'npx prisma generate';
      
      log(`Running command: ${cmd}`);
      const output = execSync(cmd, { cwd: __dirname, encoding: 'utf-8', env: process.env });
      log(`Prisma generate output: ${output}`);
    } catch (genErr) {
      log(`Prisma generate failed: ${genErr?.stderr || genErr?.message || genErr}`);
    }
  }
}

// Startup execution
(async () => {
  try {
    log('=== Starting Periyar Placement Portal Backend via loader.cjs ===');
    log(`Node Version: ${process.version}`);
    log(`Current Directory: ${process.cwd()}`);

    // 1. Ensure Prisma client exists for Linux
    ensurePrismaClient();

    // 2. Dynamically import ESM application
    log('Importing ES Module app.js...');
    await import('./app.js');
    log('app.js loaded and listening successfully.');
  } catch (bootErr) {
    log(`[FATAL STARTUP ERROR] ${bootErr?.stack || bootErr}`);
    console.error(bootErr);
  }
})();

