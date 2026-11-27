/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - EXCEL UTILITIES
 * ============================================================================
 * 
 * Provides:
 * - Robust parsing for incoming Excel files (.xlsx) handling XML namespace variations.
 * - Styled, auto-filtered Excel spreadsheet generation for reports and candidate exports.
 * - Reusable column schemas and row mapping helpers.
 */

import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { safeSpreadsheetText as safeExcel } from './policies.js';

/**
 * Loads an Excel workbook from a binary buffer, safely normalizing
 * spreadsheet XML namespace prefixes if needed.
 */
export async function loadWorkbook(buffer) {
  let buf = buffer;
  try {
    const zip = await JSZip.loadAsync(buffer);
    let modified = false;

    for (const [name, file] of Object.entries(zip.files)) {
      if (name.endsWith('.xml') || name.endsWith('.rels')) {
        let text = await file.async('text');
        if (text.includes('<x:') || text.includes('</x:')) {
          text = text
            .replace(/<(\/?)x:([a-zA-Z0-9_]+)/g, '<$1$2')
            .replace(
              /xmlns:x="http:\/\/schemas\.openxmlformats\.org\/spreadsheetml\/2006\/main"/g,
              'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'
            );
          zip.file(name, text);
          modified = true;
        }
      }
    }

    if (modified) {
      buf = await zip.generateAsync({ type: 'nodebuffer' });
    }
  } catch (_) {
    // Fall back to original buffer if zip extraction fails
  }

  const book = new ExcelJS.Workbook();
  await book.xlsx.load(buf);
  return book;
}

/**
 * Streams a styled Excel (.xlsx) file as an HTTP response download.
 */
export async function workbookResponse(res, title, headers, rows) {
  const book = new ExcelJS.Workbook();
  book.creator = 'Periyar University Placement Portal';
  book.created = new Date();

  const sheet = book.addWorksheet('Report', { views: [{ state: 'frozen', ySplit: 1 }] });

  sheet.columns = headers.map(([key, label, width]) => ({
    key,
    header: label,
    width: width || 22
  }));

  // Style header row (Dark Navy background with white bold text)
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF132B4B' }
  };

  // Populate data rows safely
  for (const row of rows) {
    sheet.addRow(
      Object.fromEntries(
        headers.map(([key]) => [
          key,
          typeof row[key] === 'number' ? row[key] : safeExcel(row[key])
        ])
      )
    );
  }

  sheet.autoFilter = {
    from: 'A1',
    to: { row: Math.max(1, rows.length + 1), column: headers.length }
  };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${title.replace(/[^a-zA-Z0-9-_]/g, '_')}.xlsx"`
  );

  await book.xlsx.write(res);
  res.end();
}

/**
 * Column headers definition for student and application reports.
 */
export const studentHeaders = [
  ['registrationNo', 'Registration Number', 24],
  ['name', 'Student Name', 28],
  ['email', 'Email', 32],
  ['department', 'Department', 25],
  ['programme', 'Programme', 27],
  ['year', 'Passing Year', 18],
  ['company', 'Company', 26],
  ['job', 'Job', 26],
  ['date', 'Selected / Applied At', 25],
  ['status', 'Status', 17]
];

/**
 * Maps an application database record to a flat report row object.
 */
export function applicationRow(app) {
  return {
    registrationNo: app.student.registrationNo,
    name: app.student.user.fullName,
    email: app.student.user.email,
    department: app.student.department.name,
    programme: app.student.programme.name,
    year: app.student.passingYear,
    company: app.job.company.name,
    job: app.job.title,
    date: (app.selectedAt || app.createdAt).toISOString().slice(0, 10),
    status: app.status
  };
}

/**
 * Prisma include relation for deep querying application details.
 */
export const applicationInclude = {
  student: {
    include: {
      user: true,
      department: true,
      programme: true
    }
  },
  job: {
    include: {
      company: true
    }
  }
};
