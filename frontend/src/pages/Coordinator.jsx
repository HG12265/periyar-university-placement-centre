import React, { useState } from 'react';
import {
  GraduationCap,
  BriefcaseBusiness,
  UploadCloud,
  PlusCircle,
  Download,
  AlertCircle
} from 'lucide-react';
import { api, download, useAuth, errorText } from '../context/Auth.jsx';
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
  ExportButton,
  DateFmt,
  AnnouncementAttachment,
  AnnouncementAttachmentPicker,
  JobAttachment
} from '../components/UI.jsx';

/**
 * -----------------------------------------------------------------------------
 * 1. CoordinatorDashboard
 * -----------------------------------------------------------------------------
 * Departmental placement analytics, eligible student counts, and programme summary.
 */
export function CoordinatorDashboard() {
  const { data, loading, error } = useLoad('/coordinator/dashboard');

  if (loading) return <Loading />;
  if (error) return <Notice type="error" message={error} />;

  const s = data.stats;

  const statItems = [
    [s.students, 'Department Students', 'students'],
    [s.eligibleStudents, 'Students Eligible for Jobs', 'jobs'],
    [s.placed, 'Placed Students', 'reports'],
    [`${s.placementPercentage}%`, 'Placement Percentage', 'reports'],
    [s.applications, 'Total Applications', 'applications'],
    [s.activeJobs, 'Active Relevant Jobs', 'jobs']
  ].map(([value, label, icon]) => ({ value, label, icon }));

  return (
    <>
      <PageHeading
        eyebrow="Department Placement Office"
        title="Coordinator Dashboard"
        description="Monitor department students, recruitment opportunities and placement progress."
      />

      <div className="role-welcome">
        <div>
          <h2>Helping students make their next move.</h2>
          <p>
            Manage student accounts, track applications and communicate
            updates.
          </p>
        </div>
        <GraduationCap size={76} />
      </div>

      <StatGrid items={statItems} />

      <Card title="Programme-Wise Summary">
        <DataTable
          rows={data.byProgramme}
          columns={[
            { key: 'name', label: 'Programme' },
            { key: 'students', label: 'Total Students' },
            { key: 'placed', label: 'Unique Placed' }
          ]}
        />
      </Card>
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 2. CoordinatorStudents
 * -----------------------------------------------------------------------------
 * Department student roster management, profile edit, password reset, and deletion.
 */
export function CoordinatorStudents() {
  const { user } = useAuth();
  const { data, loading, reload } = useLoad('/coordinator/students');
  const { data: depts } = useLoad('/common/departments');
  const [modal, setModal] = useState(null);
  const { execute, error, message } = useAction();

  const department = (depts || []).find(
    (d) => d.id === user?.coordinator?.departmentId
  );
  const programmes = department?.programmes || [];

  const studentFields = [
    {
      name: 'registrationNo',
      label: 'University Registration No.',
      required: true
    },
    { name: 'name', label: 'Student Name', required: true },
    { name: 'email', label: 'Registered Email', type: 'email', required: true },
    {
      name: 'password',
      label: 'Initial Password (optional - defaults to Registration No.)'
    },
    { name: 'phone', label: 'Phone' },
    {
      name: 'level',
      label: 'UG / PG',
      type: 'select',
      options: ['UG', 'PG'],
      required: true
    },
    {
      name: 'programmeId',
      label: 'Programme',
      type: 'select',
      options: programmes.map((p) => ({ value: p.id, label: p.name })),
      required: true
    },
    {
      name: 'passingYear',
      label: 'Passing-Out Year',
      type: 'number',
      required: true
    }
  ];

  const columns = [
    { key: 'registrationNo', label: 'Registration Number' },
    { key: 'name', label: 'Name' },
    { key: 'programme', label: 'Programme' },
    { key: 'passingYear', label: 'Batch' },
    {
      key: 'status',
      label: 'Account',
      render: (r) => <Badge value={r.status} />
    },
    {
      key: 'id',
      label: 'Manage',
      render: (r) => (
        <div className="mini-actions">
          <button className="mini-btn" onClick={() => setModal(r)}>
            Edit
          </button>
          <button
            className="mini-btn"
            onClick={async () => {
              if (
                confirm(
                  `Reset password for ${r.name} to Registration Number (${r.registrationNo})?`
                )
              ) {
                const x = await execute(() =>
                  api.post(`/coordinator/students/${r.id}/reset-password`)
                );
                if (x) reload();
              }
            }}
          >
            Reset Password
          </button>
          <button
            className="mini-btn danger"
            onClick={async () => {
              if (
                confirm(
                  `Are you sure you want to permanently delete student ${r.name} (${r.registrationNo})?`
                )
              ) {
                await execute(() =>
                  api.delete(`/coordinator/students/${r.id}`)
                );
                reload();
              }
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeading
        eyebrow="Student management"
        title="Department Students"
        description="Manage only students belonging to your assigned university department."
        action={
          <Button icon={PlusCircle} onClick={() => setModal({})}>
            Add Student
          </Button>
        }
      />

      <Notice message={message} />
      <Notice type="error" message={error} />

      {loading ? (
        <Loading />
      ) : (
        <Card>
          <DataTable
            rows={data.map((s) => ({
              ...s,
              name: s.user.fullName,
              email: s.user.email,
              department: s.department.name,
              programme: s.programme.name,
              status: s.user.status
            }))}
            columns={columns}
          />
        </Card>
      )}

      {modal && (
        <Modal
          title={modal.id ? 'Edit Student Record' : 'Add New Student'}
          onClose={() => setModal(null)}
        >
          <CrudForm
            fields={
              modal.id
                ? studentFields.filter((f) => f.name !== 'password')
                : studentFields
            }
            initial={
              modal.id
                ? {
                  ...modal,
                  name: modal.user.fullName,
                  email: modal.user.email
                }
                : { level: 'PG' }
            }
            onSave={async (v) => {
              const r = modal.id
                ? await api.patch(`/coordinator/students/${modal.id}`, v)
                : await api.post('/coordinator/students', v);
              return r;
            }}
            onClose={(ok) => {
              setModal(null);
              if (ok) reload();
            }}
          />
          {modal.id && (
            <p className="muted" style={{ fontSize: 12 }}>
              The student cannot independently change university-managed academic
              identity fields.
            </p>
          )}
        </Modal>
      )}
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 3. CoordinatorUpload & ImportHistory
 * -----------------------------------------------------------------------------
 * Bulk student onboarding via validated XLSX spreadsheet upload.
 */
function ImportHistory() {
  const { data, loading } = useLoad('/coordinator/upload/history');

  const columns = [
    {
      key: 'createdAt',
      label: 'Uploaded',
      render: (r) => <DateFmt value={r.createdAt} />
    },
    {
      key: 'stage',
      label: 'Status',
      render: (r) => <Badge value={r.stage} />
    },
    { key: 'validCount', label: 'Imported / Valid' },
    { key: 'errorCount', label: 'Errors' },
    {
      key: 'id',
      label: 'Error File',
      render: (r) => (
        <button
          className="mini-btn"
          onClick={() => download(`/coordinator/upload/errors/${r.id}`)}
        >
          Download
        </button>
      )
    }
  ];

  return (
    <Card title="Recent Import Batches">
      {loading ? <Loading /> : <DataTable rows={data || []} columns={columns} />}
    </Card>
  );
}

export function CoordinatorUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const { execute, busy, error, message } = useAction();

  return (
    <>
      <PageHeading
        eyebrow="Bulk student onboarding"
        title="Excel Student Import"
        description="Validate, preview and confirm up to 1,000 student records per XLSX upload."
        action={
          <Button
            variant="outline"
            icon={Download}
            onClick={() =>
              download(
                '/coordinator/upload/template',
                'student_import_template.xlsx'
              )
            }
          >
            Download Template
          </Button>
        }
      />

      <Notice message={error} type="error" />
      <Notice message={message} />

      <Card title="Upload Student Spreadsheet">
        <p className="muted" style={{ fontSize: 12 }}>
          Required columns: UniversityRegNo, Name, UG/PG, Department, Programme,
          Email, Phone and PassedOutYear. Imports are always restricted to your
          own department.
        </p>
        <div className="file-uploader">
          <input
            type="file"
            aria-label="Student Excel file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button
            icon={UploadCloud}
            disabled={!file || busy}
            onClick={async () => {
              const form = new FormData();
              form.append('file', file);
              const r = await execute(() =>
                api.post('/coordinator/upload/preview', form)
              );
              if (r) {
                setPreview(r.data);
                setResult(null);
              }
            }}
          >
            Preview & Validate
          </Button>
        </div>
      </Card>

      {preview && (
        <Card
          title={`Import Preview · ${preview.valid} valid · ${preview.errors} errors`}
        >
          <DataTable
            rows={preview.rows.map((r) => ({
              ...r,
              error: r.errors.join('; ') || 'Valid'
            }))}
            columns={[
              { key: 'row', label: 'Excel Row' },
              { key: 'registrationNo', label: 'Registration No.' },
              { key: 'name', label: 'Student' },
              { key: 'email', label: 'Email' },
              { key: 'error', label: 'Validation' }
            ]}
          />
          <div className="form-actions">
            <Button
              variant="outline"
              onClick={() =>
                download(
                  `/coordinator/upload/errors/${preview.batchId}`,
                  'student_import_errors.xlsx'
                )
              }
            >
              Download Errors
            </Button>
            <Button
              disabled={busy || preview.valid === 0}
              onClick={async () => {
                if (!confirm(`Import ${preview.valid} valid students?`)) return;
                const r = await execute(() =>
                  api.post(`/coordinator/upload/confirm/${preview.batchId}`)
                );
                if (r) {
                  setResult(r.data);
                  setPreview(null);
                }
              }}
            >
              Confirm Import
            </Button>
          </div>
        </Card>
      )}

      {result && (
        <Card title="Import Results">
          <Notice
            message={`Created ${result.created.length} student accounts. ${result.skipped.length} rows skipped.`}
          />
          <p className="muted" style={{ fontSize: 12 }}>
            Students can now log in directly with their registered email and
            University Registration Number as initial password. They will be
            prompted to set a new password on first login.
          </p>
          <DataTable
            rows={result.created}
            columns={[
              { key: 'registrationNo', label: 'Registration No.' },
              { key: 'email', label: 'Email' }
            ]}
          />
        </Card>
      )}

      <ImportHistory />
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 4. CoordinatorJobs
 * -----------------------------------------------------------------------------
 * Active recruitment drives matched specifically for the coordinator's department.
 */
export function CoordinatorJobs() {
  const { data, loading, error } = useLoad('/coordinator/jobs');

  return (
    <>
      <PageHeading
        title="Department Recruitment Jobs"
        eyebrow="Career opportunities"
        description="Approved, active jobs relevant to your department."
      />

      <Notice message={error} type="error" />

      {loading ? (
        <Loading />
      ) : (
        <div className="item-cards">
          {data.map((j) => (
            <div className="item-card" key={j.id}>
              <div className="portal-icon p-teal">
                <BriefcaseBusiness size={23} />
              </div>
              <h3 style={{ marginTop: 14 }}>{j.title}</h3>
              <p>
                <strong>{j.company.name}</strong>
              </p>
              <p>
                {j.location} · {j.jobType}
                <br />
                Package: {j.salaryMin ?? '—'}–{j.salaryMax ?? '—'} {j.salaryUnit}
              </p>
              <p>
                Apply by: <DateFmt value={j.deadline} />
                {new Date(j.deadline).getTime() < Date.now() && (
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
                      padding: '1px 7px',
                      borderRadius: 999,
                      marginLeft: 8
                    }}
                  >
                    <AlertCircle size={10} /> Deadline Passed / Closed
                  </span>
                )}
              </p>
              <JobAttachment job={j} />
              <Badge value="Approved" />
            </div>
          ))}
          {!data.length && (
            <Empty title="No approved jobs currently relevant to your department" />
          )}
        </div>
      )}
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 5. CoordinatorApplied
 * -----------------------------------------------------------------------------
 * Monitoring applications submitted by students in this department.
 */
export function CoordinatorApplied() {
  const { data, loading } = useLoad('/coordinator/applied-students');

  const columns = [
    { key: 'registrationNo', label: 'Reg. No.' },
    { key: 'name', label: 'Student' },
    { key: 'programme', label: 'Programme' },
    { key: 'company', label: 'Company' },
    { key: 'job', label: 'Job' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge value={r.status} />
    },
    {
      key: 'date',
      label: 'Applied At',
      render: (r) => <DateFmt value={r.date} />
    }
  ];

  return (
    <>
      <PageHeading
        eyebrow="Application monitoring"
        title="Applied Students"
        description="Track applications submitted by students in your department."
        action={
          <ExportButton
            onClick={() =>
              download(
                '/coordinator/applied-students/export',
                'department_applied_students.xlsx'
              )
            }
          />
        }
      />

      {loading ? (
        <Loading />
      ) : (
        <Card>
          <DataTable
            rows={data.map((a) => ({
              id: a.id,
              registrationNo: a.student.registrationNo,
              name: a.student.user.fullName,
              programme: a.student.programme.name,
              batch: a.student.passingYear,
              company: a.job.company.name,
              job: a.job.title,
              status: a.status,
              date: a.createdAt
            }))}
            columns={columns}
          />
        </Card>
      )}
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 6. CoordinatorSelected
 * -----------------------------------------------------------------------------
 * Confirmed campus placement offers received by students in this department.
 */
export function CoordinatorSelected() {
  const { data, loading } = useLoad('/coordinator/selected-students-report');

  const columns = [
    { key: 'registrationNo', label: 'Reg. No.' },
    { key: 'name', label: 'Student' },
    { key: 'programme', label: 'Programme' },
    { key: 'year', label: 'Batch' },
    { key: 'company', label: 'Company' },
    { key: 'job', label: 'Job' },
    { key: 'date', label: 'Selected' }
  ];

  return (
    <>
      <PageHeading
        eyebrow="Placement reporting"
        title="Selected Students"
        description="Department selection results, including multiple offers per student."
        action={
          <ExportButton
            onClick={() =>
              download(
                '/coordinator/selected-students-report/export',
                'selected_students.xlsx'
              )
            }
          />
        }
      />

      {loading ? (
        <Loading />
      ) : (
        <>
          <StatGrid
            items={[
              {
                value: data.uniquePlaced,
                label: 'Placed Students',
                icon: 'students'
              },
              {
                value: data.totalOffers,
                label: 'Total Selected Offers',
                icon: 'reports'
              }
            ]}
          />
          <Card>
            <DataTable rows={data.rows} columns={columns} />
          </Card>
        </>
      )}
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 7. CoordinatorAnnouncements
 * -----------------------------------------------------------------------------
 * Broadcast departmental notices to students OR review administrative circulars.
 */
function CoordinatorAnnouncementForm({ initial, onClose }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [body, setBody] = useState(initial?.body || '');
  const [published, setPublished] = useState(initial?.published !== false);
  const [attachment, setAttachment] = useState({
    attachmentFileId: initial?.attachmentFileId || null,
    attachmentName: initial?.attachmentName || null,
    attachmentMime: initial?.attachmentMime || null
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const payload = {
        title,
        body,
        published,
        attachmentFileId: attachment.attachmentFileId || null
      };
      if (initial?.id) {
        await api.patch(`/coordinator/announcements/${initial.id}`, payload);
      } else {
        await api.post('/coordinator/announcements', payload);
      }
      onClose(true);
    } catch (ex) {
      setErr(errorText(ex));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label className="form-field" style={{ marginBottom: 12 }}>
        <span>
          Title <em>*</em>
        </span>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="form-field" style={{ marginBottom: 12 }}>
        <span>
          Description <em>*</em>
        </span>
        <textarea
          rows={5}
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>

      <AnnouncementAttachmentPicker value={attachment} onChange={setAttachment} />

      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 14,
          cursor: 'pointer'
        }}
      >
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Publish Now
      </label>

      <Notice message={err} type="error" />

      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={() => onClose(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving...' : initial?.id ? 'Update Notice' : 'Publish Notice'}
        </Button>
      </div>
    </form>
  );
}

export function CoordinatorAnnouncements({ admin = false }) {
  const [tab, setTab] = useState(admin ? 'admin' : 'department');
  const {
    data: deptData,
    loading: deptLoading,
    reload: reloadDept
  } = useLoad('/coordinator/announcements');
  const {
    data: adminData,
    loading: adminLoading,
    reload: reloadAdmin
  } = useLoad('/coordinator/admin-announcements');
  const [modal, setModal] = useState(null);
  const { execute, message, error } = useAction();

  const unreadAdminCount = (adminData || []).filter((a) => !a.reads?.length).length;

  async function markRead(a) {
    await execute(() => api.post(`/common/announcements/${a.id}/read`));
    reloadAdmin();
  }

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (r) => (
        <div>
          <strong>{r.title}</strong>
          {r.attachmentFileId && <AnnouncementAttachment announcement={r} compact />}
        </div>
      )
    },
    { key: 'body', label: 'Message' },
    {
      key: 'createdAt',
      label: 'Posted',
      render: (r) => <DateFmt value={r.createdAt} />
    },
    {
      key: 'published',
      label: 'Status',
      render: (r) => <Badge value={r.published ? 'Published' : 'Draft'} />
    },
    {
      key: 'id',
      label: 'Actions',
      render: (r) => (
        <div className="mini-actions">
          <button className="mini-btn" onClick={() => setModal(r)}>
            Edit
          </button>
          <button
            className="mini-btn danger"
            onClick={async () => {
              if (confirm('Delete this notice?')) {
                await execute(() =>
                  api.delete(`/coordinator/announcements/${r.id}`)
                );
                reloadDept();
              }
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const isLoading = tab === 'admin' ? adminLoading : deptLoading;

  return (
    <>
      <PageHeading
        eyebrow="Department & placement communication"
        title="Announcements"
        description="Manage notices for your department students and view official circulars from Placement Administration."
        action={
          <Button
            icon={PlusCircle}
            onClick={() => {
              setTab('department');
              setModal({});
            }}
          >
            New Announcement
          </Button>
        }
      />

      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 18
        }}
      >
        <button
          type="button"
          onClick={() => setTab('department')}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: tab === 'department' ? '2px solid #167d8d' : '1px solid #d5e0ea',
            background: tab === 'department' ? '#167d8d' : '#ffffff',
            color: tab === 'department' ? '#ffffff' : '#102438',
            fontWeight: 700,
            fontSize: 13.5,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          Department Announcements
          <span
            style={{
              fontSize: 11.5,
              padding: '2px 8px',
              borderRadius: 999,
              background: tab === 'department' ? 'rgba(255,255,255,0.22)' : '#eef2f6',
              color: tab === 'department' ? '#ffffff' : '#334155'
            }}
          >
            {(deptData || []).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('admin')}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: tab === 'admin' ? '2px solid #167d8d' : '1px solid #d5e0ea',
            background: tab === 'admin' ? '#167d8d' : '#ffffff',
            color: tab === 'admin' ? '#ffffff' : '#102438',
            fontWeight: 700,
            fontSize: 13.5,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          From Placement Admin
          <span
            style={{
              fontSize: 11.5,
              padding: '2px 8px',
              borderRadius: 999,
              background:
                unreadAdminCount > 0
                  ? '#f59e0b'
                  : tab === 'admin'
                    ? 'rgba(255,255,255,0.22)'
                    : '#eef2f6',
              color:
                unreadAdminCount > 0 || tab === 'admin' ? '#ffffff' : '#334155'
            }}
          >
            {unreadAdminCount > 0
              ? `${unreadAdminCount} new`
              : (adminData || []).length}
          </span>
        </button>
      </div>

      <Notice message={message} />
      <Notice message={error} type="error" />

      {isLoading ? (
        <Loading />
      ) : tab === 'admin' ? (
        <div className="item-cards">
          {(adminData || []).map((a) => (
            <Card key={a.id}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <Badge
                  value={
                    a.audience === 'BOTH'
                      ? 'Students & Coordinators'
                      : 'Coordinators Only'
                  }
                />
                {a.targetDepartments?.length > 0 ? (
                  <span
                    style={{
                      fontSize: 11.5,
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: '#eef2f6',
                      color: '#334155',
                      fontWeight: 600
                    }}
                  >
                    Department Specific
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 11.5,
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: '#eef9fb',
                      color: '#0d5f6d',
                      fontWeight: 600
                    }}
                  >
                    All Departments
                  </span>
                )}
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
                  <Button variant="outline" onClick={() => markRead(a)}>
                    Mark as Read
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {!(adminData || []).length && <Empty title="No placement admin announcements yet" />}
        </div>
      ) : (
        <Card>
          <DataTable rows={deptData || []} columns={columns} />
        </Card>
      )}

      {modal && (
        <Modal
          title={modal.id ? 'Edit Department Announcement' : 'Department Announcement'}
          onClose={() => setModal(null)}
        >
          <CoordinatorAnnouncementForm
            initial={modal}
            onClose={(ok) => {
              setModal(null);
              if (ok) reloadDept();
            }}
          />
        </Modal>
      )}
    </>
  );
}
