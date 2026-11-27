/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT PORTAL - BUSINESS POLICIES & RULES
 * ============================================================================
 * 
 * Enforces key recruitment policies across the application:
 * - `canViewJob`: Verifies if a student meets department, programme, and graduation year criteria.
 * - `transitions`: Valid state machine transitions for student applications.
 * - `canAcceptOffer`: Placement cap rule (maximum 2 selected offers per student).
 * - `safeSpreadsheetText`: Neutralizes formula injection characters in spreadsheet exports.
 */

/**
 * Checks whether an active approved job is eligible for a student to view.
 */
export function canViewJob(student, job) {
  const isApproved = job.approval === 'APPROVED';
  const isActive = job.active && !job.archived;

  const matchesDepartment =
    !job.departments.length ||
    job.departments.some((d) => d.departmentId === student.departmentId);

  const matchesProgramme =
    !job.programmes.length ||
    job.programmes.some((p) => p.programmeId === student.programmeId);

  const matchesYear =
    !job.years.length ||
    job.years.some((y) => y.year === student.passingYear);

  return isApproved && isActive && matchesDepartment && matchesProgramme && matchesYear;
}

/**
 * Checks whether a job's application deadline has elapsed.
 */
export function isJobExpired(job, now = new Date()) {
  return new Date(job.deadline) < now;
}

/**
 * Valid state transitions for applications:
 * APPLIED -> SHORTLISTED or REJECTED
 * SHORTLISTED -> SELECTED or REJECTED
 * SELECTED -> Final (no transitions)
 * REJECTED -> Final (no transitions)
 */
export const transitions = {
  APPLIED: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['SELECTED', 'REJECTED'],
  SELECTED: [],
  REJECTED: []
};

/**
 * Validates whether an application status transition is allowed.
 */
export function canTransition(from, to) {
  return !!transitions[from]?.includes(to);
}

/**
 * University policy: A student can accept a maximum of 2 confirmed placement offers.
 */
export function canAcceptOffer(selectedCount) {
  return Number.isInteger(selectedCount) && selectedCount < 2;
}

/**
 * Prevents formula injection (CSV/Excel DDE injection) by escaping special initial symbols.
 */
export function safeSpreadsheetText(v) {
  if (v == null) return '';
  const s = String(v);
  return /^[\s]*[=+@\-\t\r]/.test(s) ? `'${s}` : s;
}
