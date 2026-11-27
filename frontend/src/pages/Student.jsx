/**
 * ============================================================================
 * PERIYAR UNIVERSITY PLACEMENT MANAGEMENT SYSTEM - STUDENT PORTAL PAGES
 * ============================================================================
 * 
 * Provides views and management interfaces for student candidates:
 * 1. StudentDashboard     - Overview of profile status, eligible drives, and active applications.
 * 2. StudentProfile       - Read/write access to personal and professional details.
 * 3. StudentCollection    - Dynamic collection manager for qualifications, skills, projects,
 *                           internships, and certifications.
 * 4. ResumeManager        - Upload and manage active primary resume and document history.
 * 5. StudentJobs          - Matched, administrator-approved eligible campus placement jobs.
 * 6. ApplyJob             - Detailed view and application submission with cover letter.
 * 7. ApplicationTracking  - Status progression and milestone timeline of past applications.
 * 8. StudentAnnouncements - Notices broadcasted specifically by the department coordinator.
 */

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BriefcaseBusiness,
  FileText,
  ArrowRight,
  PlusCircle,
  Download,
  Trash2,
  BookOpen,
  Award,
  CheckCircle2,
  UserCircle2,
  CalendarClock,
  UploadCloud,
  ExternalLink,
  MapPin,
  Building2,
  IndianRupee,
  Laptop,
  ArrowLeft,
  Globe,
  Users,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { api, fileUrl, errorText } from '../context/Auth.jsx';
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
  AnnouncementAttachment,
  JobAttachment
} from '../components/UI.jsx';

// ============================================================================
// 1. STUDENT DASHBOARD
// ============================================================================
/**
 * Main dashboard view for students showing key metrics, profile completion,
 * recent application status, and coordinator announcements.
 */
export function StudentDashboard() {
  const { data, loading, error } = useLoad('/student/dashboard');

  if (loading) return <Loading />;
  if (error) return <Notice type="error" message={error} />;

  const s = data.stats;

  return (
    <>
      <PageHeading
        eyebrow="Student career workspace"
        title="Your Placement Dashboard"
        description="Career preparation, eligible opportunities and application progress—all in one place."
      />

      <div className="role-welcome">
        <div>
          <h2>Your future is full of possibilities.</h2>
          <p>Complete your profile, find recruitment drives that fit, and follow your career journey.</p>
        </div>
        <GraduationCap size={80} />
      </div>

      <StatGrid
        items={[
          [`${s.profileCompletion}%`, 'Profile Completion', 'profile'],
          [s.eligibleJobs, 'Eligible Active Jobs', 'jobs'],
          [s.applications, 'My Applications', 'applications'],
          [s.shortlisted, 'Shortlisted', 'reports'],
          [s.selected, 'Selected Offers', 'reports']
        ].map(([value, label, icon]) => ({ value, label, icon }))}
      />

      <div className="content-grid">
        <Card
          title="Recent Applications"
          action={
            <Link to="/dashboard/status">
              Track all <ArrowRight size={15} style={{ display: 'inline' }} />
            </Link>
          }
        >
          {data.recentApplications?.length ? (
            <div className="list-rows">
              {data.recentApplications.map((a) => (
                <div className="list-row" key={a.id}>
                  <div>
                    <strong>{a.job.title}</strong>
                    <small>
                      {a.job.company.name} · <DateFmt value={a.createdAt} />
                    </small>
                  </div>
                  <Badge value={a.status} />
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="No applications submitted yet"
              text="Explore your eligible jobs and get started."
            />
          )}
        </Card>

        <Card
          title="Placement Announcements"
          action={<Link to="/dashboard/announcements">See all</Link>}
        >
          {data.announcements?.length ? (
            <div className="list-rows">
              {data.announcements.map((a) => (
                <div className="list-row" key={a.id}>
                  <div>
                    <strong>{a.title}</strong>
                    <small>
                      {a.audience === 'DEPARTMENT_STUDENTS'
                        ? 'Department Coordinator'
                        : 'Placement Admin'}{' '}
                      · <DateFmt value={a.createdAt} />
                    </small>
                    {a.attachmentFileId && <AnnouncementAttachment announcement={a} compact />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="No recent announcements" />
          )}
        </Card>
      </div>
    </>
  );
}

// ============================================================================
// 2. STUDENT PROFILE
// ============================================================================
/**
 * Detailed personal and academic view for a student, with profile photo upload
 * and editable contact / social links.
 */
export function StudentProfile() {
  const { data, loading, reload } = useLoad('/student/profile');
  const { execute, message, error, busy } = useAction();
  const [editing, setEditing] = useState(false);

  if (loading) return <Loading />;
  if (!data) return <Notice type="error" message="Student profile unavailable" />;

  const fields = [
    { name: 'phone', label: 'Phone' },
    { name: 'about', label: 'About Me', type: 'textarea', wide: true },
    { name: 'linkedin', label: 'LinkedIn URL', type: 'url' },
    { name: 'github', label: 'GitHub URL', type: 'url' },
    { name: 'portfolio', label: 'Portfolio URL', type: 'url' },
    { name: 'twitter', label: 'X / Twitter URL', type: 'url' }
  ];

  return (
    <>
      <PageHeading
        eyebrow="Your professional identity"
        title="Student Profile"
        description="University-managed details are protected. Contact your coordinator for official academic corrections."
        action={<Button onClick={() => setEditing(true)}>Edit Profile</Button>}
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      <div className="content-grid">
        <Card title="Student Identity">
          <div className="info-grid">
            <div className="info-pair">
              <small>Full Name</small>
              <strong>{data.user.fullName}</strong>
            </div>
            <div className="info-pair">
              <small>Registration Number</small>
              <strong>{data.registrationNo}</strong>
            </div>
            <div className="info-pair">
              <small>Department</small>
              <strong>{data.department.name}</strong>
            </div>
            <div className="info-pair">
              <small>Programme</small>
              <strong>{data.programme.name}</strong>
            </div>
            <div className="info-pair">
              <small>UG / PG</small>
              <strong>{data.level}</strong>
            </div>
            <div className="info-pair">
              <small>Passing-Out Year</small>
              <strong>{data.passingYear}</strong>
            </div>
            <div className="info-pair">
              <small>Registered Email</small>
              <strong>{data.user.email}</strong>
            </div>
            <div className="info-pair">
              <small>Phone</small>
              <strong>{data.phone || 'Not added'}</strong>
            </div>
          </div>
        </Card>

        <Card title="Profile Photo">
          {data.photoFileId ? (
            <div>
              <img
                className="preview-img"
                src={fileUrl(data.photoFileId)}
                alt="Your profile"
                crossOrigin="anonymous"
              />
              <div className="mini-actions" style={{ marginTop: 12 }}>
                <button
                  className="mini-btn danger"
                  onClick={async () => {
                    if (confirm('Remove profile photo?')) {
                      await execute(() => api.delete(`/files/${data.photoFileId}`));
                      reload();
                    }
                  }}
                >
                  Remove Photo
                </button>
              </div>
            </div>
          ) : (
            <Empty title="Add your profile picture" />
          )}
          <FileUpload purpose="photo" label="Upload profile image" onUploaded={reload} />
        </Card>
      </div>

      <Card title="Professional Summary">
        <p style={{ fontSize: 13, lineHeight: 1.9, color: '#627889' }}>
          {data.about || 'Introduce yourself, your interests and the kind of work you want to pursue.'}
        </p>
        <div className="info-grid">
          {[
            ['LinkedIn', data.linkedin],
            ['GitHub', data.github],
            ['Portfolio', data.portfolio],
            ['X / Twitter', data.twitter]
          ]
            .filter((x) => x[1])
            .map(([name, url]) => (
              <div className="info-pair" key={name}>
                <small>{name}</small>
                <a className="file-link" href={url} target="_blank" rel="noreferrer">
                  Visit Link <ExternalLink size={15} />
                </a>
              </div>
            ))}
        </div>
      </Card>

      {editing && (
        <Modal title="Edit Student Profile" onClose={() => setEditing(false)}>
          <CrudForm
            fields={fields}
            initial={data}
            onSave={(v) => api.patch('/student/profile', v)}
            onClose={(ok) => {
              setEditing(false);
              if (ok) reload();
            }}
          />
        </Modal>
      )}
    </>
  );
}

// ============================================================================
// 3. STUDENT PORTFOLIO COLLECTIONS
// ============================================================================
/**
 * Configuration registry for different student portfolio sub-collections.
 */
const collectionConfig = {
  education: {
    title: 'Academic Qualifications',
    description: 'Record your 10th, 12th, UG or PG academic qualifications.',
    label: 'qualification',
    fields: [
      {
        name: 'qualification',
        label: 'Qualification',
        type: 'select',
        options: ['10th Standard', '12th Standard', 'UG', 'PG'],
        required: true
      },
      { name: 'institution', label: 'Institution', required: true },
      { name: 'board', label: 'Board / University', required: true },
      { name: 'passingYear', label: 'Year of Passing', type: 'number', required: true },
      { name: 'score', label: 'Percentage / CGPA value', type: 'number', step: '0.01', required: true },
      { name: 'scale', label: 'Scale', type: 'select', options: ['Percentage', 'CGPA 10', 'CGPA 4'], required: true }
    ],
    summary: (r) => `${r.institution} · ${r.passingYear} · ${r.score} (${r.scale})`
  },
  skills: {
    title: 'Skills',
    description: 'Add technical and professional skills to your career portfolio.',
    label: 'name',
    fields: [
      { name: 'name', label: 'Skill Name', required: true }
    ],
    summary: (r) => r.name
  },
  projects: {
    title: 'My Projects',
    description: 'Showcase academic and personal projects, technologies and GitHub links.',
    label: 'title',
    fields: [
      { name: 'title', label: 'Project Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea', wide: true, required: true },
      { name: 'technologies', label: 'Technology Stack (Optional)' },
      { name: 'github', label: 'GitHub Repository URL', type: 'url' },
      { name: 'liveUrl', label: 'Live Project URL', type: 'url' }
    ],
    summary: (r) => (r.technologies ? `${r.technologies} · ${r.description}` : r.description)
  },
  internships: {
    title: 'Internships',
    description: 'Document your professional and internship experience.',
    label: 'companyName',
    fields: [
      { name: 'companyName', label: 'Company Name', required: true },
      { name: 'domain', label: 'Internship Domain', required: true },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'End Date', type: 'date', required: true },
      { name: 'description', label: 'Work Description', type: 'textarea', wide: true, required: true }
    ],
    summary: (r) => `${r.domain} · ${new Date(r.startDate).toLocaleDateString('en-IN')} – ${new Date(r.endDate).toLocaleDateString('en-IN')}`
  },
  experiences: {
    title: 'Work Experience',
    description: 'Add full-time, part-time, freelance, or contract work experience to your placement profile.',
    label: 'role',
    fields: [
      { name: 'companyName', label: 'Company / Organization Name', required: true },
      { name: 'role', label: 'Job Role / Designation', required: true },
      {
        name: 'employmentType',
        label: 'Employment Type',
        type: 'select',
        options: ['Full-time', 'Part-time', 'Freelance', 'Contract']
      },
      { name: 'location', label: 'Location' },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'End Date (leave blank if currently working)', type: 'date' },
      { name: 'currentlyWorking', label: 'Currently Working Here', type: 'checkbox' },
      { name: 'description', label: 'Work Description & Key Contributions', type: 'textarea', wide: true, required: true }
    ],
    summary: (r) => {
      const start = new Date(r.startDate).toLocaleDateString('en-IN');
      const end = r.currentlyWorking || !r.endDate ? 'Present' : new Date(r.endDate).toLocaleDateString('en-IN');
      const meta = [r.companyName, r.employmentType, r.location].filter(Boolean).join(' · ');
      return `${meta} · ${start} – ${end}`;
    }
  },
  certificates: {
    title: 'Certifications',
    description: 'Record courses and certifications, with optional supporting document uploads.',
    label: 'title',
    fields: [
      { name: 'title', label: 'Certificate / Course Title', required: true },
      { name: 'issuer', label: 'Issuing Organization', required: true },
      { name: 'year', label: 'Year', type: 'number', required: true }
    ],
    summary: (r) => `${r.issuer} · ${r.year}`
  }
};

/**
 * Generic collection manager component used for education, skills, projects,
 * internships, and certificates.
 */
export function StudentCollection({ kind }) {
  const config = collectionConfig[kind];
  const { data, loading, reload } = useLoad(`/student/${kind}`);
  const [modal, setModal] = useState(null);
  const [fileId, setFileId] = useState(null);
  const { execute, message, error } = useAction();

  return (
    <>
      <PageHeading
        eyebrow="Career portfolio"
        title={config.title}
        description={config.description}
        action={
          <Button
            icon={PlusCircle}
            onClick={() => {
              setFileId(null);
              setModal({});
            }}
          >
            Add {kind === 'education' ? 'Qualification' : kind === 'skills' ? 'Skill' : 'Record'}
          </Button>
        }
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      {loading ? (
        <Loading />
      ) : (
        <Card>
          {kind === 'skills' ? (
            <div>
              {data.map((r) => (
                <span key={r.id} className="tag">
                  {r.name}{' '}
                  <button
                    aria-label={`Remove ${r.name}`}
                    onClick={async () => {
                      if (confirm('Remove skill?')) {
                        await execute(() => api.delete(`/student/skills/${r.id}`));
                        reload();
                      }
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              {!data.length && <Empty title="No skills added yet" />}
            </div>
          ) : (
            <div className="list-rows">
              {data.map((r) => (
                <div className="list-row" key={r.id}>
                  <div style={{ maxWidth: '75%' }}>
                    <strong>{r[config.label]}</strong>
                    <small style={{ whiteSpace: 'normal' }}>{config.summary(r)}</small>
                    {r.fileId && (
                      <a href={fileUrl(r.fileId)} className="file-link">
                        View Certificate <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                  <div className="mini-actions">
                    <button
                      className="mini-btn"
                      onClick={() => {
                        setFileId(r.fileId || null);
                        setModal(r);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="mini-btn danger"
                      onClick={async () => {
                        if (confirm('Delete this record?')) {
                          await execute(() => api.delete(`/student/${kind}/${r.id}`));
                          reload();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {!data.length && <Empty title={`No ${config.title.toLowerCase()} yet`} />}
            </div>
          )}
        </Card>
      )}

      {modal && (
        <Modal title={`${modal.id ? 'Edit' : 'Add'} ${config.title}`} onClose={() => setModal(null)}>
          <CrudForm
            fields={config.fields}
            initial={
              modal.id && (kind === 'internships' || kind === 'experiences')
                ? {
                  ...modal,
                  startDate: modal.startDate?.slice(0, 10) || '',
                  endDate: modal.endDate ? modal.endDate.slice(0, 10) : ''
                }
                : modal
            }
            onSave={(v) =>
              modal.id
                ? api.patch(`/student/${kind}/${modal.id}`, {
                  ...v,
                  ...(kind === 'certificates' ? { fileId } : {})
                })
                : api.post(`/student/${kind}`, {
                  ...v,
                  ...(kind === 'certificates' ? { fileId } : {})
                })
            }
            onClose={(ok) => {
              setModal(null);
              if (ok) reload();
            }}
          />

          {kind === 'certificates' && (
            <div>
              <p className="muted" style={{ fontSize: 12 }}>
                Optional certificate file (PDF / JPEG / PNG)
              </p>
              <FileUpload purpose="certificate" onUploaded={(x) => setFileId(x.id)} />
              {fileId && (
                <Notice message="Document uploaded and ready to attach when you save the certificate details." />
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

// ============================================================================
// 4. RESUME MANAGER
// ============================================================================
/**
 * View and upload manager for student resumes.
 */
export function ResumeManager() {
  const { data, loading, reload } = useLoad('/student/resumes');
  const { execute, message, error } = useAction();

  return (
    <>
      <PageHeading
        eyebrow="Career documents"
        title="Resume Manager"
        description="Upload a primary resume in PDF, DOC or DOCX format (up to 10 MB)."
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      <Card title="Upload / Replace Your Primary Resume">
        <FileUpload purpose="resume" onUploaded={reload} />
        <p className="muted" style={{ fontSize: 12 }}>
          When you upload a new resume, it becomes your primary resume. Past application
          attachments are retained for recruitment history.
        </p>
      </Card>

      <Card title="Resume History">
        {loading ? (
          <Loading />
        ) : data.length ? (
          <div className="list-rows">
            {data.map((r) => (
              <div className="list-row" key={r.id}>
                <div>
                  <strong>
                    <FileText size={17} style={{ display: 'inline', marginRight: 8 }} />{' '}
                    {r.file?.originalName || 'Resume document'}
                  </strong>
                  <small>
                    {r.file?.size ? `${(r.file.size / 1024).toFixed(1)} KB · ` : ''}
                    Uploaded <DateFmt value={r.createdAt} /> ·{' '}
                    {r.isPrimary ? 'Active primary resume' : 'Previous resume'}
                  </small>
                </div>
                <div className="mini-actions">
                  {r.isPrimary && <Badge value="Active" />}
                  <a className="mini-btn" href={fileUrl(r.fileId)} target="_blank" rel="noreferrer">
                    Download / View
                  </a>
                  <button
                    className="mini-btn danger"
                    onClick={async () => {
                      if (
                        confirm(
                          'Delete this resume? Resumes attached to applications cannot be deleted.'
                        )
                      ) {
                        await execute(() => api.delete(`/files/${r.fileId}`));
                        reload();
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="No resume uploaded"
            text="Upload a resume to start applying for placement opportunities."
          />
        )}
      </Card>
    </>
  );
}

// ============================================================================
// 5. ELIGIBLE CAMPUS JOBS
// ============================================================================
const appStatusLabel = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  SELECTED: 'Selected',
  REJECTED: 'Not Selected'
};

function formatPackage(j) {
  if (j.salaryMin == null && j.salaryMax == null) return 'Competitive';
  if (j.salaryMin != null && j.salaryMax != null) {
    return `${j.salaryMin} – ${j.salaryMax} ${j.salaryUnit || 'LPA'}`;
  }
  return `${j.salaryMin ?? j.salaryMax} ${j.salaryUnit || 'LPA'}`;
}

/**
 * Catalog of jobs that match the candidate's academic eligibility criteria.
 */
export function StudentJobs() {
  const { data, loading, error } = useLoad('/student/jobs');
  const [filter, setFilter] = useState('ALL');

  const now = Date.now();
  const allJobs = data || [];
  const appliedCount = allJobs.filter((j) => j.applied).length;
  const openCount = allJobs.filter((j) => !j.applied && new Date(j.deadline).getTime() >= now).length;
  const closedCount = allJobs.filter((j) => new Date(j.deadline).getTime() < now).length;

  const visibleJobs = allJobs.filter((j) => {
    if (filter === 'OPEN') return !j.applied && new Date(j.deadline).getTime() >= now;
    if (filter === 'CLOSED') return new Date(j.deadline).getTime() < now;
    if (filter === 'APPLIED') return j.applied;
    return true;
  });

  return (
    <>
      <PageHeading
        eyebrow="Opportunities matched for you"
        title="Eligible Campus Jobs"
        description="Only active, administrator-approved jobs that match your department, programme and batch."
      />

      <Notice message={error} type="error" />

      {loading ? (
        <Loading />
      ) : (
        <>
          {allJobs.length > 0 && (
            <div className="job-filter-bar">
              {[
                { key: 'ALL', label: 'All Opportunities', count: allJobs.length },
                { key: 'OPEN', label: 'Open to Apply', count: openCount },
                { key: 'CLOSED', label: 'Deadline Passed / Closed', count: closedCount },
                { key: 'APPLIED', label: 'Applied', count: appliedCount }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`job-filter-pill ${filter === tab.key ? 'active' : ''}`}
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label}
                  <span className="pill-count">{tab.count}</span>
                </button>
              ))}
            </div>
          )}

          {visibleJobs.length > 0 ? (
            <div className="job-drive-grid">
              {visibleJobs.map((j) => {
                const isApplied = Boolean(j.applied);
                const isExpired = new Date(j.deadline).getTime() < now;
                const statusText = appStatusLabel[j.myApplication?.status] || 'Applied';
                const skills = Array.isArray(j.skills) ? j.skills.filter(Boolean) : [];
                const daysLeft = Math.ceil((new Date(j.deadline).getTime() - now) / 86400000);
                const deadlineSoon = !isApplied && !isExpired && daysLeft >= 0 && daysLeft <= 5;

                return (
                  <article
                    key={j.id}
                    className={`job-drive-card ${isApplied ? 'is-applied' : isExpired ? 'is-closed' : ''}`}
                  >
                    <div
                      className="job-drive-accent"
                      style={isExpired && !isApplied ? { background: '#ef4444' } : undefined}
                    />
                    <div className="job-drive-body">
                      <div className="job-drive-header">
                        <div className="job-drive-brand">
                          <div className="job-drive-logo">
                            {j.company.logoFileId ? (
                              <img
                                src={fileUrl(j.company.logoFileId)}
                                alt={`${j.company.name} logo`}
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <BriefcaseBusiness size={24} />
                            )}
                          </div>
                          <div className="job-drive-title-group">
                            <h3 className="job-drive-title">{j.title}</h3>
                            <div className="job-drive-company">
                              <Building2 size={13} />
                              <span>{j.company.name}</span>
                            </div>
                          </div>
                        </div>

                        {isApplied ? (
                          <span className="job-status-pill applied">
                            <CheckCircle2 size={13} /> {statusText}
                          </span>
                        ) : isExpired ? (
                          <span
                            className="job-status-pill closed"
                            style={{
                              background: '#fef2f2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}
                          >
                            <AlertCircle size={13} /> Deadline Passed / Closed
                          </span>
                        ) : (
                          <span className="job-status-pill open">{j.jobType}</span>
                        )}
                      </div>

                      <div className="job-meta-grid">
                        <div className="job-meta-item" title={j.location}>
                          <MapPin size={14} color="#167d8d" style={{ flexShrink: 0 }} />
                          <span>{j.location}</span>
                        </div>
                        <div className="job-meta-item" title={`${j.workMode} · ${j.jobType}`}>
                          <Laptop size={14} color="#167d8d" style={{ flexShrink: 0 }} />
                          <span>
                            {j.workMode} · {j.jobType}
                          </span>
                        </div>
                        <div className="job-meta-item package" title="Compensation Package">
                          <IndianRupee size={14} style={{ flexShrink: 0 }} />
                          <span>{formatPackage(j)}</span>
                        </div>
                        <div
                          className={`job-meta-item ${deadlineSoon ? 'deadline-soon' : isExpired ? 'deadline-expired' : ''}`}
                          title="Application Deadline"
                          style={isExpired ? { color: '#b91c1c', fontWeight: 600 } : undefined}
                        >
                          <CalendarClock
                            size={14}
                            color={isExpired ? '#dc2626' : undefined}
                            style={{ flexShrink: 0 }}
                          />
                          <span>
                            {isExpired ? (
                              <>Closed: <DateFmt value={j.deadline} /></>
                            ) : (
                              <>Due <DateFmt value={j.deadline} /></>
                            )}
                          </span>
                        </div>
                      </div>

                      {skills.length > 0 && (
                        <div className="job-skills-row">
                          {skills.slice(0, 4).map((s) => (
                            <span key={s} className="job-skill-chip">
                              {s}
                            </span>
                          ))}
                          {skills.length > 4 && (
                            <span className="job-skill-chip">+{skills.length - 4} more</span>
                          )}
                        </div>
                      )}

                      {j.attachmentFileId && (
                        <div style={{ marginTop: 10, marginBottom: 4 }}>
                          <JobAttachment job={j} compact={true} />
                        </div>
                      )}

                      <div className="job-drive-footer">
                        {isApplied ? (
                          <div className="job-applied-strip">
                            <div className="job-applied-note">
                              <CheckCircle2 size={15} />
                              <span>
                                Applied on <DateFmt value={j.myApplication?.createdAt} />
                              </span>
                            </div>
                            <div className="job-applied-actions">
                              <Link
                                to={`/dashboard/apply/${j.id}`}
                                className="btn btn-outline"
                                style={{ padding: '9px 14px', fontSize: 13 }}
                              >
                                View Details
                              </Link>
                              <Link
                                to="/dashboard/status"
                                className="btn btn-primary"
                                style={{ padding: '9px 14px', fontSize: 13 }}
                              >
                                Track Status <ArrowRight size={15} />
                              </Link>
                            </div>
                          </div>
                        ) : isExpired ? (
                          <div
                            className="job-applied-strip"
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fee2e2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              padding: '10px 14px'
                            }}
                          >
                            <div className="job-applied-note" style={{ color: '#b91c1c' }}>
                              <AlertCircle size={15} color="#dc2626" />
                              <span style={{ fontWeight: 600 }}>
                                Applications Closed
                              </span>
                            </div>
                            <div className="job-applied-actions">
                              <Link
                                to={`/dashboard/apply/${j.id}`}
                                className="btn btn-outline"
                                style={{
                                  padding: '7px 12px',
                                  fontSize: 12.5,
                                  borderColor: '#fca5a5',
                                  color: '#991b1b'
                                }}
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <Link
                            to={`/dashboard/apply/${j.id}`}
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                          >
                            View Details & Apply <ArrowRight size={17} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <Empty
              title={
                filter === 'APPLIED'
                  ? 'You have not applied to any jobs yet'
                  : filter === 'OPEN'
                    ? 'No open jobs available to apply right now'
                    : filter === 'CLOSED'
                      ? 'No closed recruitment drives'
                      : 'No currently eligible jobs'
              }
              text={
                filter === 'ALL'
                  ? 'New opportunities will appear when companies publish approved drives that match your academic details.'
                  : 'Switch tabs above to view other placement drives.'
              }
            />
          )}
        </>
      )}
    </>
  );
}

// ============================================================================
// 6. APPLY FOR JOB
// ============================================================================
/**
 * View detailed job specifications and submit application with an optional cover letter.
 */
export function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useLoad(`/student/jobs/${jobId}`);
  const [coverLetter, setCoverLetter] = useState('');
  const [showCompany, setShowCompany] = useState(false);
  const { execute, message, error: saveError, busy } = useAction();

  if (loading) return <Loading />;
  if (error) return <Notice type="error" message={error} />;

  const isApplied = Boolean(data.applied);
  const isExpired = new Date(data.deadline).getTime() < Date.now();
  const skills = Array.isArray(data.skills) ? data.skills.filter(Boolean) : [];
  const company = data.company || {};

  return (
    <>
      <PageHeading
        eyebrow="Campus recruitment"
        title={data.title}
        description={`${company.name} · ${data.location} · ${data.jobType}`}
        action={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="outline" icon={Building2} onClick={() => setShowCompany(true)}>
              Company Details
            </Button>
            <Link to="/dashboard/companies" className="btn btn-outline">
              <ArrowLeft size={16} /> Back to Jobs
            </Link>
          </div>
        }
      />

      {isExpired && !isApplied && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: '#991b1b'
          }}
        >
          <AlertCircle size={26} color="#dc2626" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: 15, display: 'block', color: '#991b1b', marginBottom: 2 }}>
              Deadline Passed / Closed
            </strong>
            <span style={{ fontSize: 13, color: '#7f1d1d' }}>
              The application deadline for this recruitment drive closed on{' '}
              <strong>
                <DateFmt value={data.deadline} />
              </strong>
              . New applications are no longer accepted for this position.
            </span>
          </div>
        </div>
      )}

      <div className="content-grid">
        <Card title="Job Description">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              padding: '12px 14px',
              marginBottom: 16,
              borderRadius: 12,
              background: '#f6f9fc',
              border: '1px solid #e3ebf3'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div className="job-drive-logo" style={{ width: 46, height: 46 }}>
                {company.logoFileId ? (
                  <img
                    src={fileUrl(company.logoFileId)}
                    alt={`${company.name} logo`}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <Building2 size={22} />
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 15, color: '#0f233a' }}>
                  {company.name}
                </strong>
                <small className="muted" style={{ fontSize: 12 }}>
                  {company.industry || 'Recruiting Partner'}
                  {company.employeeSize ? ` · ${company.employeeSize} employees` : ''}
                </small>
              </div>
            </div>
            <button
              type="button"
              className="mini-btn"
              onClick={() => setShowCompany(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Building2 size={14} /> Company Details
            </button>
          </div>

          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9, fontSize: 13.5, color: '#475569' }}>
            {data.description}
          </p>

          <JobAttachment job={data} />

          <div className="info-grid">
            <div className="info-pair">
              <small>Salary Range</small>
              <strong>{formatPackage(data)}</strong>
            </div>
            <div className="info-pair">
              <small>Work Mode</small>
              <strong>{data.workMode}</strong>
            </div>
            <div className="info-pair">
              <small>Deadline</small>
              <strong style={{ color: isExpired ? '#b91c1c' : undefined }}>
                <DateFmt value={data.deadline} />
                {isExpired && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#fef2f2',
                      color: '#b91c1c',
                      border: '1px solid #fecaca',
                      padding: '2px 8px',
                      borderRadius: 999,
                      marginLeft: 6
                    }}
                  >
                    <AlertCircle size={11} /> Deadline Passed / Closed
                  </span>
                )}
              </strong>
            </div>
          </div>
          {skills.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <small className="muted" style={{ display: 'block', marginBottom: 8 }}>
                Required Skills
              </small>
              <div className="job-skills-row" style={{ marginBottom: 0 }}>
                {skills.map((s) => (
                  <span key={s} className="job-skill-chip">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card title={isApplied ? 'Application Status' : isExpired ? 'Application Closed' : 'Submit Your Application'}>
          {isApplied ? (
            <div className="job-applied-box">
              <CheckCircle2 size={44} color="#0e9f6e" style={{ margin: '0 auto' }} />
              <h3>Already Applied</h3>
              <div style={{ margin: '10px 0 12px' }}>
                <Badge value={data.myApplication?.status || 'APPLIED'} />
              </div>
              <p>
                You submitted your application for <strong>{data.title}</strong> at{' '}
                <strong>{company.name}</strong> on{' '}
                <strong>
                  <DateFmt value={data.myApplication?.createdAt} />
                </strong>
                . You cannot apply to the same job posting twice.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/dashboard/status" className="btn btn-primary">
                  Track Application Status <ArrowRight size={16} />
                </Link>
                <Link to="/dashboard/companies" className="btn btn-outline">
                  Browse Other Jobs
                </Link>
              </div>
            </div>
          ) : isExpired ? (
            <div className="job-applied-box" style={{ background: '#fef2f2', borderColor: '#fee2e2' }}>
              <AlertCircle size={44} color="#dc2626" style={{ margin: '0 auto' }} />
              <h3 style={{ color: '#991b1b' }}>Application Window Closed</h3>
              <div style={{ margin: '10px 0 12px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: '#fee2e2',
                    color: '#991b1b',
                    fontWeight: 700,
                    fontSize: 12
                  }}
                >
                  <AlertCircle size={13} /> Deadline Passed / Closed
                </span>
              </div>
              <p style={{ color: '#7f1d1d' }}>
                The application deadline for <strong>{data.title}</strong> at <strong>{company.name}</strong> was{' '}
                <strong>
                  <DateFmt value={data.deadline} />
                </strong>
                . You can no longer submit a new application for this position.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/dashboard/companies" className="btn btn-primary">
                  Browse Active Campus Jobs
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="muted" style={{ fontSize: 12.5 }}>
                Your active primary resume will be attached automatically. You can have a maximum of
                two confirmed selected offers.
              </p>
              <label className="form-field">
                <span>Cover Letter (Optional)</span>
                <textarea
                  rows={7}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Briefly introduce yourself and your interest in this position..."
                />
              </label>
              <Notice message={saveError} type="error" />
              <Notice message={message} />
              <Button
                disabled={busy}
                onClick={async () => {
                  if (!confirm('Submit your application?')) return;
                  const r = await execute(() =>
                    api.post(`/student/jobs/${jobId}/apply`, { coverLetter })
                  );
                  if (r) navigate('/dashboard/status');
                }}
              >
                {busy ? 'Submitting...' : 'Submit Application'} <ArrowRight size={16} />
              </Button>
            </>
          )}
        </Card>
      </div>

      {showCompany && (
        <Modal title="Company Details" onClose={() => setShowCompany(false)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div className="job-drive-logo" style={{ width: 64, height: 64, borderRadius: 16 }}>
              {company.logoFileId ? (
                <img
                  src={fileUrl(company.logoFileId)}
                  alt={`${company.name} logo`}
                  crossOrigin="anonymous"
                />
              ) : (
                <Building2 size={28} />
              )}
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 20, color: '#0f233a' }}>
                {company.name}
              </h3>
              {company.industry && <Badge value={company.industry} />}
            </div>
          </div>

          <div className="info-grid">
            <div className="info-pair">
              <small>Industry</small>
              <strong>{company.industry || 'Not specified'}</strong>
            </div>
            <div className="info-pair">
              <small>Employee Size</small>
              <strong>{company.employeeSize || 'Not specified'}</strong>
            </div>
            <div className="info-pair">
              <small>Founded Year</small>
              <strong>{company.foundedYear || 'Not specified'}</strong>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 12,
              background: '#f8fbfd',
              border: '1px solid #e3ebf3'
            }}
          >
            <small
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                color: '#0f233a',
                marginBottom: 6
              }}
            >
              <MapPin size={14} color="#167d8d" /> Head Office Address
            </small>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: '#475569', whiteSpace: 'pre-wrap' }}>
              {company.address || 'Address not provided by company.'}
            </p>
          </div>

          <div style={{ marginTop: 14 }}>
            <small
              style={{
                display: 'block',
                fontWeight: 700,
                color: '#0f233a',
                marginBottom: 6
              }}
            >
              About Company
            </small>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.8, color: '#475569', whiteSpace: 'pre-wrap' }}>
              {company.description || 'No company overview provided yet.'}
            </p>
          </div>

          {(company.contactName ||
            company.contactDesignation ||
            company.contactPhone ||
            company.contactEmail) && (
              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 12,
                  background: '#f8fbfd',
                  border: '1px solid #e3ebf3'
                }}
              >
                <small
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    color: '#0f233a',
                    marginBottom: 10
                  }}
                >
                  Company Contact Details
                </small>
                <div className="info-grid" style={{ margin: 0 }}>
                  <div className="info-pair">
                    <small>Contact Person</small>
                    <strong>{company.contactName || '—'}</strong>
                  </div>
                  <div className="info-pair">
                    <small>Designation</small>
                    <strong>{company.contactDesignation || '—'}</strong>
                  </div>
                  <div className="info-pair">
                    <small>Mobile Number</small>
                    <strong>{company.contactPhone || '—'}</strong>
                  </div>
                  <div className="info-pair">
                    <small>Email ID</small>
                    <strong>{company.contactEmail || '—'}</strong>
                  </div>
                </div>
              </div>
            )}

          {(company.website || company.linkedin || company.twitter) && (
            <div
              style={{
                marginTop: 18,
                paddingTop: 14,
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap'
              }}
            >
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mini-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <Globe size={14} /> Official Website <ExternalLink size={12} />
                </a>
              )}
              {company.linkedin && (
                <a
                  href={company.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="mini-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <Users size={14} /> LinkedIn <ExternalLink size={12} />
                </a>
              )}
              {company.twitter && (
                <a
                  href={company.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="mini-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <ExternalLink size={13} /> X / Twitter
                </a>
              )}
            </div>
          )}

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowCompany(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ============================================================================
// 7. APPLICATION TRACKING
// ============================================================================
/**
 * Track status and timeline milestones for all submitted student applications.
 */
export function ApplicationTracking() {
  const { data, loading } = useLoad('/student/applications');
  const [selected, setSelected] = useState(null);

  return (
    <>
      <PageHeading
        eyebrow="Your recruitment journey"
        title="Application Tracking"
        description="Follow every application from submission to shortlist and final selection."
      />

      {loading ? (
        <Loading />
      ) : (
        <Card>
          <DataTable
            rows={data.map((a) => ({
              ...a,
              company: a.job.company.name,
              title: a.job.title,
              appliedAt: a.createdAt
            }))}
            columns={[
              { key: 'company', label: 'Company' },
              {
                key: 'title',
                label: 'Job Title',
                render: (r) => {
                  const isExpired = r.job?.deadline ? new Date(r.job.deadline).getTime() < Date.now() : false;
                  return (
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.title}</div>
                      {isExpired && (
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
                            padding: '1px 6px',
                            borderRadius: 999,
                            marginTop: 3
                          }}
                        >
                          <AlertCircle size={10} /> Deadline Passed / Closed
                        </span>
                      )}
                    </div>
                  );
                }
              },
              { key: 'appliedAt', label: 'Applied', render: (r) => <DateFmt value={r.appliedAt} /> },
              { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
              {
                key: 'id',
                label: 'View',
                render: (r) => (
                  <button className="mini-btn" onClick={() => setSelected(r)}>
                    Timeline
                  </button>
                )
              }
            ]}
          />
        </Card>
      )}

      {selected && (
        <Modal
          title={`${selected.job.title} — Application Timeline`}
          onClose={() => setSelected(null)}
        >
          <p className="muted">{selected.job.company.name}</p>
          <Badge value={selected.status} />
          <div className="timeline-list">
            {selected.history.map((h) => (
              <div className="timeline-row" key={h.id}>
                <strong>{h.toStatus}</strong>
                <br />
                <DateFmt value={h.createdAt} />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

// ============================================================================
// 8. PLACEMENT ANNOUNCEMENTS (PLACEMENT ADMIN & DEPARTMENT COORDINATOR)
// ============================================================================
/**
 * Announcements posted by Placement Administration or Department Coordinator.
 */
export function StudentAnnouncements() {
  const { data, loading, reload } = useLoad('/student/announcements');
  const { execute, message, error } = useAction();

  return (
    <>
      <PageHeading
        eyebrow="Placement updates"
        title="Placement Announcements"
        description="Official notices, circulars, and attachments from Placement Administration and your Department Coordinator."
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      {loading ? (
        <Loading />
      ) : (
        <div className="item-cards">
          {(data || []).map((a) => {
            const isAdmin = a.audience !== 'DEPARTMENT_STUDENTS';
            const isDeptSpecific =
              !isAdmin || (a.targetDepartments && a.targetDepartments.length > 0);
            return (
              <Card key={a.id}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  <Badge value={isAdmin ? 'Placement Admin' : 'Department Coordinator'} />
                  <span
                    style={{
                      fontSize: 11.5,
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: isDeptSpecific ? '#eef2f6' : '#eef9fb',
                      color: isDeptSpecific ? '#334155' : '#0d5f6d',
                      fontWeight: 600
                    }}
                  >
                    {isDeptSpecific ? 'Department Specific' : 'All Departments'}
                  </span>
                </div>
                <h3>{a.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {a.body}
                </p>
                <AnnouncementAttachment announcement={a} />
                <div
                  style={{
                    marginTop: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10
                  }}
                >
                  <small className="muted">
                    Posted <DateFmt value={a.createdAt} />
                  </small>
                  {a.reads?.length ? (
                    <Badge value="Read" />
                  ) : (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await execute(() => api.post(`/common/announcements/${a.id}/read`));
                        reload();
                      }}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
          {!(data || []).length && <Empty title="No announcements yet" />}
        </div>
      )}
    </>
  );
}
