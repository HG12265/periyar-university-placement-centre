import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  BriefcaseBusiness,
  ClipboardList,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Bell,
  ShieldCheck,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  BookOpen,
  Megaphone,
  UserCircle2,
  ChartBar,
  Code2,
  Award,
  FolderOpen,
  UploadCloud,
  KeyRound,
  Paperclip,
  ExternalLink,
  Trash2,
  Mail,
  Phone,
  Globe,
  Printer,
  Upload
} from 'lucide-react';
import { api, useAuth, roleHomes, errorText, fileUrl } from '../context/Auth.jsx';

/**
 * Global Icon Registry
 * Maps logical keys to Lucide icons for menus and stat cards.
 */
export const icons = {
  dashboard: LayoutDashboard,
  students: GraduationCap,
  departments: BookOpen,
  companies: Building2,
  coordinators: Users,
  jobs: BriefcaseBusiness,
  approvals: ShieldCheck,
  reports: ChartBar,
  announcements: Megaphone,
  upload: UploadCloud,
  profile: UserCircle2,
  skills: Code2,
  projects: FolderOpen,
  internship: BriefcaseBusiness,
  experience: Building2,
  resume: FileText,
  applications: ClipboardList,
  education: BookOpen,
  certifications: Award,
  notifications: Bell,
  settings: KeyRound
};

/**
 * Sidebar Navigation Menu Configuration by User Role
 */
export const menus = {
  UNIVERSITY_ADMIN: [
    ['dashboard', 'Dashboard', '/admin/dashboard'],
    ['students', 'Students', '/admin/students'],
    ['companies', 'Companies', '/admin/companies'],
    ['approvals', 'Job Approvals', '/admin/job-approvals'],
    ['departments', 'Departments', '/admin/departments'],
    ['coordinators', 'Coordinators', '/admin/coordinators'],
    ['reports', 'Placement Reports', '/admin/reports'],
    ['announcements', 'Announcements', '/admin/announcements']
  ],
  DEPARTMENT_COORDINATOR: [
    ['dashboard', 'Dashboard', '/coordinator/dashboard'],
    ['upload', 'Excel Student Import', '/coordinator/upload'],
    ['students', 'Students', '/coordinator/students'],
    ['jobs', 'Department Jobs', '/coordinator/jobs'],
    ['applications', 'Applied Students', '/coordinator/applied-students'],
    ['reports', 'Selected Students', '/coordinator/selected-students-report'],
    ['announcements', 'Announcements', '/coordinator/announcements']
  ],
  STUDENT: [
    ['dashboard', 'Dashboard', '/dashboard'],
    ['profile', 'My Profile', '/dashboard/profile'],
    ['education', 'Academic & Portfolio', '/dashboard/portfolio'],
    ['skills', 'Skills', '/dashboard/skills'],
    ['projects', 'Projects', '/dashboard/projects'],
    ['internship', 'Internships', '/dashboard/internship'],
    ['experience', 'Experience', '/dashboard/experience'],
    ['certifications', 'Certifications', '/dashboard/certifications'],
    ['resume', 'Resume Manager', '/dashboard/resume'],
    ['jobs', 'Eligible Jobs', '/dashboard/companies'],
    ['applications', 'Application Tracking', '/dashboard/status'],
    ['announcements', 'Announcements', '/dashboard/announcements']
  ],
  COMPANY: [
    ['dashboard', 'Dashboard', '/company/dashboard'],
    ['profile', 'Company Profile', '/company/dashboard/profile'],
    ['jobs', 'Job Postings', '/company/dashboard/post-job'],
    ['students', 'Applicants', '/company/dashboard/applicants'],
    ['reports', 'Recruitment Reports', '/company/dashboard/report']
  ]
};

/**
 * Institutional Brand Badge
 */
export function Brand({ inverse = false }) {
  return (
    <Link to="/" className={`brand ${inverse ? 'brand-light' : ''}`}>
      <span className="brand-mark">
        <img
          src={`${import.meta.env.BASE_URL}periyar-logo.png`}
          alt="Periyar University"
          style={{ width: 30, height: 30, objectFit: 'contain' }}
        />
      </span>
      <span>
        <strong>PERIYAR UNIVERSITY</strong>
        <small>PLACEMENT MANAGEMENT PORTAL</small>
      </span>
    </Link>
  );
}

/**
 * Official Periyar University Bilingual Top Banner
 */
export function UniversityBanner({
  pillText = 'Placement & Training Cell • வேலைவாய்ப்பு & பயிற்சி மையம்'
}) {
  return (
    <div className="pu-official-banner">
      <div className="site-container pu-banner-inner">
        <div className="pu-emblem-box">
          <img
            src={`${import.meta.env.BASE_URL}periyar-logo.png`}
            alt="Periyar University Emblem"
            className="pu-emblem-img"
          />
        </div>
        <div className="pu-title-center">
          <h1 className="pu-ta-title">பெரியார் பல்கலைக்கழகம்</h1>
          <p className="pu-ta-sub">அரசு பல்கலைக்கழகம், சேலம்.</p>
          <h2 className="pu-en-title">PERIYAR UNIVERSITY</h2>
          <p className="pu-en-sub">Salem - 636 011, Tamil Nadu, India.</p>
          <div className="pu-pill-badge">
            <span>{pillText}</span>
          </div>
        </div>
        <div className="pu-portrait-box">
          <img
            src={`${import.meta.env.BASE_URL}periyar-portrait.png`}
            alt="Thanthai Periyar"
            className="pu-portrait-img"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Authenticated Workspace Layout (Sidebar + Top Bar + Content)
 */
export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api
      .get('/common/notifications')
      .then((r) => setNotifications(r.data))
      .catch(() => { });
  }, []);

  const items = menus[user.role] || [];

  const roleNameMap = {
    UNIVERSITY_ADMIN: 'Placement Administrator',
    DEPARTMENT_COORDINATOR: 'Department Coordinator',
    COMPANY: 'Recruiter Partner',
    STUDENT: 'Student Candidate'
  };

  const roleTaMap = {
    UNIVERSITY_ADMIN: 'வேலைவாய்ப்பு நிர்வாகம்',
    DEPARTMENT_COORDINATOR: 'துறை ஒருங்கிணைப்பாளர்',
    COMPANY: 'கார்ப்பரேட் பார்ட்னர்',
    STUDENT: 'மாணவர் தளம்'
  };

  const roleClassMap = {
    UNIVERSITY_ADMIN: 'role-admin',
    DEPARTMENT_COORDINATOR: 'role-coordinator',
    COMPANY: 'role-company',
    STUDENT: 'role-student'
  };

  return (
    <div className="dashboard-shell">
      {/* ---------------- Sidebar Navigation ---------------- */}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Brand inverse />
          <button
            aria-label="Close menu"
            className="mobile-close"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="side-nav" aria-label="Dashboard navigation">
          {items.map(([icon, title, to]) => {
            const Icon = icons[icon] || ChevronRight;
            return (
              <NavLink
                key={to}
                end={to === roleHomes[user.role]}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `side-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={19} />
                <span>{title}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <span className={`avatar ${roleClassMap[user.role] || ''}`}>
            {user.fullName?.slice(0, 1)}
          </span>
          <div className="user-foot-meta">
            <strong title={user.fullName}>{user.fullName}</strong>
            <small className="role-chip">
              {roleNameMap[user.role] || user.role.replaceAll('_', ' ')}
            </small>
          </div>
        </div>
      </aside>

      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ---------------- Main Content Region ---------------- */}
      <div className="dash-main">
        <header className="dash-header">
          <div className="header-left">
            <button
              className="icon-btn hamburger"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div className="header-brand-group">
              <span className="header-inst-name">Periyar University</span>
              <span className="header-page-title">
                Placement Portal{' '}
                <span className="header-role-badge">
                  {roleNameMap[user.role] || user.role.replaceAll('_', ' ')}
                </span>
              </span>
            </div>
          </div>

          <div className="header-actions">
            <Link
              className="icon-btn notification-link"
              to="/notifications"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={19} />
              {notifications.some((n) => !n.read) && <span className="notif-ping" />}
            </Link>

            <div className="header-user-badge">
              <span className={`user-avatar-sm ${roleClassMap[user.role] || ''}`}>
                {user.fullName?.slice(0, 1)}
              </span>
              <div className="user-name-col">
                <span className="header-user">{user.fullName}</span>
                <small className="header-user-sub">{roleTaMap[user.role] || ''}</small>
              </div>
            </div>

            <button
              className="logout-btn"
              onClick={async () => {
                await logout();
                nav('/login');
              }}
              title="Sign out of portal"
            >
              <LogOut size={16} /> <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}

/**
 * Standard Page Title Header with Eyebrow and Optional Action CTA
 */
export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && (
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            {eyebrow}
          </span>
        )}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

/**
 * Card / Panel Surface Container
 */
export function Card({ children, title, action, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        {title && <h3>{title}</h3>}
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * 3D Interactive Statistical Metric Grid
 */
export function StatGrid({ items = [] }) {
  return (
    <div className="stat-grid">
      {items.map((item, i) => {
        const Icon = icons[item.icon] || ChartBar;
        const CardTag = item.to ? Link : 'div';
        const cardProps = item.to
          ? {
            to: item.to,
            style: { textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }
          }
          : item.onClick
            ? {
              onClick: item.onClick,
              role: 'button',
              tabIndex: 0,
              style: { cursor: 'pointer', display: 'flex', flexDirection: 'column' }
            }
            : {};

        return (
          <CardTag
            key={i}
            className={`stat-card stat-theme-${i % 4} ${item.to || item.onClick ? 'is-clickable' : ''}`}
            {...cardProps}
          >
            <div className="stat-top">
              <span className="stat-label">{item.label}</span>
              <span className={`stat-icon stat-${i % 4}`}>
                <Icon size={19} />
              </span>
            </div>
            <strong className="stat-num">{item.value ?? 0}</strong>
            {item.note && <small className="stat-note">{item.note}</small>}
          </CardTag>
        );
      })}
    </div>
  );
}

/**
 * Status Tag Badge with Pulsing Live Indicator
 */
export function Badge({ value }) {
  const label = String(value || '—').replaceAll('_', ' ');
  return (
    <span className={`status-tag status-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <span className="status-dot" />
      {label}
    </span>
  );
}

/**
 * Empty Records Fallback Placeholder
 */
export function Empty({
  title = 'Nothing here yet',
  text = 'Records will appear here when available.'
}) {
  return (
    <div className="empty-state">
      <FolderOpen size={36} />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

/**
 * Flash Notice and Alert Banners
 */
export function Notice({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div role="status" className={`notice notice-${type}`}>
      {type === 'error' ? <AlertCircle size={19} /> : <CheckCircle2 size={19} />}
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

/**
 * Async Action Execution Hook
 */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const execute = async (fn) => {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const r = await fn();
      setMessage(r?.data?.message || 'Saved successfully');
      return r;
    } catch (e) {
      setError(errorText(e));
      return null;
    } finally {
      setBusy(false);
    }
  };

  return { execute, busy, message, error, setMessage, setError };
}

/**
 * Standard Styled Button
 */
export function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  icon: Icon
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {Icon && <Icon size={17} />} <span>{children}</span>
    </button>
  );
}

/**
 * Interactive Data Table with Search Filter and Pagination
 */
export function DataTable({ columns = [], rows = [], onRowClick }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = rows.filter((row) =>
    columns.some((c) =>
      String(row[c.key] ?? '')
        .toLowerCase()
        .includes(query.toLowerCase())
    )
  );

  const per = 10;
  const shown = filtered.slice((page - 1) * per, page * per);

  useEffect(() => {
    setPage(1);
  }, [query]);

  return (
    <div className="table-area">
      <div className="table-toolbar">
        <div className="search-wrap">
          <Search size={17} className="search-icon" />
          <input
            aria-label="Search table"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quick filter records..."
          />
        </div>
        <span className="record-count">
          {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'clickable-row' : ''}
              >
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(row) : row[c.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!filtered.length && (
        <Empty
          title="No matching records"
          text="Try a different search or create a new record."
        />
      )}

      {filtered.length > per && (
        <div className="table-pagination">
          <Button
            variant="ghost"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {page} of {Math.ceil(filtered.length / per)}
          </span>
          <Button
            variant="ghost"
            disabled={page * per >= filtered.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Centered Modal Dialog with Backdrop Blur
 */
export function Modal({ title, onClose, wide = false, children, extra = null }) {
  return (
    <div
      className="modal-shade"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal-card ${wide ? 'modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {extra}
            <button
              aria-label="Close"
              className="modal-close-btn"
              onClick={onClose}
            >
              <X size={19} />
            </button>
          </div>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/**
 * Dynamic Form Field Renderer
 */
export function FormFields({ fields = [], values = {}, setValues }) {
  return (
    <div className="field-grid">
      {fields.map((f) => (
        <label
          key={f.name}
          className={`form-field ${f.wide ? 'field-wide' : ''}`}
        >
          <span>
            {f.label}
            {f.required && <em> *</em>}
          </span>
          {f.type === 'textarea' ? (
            <textarea
              rows={f.rows || 4}
              value={values[f.name] ?? ''}
              placeholder={f.placeholder || ''}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.name]: e.target.value }))
              }
              required={f.required}
            />
          ) : f.type === 'select' ? (
            <select
              value={values[f.name] ?? ''}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.name]: e.target.value }))
              }
              required={f.required}
            >
              <option value="">Choose {f.label}</option>
              {(f.options || []).map((o) => (
                <option
                  key={typeof o === 'string' ? o : o.value}
                  value={typeof o === 'string' ? o : o.value}
                >
                  {typeof o === 'string' ? o : o.label}
                </option>
              ))}
            </select>
          ) : f.type === 'checkbox' ? (
            <input
              type="checkbox"
              checked={!!values[f.name]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.name]: e.target.checked }))
              }
            />
          ) : (
            <input
              type={f.type || 'text'}
              value={values[f.name] ?? ''}
              placeholder={f.placeholder || ''}
              required={f.required}
              min={f.min}
              step={f.step}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.name]: e.target.value }))
              }
            />
          )}
        </label>
      ))}
    </div>
  );
}

/**
 * General CRUD Form Component
 */
export function CrudForm({
  title,
  fields,
  initial = {},
  onSave,
  onClose,
  submitLabel = 'Save changes',
  children
}) {
  const [values, setValues] = useState({ ...initial });
  const { execute, busy, error } = useAction();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await execute(() => onSave(values));
        if (r) onClose(true);
      }}
    >
      <h3 className="form-caption">{title}</h3>
      <FormFields fields={fields} values={values} setValues={setValues} />
      {children}
      <Notice type="error" message={error} />
      <div className="form-actions">
        <Button variant="ghost" onClick={() => onClose(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

/**
 * Loading Spinner Screen
 */
export function Loading({ text = 'Loading placement records...' }) {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}

/**
 * Direct Document / Media Upload Form
 */
export function FileUpload({ purpose, label, onUploaded }) {
  const [file, setFile] = useState(null);
  const { execute, busy, error, message } = useAction();

  return (
    <div className="file-uploader">
      <input
        aria-label={label || 'Choose file'}
        type="file"
        accept={
          purpose === 'resume'
            ? '.pdf,.doc,.docx'
            : purpose === 'certificate'
              ? '.pdf,.jpg,.png'
              : '.jpg,.jpeg,.png,.webp'
        }
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button
        icon={UploadCloud}
        disabled={!file || busy}
        onClick={async () => {
          const data = new FormData();
          data.append('file', file);
          const r = await execute(() => api.post(`/files/upload/${purpose}`, data));
          if (r) {
            onUploaded?.(r.data);
            setFile(null);
          }
        }}
      >
        {busy ? 'Uploading...' : 'Upload'}
      </Button>
      <Notice message={error} type="error" />
      <Notice message={message} />
    </div>
  );
}

/**
 * Hook to Fetch and Cache Data with Automatic Re-fetch Support
 */
export function useLoad(url, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(url)
      .then((r) => {
        if (active) {
          setData(r.data);
          setError('');
        }
      })
      .catch((e) => {
        if (active) setError(errorText(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [url, revision, ...dependencies]);

  return { data, loading, error, reload: () => setRevision((v) => v + 1) };
}

/**
 * Standard Indian Locale Date Formatter
 */
export function DateFmt({ value }) {
  return value
    ? new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    })
    : '—';
}

/**
 * Excel Export Button Trigger
 */
export function ExportButton({ onClick }) {
  return (
    <Button icon={Download} variant="outline" onClick={onClick}>
      Export Excel
    </Button>
  );
}

/**
 * Displays an Announcement PDF or Image attachment with inline image preview and view/download links.
 */
export function AnnouncementAttachment({ announcement, compact = false }) {
  if (!announcement?.attachmentFileId) return null;

  const isImg = String(announcement.attachmentMime || '').startsWith('image/');
  const previewHref = fileUrl(announcement.attachmentFileId, true);
  const downloadHref = fileUrl(announcement.attachmentFileId, false);
  const name = announcement.attachmentName || (isImg ? 'Attached Image' : 'Attached PDF');

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        <a
          href={previewHref}
          target="_blank"
          rel="noreferrer"
          className="file-link"
          style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Paperclip size={13} /> {name}
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 10,
        border: '1px solid #e3ebf3',
        background: '#f8fbfd'
      }}
    >
      {isImg && (
        <a
          href={previewHref}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'block', marginBottom: 10 }}
        >
          <img
            src={previewHref}
            alt={name}
            style={{
              maxWidth: '100%',
              maxHeight: 260,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              objectFit: 'contain',
              background: '#ffffff'
            }}
          />
        </a>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {isImg ? <Paperclip size={16} color="#167d8d" /> : <FileText size={16} color="#dc2626" />}
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: '#102438',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 260
            }}
            title={name}
          >
            {name}
          </span>
        </div>
        <div className="mini-actions">
          <a
            href={previewHref}
            target="_blank"
            rel="noreferrer"
            className="mini-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
          >
            <ExternalLink size={12} /> {isImg ? 'View Image' : 'Preview PDF'}
          </a>
          <a
            href={downloadHref}
            target="_blank"
            rel="noreferrer"
            className="mini-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
          >
            <Download size={12} /> Download
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * File picker & uploader for Announcement PDF / Image attachments.
 */
export function AnnouncementAttachmentPicker({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadErr('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/files/upload/announcement', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange({
        attachmentFileId: data.id,
        attachmentName: data.name,
        attachmentMime: data.mimeType
      });
    } catch (err) {
      setUploadErr(errorText(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      <span
        style={{
          display: 'block',
          fontSize: 12.5,
          fontWeight: 700,
          color: '#102438',
          marginBottom: 6
        }}
      >
        Attachment (Optional — PDF or Image, max 10 MB)
      </span>

      {value?.attachmentFileId ? (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #cbd5e1',
            background: '#f8fbfd'
          }}
        >
          {String(value.attachmentMime || '').startsWith('image/') && (
            <img
              src={fileUrl(value.attachmentFileId, true)}
              alt={value.attachmentName || 'Attachment'}
              style={{
                maxWidth: '100%',
                maxHeight: 160,
                borderRadius: 8,
                marginBottom: 8,
                objectFit: 'contain',
                background: '#fff',
                border: '1px solid #e2e8f0'
              }}
            />
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Paperclip size={15} color="#167d8d" />
              <strong style={{ fontSize: 13 }}>{value.attachmentName || 'Attached File'}</strong>
            </div>
            <div className="mini-actions">
              <a
                href={fileUrl(value.attachmentFileId, true)}
                target="_blank"
                rel="noreferrer"
                className="mini-btn"
                style={{ textDecoration: 'none' }}
              >
                Preview
              </a>
              <button
                type="button"
                className="mini-btn danger"
                onClick={() =>
                  onChange({
                    attachmentFileId: null,
                    attachmentName: null,
                    attachmentMime: null
                  })
                }
              >
                <Trash2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 10,
            border: '1.5px dashed #94a3b8',
            background: '#f8fafc',
            cursor: uploading ? 'wait' : 'pointer'
          }}
        >
          <UploadCloud size={20} color="#167d8d" />
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: 13, color: '#102438' }}>
              {uploading ? 'Uploading attachment...' : 'Click to upload PDF or Image'}
            </strong>
            <small className="muted" style={{ fontSize: 11.5 }}>
              Supported formats: PDF, JPG, PNG, WEBP (up to 10 MB)
            </small>
          </div>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>
      )}

      {uploadErr && <Notice message={uploadErr} type="error" />}
    </div>
  );
}

/**
 * Job Recruitment Drive Attachment Display (Flyer Image / PDF JD)
 * Used across Student, Company, Admin, and Coordinator views.
 */
export function JobAttachment({ job, compact = false }) {
  if (!job || !job.attachmentFileId) return null;

  const isImg = String(job.attachmentMime || '').startsWith('image/');
  const previewHref = fileUrl(job.attachmentFileId, true);
  const downloadHref = fileUrl(job.attachmentFileId, false);
  const name = job.attachmentName || (isImg ? 'Recruitment Flyer' : 'Job Description Document');

  if (compact) {
    return (
      <a
        href={previewHref}
        target="_blank"
        rel="noreferrer"
        className="mini-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          textDecoration: 'none',
          fontSize: 11.5,
          padding: '3px 8px',
          borderRadius: 6,
          background: isImg ? '#ecfdf5' : '#fef2f2',
          color: isImg ? '#065f46' : '#991b1b',
          border: isImg ? '1px solid #a7f3d0' : '1px solid #fecaca',
          fontWeight: 600
        }}
        title={`View ${name} (${isImg ? 'Image' : 'PDF'})`}
      >
        {isImg ? <Paperclip size={12} color="#059669" /> : <FileText size={12} color="#dc2626" />}
        <span>{isImg ? 'Drive Flyer' : 'JD Attachment'}</span>
        <ExternalLink size={10} />
      </a>
    );
  }

  return (
    <div
      style={{
        marginTop: 14,
        marginBottom: 14,
        padding: 14,
        borderRadius: 12,
        border: '1px solid #d9e6eb',
        background: 'linear-gradient(180deg, #f8fbfd 0%, #f0f7f9 100%)',
        boxShadow: '0 2px 6px rgba(16, 36, 56, 0.04)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          gap: 10,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 6,
              background: isImg ? '#d1fae5' : '#fee2e2',
              color: isImg ? '#065f46' : '#b91c1c'
            }}
          >
            {isImg ? <Paperclip size={15} /> : <FileText size={15} />}
          </span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#102438' }}>
              Official Recruitment Drive Attachment
            </div>
            <div style={{ fontSize: 11.5, color: '#627889' }}>
              {name} · {isImg ? 'Flyer / Poster Image' : 'Job Description / Brochure PDF'}
            </div>
          </div>
        </div>

        <div className="mini-actions" style={{ display: 'flex', gap: 6 }}>
          <a
            href={previewHref}
            target="_blank"
            rel="noreferrer"
            className="mini-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              textDecoration: 'none',
              fontWeight: 600,
              background: '#fff'
            }}
          >
            <ExternalLink size={12} /> {isImg ? 'View Full Image' : 'Preview PDF'}
          </a>
          <a
            href={downloadHref}
            target="_blank"
            rel="noreferrer"
            className="mini-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              textDecoration: 'none',
              fontWeight: 600,
              background: '#fff'
            }}
          >
            <Download size={12} /> Download
          </a>
        </div>
      </div>

      {isImg && (
        <a
          href={previewHref}
          target="_blank"
          rel="noreferrer"
          title="Click to view full-size recruitment flyer"
          style={{ display: 'block', textAlign: 'center', marginTop: 10 }}
        >
          <img
            src={previewHref}
            alt={name}
            style={{
              maxWidth: '100%',
              maxHeight: 420,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              objectFit: 'contain',
              background: '#ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              cursor: 'zoom-in'
            }}
          />
        </a>
      )}
    </div>
  );
}

/**
 * Job Recruitment Drive Attachment Picker (Upload Flyer Image or PDF JD)
 */
export function JobAttachmentPicker({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadErr('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/files/upload/job_attachment', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange({
        attachmentFileId: data.id,
        attachmentName: data.name,
        attachmentMime: data.mimeType
      });
    } catch (err) {
      setUploadErr(errorText(err));
    } finally {
      setUploading(false);
    }
  }

  const isImg = String(value?.attachmentMime || '').startsWith('image/');

  return (
    <div style={{ marginTop: 12, marginBottom: 14 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12.5,
          fontWeight: 700,
          color: '#102438',
          marginBottom: 6
        }}
      >
        Recruitment Drive Attachment (Optional — Flyer / Brochure / JD, max 10 MB)
      </label>

      {value?.attachmentFileId ? (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #cbd5e1',
            background: '#f8fbfd'
          }}
        >
          {isImg && (
            <img
              src={fileUrl(value.attachmentFileId, true)}
              alt={value.attachmentName || 'Attachment'}
              style={{
                maxWidth: '100%',
                maxHeight: 180,
                borderRadius: 8,
                marginBottom: 10,
                objectFit: 'contain',
                background: '#fff',
                border: '1px solid #e2e8f0',
                display: 'block'
              }}
            />
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isImg ? <Paperclip size={16} color="#167d8d" /> : <FileText size={16} color="#dc2626" />}
              <div>
                <strong style={{ fontSize: 13, color: '#102438' }}>
                  {value.attachmentName || 'Attached File'}
                </strong>
                <div style={{ fontSize: 11, color: '#627889' }}>
                  {isImg ? 'Flyer Image' : 'PDF Document'}
                </div>
              </div>
            </div>
            <div className="mini-actions" style={{ display: 'flex', gap: 6 }}>
              <a
                href={fileUrl(value.attachmentFileId, true)}
                target="_blank"
                rel="noreferrer"
                className="mini-btn"
                style={{ textDecoration: 'none' }}
              >
                Preview
              </a>
              <button
                type="button"
                className="mini-btn danger"
                onClick={() =>
                  onChange({
                    attachmentFileId: null,
                    attachmentName: null,
                    attachmentMime: null
                  })
                }
              >
                <Trash2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '18px 14px',
            border: '2px dashed #cbd5e1',
            borderRadius: 10,
            background: uploading ? '#f1f5f9' : '#ffffff',
            cursor: uploading ? 'wait' : 'pointer',
            textAlign: 'center',
            transition: 'border-color 0.15s ease'
          }}
        >
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          {uploading ? (
            <span style={{ fontSize: 12.5, color: '#167d8d', fontWeight: 600 }}>
              Uploading attachment...
            </span>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#167d8d' }}>
                <Upload size={16} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Upload Recruitment Flyer or PDF JD
                </span>
              </div>
              <span style={{ fontSize: 11.5, color: '#627889' }}>
                Click to browse JPG, PNG, WebP or PDF (up to 10 MB)
              </span>
            </>
          )}
        </label>
      )}

      {uploadErr && (
        <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 4 }}>
          {uploadErr}
        </div>
      )}
    </div>
  );
}

/**
 * -----------------------------------------------------------------------------
 * Resume A4 PDF Generator & Print Trigger
 * -----------------------------------------------------------------------------
 * Creates a pixel-perfect, vector-crisp A4 printable document with full original
 * URLs (e.g. https://itsgowtham.vercel.app, https://github.com/...) and opens
 * the browser's native Print / Save as PDF dialog.
 * 
 * Supports both single candidate export and multi-candidate batch printing
 * (with each student's resume automatically starting on a brand new page).
 */
function renderSingleStudentResume(s, escape, fmtMY) {
  if (!s) return '';
  const studentName = s.user?.fullName || 'Student';
  const education = [...(s.education || [])].sort(
    (a, b) => (b.passingYear || 0) - (a.passingYear || 0)
  );
  const experiences = s.experiences || [];
  const internships = s.internships || [];
  const projects = s.projects || [];
  const skills = s.skills || [];
  const certificates = s.certificates || [];

  const photoUrl = s.photoFileId
    ? new URL(fileUrl(s.photoFileId), window.location.origin).href
    : null;

  return `
  <div class="student-resume-sheet">
    <div class="header-box">
      <div class="header-info">
        <h1 class="cand-name">${escape(studentName)}</h1>
        <p class="cand-sub">
          ${escape(s.programme?.name || 'Programme')} · Department of ${escape(s.department?.name || 'Department')} · Passing-Out Year: ${escape(s.passingYear || '—')}
        </p>

        <div class="badge-wrap">
          <span class="badge">Reg. No: ${escape(s.registrationNo)}</span>
          <span class="badge">Passing-Out Year: ${escape(s.passingYear || '—')}</span>
          <span class="badge active">${escape(s.user?.status || 'ACTIVE')}</span>
        </div>

        <div class="contact-grid">
          ${s.user?.email ? `
          <div class="contact-item">
            <span class="contact-lbl">Email:</span>
            <a href="mailto:${escape(s.user.email)}">${escape(s.user.email)}</a>
            ${s.phone ? `&nbsp;·&nbsp;<span class="contact-lbl" style="min-width:auto;">Phone:</span> <span>${escape(s.phone)}</span>` : ''}
          </div>` : ''}
          ${s.portfolio ? `
          <div class="contact-item">
            <span class="contact-lbl">Portfolio:</span>
            <a href="${escape(s.portfolio.startsWith('http') ? s.portfolio : 'https://' + s.portfolio)}" target="_blank" rel="noreferrer">${escape(s.portfolio)}</a>
          </div>` : ''}
          ${s.linkedin ? `
          <div class="contact-item">
            <span class="contact-lbl">LinkedIn:</span>
            <a href="${escape(s.linkedin.startsWith('http') ? s.linkedin : 'https://' + s.linkedin)}" target="_blank" rel="noreferrer">${escape(s.linkedin)}</a>
          </div>` : ''}
          ${s.github ? `
          <div class="contact-item">
            <span class="contact-lbl">GitHub:</span>
            <a href="${escape(s.github.startsWith('http') ? s.github : 'https://' + s.github)}" target="_blank" rel="noreferrer">${escape(s.github)}</a>
          </div>` : ''}
          ${s.twitter ? `
          <div class="contact-item">
            <span class="contact-lbl">X / Twitter:</span>
            <a href="${escape(s.twitter.startsWith('http') ? s.twitter : 'https://' + s.twitter)}" target="_blank" rel="noreferrer">${escape(s.twitter)}</a>
          </div>` : ''}
        </div>
      </div>

      <div class="photo-cell">
        ${photoUrl ? `<img src="${photoUrl}" alt="${escape(studentName)}" />` : `<div class="photo-placeholder">${escape((studentName || 'S').slice(0, 2).toUpperCase())}</div>`}
      </div>
    </div>

    ${s.about ? `
    <div class="sec">
      <div class="sec-title">Professional Summary</div>
      <p class="summary-p">${escape(s.about)}</p>
    </div>` : ''}

    ${education.length > 0 ? `
    <div class="sec">
      <div class="sec-title">Education</div>
      ${education.map(e => `
        <div class="entry">
          <div class="entry-header">
            <div>
              <span class="entry-title">${escape(e.qualification)}</span>
              ${e.board ? `<span class="entry-extra"> — ${escape(e.board)}</span>` : ''}
            </div>
            <div>
              <span class="entry-score">${escape(e.score)} ${e.scale === 'Percentage' ? '%' : `(${escape(e.scale)})`}</span>
              <span class="entry-date">&nbsp;(${escape(e.passingYear)})</span>
            </div>
          </div>
          <div class="entry-sub">${escape(e.institution)}</div>
        </div>
      `).join('')}
    </div>` : ''}

    ${skills.length > 0 ? `
    <div class="sec">
      <div class="sec-title">Skills</div>
      <div class="skills-flex">
        ${skills.map(sk => `<span class="skill-badge">${escape(sk.name)}</span>`).join('')}
      </div>
    </div>` : ''}

    ${experiences.length > 0 ? `
    <div class="sec">
      <div class="sec-title">Work Experience</div>
      ${experiences.map(ex => `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${escape(ex.role)}${ex.employmentType ? ` · ${escape(ex.employmentType)}` : ''}</span>
            <span class="entry-date">${fmtMY(ex.startDate)} – ${ex.currentlyWorking || !ex.endDate ? 'Present' : fmtMY(ex.endDate)}</span>
          </div>
          <div class="entry-sub">${escape(ex.companyName)}${ex.location ? ` · ${escape(ex.location)}` : ''}</div>
          ${ex.description ? `<p class="entry-desc">${escape(ex.description)}</p>` : ''}
        </div>
      `).join('')}
    </div>` : ''}

    ${internships.length > 0 ? `
    <div class="sec">
      <div class="sec-title">Internships</div>
      ${internships.map(i => `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${escape(i.domain)} — ${escape(i.companyName)}</span>
            <span class="entry-date">${fmtMY(i.startDate)} – ${fmtMY(i.endDate)}</span>
          </div>
          ${i.description ? `<p class="entry-desc">${escape(i.description)}</p>` : ''}
        </div>
      `).join('')}
    </div>` : ''}

    ${projects.length > 0 ? `
    <div class="sec">
      <div class="sec-title">Projects</div>
      ${projects.map(p => `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${escape(p.title)}${p.technologies ? ` · <span style="font-weight: normal; color: #475569;">${escape(p.technologies)}</span>` : ''}</span>
          </div>
          <div class="entry-links">
            ${p.github ? `<div><strong>GitHub:</strong> <a href="${escape(p.github.startsWith('http') ? p.github : 'https://' + p.github)}" target="_blank" rel="noreferrer">${escape(p.github)}</a></div>` : ''}
            ${p.liveUrl ? `<div><strong>Live Demo:</strong> <a href="${escape(p.liveUrl.startsWith('http') ? p.liveUrl : 'https://' + p.liveUrl)}" target="_blank" rel="noreferrer">${escape(p.liveUrl)}</a></div>` : ''}
          </div>
          ${p.description ? `<p class="entry-desc">${escape(p.description)}</p>` : ''}
        </div>
      `).join('')}
    </div>` : ''}

    ${certificates.length > 0 ? `
    <div class="sec">
      <div class="sec-title">Certifications</div>
      ${certificates.map(c => `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${escape(c.title)} — ${escape(c.issuer)}</span>
            <span class="entry-date">${escape(c.year)}</span>
          </div>
          ${c.fileId ? `<div class="entry-links"><div><strong>Certificate:</strong> <a href="${new URL(fileUrl(c.fileId, true), window.location.origin).href}" target="_blank" rel="noreferrer">Verified Credential</a></div></div>` : ''}
        </div>
      `).join('')}
    </div>` : ''}
  </div>
  `;
}

export function downloadResumePdf(studentOrStudents, customTitle = null) {
  if (!studentOrStudents) return;
  const list = Array.isArray(studentOrStudents) ? studentOrStudents : [studentOrStudents];
  if (list.length === 0) return;

  const fileName =
    customTitle ||
    (list.length === 1
      ? `${list[0].user?.fullName || 'Student'} - Resume Profile`
      : `Periyar University - Student Resumes (${list.length} Candidates)`);

  const escape = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const fmtMY = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      })
      : 'Present';

  const bodyContent = list.map((s) => renderSingleStudentResume(s, escape, fmtMY)).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escape(fileName)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 12mm 15mm;
    }
    @media print {
      html, body {
        width: 210mm;
        height: auto;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f233a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.5;
    }
    a {
      color: #0e7490;
      text-decoration: underline;
      word-break: break-all;
    }
    .student-resume-sheet {
      display: block;
      page-break-after: always;
      break-after: page;
    }
    .student-resume-sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 18px;
      margin-bottom: 14px;
      padding-bottom: 14px;
      border-bottom: 2px solid #e2e8f0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .header-info {
      flex: 1;
    }
    .cand-name {
      font-size: 23pt;
      font-weight: 800;
      color: #0a2540;
      letter-spacing: -0.015em;
      line-height: 1.15;
      margin: 0 0 4px 0;
    }
    .cand-sub {
      font-size: 11.5pt;
      color: #334e68;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    .badge-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }
    .badge {
      font-size: 9pt;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      background: #f1f5f9;
      color: #334e68;
      border: 1px solid #cbd5e1;
    }
    .badge.active {
      background: #ecfdf5;
      color: #065f46;
      border-color: #a7f3d0;
    }
    .contact-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 10.5pt;
      color: #334e68;
    }
    .contact-item {
      display: flex;
      align-items: baseline;
      gap: 6px;
      line-height: 1.4;
    }
    .contact-lbl {
      font-weight: 700;
      color: #0f233a;
      min-width: 75px;
      flex-shrink: 0;
    }
    .photo-cell {
      width: 100px;
      height: 125px;
      flex-shrink: 0;
      border-radius: 6px;
      overflow: hidden;
      border: 1.5px solid #cbd5e1;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(15, 35, 58, 0.08);
    }
    .photo-cell img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .photo-placeholder {
      font-size: 26pt;
      font-weight: 800;
      color: #64748b;
    }
    .sec {
      display: block;
      margin-bottom: 14px;
    }
    .sec-title {
      display: block;
      font-size: 12pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0e7490;
      border-bottom: 2px solid #0e7490;
      padding-bottom: 3px;
      margin: 0 0 8px 0;
      break-after: avoid;
      page-break-after: avoid;
    }
    .summary-p {
      margin: 0;
      font-size: 10.5pt;
      line-height: 1.55;
      color: #1e293b;
      text-align: justify;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .entry {
      display: block;
      margin-bottom: 8px;
      padding-bottom: 7px;
      border-bottom: 1px dashed #e2e8f0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .entry:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 11pt;
      color: #0f233a;
    }
    .entry-title {
      font-weight: 700;
      color: #0f233a;
    }
    .entry-extra {
      color: #475569;
      font-size: 10pt;
    }
    .entry-score {
      font-weight: 700;
      color: #0e7490;
      font-size: 10.5pt;
    }
    .entry-date {
      color: #64748b;
      font-size: 9.5pt;
      font-weight: 600;
    }
    .entry-sub {
      font-size: 10pt;
      color: #475569;
      margin-top: 2px;
    }
    .entry-desc {
      font-size: 10pt;
      color: #334e68;
      margin: 3px 0 0 0;
      line-height: 1.45;
    }
    .entry-links {
      margin-top: 3px;
      font-size: 10pt;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .skills-flex {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .skill-badge {
      font-size: 9.5pt;
      font-weight: 600;
      padding: 3px 8px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      color: #1e293b;
    }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const pri = iframe.contentWindow;
  pri.document.open();
  pri.document.write(html);
  pri.document.close();

  const triggerPrint = () => {
    try {
      pri.focus();
      pri.print();
    } catch (err) {
      console.error('Print failed via iframe, opening print window fallback:', err);
      const w = window.open('', '_blank');
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
        setTimeout(() => {
          w.focus();
          w.print();
        }, 500);
      }
    } finally {
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (_) { }
      }, 3000);
    }
  };

  const images = pri.document.images;
  if (images && images.length > 0) {
    let loaded = 0;
    const total = images.length;
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      triggerPrint();
    };
    for (let i = 0; i < total; i++) {
      if (images[i].complete) {
        loaded++;
      } else {
        images[i].onload = () => {
          loaded++;
          if (loaded >= total) done();
        };
        images[i].onerror = () => {
          loaded++;
          if (loaded >= total) done();
        };
      }
    }
    if (loaded >= total) {
      setTimeout(done, 200);
    } else {
      setTimeout(done, 1500);
    }
  } else {
    setTimeout(triggerPrint, 250);
  }
}

export const downloadMultipleResumesPdf = downloadResumePdf;

/**
 * -----------------------------------------------------------------------------
 * StudentResumeModal
 * -----------------------------------------------------------------------------
 * Standardized executive resume presentation used across Company, Admin,
 * and Coordinator portals to view candidates' complete profiles.
 */
export function StudentResumeModal({
  student,
  onClose,
  application = null,
  extraActions = null
}) {
  if (!student) return null;
  const s = student;
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
  const resumes = s.resumes || [];
  const activeResume = resumes.find((r) => r.isActive) || resumes[0];

  return (
    <Modal
      wide
      title={`${s.user?.fullName || 'Student'} — Resume Profile`}
      onClose={onClose}
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
            <h2 className="resume-name">{s.user?.fullName || 'Candidate Name'}</h2>
            <p className="resume-subtitle">
              {s.programme?.name || 'Programme'} · Department of {s.department?.name || 'Department'} · Passing-Out Year: {s.passingYear || '—'}
            </p>
            <div className="resume-meta-pills">
              <span className="resume-meta-pill">Reg. No: {s.registrationNo}</span>
              {application ? (
                <>
                  <span className="resume-meta-pill role-pill">
                    Applied for: {application.job?.title}
                  </span>
                  <span className="resume-meta-pill">Passing-Out Year: {s.passingYear || '—'}</span>
                  <Badge value={application.status} />
                </>
              ) : (
                <>
                  <span className="resume-meta-pill">Passing-Out Year: {s.passingYear || '—'}</span>
                  <Badge value={s.user?.status || 'ACTIVE'} />
                  {s._count?.applications !== undefined && (
                    <span
                      className="resume-meta-pill"
                      style={{
                        background: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0'
                      }}
                    >
                      {s._count.applications} Applications
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="resume-contact-row">
              {s.user?.email && (
                <a
                  className="resume-contact-item"
                  href={`mailto:${s.user.email}`}
                  title="Registered Email"
                >
                  <Mail size={13} color="#167d8d" /> {s.user.email}
                </a>
              )}
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

          {s.photoFileId ? (
            <div className="resume-photo-frame">
              <img
                src={fileUrl(s.photoFileId)}
                alt={s.user?.fullName}
                crossOrigin="anonymous"
              />
            </div>
          ) : (
            <div
              className="resume-photo-frame"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e2e8f0',
                color: '#475569',
                fontSize: 22,
                fontWeight: 700
              }}
            >
              {(s.user?.fullName || 'S').slice(0, 2).toUpperCase()}
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
                        {e.board && <span className="resume-entry-sub"> — {e.board}</span>}
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
                    {ex.description && <p className="resume-entry-desc">{ex.description}</p>}
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

          {/* 8. Cover Letter if application */}
          {application?.coverLetter && (
            <section>
              <h3 className="resume-section-title">
                <FileText size={14} /> Cover Letter
              </h3>
              <p className="resume-summary-text">{application.coverLetter}</p>
            </section>
          )}
        </div>
      </div>

      {/* Resume Document Downloads & Actions Footer */}
      <div
        className="resume-screening-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div>
          <strong style={{ fontSize: 13.5, color: '#0f233a', display: 'block' }}>
            {application ? 'Submitted Application Resume' : 'Student Career Documents'}
          </strong>
          <small className="muted">
            {application
              ? `Attached at time of application on ${new Date(
                application.createdAt
              ).toLocaleDateString('en-IN')}`
              : activeResume
                ? `Uploaded file: ${activeResume.fileName || 'Primary Resume'}`
                : 'Student hasn’t uploaded an external resume file yet.'}
          </small>
        </div>

        <div
          className="mini-actions"
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}
        >
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
          {(application?.resumeFileId || activeResume?.fileId) && (
            <>
              <a
                className="mini-btn"
                href={fileUrl(application?.resumeFileId || activeResume?.fileId, true)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={13} /> Preview Uploaded File
              </a>
              <a
                className="mini-btn"
                href={fileUrl(application?.resumeFileId || activeResume?.fileId)}
                download
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  textDecoration: 'none'
                }}
              >
                <Download size={13} /> Download Uploaded File
              </a>
            </>
          )}
          {extraActions}
        </div>
      </div>
    </Modal>
  );
}
