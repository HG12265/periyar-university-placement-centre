/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT SYSTEM - COMPANY / RECRUITER PAGES
 * ============================================================================
 * 
 * Provides views and management interfaces for recruiting companies:
 * 1. CompanyDashboard  - Recruitment overview, hiring pipeline metrics, and candidate distribution chart.
 * 2. CompanyProfile    - Corporate profile details, head office information, and logo upload.
 * 3. JobForm           - Comprehensive job creation/edit form with department, programme, and batch targeting.
 * 4. CompanyJobs       - Recruitment drive management table (post, edit, activate, deactivate, archive).
 * 5. CompanyApplicants - Candidate screening table and deep profile modal (resume, certs, status transition).
 * 6. CompanyReport     - Hiring analytics and exportable placement drive summaries.
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  BriefcaseBusiness,
  PlusCircle,
  FileText,
  UploadCloud,
  Building2,
  Users,
  CheckCircle2,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  GraduationCap,
  Award,
  FolderOpen,
  Code2,
  ArrowLeft,
  Calendar,
  MapPin,
  ChevronRight,
  Search,
  SlidersHorizontal,
  RotateCcw,
  X,
  Filter,
  Printer,
  AlertCircle,
  Check
} from 'lucide-react';
import { api, download, fileUrl, errorText } from '../context/Auth.jsx';
import {
  PageHeading,
  StatGrid,
  Card,
  Badge,
  DataTable,
  Empty,
  Modal,
  CrudForm,
  Button,
  useLoad,
  Loading,
  Notice,
  useAction,
  FileUpload,
  DateFmt,
  ExportButton,
  downloadResumePdf,
  JobAttachment,
  JobAttachmentPicker
} from '../components/UI.jsx';

// ============================================================================
// 1. COMPANY RECRUITMENT DASHBOARD
// ============================================================================
/**
 * Main recruiter workspace showing job counts, applicant milestones, and
 * visual bar chart breakdown of candidates per job posting.
 */
export function CompanyDashboard() {
  const { data, loading, error } = useLoad('/company/dashboard');

  if (loading) return <Loading />;
  if (error) return <Notice message={error} type="error" />;

  const s = data.stats;

  return (
    <>
      <PageHeading
        eyebrow="Recruiter workspace"
        title="Recruitment Dashboard"
        description="Manage your campus hiring pipeline and track applicant progress."
      />

      <div className="role-welcome">
        <div>
          <h2>Find your next great team.</h2>
          <p>Create targeted recruitment drives and discover eligible university talent.</p>
        </div>
        <BriefcaseBusiness size={80} />
      </div>

      <StatGrid
        items={[
          {
            value: s.jobs,
            label: 'Jobs Posted',
            icon: 'jobs',
            to: '/company/dashboard/post-job',
            note: 'Click to view all jobs →'
          },
          {
            value: s.approved,
            label: 'Approved Jobs',
            icon: 'approvals',
            to: '/company/dashboard/post-job?tab=APPROVED',
            note: 'Click to view approved drives →'
          },
          {
            value: s.pending,
            label: 'Pending Review',
            icon: 'approvals',
            to: '/company/dashboard/post-job?tab=PENDING',
            note: 'Click to view pending approval →'
          },
          {
            value: s.applicants,
            label: 'Applicants',
            icon: 'students',
            to: '/company/dashboard/applicants',
            note: 'Click to view all applicants →'
          },
          {
            value: s.shortlisted,
            label: 'Shortlisted Candidates',
            icon: 'reports',
            to: '/company/dashboard/applicants?status=SHORTLISTED',
            note: 'Click to view shortlisted →'
          },
          {
            value: s.selected,
            label: 'Selected Candidates',
            icon: 'reports',
            to: '/company/dashboard/applicants?status=SELECTED',
            note: 'Click to view selected hires →'
          }
        ]}
      />

      <Card title="Applicants by Job">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.byJob}>
            <CartesianGrid vertical={false} stroke="#edf0f5" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="applicants" fill="#167d8d" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}

// ============================================================================
// 2. COMPANY PROFILE
// ============================================================================
/**
 * View and edit corporate details, company background, and brand logo.
 */
function CompanyProfileForm({ initial, onClose }) {
  const [values, setValues] = useState({
    website: initial?.website || '',
    industry: initial?.industry || '',
    employeeSize: initial?.employeeSize || '',
    foundedYear: initial?.foundedYear || '',
    address: initial?.address || '',
    description: initial?.description || '',
    linkedin: initial?.linkedin || '',
    twitter: initial?.twitter || '',
    contactName: initial?.contactName || '',
    contactDesignation: initial?.contactDesignation || '',
    contactPhone: initial?.contactPhone || '',
    contactEmail: initial?.contactEmail || ''
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await api.patch('/company/profile', values);
      onClose(true);
    } catch (ex) {
      setErr(errorText(ex));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h3 className="form-caption" style={{ marginTop: 0 }}>
        Corporate Information
      </h3>
      <div className="field-grid">
        <label className="form-field">
          <span>Company Website</span>
          <input type="url" value={values.website} onChange={set('website')} placeholder="https://company.com" />
        </label>
        <label className="form-field">
          <span>Industry</span>
          <input type="text" value={values.industry} onChange={set('industry')} placeholder="e.g. Information Technology" />
        </label>
        <label className="form-field">
          <span>Employee Size</span>
          <input type="text" value={values.employeeSize} onChange={set('employeeSize')} placeholder="e.g. 500 - 1000" />
        </label>
        <label className="form-field">
          <span>Founded Year</span>
          <input type="number" value={values.foundedYear} onChange={set('foundedYear')} placeholder="e.g. 2005" />
        </label>
        <label className="form-field field-wide">
          <span>Head Office Address</span>
          <textarea rows={3} value={values.address} onChange={set('address')} />
        </label>
        <label className="form-field field-wide">
          <span>Company Description</span>
          <textarea rows={4} value={values.description} onChange={set('description')} />
        </label>
        <label className="form-field">
          <span>LinkedIn URL</span>
          <input type="url" value={values.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/company/..." />
        </label>
        <label className="form-field">
          <span>X / Twitter URL</span>
          <input type="url" value={values.twitter} onChange={set('twitter')} placeholder="https://x.com/..." />
        </label>
      </div>

      <div
        style={{
          marginTop: 20,
          marginBottom: 14,
          padding: 16,
          borderRadius: 12,
          background: '#f6f9fc',
          border: '1px solid #e3ebf3'
        }}
      >
        <h3 className="form-caption" style={{ marginTop: 0, marginBottom: 12, color: '#0f233a' }}>
          Company Contact Details
        </h3>
        <div className="field-grid">
          <label className="form-field">
            <span>Contact Person Name</span>
            <input
              type="text"
              value={values.contactName}
              onChange={set('contactName')}
              placeholder="e.g. Karthik Sundaram"
            />
          </label>
          <label className="form-field">
            <span>Designation</span>
            <input
              type="text"
              value={values.contactDesignation}
              onChange={set('contactDesignation')}
              placeholder="e.g. HR Manager / Campus Recruiter"
            />
          </label>
          <label className="form-field">
            <span>Mobile Number</span>
            <input
              type="tel"
              value={values.contactPhone}
              onChange={set('contactPhone')}
              placeholder="e.g. +91 98765 43210"
            />
          </label>
          <label className="form-field">
            <span>Email ID</span>
            <input
              type="email"
              value={values.contactEmail}
              onChange={set('contactEmail')}
              placeholder="e.g. hr@company.com"
            />
          </label>
        </div>
      </div>

      <Notice message={err} type="error" />

      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={() => onClose(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

export function CompanyProfile() {
  const { data, loading, reload } = useLoad('/company/profile');
  const [edit, setEdit] = useState(false);
  const { execute, message, error } = useAction();

  if (loading) return <Loading />;
  if (!data) return <Empty title="Company profile unavailable" />;

  return (
    <>
      <PageHeading
        eyebrow="Corporate identity"
        title="Company Profile"
        description="Keep your company information and recruiter contact details accurate for university staff and student applicants."
        action={<Button onClick={() => setEdit(true)}>Edit Profile</Button>}
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      <div className="content-grid">
        <Card title="Company Information">
          <div className="info-grid">
            <div className="info-pair">
              <small>Registered Name</small>
              <strong>{data.name}</strong>
            </div>
            <div className="info-pair">
              <small>Login Email</small>
              <strong>{data.user.email}</strong>
            </div>
            <div className="info-pair">
              <small>Industry</small>
              <strong>{data.industry || 'Not added'}</strong>
            </div>
            <div className="info-pair">
              <small>Workforce</small>
              <strong>{data.employeeSize || '—'}</strong>
            </div>
            <div className="info-pair">
              <small>Founded</small>
              <strong>{data.foundedYear || '—'}</strong>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: '#5b7286', lineHeight: 1.8 }}>
            {data.description || 'Add a description of your organization.'}
          </p>
          {data.website && (
            <a className="file-link" href={data.website} target="_blank" rel="noreferrer">
              Visit Website <ExternalLink size={16} />
            </a>
          )}
        </Card>

        <Card title="Company Logo">
          {data.logoFileId ? (
            <img
              className="preview-img"
              src={fileUrl(data.logoFileId)}
              alt="Company logo"
              crossOrigin="anonymous"
            />
          ) : (
            <Empty title="Company logo not uploaded" />
          )}
          <FileUpload purpose="logo" onUploaded={reload} />
          {data.logoFileId && (
            <Button
              variant="danger"
              onClick={async () => {
                if (confirm('Remove logo?')) {
                  await execute(() => api.delete(`/files/${data.logoFileId}`));
                  reload();
                }
              }}
            >
              Remove Logo
            </Button>
          )}
        </Card>
      </div>

      <Card title="Company Contact Details" style={{ marginTop: 20 }}>
        <div className="info-grid">
          <div className="info-pair">
            <small>Contact Person Name</small>
            <strong>{data.contactName || 'Not added'}</strong>
          </div>
          <div className="info-pair">
            <small>Designation</small>
            <strong>{data.contactDesignation || 'Not added'}</strong>
          </div>
          <div className="info-pair">
            <small>Mobile Number</small>
            <strong>{data.contactPhone || 'Not added'}</strong>
          </div>
          <div className="info-pair">
            <small>Email ID</small>
            <strong>{data.contactEmail || 'Not added'}</strong>
          </div>
        </div>
      </Card>

      {edit && (
        <Modal title="Edit Corporate Profile" onClose={() => setEdit(false)}>
          <CompanyProfileForm
            initial={data}
            onClose={(ok) => {
              setEdit(false);
              if (ok) reload();
            }}
          />
        </Modal>
      )}
    </>
  );
}

// ============================================================================
// 3. JOB CREATION / EDITING FORM
// ============================================================================
/** Field definitions for campus recruitment jobs */
const jobFields = [
  { name: 'title', label: 'Job Title', required: true },
  { name: 'jobType', label: 'Job Type', type: 'select', options: ['Full Time', 'Internship'], required: true },
  { name: 'description', label: 'Detailed Job Description', type: 'textarea', wide: true, required: true },
  { name: 'salaryMin', label: 'Minimum Salary', type: 'number', step: '0.01' },
  { name: 'salaryMax', label: 'Maximum Salary', type: 'number', step: '0.01' },
  { name: 'salaryUnit', label: 'Salary Unit', type: 'select', options: ['LPA', 'INR / month', 'INR / year'] },
  { name: 'location', label: 'Work Location', required: true },
  { name: 'workMode', label: 'Work Mode', type: 'select', options: ['On-site', 'Hybrid', 'Remote'] },
  { name: 'deadline', label: 'Application Deadline', type: 'date', required: true },
  { name: 'skillsText', label: 'Required Skills (comma-separated)', wide: true }
];

/**
 * Form modal component for creating and editing recruitment drives,
 * including academic eligibility filters.
 */
function JobForm({ job, onClose, departments = [] }) {
  const [departmentIds, setDepartmentIds] = useState(
    job?.departments?.map((d) => d.departmentId) || []
  );
  const [programmeIds, setProgrammeIds] = useState(
    job?.programmes?.map((p) => p.programmeId) || []
  );
  const [selectedYears, setSelectedYears] = useState(() => {
    if (!job?.years?.length) return [];
    return job.years
      .map((y) => (typeof y === 'object' ? Number(y.year) : Number(y)))
      .filter((n) => Number.isFinite(n) && n > 0);
  });
  const [customYear, setCustomYear] = useState('');
  const [progSearch, setProgSearch] = useState('');
  const [deptSearch, setDeptSearch] = useState('');
  const [attachment, setAttachment] = useState({
    attachmentFileId: job?.attachmentFileId || null,
    attachmentName: job?.attachmentName || null,
    attachmentMime: job?.attachmentMime || null
  });
  const { execute, error, message } = useAction();

  const initial = job
    ? {
      ...job,
      deadline: job.deadline.slice(0, 10),
      skillsText: Array.isArray(job.skills) ? job.skills.join(', ') : ''
    }
    : {
      jobType: 'Full Time',
      workMode: 'On-site',
      salaryUnit: 'LPA'
    };

  // Standard graduating batch options
  const standardYears = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  function toggleYear(yr) {
    const num = Number(yr);
    if (!Number.isFinite(num)) return;
    setSelectedYears((prev) =>
      prev.includes(num) ? prev.filter((y) => y !== num) : [...prev, num].sort((a, b) => a - b)
    );
  }

  function handleAddCustomYear(e) {
    if (e) e.preventDefault();
    const val = parseInt(customYear.trim(), 10);
    if (val && val >= 2000 && val <= 2120) {
      if (!selectedYears.includes(val)) {
        setSelectedYears((prev) => [...prev, val].sort((a, b) => a - b));
      }
      setCustomYear('');
    }
  }

  function toggleDepartment(depId) {
    const next = departmentIds.includes(depId)
      ? departmentIds.filter((id) => id !== depId)
      : [...departmentIds, depId];
    setDepartmentIds(next);

    // Prune programmes if departments are actively selected
    if (next.length > 0) {
      setProgrammeIds((prev) =>
        prev.filter((pId) =>
          departments
            .filter((d) => next.includes(d.id))
            .some((d) => d.programmes.some((p) => p.id === pId))
        )
      );
    }
  }

  function toggleProgramme(progId) {
    setProgrammeIds((prev) =>
      prev.includes(progId) ? prev.filter((p) => p !== progId) : [...prev, progId]
    );
  }

  // Active departments to display programmes for
  const activeDepartmentsForProgrammes = departments.filter((d) =>
    departmentIds.length === 0 ? true : departmentIds.includes(d.id)
  );

  // Filter programmes by search query
  const filteredDepartmentsWithProgrammes = activeDepartmentsForProgrammes
    .map((d) => {
      const progs = (d.programmes || []).filter((p) =>
        progSearch.trim()
          ? p.name.toLowerCase().includes(progSearch.toLowerCase()) ||
            (p.code && p.code.toLowerCase().includes(progSearch.toLowerCase()))
          : true
      );
      return { ...d, programmes: progs };
    })
    .filter((d) => d.programmes.length > 0);

  function selectAllVisibleProgrammes() {
    const visibleIds = filteredDepartmentsWithProgrammes.flatMap((d) =>
      d.programmes.map((p) => p.id)
    );
    setProgrammeIds((prev) => [...new Set([...prev, ...visibleIds])]);
  }

  function clearProgrammes() {
    setProgrammeIds([]);
  }

  function selectAllDepartments() {
    setDepartmentIds(departments.map((d) => d.id));
  }

  function clearDepartments() {
    setDepartmentIds([]);
    setProgrammeIds([]);
  }

  const save = async (values) => {
    const body = {
      ...values,
      attachmentFileId: attachment.attachmentFileId,
      attachmentName: attachment.attachmentName,
      attachmentMime: attachment.attachmentMime,
      skills: String(values.skillsText || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      departmentIds,
      programmeIds,
      years: selectedYears
    };
    const response = await (job
      ? api.patch(`/company/jobs/${job.id}`, body)
      : api.post('/company/jobs', body));
    return response;
  };

  return (
    <>
      <p className="muted" style={{ fontSize: 12, marginBottom: 14 }}>
        All new or materially edited jobs require placement administration approval before
        students can view them.
      </p>

      {/* Modern Executive Eligibility Targets Manager */}
      <div
        style={{
          border: '1px solid #dbeafe',
          borderRadius: 14,
          background: 'linear-gradient(180deg, #f8fafc 0%, #f0f7ff 100%)',
          padding: '18px 20px',
          marginBottom: 22,
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}
      >
        {/* Header with Title & Live Filter Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            paddingBottom: 14,
            borderBottom: '1px solid #e2e8f0',
            marginBottom: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7'
              }}
            >
              <GraduationCap size={20} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0
                }}
              >
                Candidate Eligibility Targets
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
                Specify departments, degree programmes, and graduation batches. Leave empty to target all students.
              </p>
            </div>
          </div>

          <div>
            {departmentIds.length === 0 && programmeIds.length === 0 && selectedYears.length === 0 ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '4px 10px',
                  borderRadius: 20
                }}
              >
                <Globe size={13} /> Open Drive (All University Students Eligible)
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '4px 10px',
                  borderRadius: 20
                }}
              >
                <SlidersHorizontal size={13} /> Targeted Drive Active
              </span>
            )}
          </div>
        </div>

        {/* 1. Target Passing-Out Batches (Graduation Years) */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: '14px 16px',
            marginBottom: 16
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              gap: 8,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={15} color="#167d8d" />
              <strong style={{ fontSize: 13, color: '#0f172a' }}>
                Target Passing-Out Batches (Graduation Years)
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => setSelectedYears([])}
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: selectedYears.length === 0 ? '1px solid #14b8a6' : '1px solid #cbd5e1',
                  background: selectedYears.length === 0 ? '#f0fdfa' : '#fff',
                  color: selectedYears.length === 0 ? '#0d9488' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                🎓 Target All Batches
              </button>
              {selectedYears.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedYears([])}
                  style={{
                    fontSize: 11.5,
                    color: '#dc2626',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px 0' }}>
            Click batch buttons below to include specific graduation years (or leave on All Batches for unrestricted drive):
          </p>

          {/* Year Chips Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {standardYears.map((yr) => {
              const active = selectedYears.includes(yr);
              return (
                <button
                  type="button"
                  key={yr}
                  onClick={() => toggleYear(yr)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    padding: '6px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: active ? '#167d8d' : '#f8fafc',
                    color: active ? '#ffffff' : '#334155',
                    border: active ? '1px solid #167d8d' : '1px solid #cbd5e1',
                    boxShadow: active ? '0 2px 5px rgba(22, 125, 141, 0.25)' : 'none'
                  }}
                >
                  {active && <Check size={13} strokeWidth={2.5} />}
                  <span>Batch {yr}</span>
                </button>
              );
            })}

            {/* Custom Year Add Input */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
              <input
                type="number"
                placeholder="Other year..."
                value={customYear}
                onChange={(e) => setCustomYear(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomYear();
                  }
                }}
                style={{
                  width: 100,
                  padding: '5px 8px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#fff'
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomYear}
                disabled={!customYear}
                style={{
                  fontSize: 11.5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  cursor: customYear ? 'pointer' : 'default',
                  fontWeight: 600
                }}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Active Batches Indicator */}
          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: '1px dashed #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: 12
            }}
          >
            {selectedYears.length === 0 ? (
              <span style={{ color: '#059669', fontWeight: 600 }}>
                ✓ Currently open to ALL passing-out batches (no graduation year restriction applied).
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Eligible Batches:</span>
                {selectedYears.map((yr) => (
                  <span
                    key={yr}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 11.5,
                      fontWeight: 600
                    }}
                  >
                    Class of {yr}
                    <X
                      size={12}
                      style={{ cursor: 'pointer', marginLeft: 2 }}
                      onClick={() => toggleYear(yr)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Departments & Programmes Selection (Split Panels) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
            marginBottom: 16
          }}
        >
          {/* Left Panel: Academic Departments */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                gap: 6
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={15} color="#167d8d" />
                <strong style={{ fontSize: 13, color: '#0f172a' }}>
                  Departments
                </strong>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 7px',
                    borderRadius: 10,
                    background: departmentIds.length === 0 ? '#ecfdf5' : '#eff6ff',
                    color: departmentIds.length === 0 ? '#065f46' : '#1d4ed8',
                    fontWeight: 600
                  }}
                >
                  {departmentIds.length === 0 ? 'All 8' : `${departmentIds.length} selected`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  type="button"
                  onClick={selectAllDepartments}
                  style={{
                    fontSize: 11,
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: '2px 4px'
                  }}
                >
                  Select All
                </button>
                <span style={{ color: '#cbd5e1' }}>·</span>
                <button
                  type="button"
                  onClick={clearDepartments}
                  style={{
                    fontSize: 11,
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '2px 4px'
                  }}
                >
                  Clear (All)
                </button>
              </div>
            </div>

            <p style={{ fontSize: 11.5, color: '#64748b', margin: '0 0 10px 0' }}>
              Unselected defaults to all university departments.
            </p>

            {/* Department Search */}
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <Search
                size={13}
                style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Filter departments..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '5px 8px 5px 28px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc'
                }}
              />
            </div>

            {/* Department Items List */}
            <div
              style={{
                maxHeight: 250,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                paddingRight: 2
              }}
            >
              {departments
                .filter((d) =>
                  deptSearch.trim()
                    ? d.name.toLowerCase().includes(deptSearch.toLowerCase())
                    : true
                )
                .map((d) => {
                  const isChecked = departmentIds.includes(d.id);
                  const progCount = d.programmes?.length || 0;
                  return (
                    <div
                      key={d.id}
                      onClick={() => toggleDepartment(d.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: isChecked ? '1px solid #14b8a6' : '1px solid #e2e8f0',
                        background: isChecked ? '#f0fdfa' : '#ffffff',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: isChecked ? '1px solid #0d9488' : '1px solid #cbd5e1',
                            background: isChecked ? '#0d9488' : '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            flexShrink: 0
                          }}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: isChecked ? 600 : 500,
                            color: isChecked ? '#0f766e' : '#334155',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={d.name}
                        >
                          {d.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#94a3b8',
                          flexShrink: 0,
                          marginLeft: 6
                        }}
                      >
                        {progCount} prog
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Panel: Degree Programmes */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                gap: 6
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FolderOpen size={15} color="#167d8d" />
                <strong style={{ fontSize: 13, color: '#0f172a' }}>
                  Degree Programmes
                </strong>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 7px',
                    borderRadius: 10,
                    background: programmeIds.length === 0 ? '#ecfdf5' : '#eff6ff',
                    color: programmeIds.length === 0 ? '#065f46' : '#1d4ed8',
                    fontWeight: 600
                  }}
                >
                  {programmeIds.length === 0 ? 'All programmes' : `${programmeIds.length} selected`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  type="button"
                  onClick={selectAllVisibleProgrammes}
                  style={{
                    fontSize: 11,
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: '2px 4px'
                  }}
                >
                  Select All
                </button>
                <span style={{ color: '#cbd5e1' }}>·</span>
                <button
                  type="button"
                  onClick={clearProgrammes}
                  style={{
                    fontSize: 11,
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '2px 4px'
                  }}
                >
                  Clear (All)
                </button>
              </div>
            </div>

            <p style={{ fontSize: 11.5, color: '#64748b', margin: '0 0 10px 0' }}>
              Select specific degrees or leave empty for all in chosen departments.
            </p>

            {/* Programme Search */}
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <Search
                size={13}
                style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Search programme (e.g. MCA, MBA, M.Sc, B.Com)..."
                value={progSearch}
                onChange={(e) => setProgSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '5px 8px 5px 28px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc'
                }}
              />
            </div>

            {/* Grouped Programmes List */}
            <div
              style={{
                maxHeight: 250,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                paddingRight: 2
              }}
            >
              {filteredDepartmentsWithProgrammes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 10px', color: '#94a3b8', fontSize: 12 }}>
                  No programmes match the filter or selected departments.
                </div>
              ) : (
                filteredDepartmentsWithProgrammes.map((dep) => (
                  <div key={dep.id} style={{ marginBottom: 2 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: '#64748b',
                        background: '#f8fafc',
                        padding: '3px 8px',
                        borderRadius: 4,
                        marginBottom: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{dep.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 500, color: '#94a3b8' }}>
                        {dep.programmes.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {dep.programmes.map((p) => {
                        const isChecked = programmeIds.includes(p.id);
                        const isPG = p.name.startsWith('M.') || p.name.includes('Master');
                        return (
                          <div
                            key={p.id}
                            onClick={() => toggleProgramme(p.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              border: isChecked ? '1px solid #14b8a6' : '1px solid #e2e8f0',
                              background: isChecked ? '#f0fdfa' : '#ffffff',
                              transition: 'all 0.1s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <div
                                style={{
                                  width: 15,
                                  height: 15,
                                  borderRadius: 4,
                                  border: isChecked ? '1px solid #0d9488' : '1px solid #cbd5e1',
                                  background: isChecked ? '#0d9488' : '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  flexShrink: 0
                                }}
                              >
                                {isChecked && <Check size={10} strokeWidth={3} />}
                              </div>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: isChecked ? 600 : 500,
                                  color: isChecked ? '#0f766e' : '#334155',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={p.name}
                              >
                                {p.name}
                              </span>
                            </div>

                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: 4,
                                background: isPG ? '#f3e8ff' : '#e0e7ff',
                                color: isPG ? '#7e22ce' : '#3730a3',
                                flexShrink: 0
                              }}
                            >
                              {isPG ? 'PG' : 'UG'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 3. Executive Live Eligibility Summary Bar */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 10,
            border: '1px solid #cbd5e1',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            fontSize: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>📋 Active Eligibility:</span>
            <span>
              <strong>Departments:</strong>{' '}
              {departmentIds.length === 0
                ? 'All University Departments'
                : `${departmentIds.length} Selected (${departments
                    .filter((d) => departmentIds.includes(d.id))
                    .map((d) => d.name)
                    .slice(0, 2)
                    .join(', ')}${departmentIds.length > 2 ? '...' : ''})`}
            </span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span>
              <strong>Programmes:</strong>{' '}
              {programmeIds.length === 0
                ? 'All Degrees in selected departments'
                : `${programmeIds.length} Degree(s)`}
            </span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span>
              <strong>Batches:</strong>{' '}
              {selectedYears.length === 0
                ? 'All Passing Years'
                : `Class of ${selectedYears.sort((a, b) => a - b).join(', ')}`}
            </span>
          </div>

          {(departmentIds.length > 0 || programmeIds.length > 0 || selectedYears.length > 0) && (
            <button
              type="button"
              onClick={() => {
                setDepartmentIds([]);
                setProgrammeIds([]);
                setSelectedYears([]);
              }}
              style={{
                fontSize: 11,
                color: '#dc2626',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RotateCcw size={11} /> Reset All to Open
            </button>
          )}
        </div>
      </div>

      <CrudForm
        title="Recruitment Drive Details"
        fields={jobFields}
        initial={initial}
        onSave={save}
        onClose={onClose}
        submitLabel={job ? 'Save Changes & Request Reapproval' : 'Submit for Approval'}
      >
        <JobAttachmentPicker value={attachment} onChange={setAttachment} />
      </CrudForm>

      <Notice message={error} type="error" />
    </>
  );
}

// ============================================================================
// 4. RECRUITMENT DRIVES / JOBS
// ============================================================================
/**
 * Table view of jobs posted by the company, with controls to activate, deactivate,
 * archive, or edit job details.
 */
export function CompanyJobs() {
  const { data, loading, reload } = useLoad('/company/jobs');
  const { data: departments } = useLoad('/common/departments');
  const [modal, setModal] = useState(null);
  const { execute, message, error } = useAction();
  const [searchParams] = useSearchParams();

  // Filters State
  const [search, setSearch] = useState('');
  const initialTab = searchParams.get('tab') || 'ALL';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [jobTypeFilter, setJobTypeFilter] = useState('ALL');
  const [workModeFilter, setWorkModeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && ['ALL', 'APPROVED', 'PENDING', 'ACTIVE', 'ARCHIVED', 'REJECTED'].includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  async function status(job, action) {
    if (!confirm(`${action} job "${job.title}"?`)) return;
    await execute(() => api.patch(`/company/jobs/${job.id}/status`, { action }));
    reload();
  }

  const jobsList = data || [];

  const tabCounts = {
    ALL: jobsList.length,
    APPROVED: jobsList.filter((j) => j.approval === 'APPROVED').length,
    PENDING: jobsList.filter((j) => j.approval === 'PENDING').length,
    ACTIVE: jobsList.filter((j) => j.active && !j.archived).length,
    ARCHIVED: jobsList.filter((j) => j.archived).length,
    REJECTED: jobsList.filter((j) => j.approval === 'REJECTED').length
  };

  const isFiltered =
    search.trim() !== '' ||
    activeTab !== 'ALL' ||
    jobTypeFilter !== 'ALL' ||
    workModeFilter !== 'ALL' ||
    sortBy !== 'newest';

  function resetFilters() {
    setSearch('');
    setActiveTab('ALL');
    setJobTypeFilter('ALL');
    setWorkModeFilter('ALL');
    setSortBy('newest');
  }

  const filteredJobs = jobsList
    .filter((j) => {
      if (activeTab === 'APPROVED' && j.approval !== 'APPROVED') return false;
      if (activeTab === 'PENDING' && j.approval !== 'PENDING') return false;
      if (activeTab === 'REJECTED' && j.approval !== 'REJECTED') return false;
      if (activeTab === 'ACTIVE' && (!j.active || j.archived)) return false;
      if (activeTab === 'ARCHIVED' && !j.archived) return false;

      if (jobTypeFilter !== 'ALL' && j.jobType !== jobTypeFilter) return false;
      if (workModeFilter !== 'ALL' && (j.workMode || 'On-site') !== workModeFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = j.title?.toLowerCase().includes(q);
        const matchLoc = j.location?.toLowerCase().includes(q);
        const matchDesc = j.description?.toLowerCase().includes(q);
        const matchSkills =
          Array.isArray(j.skills) && j.skills.some((s) => String(s).toLowerCase().includes(q));
        if (!matchTitle && !matchLoc && !matchDesc && !matchSkills) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'applications')
        return (b._count?.applications || 0) - (a._count?.applications || 0);
      return 0;
    });

  return (
    <>
      <PageHeading
        eyebrow="Recruitment drives"
        title="Job Postings"
        description="Create, submit and manage campus recruitment drives. Approval is required before publication."
        action={
          <Button icon={PlusCircle} onClick={() => setModal({})}>
            Post a Job
          </Button>
        }
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      {/* Modern Filter Panel */}
      <div className="filter-panel">
        <div className="filter-pill-row">
          {[
            { id: 'ALL', label: 'All Postings' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'PENDING', label: 'Pending Review' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'ARCHIVED', label: 'Archived' },
            { id: 'REJECTED', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="pill-count">{tabCounts[tab.id] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="filter-inputs-grid">
          <div className="filter-search-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by job title, location, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="filter-search-clear" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <select
            className="filter-dropdown"
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Internship">Internship</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
          </select>

          <select
            className="filter-dropdown"
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
          >
            <option value="ALL">All Work Modes</option>
            <option value="On-site">On-site</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <select
            className="filter-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="deadline">Sort: Deadline Soonest</option>
            <option value="title">Sort: Title (A–Z)</option>
            <option value="applications">Sort: Most Applicants</option>
          </select>

          {isFiltered && (
            <button className="filter-reset-action" onClick={resetFilters}>
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        <div className="filter-meta-bar">
          <span>
            Showing <strong>{filteredJobs.length}</strong> of <strong>{jobsList.length}</strong> recruitment drives
            {isFiltered && ' (filtered)'}
          </span>
          {isFiltered && (
            <span style={{ color: '#0e7043' }}>
              ✓ Filters Active
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredJobs.length === 0 ? (
        <Card>
          <div className="filter-empty-state">
            <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
            <strong>No matching recruitment drives found</strong>
            <span>No jobs match your current search and filter combination. Try adjusting or clearing your filters.</span>
            {isFiltered && (
              <div style={{ marginTop: 8 }}>
                <Button variant="outline" icon={RotateCcw} onClick={resetFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <DataTable
            rows={filteredJobs.map((j) => ({
              ...j,
              companyName: j.company.name,
              deadlineText: new Date(j.deadline).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }),
              applicantCount: j._count?.applications ?? 0
            }))}
            columns={[
              {
                key: 'title',
                label: 'Job Title',
                render: (r) => (
                  <div>
                    <strong style={{ display: 'block', color: '#102438' }}>{r.title}</strong>
                    {r.attachmentFileId && (
                      <div style={{ marginTop: 4 }}>
                        <JobAttachment job={r} compact={true} />
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'jobType',
                label: 'Type & Mode',
                render: (r) => (
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {r.jobType} · {r.workMode || 'On-site'}
                  </span>
                )
              },
              {
                key: 'applicantCount',
                label: 'Applicants',
                render: (r) => (
                  <span
                    className="resume-timeline-pill"
                    style={{
                      background: r.applicantCount > 0 ? '#eafbf3' : '#f8fafc',
                      borderColor: r.applicantCount > 0 ? '#bbf0d8' : '#e2e8f0',
                      color: r.applicantCount > 0 ? '#0e7043' : '#64748b'
                    }}
                  >
                    <strong>{r.applicantCount}</strong> applied
                  </span>
                )
              },
              {
                key: 'deadlineText',
                label: 'Deadline',
                render: (r) => {
                  const isExpired = new Date(r.deadline).getTime() < Date.now();
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontWeight: 600, color: isExpired ? '#b91c1c' : '#334155' }}>
                        {r.deadlineText}
                      </span>
                      {isExpired ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10.5,
                            fontWeight: 700,
                            background: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            padding: '2px 8px',
                            borderRadius: 999,
                            width: 'fit-content'
                          }}
                        >
                          <AlertCircle size={10} /> Deadline Passed / Closed
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10.5,
                            fontWeight: 600,
                            background: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                            padding: '2px 8px',
                            borderRadius: 999,
                            width: 'fit-content'
                          }}
                        >
                          Open / Active
                        </span>
                      )}
                    </div>
                  );
                }
              },
              { key: 'approval', label: 'Approval', render: (r) => <Badge value={r.approval} /> },
              {
                key: 'active',
                label: 'Availability',
                render: (r) => (
                  <Badge value={r.archived ? 'Archived' : r.active ? 'Active' : 'Inactive'} />
                )
              },
              {
                key: 'id',
                label: 'Manage',
                render: (r) => (
                  <div className="mini-actions">
                    <button
                      className="mini-btn"
                      disabled={r.archived}
                      onClick={() => setModal(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="mini-btn"
                      disabled={r.archived}
                      onClick={() => status(r, r.active ? 'deactivate' : 'activate')}
                    >
                      {r.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="mini-btn danger"
                      disabled={r.archived}
                      onClick={() => status(r, 'archive')}
                    >
                      Archive
                    </button>
                    <button
                      className="mini-btn danger"
                      onClick={async () => {
                        if (
                          confirm(
                            `Are you sure you want to permanently delete job "${r.title}"? This cannot be undone.`
                          )
                        ) {
                          const res = await execute(() =>
                            api.delete(`/company/jobs/${r.id}`)
                          );
                          if (res) reload();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )
              }
            ]}
          />
        </Card>
      )}

      {modal && (
        <Modal
          wide
          title={modal.id ? 'Edit Recruitment Drive' : 'Create Recruitment Drive'}
          onClose={() => setModal(null)}
        >
          <JobForm
            job={modal.id ? modal : null}
            departments={departments || []}
            onClose={(ok) => {
              setModal(null);
              if (ok) reload();
            }}
          />
        </Modal>
      )}
    </>
  );
}

// ============================================================================
// 5. APPLICANTS MANAGEMENT
// ============================================================================
/**
 * Table of candidates who applied to this company's postings, with modal view of
 * academic qualifications, skills, projects, resume download, and status progression.
 */
export function CompanyApplicants() {
  const { data: jobs, loading: jobsLoading, reload: reloadJobs } = useLoad('/company/jobs');
  const { data: applicants, loading: appsLoading, reload: reloadApps } = useLoad('/company/applicants');
  const [searchParams] = useSearchParams();

  const initialStatus = searchParams.get('status');

  const [selectedJob, setSelectedJob] = useState(() => (initialStatus ? 'ALL' : null));
  const [selected, setSelected] = useState(null);
  const { execute, message, error, busy } = useAction();

  // View 1 Filters (Posted Jobs Cards)
  const [jobSearch, setJobSearch] = useState('');
  const [jobTab, setJobTab] = useState('ALL');
  const [jobSortBy, setJobSortBy] = useState('applicants');

  // View 2 Filters (Candidate Applicants Table)
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateStatusTab, setCandidateStatusTab] = useState(() => {
    return initialStatus &&
      ['ALL', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'].includes(initialStatus)
      ? initialStatus
      : 'ALL';
  });
  const [candidateProgFilter, setCandidateProgFilter] = useState('ALL');
  const [candidateSortBy, setCandidateSortBy] = useState('newest');

  useEffect(() => {
    const s = searchParams.get('status');
    if (s && ['ALL', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'].includes(s)) {
      setSelectedJob('ALL');
      setCandidateStatusTab(s);
    }
  }, [searchParams]);

  const loading = jobsLoading || appsLoading;

  async function change(status) {
    if (!confirm(`Change candidate status to ${status}?`)) return;
    const r = await execute(() =>
      api.patch(`/company/applications/${selected.id}/status`, { status })
    );
    if (r) {
      setSelected(null);
      reloadApps();
      reloadJobs();
    }
  }

  const allApps = applicants || [];
  const allJobs = jobs || [];
  const totalApps = allApps.length;
  const totalShortlisted = allApps.filter(
    (a) => a.status === 'SHORTLISTED' || a.status === 'SELECTED'
  ).length;
  const totalSelected = allApps.filter((a) => a.status === 'SELECTED').length;

  const appsByJob = {};
  for (const a of allApps) {
    if (!appsByJob[a.jobId]) appsByJob[a.jobId] = [];
    appsByJob[a.jobId].push(a);
  }

  const currentJob =
    selectedJob && typeof selectedJob === 'object'
      ? allJobs.find((j) => j.id === selectedJob.id) || selectedJob
      : null;

  const displayedApplicants =
    selectedJob === 'ALL'
      ? allApps
      : currentJob
        ? appsByJob[currentJob.id] || []
        : [];

  // Filtered Jobs in View 1
  const jobTabCounts = {
    ALL: allJobs.length,
    WITH_APPS: allJobs.filter((j) => (appsByJob[j.id]?.length || 0) > 0).length,
    ZERO_APPS: allJobs.filter((j) => (appsByJob[j.id]?.length || 0) === 0).length,
    APPROVED: allJobs.filter((j) => j.approval === 'APPROVED').length,
    PENDING: allJobs.filter((j) => j.approval === 'PENDING').length
  };

  const isJobFiltered =
    jobSearch.trim() !== '' || jobTab !== 'ALL' || jobSortBy !== 'applicants';

  function resetJobFilters() {
    setJobSearch('');
    setJobTab('ALL');
    setJobSortBy('applicants');
  }

  const filteredJobs = allJobs
    .filter((j) => {
      const count = appsByJob[j.id]?.length || 0;
      if (jobTab === 'WITH_APPS' && count === 0) return false;
      if (jobTab === 'ZERO_APPS' && count > 0) return false;
      if (jobTab === 'APPROVED' && j.approval !== 'APPROVED') return false;
      if (jobTab === 'PENDING' && j.approval !== 'PENDING') return false;

      if (jobSearch.trim()) {
        const q = jobSearch.toLowerCase();
        const matchTitle = j.title?.toLowerCase().includes(q);
        const matchLoc = j.location?.toLowerCase().includes(q);
        const matchType = j.jobType?.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchType) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const countA = appsByJob[a.id]?.length || 0;
      const countB = appsByJob[b.id]?.length || 0;
      if (jobSortBy === 'applicants') return countB - countA;
      if (jobSortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (jobSortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      if (jobSortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  // Filtered Candidates in View 2
  const candidateStatusCounts = {
    ALL: displayedApplicants.length,
    APPLIED: displayedApplicants.filter((a) => a.status === 'APPLIED').length,
    SHORTLISTED: displayedApplicants.filter((a) => a.status === 'SHORTLISTED').length,
    SELECTED: displayedApplicants.filter((a) => a.status === 'SELECTED').length,
    REJECTED: displayedApplicants.filter((a) => a.status === 'REJECTED').length
  };

  const availableProgrammes = Array.from(
    new Set(
      displayedApplicants
        .map((a) => a.student?.programme?.name)
        .filter(Boolean)
    )
  ).sort();

  const isCandidateFiltered =
    candidateSearch.trim() !== '' ||
    candidateStatusTab !== 'ALL' ||
    candidateProgFilter !== 'ALL' ||
    candidateSortBy !== 'newest';

  function resetCandidateFilters() {
    setCandidateSearch('');
    setCandidateStatusTab('ALL');
    setCandidateProgFilter('ALL');
    setCandidateSortBy('newest');
  }

  const filteredCandidates = displayedApplicants
    .filter((a) => {
      if (candidateStatusTab !== 'ALL' && a.status !== candidateStatusTab) return false;
      if (
        candidateProgFilter !== 'ALL' &&
        a.student?.programme?.name !== candidateProgFilter
      )
        return false;

      if (candidateSearch.trim()) {
        const q = candidateSearch.toLowerCase();
        const matchName = a.student?.user?.fullName?.toLowerCase().includes(q);
        const matchReg = a.student?.registrationNo?.toLowerCase().includes(q);
        const matchEmail = a.student?.user?.email?.toLowerCase().includes(q);
        const matchProg = a.student?.programme?.name?.toLowerCase().includes(q);
        const matchJob = a.job?.title?.toLowerCase().includes(q);
        if (!matchName && !matchReg && !matchEmail && !matchProg && !matchJob)
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (candidateSortBy === 'newest')
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (candidateSortBy === 'oldest')
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (candidateSortBy === 'name')
        return (a.student?.user?.fullName || '').localeCompare(
          a.student?.user?.fullName || ''
        );
      if (candidateSortBy === 'regNo')
        return (a.student?.registrationNo || '').localeCompare(
          a.student?.registrationNo || ''
        );
      if (candidateSortBy === 'status')
        return a.status.localeCompare(b.status);
      return 0;
    });

  return (
    <>
      <Notice message={message} />
      <Notice message={error} type="error" />

      {/* VIEW 1: POSTED JOBS OVERVIEW (DEFAULT) */}
      {!selectedJob && (
        <>
          <PageHeading
            eyebrow="Candidate screening"
            title="Company Applicants"
            description="Select a posted recruitment drive below to view its applied candidates and screening profiles."
            action={
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {totalApps > 0 && (
                  <Button variant="secondary" onClick={() => setSelectedJob('ALL')}>
                    View All Candidates ({totalApps})
                  </Button>
                )}
                <ExportButton
                  onClick={() => download('/company/applicants/export', 'company_applicants.xlsx')}
                />
              </div>
            }
          />

          <StatGrid
            items={[
              {
                label: 'Active Drives',
                value: allJobs.filter((j) => j.active && !j.archived).length,
                icon: 'BriefcaseBusiness',
                note: `${allJobs.length} total posted`
              },
              {
                label: 'Total Applicants',
                value: totalApps,
                icon: 'Users',
                note: 'Across all drives'
              },
              {
                label: 'Shortlisted',
                value: totalShortlisted,
                icon: 'CheckCircle2',
                note: 'In review stages'
              },
              {
                label: 'Selected / Hired',
                value: totalSelected,
                icon: 'Award',
                note: 'Offers extended'
              }
            ]}
          />

          {/* View 1: Job Cards Filter Panel */}
          <div className="filter-panel">
            <div className="filter-pill-row">
              {[
                { id: 'ALL', label: 'All Posted Drives' },
                { id: 'WITH_APPS', label: 'With Candidates' },
                { id: 'APPROVED', label: 'Approved' },
                { id: 'PENDING', label: 'Pending Review' },
                { id: 'ZERO_APPS', label: 'Zero Applicants' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`filter-pill ${jobTab === tab.id ? 'active' : ''}`}
                  onClick={() => setJobTab(tab.id)}
                >
                  <span>{tab.label}</span>
                  <span className="pill-count">{jobTabCounts[tab.id] ?? 0}</span>
                </button>
              ))}
            </div>

            <div className="filter-inputs-grid">
              <div className="filter-search-wrap">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter drives by title, location, type..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                />
                {jobSearch && (
                  <button className="filter-search-clear" onClick={() => setJobSearch('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                className="filter-dropdown"
                value={jobSortBy}
                onChange={(e) => setJobSortBy(e.target.value)}
              >
                <option value="applicants">Sort: Most Applicants</option>
                <option value="newest">Sort: Newest Postings</option>
                <option value="deadline">Sort: Deadline Soonest</option>
                <option value="title">Sort: Title (A–Z)</option>
              </select>

              {isJobFiltered && (
                <button className="filter-reset-action" onClick={resetJobFilters}>
                  <RotateCcw size={13} /> Reset Filter
                </button>
              )}
            </div>

            <div className="filter-meta-bar">
              <span>
                Showing <strong>{filteredJobs.length}</strong> of <strong>{allJobs.length}</strong> recruitment drives
                {isJobFiltered && ' (filtered)'}
              </span>
              {isJobFiltered && (
                <span style={{ color: '#0e7043' }}>✓ Drive Filters Active</span>
              )}
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : allJobs.length === 0 ? (
            <Card>
              <Empty
                title="No Recruitment Drives Posted"
                text="You have not created any job postings yet. Once you post a job and it receives student applications, candidates will appear here."
              />
            </Card>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <div className="filter-empty-state">
                <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
                <strong>No matching recruitment drives</strong>
                <span>Try clearing your search or selecting a different filter tab.</span>
                {isJobFiltered && (
                  <div style={{ marginTop: 8 }}>
                    <Button variant="outline" icon={RotateCcw} onClick={resetJobFilters}>
                      Clear Drive Filters
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="applicants-jobs-grid">
              {filteredJobs.map((job) => {
                const jobApps = appsByJob[job.id] || [];
                const count = jobApps.length;
                const shortlisted = jobApps.filter(
                  (a) => a.status === 'SHORTLISTED' || a.status === 'SELECTED'
                ).length;

                return (
                  <div
                    key={job.id}
                    className="applicant-job-card"
                    onClick={() => setSelectedJob(job)}
                  >
                    <div
                      className={`applicant-job-card-top ${count > 0 ? 'has-applicants' : ''}`}
                    />
                    <div className="applicant-job-card-body">
                      <div className="applicant-job-card-header">
                        <h3 className="applicant-job-card-title">{job.title}</h3>
                        <div className="applicant-job-badges">
                          <Badge value={job.approval} />
                          <Badge
                            value={job.archived ? 'Archived' : job.active ? 'Active' : 'Inactive'}
                          />
                        </div>
                      </div>

                      <div className="applicant-job-meta-list">
                        <div className="applicant-job-meta-item">
                          <BriefcaseBusiness size={14} />
                          <span>
                            {job.jobType} · {job.workMode || 'On-site'}
                          </span>
                        </div>
                        <div className="applicant-job-meta-item">
                          <MapPin size={14} />
                          <span>{job.location}</span>
                        </div>
                        <div className="applicant-job-meta-item">
                          <Award size={14} />
                          <span>
                            Package:{' '}
                            {job.salaryMin && job.salaryMax
                              ? `${job.salaryMin}–${job.salaryMax} ${job.salaryUnit || 'LPA'}`
                              : 'Disclosed on interview'}
                          </span>
                        </div>
                        <div className="applicant-job-meta-item">
                          <Calendar size={14} />
                          <span>
                            Deadline:{' '}
                            {new Date(job.deadline).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          {new Date(job.deadline).getTime() < Date.now() && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                fontSize: 10,
                                fontWeight: 700,
                                background: '#fef2f2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                padding: '1px 6px',
                                borderRadius: 999,
                                marginLeft: 6
                              }}
                            >
                              <AlertCircle size={10} /> Deadline Passed / Closed
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`applicant-count-banner ${count > 0 ? 'active-applicants' : ''}`}
                      >
                        <span
                          className={`applicant-count-number ${count > 0 ? 'active-applicants' : ''
                            }`}
                        >
                          <Users size={16} />
                          {count} {count === 1 ? 'Candidate Applied' : 'Candidates Applied'}
                        </span>
                        {shortlisted > 0 && (
                          <span className="applicant-count-sub">
                            {shortlisted} Shortlisted
                          </span>
                        )}
                      </div>

                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                        }}
                      >
                        View Applicants ({count}) →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW 2: JOB-SPECIFIC APPLICANTS LIST (DRILL-DOWN) */}
      {selectedJob && (
        <>
          <div className="applicant-drill-header">
            <div className="applicant-drill-left">
              <Button
                icon={ArrowLeft}
                variant="outline"
                onClick={() => {
                  setSelectedJob(null);
                  resetCandidateFilters();
                }}
              >
                Back to Posted Jobs
              </Button>
              <div className="applicant-drill-info">
                <h2 className="applicant-drill-title">
                  {selectedJob === 'ALL'
                    ? 'All Candidates (Across All Drives)'
                    : currentJob?.title}
                </h2>
                <div className="applicant-drill-sub">
                  {selectedJob === 'ALL' ? (
                    <span>Showing all {totalApps} applied students across all drives</span>
                  ) : (
                    <>
                      <span>{currentJob?.jobType}</span>
                      <span>·</span>
                      <span>{currentJob?.location}</span>
                      <span>·</span>
                      <span>
                        Deadline:{' '}
                        {new Date(currentJob?.deadline).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        {new Date(currentJob?.deadline).getTime() < Date.now() && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: 10,
                              fontWeight: 700,
                              background: '#fef2f2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              padding: '1px 6px',
                              borderRadius: 999,
                              marginLeft: 6
                            }}
                          >
                            <AlertCircle size={10} /> Deadline Passed / Closed
                          </span>
                        )}
                      </span>
                      <span>·</span>
                      <strong style={{ color: '#0e7043' }}>
                        {displayedApplicants.length}{' '}
                        {displayedApplicants.length === 1 ? 'Candidate' : 'Candidates'}
                      </strong>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="applicant-drill-controls">
              <select
                className="job-switch-select"
                value={selectedJob === 'ALL' ? 'ALL' : currentJob?.id}
                onChange={(e) => {
                  if (e.target.value === 'ALL') {
                    setSelectedJob('ALL');
                  } else {
                    const match = allJobs.find((j) => j.id === e.target.value);
                    if (match) setSelectedJob(match);
                  }
                  resetCandidateFilters();
                }}
              >
                <option value="ALL">All Jobs ({totalApps} candidates)</option>
                {allJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({(appsByJob[j.id] || []).length} candidates)
                  </option>
                ))}
              </select>

              <ExportButton
                onClick={() => {
                  if (selectedJob === 'ALL') {
                    download('/company/applicants/export', 'company_applicants.xlsx');
                  } else {
                    download(
                      `/company/applicants/export?jobId=${currentJob?.id}`,
                      `${(currentJob?.title || 'job').replace(/\s+/g, '_')}_applicants.xlsx`
                    );
                  }
                }}
              />
            </div>
          </div>

          {/* View 2: Candidate Advanced Filter Toolbar */}
          <div className="filter-panel">
            <div className="filter-pill-row">
              {[
                { id: 'ALL', label: 'All Candidates' },
                { id: 'APPLIED', label: 'Applied' },
                { id: 'SHORTLISTED', label: 'Shortlisted' },
                { id: 'SELECTED', label: 'Selected / Offered' },
                { id: 'REJECTED', label: 'Rejected' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`filter-pill ${candidateStatusTab === tab.id ? 'active' : ''}`}
                  onClick={() => setCandidateStatusTab(tab.id)}
                >
                  <span>{tab.label}</span>
                  <span className="pill-count">{candidateStatusCounts[tab.id] ?? 0}</span>
                </button>
              ))}
            </div>

            <div className="filter-inputs-grid">
              <div className="filter-search-wrap">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search candidate name, reg. no, email, programme..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                />
                {candidateSearch && (
                  <button className="filter-search-clear" onClick={() => setCandidateSearch('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {availableProgrammes.length > 1 && (
                <select
                  className="filter-dropdown"
                  value={candidateProgFilter}
                  onChange={(e) => setCandidateProgFilter(e.target.value)}
                >
                  <option value="ALL">All Programmes</option>
                  {availableProgrammes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}

              <select
                className="filter-dropdown"
                value={candidateSortBy}
                onChange={(e) => setCandidateSortBy(e.target.value)}
              >
                <option value="newest">Sort: Applied Date (Newest)</option>
                <option value="oldest">Sort: Applied Date (Oldest)</option>
                <option value="name">Sort: Candidate Name (A–Z)</option>
                <option value="regNo">Sort: Reg. No. (Asc)</option>
                <option value="status">Sort: Status</option>
              </select>

              {isCandidateFiltered && (
                <button className="filter-reset-action" onClick={resetCandidateFilters}>
                  <RotateCcw size={13} /> Reset Filter
                </button>
              )}
            </div>

            <div className="filter-meta-bar">
              <span>
                Showing <strong>{filteredCandidates.length}</strong> of{' '}
                <strong>{displayedApplicants.length}</strong> candidate applications
                {isCandidateFiltered && ' (filtered)'}
              </span>
              {isCandidateFiltered && (
                <span style={{ color: '#0e7043' }}>✓ Candidate Filter Active</span>
              )}
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : displayedApplicants.length === 0 ? (
            <Card>
              <Empty
                title="No Applicants for this Job"
                text={`No candidates have applied to "${currentJob?.title || 'this job'}" yet. When students submit applications, they will appear here.`}
              />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <Button
                  icon={ArrowLeft}
                  variant="outline"
                  onClick={() => setSelectedJob(null)}
                >
                  Return to Posted Jobs
                </Button>
              </div>
            </Card>
          ) : filteredCandidates.length === 0 ? (
            <Card>
              <div className="filter-empty-state">
                <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
                <strong>No matching candidate applications found</strong>
                <span>Try clearing your search query or selecting a different status filter tab.</span>
                {isCandidateFiltered && (
                  <div style={{ marginTop: 8 }}>
                    <Button variant="outline" icon={RotateCcw} onClick={resetCandidateFilters}>
                      Clear Candidate Filters
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <DataTable
                rows={filteredCandidates.map((a) => ({
                  ...a,
                  name: a.student.user.fullName,
                  registrationNo: a.student.registrationNo,
                  programme: a.student.programme.name,
                  jobTitle: a.job.title,
                  company: a.job.company.name
                }))}
                columns={[
                  { key: 'registrationNo', label: 'Reg. No.' },
                  { key: 'name', label: 'Candidate' },
                  { key: 'programme', label: 'Programme' },
                  { key: 'jobTitle', label: 'Job Applied' },
                  { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
                  {
                    key: 'id',
                    label: 'Candidate',
                    render: (r) => (
                      <button className="mini-btn" onClick={() => setSelected(r)}>
                        View Profile
                      </button>
                    )
                  }
                ]}
              />
            </Card>
          )}
        </>
      )}

      {selected && (() => {
        const s = selected.student;
        const fmtMY = (d) =>
          d
            ? new Date(d).toLocaleDateString('en-IN', {
              month: 'short',
              year: 'numeric',
              timeZone: 'Asia/Kolkata'
            })
            : 'Present';
        const education = [...(s.education || [])].sort(
          (a, b) => (b.passingYear || 0) - (a.passingYear || 0)
        );
        const experiences = s.experiences || [];
        const internships = s.internships || [];
        const projects = s.projects || [];
        const skills = s.skills || [];
        const certificates = s.certificates || [];

        return (
          <Modal
            wide
            title={`${s.user.fullName} — Candidate Resume Profile`}
            onClose={() => setSelected(null)}
            extra={
              <button
                type="button"
                className="mini-btn primary"
                onClick={() => downloadResumePdf(s)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Print or Save Resume as A4 PDF"
              >
                <Printer size={13} /> Download PDF (A4)
              </button>
            }
          >
            <div className="resume-sheet">
              <div className="resume-top-bar" />

              {/* Executive Resume Header */}
              <div className="resume-header">
                <div className="resume-header-main">
                  <h2 className="resume-name">{s.user.fullName}</h2>
                  <p className="resume-subtitle">
                    {s.programme.name} · Department of {s.department.name} · Passing-Out Year: {s.passingYear}
                  </p>
                  <div className="resume-meta-pills">
                    <span className="resume-meta-pill">Reg. No: {s.registrationNo}</span>
                    <span className="resume-meta-pill role-pill">
                      Applied for: {selected.job.title}
                    </span>
                    <span className="resume-meta-pill">Passing-Out Year: {s.passingYear}</span>
                    <Badge value={selected.status} />
                  </div>

                  <div className="resume-contact-row">
                    <a
                      className="resume-contact-item"
                      href={`mailto:${s.user.email}`}
                      title="Registered Email"
                    >
                      <Mail size={13} color="#167d8d" /> {s.user.email}
                    </a>
                    {s.phone && (
                      <a
                        className="resume-contact-item"
                        href={`tel:${s.phone}`}
                        title="Phone Number"
                      >
                        <Phone size={13} color="#167d8d" /> {s.phone}
                      </a>
                    )}
                    {s.linkedin && (
                      <a
                        className="resume-contact-item"
                        href={s.linkedin.startsWith('http') ? s.linkedin : `https://${s.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        title={s.linkedin}
                      >
                        <Globe size={13} /> LinkedIn <ExternalLink size={11} />
                      </a>
                    )}
                    {s.github && (
                      <a
                        className="resume-contact-item"
                        href={s.github.startsWith('http') ? s.github : `https://${s.github}`}
                        target="_blank"
                        rel="noreferrer"
                        title={s.github}
                      >
                        <Code2 size={13} /> GitHub <ExternalLink size={11} />
                      </a>
                    )}
                    {s.portfolio && (
                      <a
                        className="resume-contact-item"
                        href={s.portfolio.startsWith('http') ? s.portfolio : `https://${s.portfolio}`}
                        target="_blank"
                        rel="noreferrer"
                        title={s.portfolio}
                      >
                        <Globe size={13} /> Portfolio <ExternalLink size={11} />
                      </a>
                    )}
                    {s.twitter && (
                      <a
                        className="resume-contact-item"
                        href={s.twitter.startsWith('http') ? s.twitter : `https://${s.twitter}`}
                        target="_blank"
                        rel="noreferrer"
                        title={s.twitter}
                      >
                        <ExternalLink size={12} /> Twitter / X
                      </a>
                    )}
                  </div>
                </div>

                {s.photoFileId && (
                  <div className="resume-photo-frame">
                    <img
                      src={fileUrl(s.photoFileId)}
                      alt={s.user.fullName}
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
              </div>

              {/* Resume Body Sections */}
              <div className="resume-body">
                {/* 1. Professional Summary */}
                {s.about && (
                  <section>
                    <h3 className="resume-section-title">Professional Summary</h3>
                    <p className="resume-summary-text">{s.about}</p>
                  </section>
                )}

                {/* 2. Education */}
                <section>
                  <h3 className="resume-section-title">
                    <GraduationCap size={14} /> Education
                  </h3>
                  {education.length > 0 ? (
                    <div className="resume-entry-list">
                      {education.map((e) => (
                        <div className="resume-entry" key={e.id}>
                          <div className="resume-entry-top">
                            <div>
                              <span className="resume-entry-title">{e.qualification}</span>
                              {e.board && (
                                <span className="resume-entry-sub"> — {e.board}</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span className="resume-entry-score">
                                {e.score} {e.scale === 'Percentage' ? '%' : `(${e.scale})`}
                              </span>
                              <span className="resume-entry-date">{e.passingYear}</span>
                            </div>
                          </div>
                          <div className="resume-entry-sub">{e.institution}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted" style={{ fontSize: 12.5, margin: 0 }}>
                      Academic details not added yet.
                    </p>
                  )}
                </section>

                {/* 3. Skills */}
                {skills.length > 0 && (
                  <section>
                    <h3 className="resume-section-title">
                      <Code2 size={14} /> Skills
                    </h3>
                    <div className="resume-skills-wrap">
                      {skills.map((sk) => (
                        <span key={sk.id} className="resume-skill-tag">
                          {sk.name}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. Work Experience */}
                {experiences.length > 0 && (
                  <section>
                    <h3 className="resume-section-title">
                      <Building2 size={14} /> Work Experience
                    </h3>
                    <div className="resume-entry-list">
                      {experiences.map((ex) => (
                        <div className="resume-entry" key={ex.id}>
                          <div className="resume-entry-top">
                            <div>
                              <span className="resume-entry-title">{ex.role}</span>
                              {ex.employmentType && (
                                <span className="resume-entry-sub"> · {ex.employmentType}</span>
                              )}
                            </div>
                            <span className="resume-entry-date">
                              {fmtMY(ex.startDate)} –{' '}
                              {ex.currentlyWorking || !ex.endDate ? 'Present' : fmtMY(ex.endDate)}
                            </span>
                          </div>
                          <div className="resume-entry-sub">
                            {ex.companyName}
                            {ex.location ? ` · ${ex.location}` : ''}
                          </div>
                          {ex.description && (
                            <p className="resume-entry-desc">{ex.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 5. Internships */}
                {internships.length > 0 && (
                  <section>
                    <h3 className="resume-section-title">
                      <BriefcaseBusiness size={14} /> Internships
                    </h3>
                    <div className="resume-entry-list">
                      {internships.map((i) => (
                        <div className="resume-entry" key={i.id}>
                          <div className="resume-entry-top">
                            <div>
                              <span className="resume-entry-title">{i.domain}</span>
                              <span className="resume-entry-sub"> — {i.companyName}</span>
                            </div>
                            <span className="resume-entry-date">
                              {fmtMY(i.startDate)} – {fmtMY(i.endDate)}
                            </span>
                          </div>
                          {i.description && <p className="resume-entry-desc">{i.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 6. Projects */}
                {projects.length > 0 && (
                  <section>
                    <h3 className="resume-section-title">
                      <FolderOpen size={14} /> Projects
                    </h3>
                    <div className="resume-entry-list">
                      {projects.map((p) => (
                        <div className="resume-entry" key={p.id}>
                          <div className="resume-entry-top">
                            <div>
                              <span className="resume-entry-title">{p.title}</span>
                              {p.technologies && (
                                <span className="resume-entry-sub"> · {p.technologies}</span>
                              )}
                            </div>
                            <div className="resume-links-inline">
                              {p.github && (
                                <a
                                  href={p.github.startsWith('http') ? p.github : `https://${p.github}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ wordBreak: 'break-all' }}
                                >
                                  <Code2 size={11} /> {p.github} <ExternalLink size={11} />
                                </a>
                              )}
                              {p.liveUrl && (
                                <a
                                  href={p.liveUrl.startsWith('http') ? p.liveUrl : `https://${p.liveUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ wordBreak: 'break-all' }}
                                >
                                  <Globe size={11} /> {p.liveUrl} <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          </div>
                          {p.description && <p className="resume-entry-desc">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 7. Certifications */}
                {certificates.length > 0 && (
                  <section>
                    <h3 className="resume-section-title">
                      <Award size={14} /> Certifications
                    </h3>
                    <div className="resume-entry-list">
                      {certificates.map((c) => (
                        <div className="resume-entry" key={c.id}>
                          <div className="resume-entry-top">
                            <div>
                              <span className="resume-entry-title">{c.title}</span>
                              <span className="resume-entry-sub"> — {c.issuer}</span>
                            </div>
                            <div className="resume-links-inline">
                              <span className="resume-entry-date">{c.year}</span>
                              {c.fileId && (
                                <a href={fileUrl(c.fileId, true)} target="_blank" rel="noreferrer">
                                  View Certificate <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 8. Cover Letter */}
                {selected.coverLetter && (
                  <section>
                    <h3 className="resume-section-title">
                      <FileText size={14} /> Cover Letter
                    </h3>
                    <p className="resume-summary-text">{selected.coverLetter}</p>
                  </section>
                )}
              </div>
            </div>

            {/* Recruiter Screening & Documents Footer */}
            <div className="resume-screening-bar">
              <div className="resume-doc-row">
                <div>
                  <strong style={{ fontSize: 13.5, color: '#0f233a', display: 'block' }}>
                    Submitted Application Resume
                  </strong>
                  <small className="muted">
                    Attached at time of application on <DateFmt value={selected.createdAt} />
                  </small>
                </div>
                <div className="mini-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="mini-btn primary"
                    onClick={() => downloadResumePdf(s)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer'
                    }}
                  >
                    <Printer size={13} /> Download PDF (A4)
                  </button>
                  {selected.resumeFileId && (
                    <>
                      <a
                        className="mini-btn"
                        href={fileUrl(selected.resumeFileId, true)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                      >
                        <ExternalLink size={13} /> Preview Uploaded File
                      </a>
                      <a
                        className="mini-btn"
                        href={fileUrl(selected.resumeFileId)}
                        download
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                      >
                        <Download size={13} /> Download Uploaded File
                      </a>
                    </>
                  )}
                </div>
              </div>

              {selected.history?.length > 0 && (
                <div className="resume-timeline-row">
                  <small className="muted" style={{ fontWeight: 700 }}>
                    Timeline:
                  </small>
                  {selected.history.map((h) => (
                    <span className="resume-timeline-pill" key={h.id}>
                      <strong>{h.toStatus}</strong> · <DateFmt value={h.createdAt} />
                    </span>
                  ))}
                </div>
              )}

              <div className="form-actions" style={{ marginTop: 4 }}>
                <Badge value={selected.status} />
                {selected.status === 'APPLIED' && (
                  <>
                    <Button disabled={busy} variant="danger" onClick={() => change('REJECTED')}>
                      Reject
                    </Button>
                    <Button disabled={busy} onClick={() => change('SHORTLISTED')}>
                      Shortlist
                    </Button>
                  </>
                )}
                {selected.status === 'SHORTLISTED' && (
                  <>
                    <Button disabled={busy} variant="danger" onClick={() => change('REJECTED')}>
                      Reject
                    </Button>
                    <Button disabled={busy} onClick={() => change('SELECTED')}>
                      Confirm Selection
                    </Button>
                  </>
                )}
              </div>

              {selected.status === 'SELECTED' && (
                <p className="muted" style={{ fontSize: 12, margin: 0 }}>
                  Confirmed selections are final. Contact the placement administrator for any
                  exceptional corrections.
                </p>
              )}
            </div>
          </Modal>
        );
      })()}
    </>
  );
}

// ============================================================================
// 6. HIRING SUMMARY & REPORT
// ============================================================================
/**
 * Placement drive analytics table and export for the company.
 */
export function CompanyReport() {
  const { data, loading, error } = useLoad('/company/report');

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [activityFilter, setActivityFilter] = useState('ALL');
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('apps_desc');

  const rows = data?.rows || [];

  const totalDrives = rows.length;
  const totalApps = rows.reduce((sum, r) => sum + (r.applications || 0), 0);
  const totalShortlisted = rows.reduce((sum, r) => sum + (r.shortlisted || 0), 0);
  const totalSelected = rows.reduce((sum, r) => sum + (r.selected || 0), 0);
  const hireRate = totalApps > 0 ? ((totalSelected / totalApps) * 100).toFixed(1) : '0.0';

  const tabCounts = {
    ALL: rows.length,
    WITH_APPS: rows.filter((r) => r.applications > 0).length,
    WITH_HIRES: rows.filter((r) => r.selected > 0).length,
    APPROVED: rows.filter((r) => r.approval === 'APPROVED').length,
    PENDING: rows.filter((r) => r.approval === 'PENDING').length,
    ZERO_APPS: rows.filter((r) => r.applications === 0).length
  };

  const isFiltered =
    search.trim() !== '' ||
    activeTab !== 'ALL' ||
    activityFilter !== 'ALL' ||
    approvalFilter !== 'ALL' ||
    sortBy !== 'apps_desc';

  function resetFilters() {
    setSearch('');
    setActiveTab('ALL');
    setActivityFilter('ALL');
    setApprovalFilter('ALL');
    setSortBy('apps_desc');
  }

  const filteredRows = rows
    .filter((r) => {
      if (activeTab === 'WITH_APPS' && r.applications === 0) return false;
      if (activeTab === 'ZERO_APPS' && r.applications > 0) return false;
      if (activeTab === 'WITH_HIRES' && r.selected === 0) return false;
      if (activeTab === 'APPROVED' && r.approval !== 'APPROVED') return false;
      if (activeTab === 'PENDING' && r.approval !== 'PENDING') return false;

      if (approvalFilter !== 'ALL' && r.approval !== approvalFilter) return false;
      if (activityFilter === 'WITH_APPS' && r.applications === 0) return false;
      if (activityFilter === 'ZERO_APPS' && r.applications > 0) return false;
      if (activityFilter === 'WITH_HIRES' && r.selected === 0) return false;
      if (activityFilter === 'WITH_SHORTLIST' && r.shortlisted === 0) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        if (!r.job?.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'apps_desc') return (b.applications || 0) - (a.applications || 0);
      if (sortBy === 'selected_desc') return (b.selected || 0) - (a.selected || 0);
      if (sortBy === 'shortlisted_desc') return (b.shortlisted || 0) - (a.shortlisted || 0);
      if (sortBy === 'title') return (a.job || '').localeCompare(b.job || '');
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });

  return (
    <>
      <PageHeading
        eyebrow="Hiring analytics"
        title="Recruitment Summary Reports"
        description="Comprehensive analytics derived from your posted drives and candidate hiring pipeline."
        action={
          <ExportButton
            onClick={() => download('/company/report/export', 'company_recruitment_summary.xlsx')}
          />
        }
      />

      <Notice message={error} type="error" />

      {/* Summary KPI Cards */}
      <StatGrid
        items={[
          {
            label: 'Total Drives',
            value: totalDrives,
            icon: 'BriefcaseBusiness',
            note: `${tabCounts.APPROVED} approved`
          },
          {
            label: 'Applications',
            value: totalApps,
            icon: 'Users',
            note: 'Across all drives'
          },
          {
            label: 'Shortlisted',
            value: totalShortlisted,
            icon: 'CheckCircle2',
            note: 'Screening passed'
          },
          {
            label: 'Selected / Placed',
            value: totalSelected,
            icon: 'Award',
            note: `${hireRate}% placement rate`
          }
        ]}
      />

      {/* Advanced Filter Panel */}
      <div className="filter-panel">
        <div className="filter-pill-row">
          {[
            { id: 'ALL', label: 'All Reports' },
            { id: 'WITH_APPS', label: 'Has Applications' },
            { id: 'WITH_HIRES', label: 'With Selected Hires' },
            { id: 'APPROVED', label: 'Approved Drives' },
            { id: 'PENDING', label: 'Pending Review' },
            { id: 'ZERO_APPS', label: 'Zero Applicants' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="pill-count">{tabCounts[tab.id] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="filter-inputs-grid">
          <div className="filter-search-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search reports by job title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="filter-search-clear" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <select
            className="filter-dropdown"
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
          >
            <option value="ALL">All Approvals</option>
            <option value="APPROVED">Approved Only</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            className="filter-dropdown"
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
          >
            <option value="ALL">All Pipeline Activity</option>
            <option value="WITH_APPS">Has Applications (≥ 1)</option>
            <option value="WITH_HIRES">Has Hires / Selected (≥ 1)</option>
            <option value="WITH_SHORTLIST">Has Shortlisted (≥ 1)</option>
            <option value="ZERO_APPS">Zero Applications (0)</option>
          </select>

          <select
            className="filter-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="apps_desc">Sort: Most Applications</option>
            <option value="selected_desc">Sort: Most Selected</option>
            <option value="shortlisted_desc">Sort: Most Shortlisted</option>
            <option value="title">Sort: Job Title (A–Z)</option>
            <option value="newest">Sort: Newest First</option>
          </select>

          {isFiltered && (
            <button className="filter-reset-action" onClick={resetFilters}>
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        <div className="filter-meta-bar">
          <span>
            Showing <strong>{filteredRows.length}</strong> of <strong>{rows.length}</strong> drive reports
            {isFiltered && ' (filtered)'}
          </span>
          {isFiltered && (
            <span style={{ color: '#0e7043' }}>✓ Filters Active</span>
          )}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredRows.length === 0 ? (
        <Card>
          <div className="filter-empty-state">
            <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
            <strong>No matching reports found</strong>
            <span>No recruitment summary records match your current filter combination.</span>
            {isFiltered && (
              <div style={{ marginTop: 8 }}>
                <Button variant="outline" icon={RotateCcw} onClick={resetFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <DataTable
            rows={filteredRows.map((r) => ({
              ...r,
              conversionRate:
                r.applications > 0
                  ? `${((r.selected / r.applications) * 100).toFixed(0)}%`
                  : '0%'
            }))}
            columns={[
              { key: 'job', label: 'Job Title' },
              { key: 'approval', label: 'Approval', render: (r) => <Badge value={r.approval} /> },
              {
                key: 'applications',
                label: 'Applications',
                render: (r) => (
                  <span style={{ fontWeight: 700, color: '#102a43' }}>{r.applications}</span>
                )
              },
              {
                key: 'shortlisted',
                label: 'Shortlisted',
                render: (r) => (
                  <span style={{ fontWeight: 700, color: '#0284c7' }}>{r.shortlisted}</span>
                )
              },
              {
                key: 'selected',
                label: 'Selected (Hired)',
                render: (r) => (
                  <span style={{ fontWeight: 800, color: '#0e7043' }}>{r.selected}</span>
                )
              },
              {
                key: 'rejected',
                label: 'Rejected',
                render: (r) => (
                  <span style={{ fontWeight: 600, color: '#b91c1c' }}>{r.rejected}</span>
                )
              },
              {
                key: 'conversionRate',
                label: 'Placement Rate',
                render: (r) => (
                  <span
                    className="resume-timeline-pill"
                    style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1' }}
                  >
                    {r.conversionRate}
                  </span>
                )
              }
            ]}
          />
        </Card>
      )}
    </>
  );
}
