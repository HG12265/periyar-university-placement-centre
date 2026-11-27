import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PlusCircle,
  ChevronRight,
  Building2,
  GraduationCap,
  ChartNoAxesCombined,
  Users,
  Paperclip,
  Search,
  SlidersHorizontal,
  RotateCcw,
  X,
  Filter,
  Printer,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api, download, errorText, fileUrl } from '../context/Auth.jsx';
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
  StudentResumeModal,
  downloadResumePdf,
  JobAttachment
} from '../components/UI.jsx';

const yesNo = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Disabled', value: 'DISABLED' }
];

/**
 * -----------------------------------------------------------------------------
 * 1. AdminDashboard
 * -----------------------------------------------------------------------------
 * Executive placement overview with department-wise and monthly charts.
 */
export function AdminDashboard() {
  const { data, loading, error } = useLoad('/admin/dashboard');

  if (loading) return <Loading />;
  if (error) return <Notice type="error" message={error} />;

  const s = data.stats;

  const statItems = [
    {
      value: s.students,
      label: 'Total Students',
      icon: 'students',
      to: '/admin/students',
      note: 'View student directory →'
    },
    {
      value: s.companies,
      label: 'Registered Companies',
      icon: 'companies',
      to: '/admin/companies',
      note: 'Manage recruiter accounts →'
    },
    {
      value: s.jobs,
      label: 'Jobs Posted',
      icon: 'jobs',
      to: '/admin/job-approvals?tab=ALL',
      note: 'View all postings →'
    },
    {
      value: s.approved,
      label: 'Approved Jobs',
      icon: 'approvals',
      to: '/admin/job-approvals?tab=APPROVED',
      note: 'Active campus drives →'
    },
    {
      value: s.pending,
      label: 'Pending Approvals',
      icon: 'approvals',
      to: '/admin/job-approvals?tab=PENDING',
      note: s.pending > 0 ? '⚠️ Review pending drives →' : 'All drives reviewed →'
    },
    {
      value: s.placed,
      label: 'Placed Students',
      icon: 'students',
      to: '/admin/reports?tab=WITH_PLACED',
      note: 'View placed departments →'
    },
    {
      value: s.offers,
      label: 'Selected Offers',
      icon: 'reports',
      to: '/admin/reports',
      note: 'Detailed offers table →'
    },
    {
      value: s.applications,
      label: 'Applications',
      icon: 'applications',
      to: '/admin/students?tab=APPLIED',
      note: 'View applicant students →'
    }
  ];

  return (
    <>
      <PageHeading
        eyebrow="Placement administration"
        title="Placement Cell Overview"
        description="A real-time view of campus recruitment, students and selected offers."
      />

      <div className="role-welcome">
        <div>
          <span className="eyebrow" style={{ color: '#abdadb' }}>
            MANAGE THE PLACEMENT ECOSYSTEM
          </span>
          <h2>Great outcomes begin with clear oversight.</h2>
          <p>
            Review recruitment activity, manage university departments and
            monitor placement results.
          </p>
        </div>
        <ChartNoAxesCombined size={80} />
      </div>

      <StatGrid items={statItems} />

      <div className="chart-grid">
        <Card title="Department-Wise Placements">
          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={data.byDepartment}
                margin={{ top: 10, right: 15, bottom: 30, left: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#edf0f5" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-24}
                  textAnchor="end"
                  height={62}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar
                  dataKey="placed"
                  name="Placed Students"
                  fill="#167d8d"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Monthly Selected Offers">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.monthly}>
              <CartesianGrid vertical={false} stroke="#edf0f5" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#eab64f" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {!data.monthly.length && (
            <Empty title="No confirmed selections yet" />
          )}
        </Card>
      </div>
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 2. Departments
 * -----------------------------------------------------------------------------
 * Department and academic programme configuration management.
 */
export function Departments() {
  const { data, loading, reload } = useLoad('/admin/departments');
  const [modal, setModal] = useState(null);
  const { execute, message, error } = useAction();

  // Filters State
  const [search, setSearch] = useState('');
  const [deptTab, setDeptTab] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');

  const close = (ok) => {
    setModal(null);
    if (ok) reload();
  };

  const departmentFields = [
    { name: 'name', label: 'Department Name', required: true },
    { name: 'code', label: 'Department Code' }
  ];

  const programmeFields = [
    { name: 'name', label: 'Programme Name', required: true },
    { name: 'code', label: 'Programme Code' },
    {
      name: 'level',
      label: 'Level',
      type: 'select',
      required: true,
      options: ['UG', 'PG']
    }
  ];

  const deptList = data || [];

  const tabCounts = {
    ALL: deptList.length,
    ACTIVE: deptList.filter((d) => d.active).length,
    DISABLED: deptList.filter((d) => !d.active).length,
    HAS_PG: deptList.filter((d) => (d.programmes || []).some((p) => p.level === 'PG')).length,
    HAS_UG: deptList.filter((d) => (d.programmes || []).some((p) => p.level === 'UG')).length,
    HAS_STUDENTS: deptList.filter((d) => (d._count?.students || 0) > 0).length
  };

  const isFiltered =
    search.trim() !== '' ||
    deptTab !== 'ALL' ||
    levelFilter !== 'ALL' ||
    sortBy !== 'name';

  function resetFilters() {
    setSearch('');
    setDeptTab('ALL');
    setLevelFilter('ALL');
    setSortBy('name');
  }

  const filteredDepts = deptList
    .filter((d) => {
      if (deptTab === 'ACTIVE' && !d.active) return false;
      if (deptTab === 'DISABLED' && d.active) return false;
      if (deptTab === 'HAS_PG' && !(d.programmes || []).some((p) => p.level === 'PG')) return false;
      if (deptTab === 'HAS_UG' && !(d.programmes || []).some((p) => p.level === 'UG')) return false;
      if (deptTab === 'HAS_STUDENTS' && (d._count?.students || 0) === 0) return false;

      if (levelFilter === 'PG' && !(d.programmes || []).some((p) => p.level === 'PG')) return false;
      if (levelFilter === 'UG' && !(d.programmes || []).some((p) => p.level === 'UG')) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = d.name?.toLowerCase().includes(q);
        const matchCode = d.code?.toLowerCase().includes(q);
        const matchProg = (d.programmes || []).some(
          (p) => p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q)
        );
        if (!matchName && !matchCode && !matchProg) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'students_desc') return (b._count?.students || 0) - (a._count?.students || 0);
      if (sortBy === 'programmes_desc') return (b.programmes?.length || 0) - (a.programmes?.length || 0);
      if (sortBy === 'code') return (a.code || '').localeCompare(b.code || '');
      return 0;
    });

  return (
    <>
      <PageHeading
        title="Departments & Programmes"
        eyebrow="University structure"
        description="Create departments and their academic programmes. Linked records are preserved."
        action={
          <Button icon={PlusCircle} onClick={() => setModal({ type: 'department' })}>
            Add Department
          </Button>
        }
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      {/* Advanced Filter Toolbar */}
      <div className="filter-panel">
        <div className="filter-pill-row">
          {[
            { id: 'ALL', label: 'All Departments' },
            { id: 'ACTIVE', label: 'Active Only' },
            { id: 'HAS_PG', label: 'Has PG Programmes' },
            { id: 'HAS_UG', label: 'Has UG Programmes' },
            { id: 'HAS_STUDENTS', label: 'Enrolled Students' },
            { id: 'DISABLED', label: 'Disabled' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-pill ${deptTab === tab.id ? 'active' : ''}`}
              onClick={() => setDeptTab(tab.id)}
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
              placeholder="Search by department name, code, or programme..."
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
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="ALL">All Programme Levels</option>
            <option value="PG">Contains PG Programmes</option>
            <option value="UG">Contains UG Programmes</option>
          </select>

          <select
            className="filter-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort: Department Name (A–Z)</option>
            <option value="students_desc">Sort: Most Students</option>
            <option value="programmes_desc">Sort: Most Programmes</option>
            <option value="code">Sort: Department Code</option>
          </select>

          {isFiltered && (
            <button className="filter-reset-action" onClick={resetFilters}>
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        <div className="filter-meta-bar">
          <span>
            Showing <strong>{filteredDepts.length}</strong> of <strong>{deptList.length}</strong> academic departments
            {isFiltered && ' (filtered)'}
          </span>
          {isFiltered && <span style={{ color: '#0e7043' }}>✓ Filters Active</span>}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredDepts.length === 0 ? (
        <Card>
          <div className="filter-empty-state">
            <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
            <strong>No matching departments found</strong>
            <span>No academic departments match your search or filter settings.</span>
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
        <div className="item-cards">
          {filteredDepts.map((d) => (
            <Card key={d.id} className="department-card">
              <div className="portal-icon p-teal" style={{ marginBottom: 14 }}>
                <GraduationCap size={24} />
              </div>
              <h3>
                {d.name} <Badge value={d.active ? 'Active' : 'Disabled'} />
              </h3>
              <p>
                {d.code || 'No department code'} · {d._count.students} students
              </p>

              <div className="list-rows">
                {d.programmes.map((p) => (
                  <div className="list-row" key={p.id}>
                    <div>
                      <strong>{p.name}</strong>
                      <small>
                        {p.level} · {p.active ? 'Active' : 'Archived'}
                      </small>
                    </div>
                    <div className="mini-actions">
                      <button
                        className="mini-btn"
                        onClick={() =>
                          setModal({ type: 'programme', programme: p, dept: d })
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="mini-btn danger"
                        onClick={async () => {
                          if (
                            confirm(
                              `Permanently delete programme "${p.name}"? This action cannot be undone.`
                            )
                          ) {
                            const res = await execute(() =>
                              api.delete(`/admin/programmes/${p.id}`)
                            );
                            if (res) reload();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mini-actions" style={{ marginTop: 15 }}>
                <Button
                  variant="outline"
                  icon={PlusCircle}
                  onClick={() => setModal({ type: 'programme', dept: d })}
                >
                  Add Programme
                </Button>
                <button
                  className="mini-btn"
                  onClick={() =>
                    setModal({ type: 'department', department: d })
                  }
                >
                  Edit
                </button>
                <button
                  className="mini-btn danger"
                  onClick={async () => {
                    if (
                      confirm(
                        `Permanently delete department "${d.name}" and all its programmes and coordinators? This action cannot be undone.`
                      )
                    ) {
                      const res = await execute(() =>
                        api.delete(`/admin/departments/${d.id}`)
                      );
                      if (res) reload();
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={
            modal.type === 'department'
              ? 'Department Details'
              : 'Programme Details'
          }
          onClose={() => close(false)}
        >
          <CrudForm
            fields={
              modal.type === 'department' ? departmentFields : programmeFields
            }
            title={
              modal.type === 'department'
                ? 'Department information'
                : `Programme in ${modal.dept.name}`
            }
            initial={modal.department || modal.programme || { level: 'PG' }}
            onClose={close}
            onSave={(v) =>
              modal.type === 'department'
                ? modal.department
                  ? api.patch(`/admin/departments/${modal.department.id}`, v)
                  : api.post('/admin/departments', v)
                : modal.programme
                  ? api.patch(`/admin/programmes/${modal.programme.id}`, v)
                  : api.post(`/admin/departments/${modal.dept.id}/programmes`, v)
            }
          />
          {(modal.department || modal.programme) && (
            <div style={{ display: 'flex', gap: 10, marginTop: 15, flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                onClick={async () => {
                  if (
                    confirm(
                      'Archive this record? Existing student placement data will remain.'
                    )
                  ) {
                    await execute(() =>
                      modal.type === 'department'
                        ? api.patch(
                          `/admin/departments/${modal.department.id}`,
                          { ...modal.department, active: false }
                        )
                        : api.patch(
                          `/admin/programmes/${modal.programme.id}`,
                          { ...modal.programme, active: false }
                        )
                    );
                    close(true);
                  }
                }}
              >
                Archive / Deactivate
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  const isDept = modal.type === 'department';
                  const name = isDept ? modal.department.name : modal.programme.name;
                  if (
                    confirm(
                      `Permanently delete ${isDept ? 'department' : 'programme'} "${name}"? This action cannot be undone.`
                    )
                  ) {
                    const res = await execute(() =>
                      isDept
                        ? api.delete(`/admin/departments/${modal.department.id}`)
                        : api.delete(`/admin/programmes/${modal.programme.id}`)
                    );
                    if (res) close(true);
                  }
                }}
              >
                Permanent Delete
              </Button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 3. Companies
 * -----------------------------------------------------------------------------
 * Managing corporate recruiter partner accounts.
 */
export function Companies() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'ALL';
  const { data, loading, reload } = useLoad('/admin/companies');
  const [modal, setModal] = useState(null);
  const { execute, message, error } = useAction();

  // Filters State
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState(initialTab);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [jobsFilter, setJobsFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setStatusTab(tabParam);
  }, [searchParams]);

  const fields = [
    { name: 'name', label: 'Company Name', required: true },
    { name: 'email', label: 'Login Email', type: 'email', required: true },
    {
      name: 'password',
      label: 'Initial Strong Password',
      type: 'password',
      required: true
    }
  ];

  const editFields = [
    { name: 'name', label: 'Company Name', required: true },
    { name: 'status', label: 'Account Status', type: 'select', options: yesNo }
  ];

  const companiesList = data || [];

  const tabCounts = {
    ALL: companiesList.length,
    ACTIVE: companiesList.filter((c) => c.user?.status === 'ACTIVE').length,
    DISABLED: companiesList.filter((c) => c.user?.status === 'DISABLED').length,
    WITH_JOBS: companiesList.filter((c) => (c._count?.jobs || 0) > 0).length,
    ZERO_JOBS: companiesList.filter((c) => (c._count?.jobs || 0) === 0).length
  };

  const isFiltered =
    search.trim() !== '' ||
    statusTab !== 'ALL' ||
    statusFilter !== 'ALL' ||
    jobsFilter !== 'ALL' ||
    sortBy !== 'name';

  function resetFilters() {
    setSearch('');
    setStatusTab('ALL');
    setStatusFilter('ALL');
    setJobsFilter('ALL');
    setSortBy('name');
  }

  const filteredCompanies = companiesList
    .filter((c) => {
      const status = c.user?.status || 'ACTIVE';
      const jobsCount = c._count?.jobs || 0;

      if (statusTab === 'ACTIVE' && status !== 'ACTIVE') return false;
      if (statusTab === 'DISABLED' && status !== 'DISABLED') return false;
      if (statusTab === 'WITH_JOBS' && jobsCount === 0) return false;
      if (statusTab === 'ZERO_JOBS' && jobsCount > 0) return false;

      if (statusFilter !== 'ALL' && status !== statusFilter) return false;
      if (jobsFilter === 'WITH_JOBS' && jobsCount === 0) return false;
      if (jobsFilter === 'ZERO_JOBS' && jobsCount > 0) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchEmail = c.user?.email?.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'jobs_desc') return (b._count?.jobs || 0) - (a._count?.jobs || 0);
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });

  const columns = [
    { key: 'name', label: 'Company' },
    { key: 'email', label: 'Account Email' },
    { key: 'jobs', label: 'Jobs' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge value={r.status} />
    },
    {
      key: 'id',
      label: 'Actions',
      render: (r) => (
        <div className="mini-actions">
          <button className="mini-btn" onClick={() => setModal(r)}>
            Manage
          </button>
          <button
            className="mini-btn danger"
            onClick={async () => {
              if (
                confirm(
                  `Are you sure you want to permanently delete company "${r.name}"? All its job postings, recruiter login, and applicant records will be permanently removed.`
                )
              ) {
                const res = await execute(() =>
                  api.delete(`/admin/companies/${r.id}`)
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
  ];

  return (
    <>
      <PageHeading
        eyebrow="Recruitment partners"
        title="Company Management"
        description="Only placement administrators can create recruiter accounts."
        action={
          <Button icon={PlusCircle} onClick={() => setModal({})}>
            Add Company
          </Button>
        }
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      {/* Advanced Filter Toolbar */}
      <div className="filter-panel">
        <div className="filter-pill-row">
          {[
            { id: 'ALL', label: 'All Companies' },
            { id: 'ACTIVE', label: 'Active Accounts' },
            { id: 'WITH_JOBS', label: 'Has Posted Jobs' },
            { id: 'ZERO_JOBS', label: 'Zero Jobs Posted' },
            { id: 'DISABLED', label: 'Disabled / Inactive' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-pill ${statusTab === tab.id ? 'active' : ''}`}
              onClick={() => setStatusTab(tab.id)}
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
              placeholder="Search by company name, account email..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Disabled Only</option>
          </select>

          <select
            className="filter-dropdown"
            value={jobsFilter}
            onChange={(e) => setJobsFilter(e.target.value)}
          >
            <option value="ALL">All Job Volumes</option>
            <option value="WITH_JOBS">Has Posted Jobs (≥ 1)</option>
            <option value="ZERO_JOBS">No Jobs Posted (0)</option>
          </select>

          <select
            className="filter-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort: Company Name (A–Z)</option>
            <option value="jobs_desc">Sort: Most Jobs Posted</option>
            <option value="newest">Sort: Newest Registered</option>
          </select>

          {isFiltered && (
            <button className="filter-reset-action" onClick={resetFilters}>
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        <div className="filter-meta-bar">
          <span>
            Showing <strong>{filteredCompanies.length}</strong> of <strong>{companiesList.length}</strong> companies
            {isFiltered && ' (filtered)'}
          </span>
          {isFiltered && <span style={{ color: '#0e7043' }}>✓ Filters Active</span>}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredCompanies.length === 0 ? (
        <Card>
          <div className="filter-empty-state">
            <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
            <strong>No matching companies found</strong>
            <span>No recruiter partner accounts match your current search and filter combination.</span>
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
            rows={filteredCompanies.map((c) => ({
              ...c,
              email: c.user?.email || '—',
              status: c.user?.status || 'ACTIVE',
              jobs: c._count?.jobs ?? 0
            }))}
            columns={columns}
          />
        </Card>
      )}

      {modal && (
        <Modal
          title={modal.id ? 'Edit Company' : 'Add Recruiter Company'}
          onClose={() => setModal(null)}
        >
          <CrudForm
            fields={modal.id ? editFields : fields}
            initial={
              modal.id ? { name: modal.name, status: modal.user?.status || modal.status } : {}
            }
            onSave={(v) =>
              modal.id
                ? api.patch(`/admin/companies/${modal.id}`, v)
                : api.post('/admin/companies', v)
            }
            onClose={(ok) => {
              setModal(null);
              if (ok) reload();
            }}
            submitLabel={
              modal.id ? 'Update Company' : 'Create Company Account'
            }
          />
          {!modal.id && (
            <p className="muted" style={{ fontSize: 12 }}>
              The recruiter must change the initial password at first sign-in.
            </p>
          )}
          {modal.id && (
            <div style={{ marginTop: 20, paddingTop: 15, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="danger"
                onClick={async () => {
                  if (
                    confirm(
                      `Are you sure you want to permanently delete company "${modal.name}"? All its job postings and recruiter account will be removed.`
                    )
                  ) {
                    const res = await execute(() =>
                      api.delete(`/admin/companies/${modal.id}`)
                    );
                    setModal(null);
                    if (res) reload();
                  }
                }}
              >
                Permanent Delete Company
              </Button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 4. Coordinators
 * -----------------------------------------------------------------------------
 * Placement coordinator assignments for each university department.
 */
export function Coordinators() {
  const { data, loading, reload } = useLoad('/admin/coordinators');
  const { data: departments } = useLoad('/admin/departments');
  const [modal, setModal] = useState(null);
  const { execute, message, error } = useAction();

  // Filters State
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');

  const options = (departments || [])
    .filter((d) => d.active)
    .map((d) => ({ label: d.name, value: d.id }));

  const fields = [
    { name: 'fullName', label: 'Coordinator Full Name', required: true },
    { name: 'email', label: 'Account Email', type: 'email', required: true },
    {
      name: 'password',
      label: 'Initial Strong Password',
      type: 'password',
      required: true
    },
    {
      name: 'departmentId',
      label: 'Assigned Department',
      type: 'select',
      options,
      required: true
    }
  ];

  const editFields = [
    { name: 'fullName', label: 'Coordinator Name', required: true },
    {
      name: 'departmentId',
      label: 'Assigned Department',
      type: 'select',
      options,
      required: true
    },
    { name: 'status', label: 'Account Status', type: 'select', options: yesNo }
  ];

  const coordList = data || [];

  const tabCounts = {
    ALL: coordList.length,
    ACTIVE: coordList.filter((c) => c.user?.status === 'ACTIVE').length,
    DISABLED: coordList.filter((c) => c.user?.status === 'DISABLED').length
  };

  const isFiltered =
    search.trim() !== '' ||
    statusTab !== 'ALL' ||
    deptFilter !== 'ALL' ||
    sortBy !== 'name';

  function resetFilters() {
    setSearch('');
    setStatusTab('ALL');
    setDeptFilter('ALL');
    setSortBy('name');
  }

  const filteredCoords = coordList
    .filter((c) => {
      const status = c.user?.status || 'ACTIVE';
      if (statusTab === 'ACTIVE' && status !== 'ACTIVE') return false;
      if (statusTab === 'DISABLED' && status !== 'DISABLED') return false;

      if (deptFilter !== 'ALL' && c.departmentId !== deptFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.user?.fullName?.toLowerCase().includes(q);
        const matchEmail = c.user?.email?.toLowerCase().includes(q);
        const matchDept = c.department?.name?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDept) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name')
        return (a.user?.fullName || '').localeCompare(b.user?.fullName || '');
      if (sortBy === 'dept')
        return (a.department?.name || '').localeCompare(b.department?.name || '');
      if (sortBy === 'email')
        return (a.user?.email || '').localeCompare(b.user?.email || '');
      return 0;
    });

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'departmentName', label: 'Department' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge value={r.status} />
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
              if (
                confirm(
                  `Are you sure you want to permanently delete coordinator "${r.fullName}" (${r.email})? Their login account will also be removed.`
                )
              ) {
                const res = await execute(() =>
                  api.delete(`/admin/coordinators/${r.id}`)
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
  ];

  return (
    <>
      <PageHeading
        eyebrow="University staff"
        title="Coordinator Management"
        description="Assign each placement coordinator to one department."
        action={
          <Button icon={PlusCircle} onClick={() => setModal({})}>
            Add Coordinator
          </Button>
        }
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      {/* Advanced Filter Toolbar */}
      <div className="filter-panel">
        <div className="filter-pill-row">
          {[
            { id: 'ALL', label: 'All Coordinators' },
            { id: 'ACTIVE', label: 'Active Coordinators' },
            { id: 'DISABLED', label: 'Disabled / Inactive' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-pill ${statusTab === tab.id ? 'active' : ''}`}
              onClick={() => setStatusTab(tab.id)}
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
              placeholder="Search by coordinator name, email, department..."
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
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            {(departments || [])
              .filter((d) => d.active)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>

          <select
            className="filter-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort: Coordinator Name (A–Z)</option>
            <option value="dept">Sort: Department (A–Z)</option>
            <option value="email">Sort: Account Email</option>
          </select>

          {isFiltered && (
            <button className="filter-reset-action" onClick={resetFilters}>
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        <div className="filter-meta-bar">
          <span>
            Showing <strong>{filteredCoords.length}</strong> of <strong>{coordList.length}</strong> coordinators
            {isFiltered && ' (filtered)'}
          </span>
          {isFiltered && <span style={{ color: '#0e7043' }}>✓ Filters Active</span>}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredCoords.length === 0 ? (
        <Card>
          <div className="filter-empty-state">
            <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
            <strong>No matching coordinators found</strong>
            <span>No staff accounts match your current search and filter settings.</span>
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
            rows={filteredCoords.map((c) => ({
              ...c,
              fullName: c.user?.fullName || '—',
              email: c.user?.email || '—',
              status: c.user?.status || 'ACTIVE',
              departmentName: c.department?.name || '—'
            }))}
            columns={columns}
          />
        </Card>
      )}

      {modal && (
        <Modal
          title={modal.id ? 'Edit Coordinator' : 'New Coordinator Account'}
          onClose={() => setModal(null)}
        >
          <CrudForm
            fields={modal.id ? editFields : fields}
            initial={
              modal.id
                ? {
                  ...modal,
                  fullName: modal.user?.fullName || modal.fullName,
                  status: modal.user?.status || modal.status
                }
                : {}
            }
            onSave={(v) =>
              modal.id
                ? api.patch(`/admin/coordinators/${modal.id}`, v)
                : api.post('/admin/coordinators', v)
            }
            onClose={(ok) => {
              setModal(null);
              if (ok) reload();
            }}
          />
          {modal.id && (
            <div style={{ marginTop: 20, paddingTop: 15, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="danger"
                onClick={async () => {
                  const name = modal.user?.fullName || modal.fullName;
                  if (
                    confirm(
                      `Permanently delete coordinator "${name}"? Their login account will also be removed.`
                    )
                  ) {
                    const res = await execute(() =>
                      api.delete(`/admin/coordinators/${modal.id}`)
                    );
                    setModal(null);
                    if (res) reload();
                  }
                }}
              >
                Permanent Delete Coordinator
              </Button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 5. JobApprovals
 * -----------------------------------------------------------------------------
 * Review, approve or reject employer job submissions.
 */
export function JobApprovals() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'ALL';
  const { data, loading, reload } = useLoad('/admin/jobs');
  const [job, setJob] = useState(null);
  const [reason, setReason] = useState('');
  const { execute, error, message, busy } = useAction();

  // Filters State
  const [search, setSearch] = useState('');
  const [approvalTab, setApprovalTab] = useState(initialTab);
  const [jobTypeFilter, setJobTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setApprovalTab(tabParam);
  }, [searchParams]);

  async function review(approval) {
    if (approval === 'REJECTED' && !reason.trim()) return;
    const r = await execute(() =>
      api.patch(`/admin/jobs/${job.id}/review`, { approval, reason })
    );
    if (r) {
      setJob(null);
      reload();
    }
  }

  const jobsList = data || [];

  const tabCounts = {
    ALL: jobsList.length,
    PENDING: jobsList.filter((j) => j.approval === 'PENDING').length,
    APPROVED: jobsList.filter((j) => j.approval === 'APPROVED').length,
    REJECTED: jobsList.filter((j) => j.approval === 'REJECTED').length
  };

  const isFiltered =
    search.trim() !== '' ||
    approvalTab !== 'ALL' ||
    jobTypeFilter !== 'ALL' ||
    sortBy !== 'newest';

  function resetFilters() {
    setSearch('');
    setApprovalTab('ALL');
    setJobTypeFilter('ALL');
    setSortBy('newest');
  }

  const filteredJobs = jobsList
    .filter((j) => {
      if (approvalTab !== 'ALL' && j.approval !== approvalTab) return false;
      if (jobTypeFilter !== 'ALL' && j.jobType !== jobTypeFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = j.title?.toLowerCase().includes(q);
        const matchCompany = j.company?.name?.toLowerCase().includes(q);
        const matchLocation = j.location?.toLowerCase().includes(q);
        if (!matchTitle && !matchCompany && !matchLocation) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'company') return (a.company?.name || '').localeCompare(b.company?.name || '');
      return 0;
    });

  const columns = [
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
    { key: 'companyName', label: 'Company' },
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
    {
      key: 'approval',
      label: 'Approval',
      render: (r) => <Badge value={r.approval} />
    },
    {
      key: 'id',
      label: 'Actions',
      render: (r) => (
        <div className="mini-actions">
          <button className="mini-btn" onClick={() => setJob(r)}>
            View Details
          </button>
          <button
            className="mini-btn danger"
            onClick={async () => {
              if (
                confirm(
                  `Are you sure you want to permanently delete job "${r.title}"? All student applications for this job will also be removed.`
                )
              ) {
                const res = await execute(() =>
                  api.delete(`/admin/jobs/${r.id}`)
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
  ];

  return (
    <>
      <PageHeading
        eyebrow="Recruitment governance"
        title="Job Posting Approvals"
        description="Review company submissions before they become visible to eligible students."
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      {/* Advanced Filter Toolbar */}
      <div className="filter-panel">
        <div className="filter-pill-row">
          {[
            { id: 'ALL', label: 'All Postings' },
            { id: 'PENDING', label: 'Pending Review' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'REJECTED', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-pill ${approvalTab === tab.id ? 'active' : ''}`}
              onClick={() => setApprovalTab(tab.id)}
            >
              <span>{tab.label}</span>
              <span
                className="pill-count"
                style={
                  tab.id === 'PENDING' && tabCounts.PENDING > 0 && approvalTab !== 'PENDING'
                    ? { background: '#fef3c7', color: '#b45309' }
                    : {}
                }
              >
                {tabCounts[tab.id] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="filter-inputs-grid">
          <div className="filter-search-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by job title, recruiting company, location..."
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
            <option value="ALL">All Job Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Internship">Internship</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
          </select>

          <select
            className="filter-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Sort: Submission Date (Newest)</option>
            <option value="oldest">Sort: Submission Date (Oldest)</option>
            <option value="deadline">Sort: Deadline Soonest</option>
            <option value="title">Sort: Job Title (A–Z)</option>
            <option value="company">Sort: Company Name (A–Z)</option>
          </select>

          {isFiltered && (
            <button className="filter-reset-action" onClick={resetFilters}>
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        <div className="filter-meta-bar">
          <span>
            Showing <strong>{filteredJobs.length}</strong> of <strong>{jobsList.length}</strong> submissions
            {isFiltered && ' (filtered)'}
          </span>
          {isFiltered && <span style={{ color: '#0e7043' }}>✓ Filters Active</span>}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredJobs.length === 0 ? (
        <Card>
          <div className="filter-empty-state">
            <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
            <strong>No matching job submissions found</strong>
            <span>No recruitment drives match your current search and filter combination.</span>
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
              companyName: j.company?.name || '—',
              deadlineText: new Date(j.deadline).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
            }))}
            columns={columns}
          />
        </Card>
      )}

      {job && (
        <Modal title={job.title} onClose={() => setJob(null)}>
          <p className="muted">
            {job.company.name} · {job.location} · {job.jobType} · {job.workMode}
          </p>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.8 }}>
            {job.description}
          </p>

          <JobAttachment job={job} />

          <div className="info-grid">
            <div className="info-pair">
              <small>Salary</small>
              <strong>
                {job.salaryMin ?? '—'}–{job.salaryMax ?? '—'} {job.salaryUnit}
              </strong>
            </div>
            <div className="info-pair">
              <small>Deadline</small>
              <strong style={{ color: new Date(job.deadline).getTime() < Date.now() ? '#b91c1c' : undefined }}>
                <DateFmt value={job.deadline} />
                {new Date(job.deadline).getTime() < Date.now() && (
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
                      marginLeft: 6
                    }}
                  >
                    <AlertCircle size={10} /> Deadline Passed / Closed
                  </span>
                )}
              </strong>
            </div>
            <div className="info-pair">
              <small>Target Departments</small>
              <strong>{job.departments.length || 'ALL'}</strong>
            </div>
            <div className="info-pair">
              <small>Target Programmes</small>
              <strong>{job.programmes.length || 'ALL'}</strong>
            </div>
          </div>

          {job.approval === 'PENDING' ? (
            <>
              <label className="form-field">
                <span>Reason for rejection (if rejecting)</span>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <div className="form-actions">
                <Button
                  variant="danger"
                  disabled={!reason.trim() || busy}
                  onClick={() => review('REJECTED')}
                >
                  Reject
                </Button>
                <Button disabled={busy} onClick={() => review('APPROVED')}>
                  Approve Job
                </Button>
              </div>
            </>
          ) : (
            <Badge value={job.approval} />
          )}

          <div style={{ marginTop: 20, paddingTop: 15, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="danger"
              disabled={busy}
              onClick={async () => {
                if (
                  confirm(
                    `Are you sure you want to permanently delete job "${job.title}" and all its student applications?`
                  )
                ) {
                  const res = await execute(() =>
                    api.delete(`/admin/jobs/${job.id}`)
                  );
                  setJob(null);
                  if (res) reload();
                }
              }}
            >
              Permanent Delete Job
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 6. AdminReports
 * -----------------------------------------------------------------------------
 * Deep-dive institutional reports with Excel export.
 */
export function AdminReports() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'ALL';
  const { data, loading } = useLoad('/admin/reports');
  const [department, setDepartment] = useState(null);
  const [programme, setProgramme] = useState(null);
  const [year, setYear] = useState(null);

  // Departments Overview Filter States
  const [deptSearch, setDeptSearch] = useState('');
  const [deptTab, setDeptTab] = useState(initialTab);
  const [deptSort, setDeptSort] = useState('placed_desc');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setDeptTab(tabParam);
  }, [searchParams]);

  // Programme Search Filter
  const [progSearch, setProgSearch] = useState('');

  // Detailed Offers Table Filter States
  const [offerSearch, setOfferSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [offerSort, setOfferSort] = useState('newest');

  const query = new URLSearchParams();
  if (department) query.set('departmentId', department.id);
  if (programme) query.set('programmeId', programme.id);
  if (year) query.set('year', year);

  const { data: detail, loading: detailLoading } = useLoad(
    `/admin/reports?${query}`
  );
  const departments = data?.departments || [];
  const p = department?.programmes.find((x) => x.id === programme?.id);

  // Tab counts for departments overview
  const deptTabCounts = {
    ALL: departments.length,
    WITH_PLACED: departments.filter((d) => (d.placed || 0) > 0).length,
    ZERO_PLACED: departments.filter((d) => (d.placed || 0) === 0).length
  };

  const isDeptFiltered =
    deptSearch.trim() !== '' ||
    deptTab !== 'ALL' ||
    deptSort !== 'placed_desc';

  function resetDeptFilters() {
    setDeptSearch('');
    setDeptTab('ALL');
    setDeptSort('placed_desc');
  }

  const filteredDepts = departments
    .filter((d) => {
      const placed = d.placed || 0;
      if (deptTab === 'WITH_PLACED' && placed === 0) return false;
      if (deptTab === 'ZERO_PLACED' && placed > 0) return false;

      if (deptSearch.trim()) {
        const q = deptSearch.toLowerCase();
        const matchName = d.name?.toLowerCase().includes(q);
        const matchCode = d.code?.toLowerCase().includes(q);
        if (!matchName && !matchCode) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (deptSort === 'placed_desc') return (b.placed || 0) - (a.placed || 0);
      if (deptSort === 'placed_asc') return (a.placed || 0) - (b.placed || 0);
      if (deptSort === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  // Programmes filter
  const filteredProgrammes = (department?.programmes || []).filter((pr) => {
    if (!progSearch.trim()) return true;
    return pr.name?.toLowerCase().includes(progSearch.toLowerCase());
  });

  // Detailed offers filter
  const rawRows = detail?.rows || [];
  const uniqueCompanies = Array.from(
    new Set(rawRows.map((r) => r.company).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const isOffersFiltered =
    offerSearch.trim() !== '' ||
    companyFilter !== 'ALL' ||
    offerSort !== 'newest';

  function resetOfferFilters() {
    setOfferSearch('');
    setCompanyFilter('ALL');
    setOfferSort('newest');
  }

  const filteredOffers = rawRows
    .filter((r) => {
      if (companyFilter !== 'ALL' && r.company !== companyFilter) return false;

      if (offerSearch.trim()) {
        const q = offerSearch.toLowerCase();
        const matchReg = r.registrationNo?.toLowerCase().includes(q);
        const matchName = r.name?.toLowerCase().includes(q);
        const matchEmail = r.email?.toLowerCase().includes(q);
        const matchCompany = r.company?.toLowerCase().includes(q);
        const matchJob = r.job?.toLowerCase().includes(q);
        if (!matchReg && !matchName && !matchEmail && !matchCompany && !matchJob)
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (offerSort === 'newest') return new Date(b.date || 0) - new Date(a.date || 0);
      if (offerSort === 'oldest') return new Date(a.date || 0) - new Date(b.date || 0);
      if (offerSort === 'name') return (a.name || '').localeCompare(b.name || '');
      if (offerSort === 'company') return (a.company || '').localeCompare(b.company || '');
      if (offerSort === 'job') return (a.job || '').localeCompare(b.job || '');
      return 0;
    });

  const detailColumns = [
    { key: 'registrationNo', label: 'Reg. No.' },
    { key: 'name', label: 'Student' },
    { key: 'email', label: 'Email' },
    { key: 'company', label: 'Company' },
    { key: 'job', label: 'Job Title' },
    {
      key: 'date',
      label: 'Selected At',
      render: (r) => (r.date ? <DateFmt value={r.date} /> : '—')
    }
  ];

  return (
    <>
      <PageHeading
        eyebrow="Placement intelligence"
        title="Department-Wise Placement Reports"
        description="Drill down from department to programme and graduating batch. Count unique students separately from offers."
        action={
          <ExportButton
            onClick={() =>
              download(
                `/admin/reports/export?${query}`,
                'university_placement_report.xlsx'
              )
            }
          />
        }
      />

      <div
        className="filters-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          padding: '10px 14px',
          background: '#f8fafc',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          marginBottom: 18
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Scope:
        </span>
        <button
          className={`mini-btn ${!department ? 'primary' : ''}`}
          onClick={() => {
            setDepartment(null);
            setProgramme(null);
            setYear(null);
            setProgSearch('');
          }}
        >
          All Departments
        </button>
        {department && (
          <>
            <span style={{ color: '#94a3b8' }}>›</span>
            <button
              className={`mini-btn ${department && !programme ? 'primary' : ''}`}
              onClick={() => {
                setProgramme(null);
                setYear(null);
                setProgSearch('');
              }}
            >
              {department.name}
            </button>
          </>
        )}
        {programme && (
          <>
            <span style={{ color: '#94a3b8' }}>›</span>
            <button
              className={`mini-btn ${programme && !year ? 'primary' : ''}`}
              onClick={() => setYear(null)}
            >
              {programme.name}
            </button>
          </>
        )}
        {year && (
          <>
            <span style={{ color: '#94a3b8' }}>›</span>
            <Badge value={`Passing-Out Year: ${year}`} />
          </>
        )}
      </div>

      {loading || detailLoading ? (
        <Loading />
      ) : (
        <>
          <StatGrid
            items={[
              {
                value: detail?.uniquePlaced,
                label: 'Placed Students',
                icon: 'students'
              },
              {
                value: detail?.selectedOffers,
                label: 'Total Selected Offers',
                icon: 'reports'
              }
            ]}
          />

          {!department ? (
            <>
              {/* Department search and filters */}
              <div className="filter-panel">
                <div className="filter-pill-row">
                  {[
                    { id: 'ALL', label: 'All Departments' },
                    { id: 'WITH_PLACED', label: 'With Placed Students' },
                    { id: 'ZERO_PLACED', label: 'Zero Placements' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`filter-pill ${deptTab === tab.id ? 'active' : ''}`}
                      onClick={() => setDeptTab(tab.id)}
                    >
                      <span>{tab.label}</span>
                      <span className="pill-count">{deptTabCounts[tab.id] ?? 0}</span>
                    </button>
                  ))}
                </div>

                <div className="filter-inputs-grid">
                  <div className="filter-search-wrap">
                    <Search size={15} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search department name or code..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                    />
                    {deptSearch && (
                      <button className="filter-search-clear" onClick={() => setDeptSearch('')}>
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <select
                    className="filter-dropdown"
                    value={deptSort}
                    onChange={(e) => setDeptSort(e.target.value)}
                  >
                    <option value="placed_desc">Sort: Most Placed Students</option>
                    <option value="placed_asc">Sort: Least Placed Students</option>
                    <option value="name">Sort: Department Name (A–Z)</option>
                  </select>

                  {isDeptFiltered && (
                    <button className="filter-reset-action" onClick={resetDeptFilters}>
                      <RotateCcw size={13} /> Reset Filters
                    </button>
                  )}
                </div>

                <div className="filter-meta-bar">
                  <span>
                    Showing <strong>{filteredDepts.length}</strong> of <strong>{departments.length}</strong> departments
                    {isDeptFiltered && ' (filtered)'}
                  </span>
                  {isDeptFiltered && <span style={{ color: '#0e7043' }}>✓ Filters Active</span>}
                </div>
              </div>

              {filteredDepts.length === 0 ? (
                <Card>
                  <div className="filter-empty-state">
                    <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
                    <strong>No matching departments found</strong>
                    <span>No university departments match your current filter criteria.</span>
                    {isDeptFiltered && (
                      <div style={{ marginTop: 8 }}>
                        <Button variant="outline" icon={RotateCcw} onClick={resetDeptFilters}>
                          Clear Department Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <div className="item-cards">
                  {filteredDepts.map((d) => (
                    <button
                      key={d.id}
                      className="item-card"
                      style={{ textAlign: 'left' }}
                      onClick={() => {
                        setDepartment(d);
                        setProgramme(null);
                        setYear(null);
                      }}
                    >
                      <GraduationCap color="#167d8d" />
                      <h3>{d.name}</h3>
                      <p>{d.placed} placed students</p>
                      <span className="file-link">
                        View Programmes <ChevronRight size={17} />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : !programme ? (
            <>
              {department.programmes?.length > 4 && (
                <div style={{ marginBottom: 14 }}>
                  <div className="filter-search-wrap" style={{ maxWidth: 360 }}>
                    <Search size={15} className="search-icon" />
                    <input
                      type="text"
                      placeholder={`Search ${department.name} programmes...`}
                      value={progSearch}
                      onChange={(e) => setProgSearch(e.target.value)}
                    />
                    {progSearch && (
                      <button className="filter-search-clear" onClick={() => setProgSearch('')}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="item-cards">
                {filteredProgrammes.map((pr) => (
                  <button
                    key={pr.id}
                    className="item-card"
                    style={{ textAlign: 'left' }}
                    onClick={() => {
                      setProgramme(pr);
                      setYear(null);
                    }}
                  >
                    <Building2 color="#167d8d" />
                    <h3>{pr.name}</h3>
                    <p>{pr.placed} placed students</p>
                    <span className="file-link">
                      View Passing-Out Years <ChevronRight size={17} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : !year ? (
            <div className="item-cards">
              {!p?.years?.length ? (
                <Empty title="No passing-out years with selected students" />
              ) : (
                p.years.map((y) => (
                  <button
                    className="item-card"
                    key={y}
                    onClick={() => setYear(y)}
                  >
                    <h3>Passing-Out Year: {y}</h3>
                    <span className="file-link">
                      View Results <ChevronRight size={17} />
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : null}

          <Card
            title={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  flexWrap: 'wrap',
                  gap: 10
                }}
              >
                <span>Selected Offers — Detailed Results</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                  {filteredOffers.length} {filteredOffers.length === 1 ? 'record' : 'records'}
                </span>
              </div>
            }
          >
            {/* Filter toolbar for Detailed Offers */}
            <div className="filter-panel" style={{ margin: '0 0 16px 0' }}>
              <div className="filter-inputs-grid">
                <div className="filter-search-wrap">
                  <Search size={15} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search candidate name, reg no, email, recruiting company, job..."
                    value={offerSearch}
                    onChange={(e) => setOfferSearch(e.target.value)}
                  />
                  {offerSearch && (
                    <button className="filter-search-clear" onClick={() => setOfferSearch('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  className="filter-dropdown"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <option value="ALL">All Recruiting Companies ({uniqueCompanies.length})</option>
                  {uniqueCompanies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  className="filter-dropdown"
                  value={offerSort}
                  onChange={(e) => setOfferSort(e.target.value)}
                >
                  <option value="newest">Sort: Selected Date (Newest)</option>
                  <option value="oldest">Sort: Selected Date (Oldest)</option>
                  <option value="name">Sort: Student Name (A–Z)</option>
                  <option value="company">Sort: Company Name (A–Z)</option>
                  <option value="job">Sort: Job Title (A–Z)</option>
                </select>

                {isOffersFiltered && (
                  <button className="filter-reset-action" onClick={resetOfferFilters}>
                    <RotateCcw size={13} /> Reset Filters
                  </button>
                )}
              </div>

              <div className="filter-meta-bar">
                <span>
                  Showing <strong>{filteredOffers.length}</strong> of <strong>{rawRows.length}</strong> selected offers
                  {isOffersFiltered && ' (filtered)'}
                </span>
                {isOffersFiltered && <span style={{ color: '#0e7043' }}>✓ Filters Active</span>}
              </div>
            </div>

            {filteredOffers.length === 0 ? (
              <div className="filter-empty-state">
                <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
                <strong>No matching placement offers found</strong>
                <span>Try adjusting your search keywords or company filter.</span>
                {isOffersFiltered && (
                  <div style={{ marginTop: 8 }}>
                    <Button variant="outline" icon={RotateCcw} onClick={resetOfferFilters}>
                      Clear Offers Filter
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <DataTable rows={filteredOffers} columns={detailColumns} />
            )}
          </Card>
        </>
      )}
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 7. AdminAnnouncements
 * -----------------------------------------------------------------------------
 * Full-access university announcement management with audience targeting
 * (Students, Coordinators, Both), particular department selection, and
 * PDF / Image attachments.
 */
const audienceLabels = {
  STUDENTS: 'Students Only',
  COORDINATORS: 'Coordinators Only',
  BOTH: 'Students & Coordinators'
};

function AdminAnnouncementForm({ initial, departments, onClose }) {
  const initialDeptIds = (initial?.targetDepartments || []).map((t) => t.departmentId);
  const [title, setTitle] = useState(initial?.title || '');
  const [body, setBody] = useState(initial?.body || '');
  const [audience, setAudience] = useState(initial?.audience || 'BOTH');
  const [deptScope, setDeptScope] = useState(initialDeptIds.length > 0 ? 'SELECTED' : 'ALL');
  const [departmentIds, setDepartmentIds] = useState(initialDeptIds);
  const [published, setPublished] = useState(initial?.published !== false);
  const [attachment, setAttachment] = useState({
    attachmentFileId: initial?.attachmentFileId || null,
    attachmentName: initial?.attachmentName || null,
    attachmentMime: initial?.attachmentMime || null
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function toggleDept(id) {
    setDepartmentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');

    if (deptScope === 'SELECTED' && departmentIds.length === 0) {
      setErr('Please select at least one department or choose "All Departments".');
      return;
    }

    setBusy(true);
    try {
      const payload = {
        title,
        body,
        audience,
        departmentIds: deptScope === 'SELECTED' ? departmentIds : [],
        published,
        attachmentFileId: attachment.attachmentFileId || null
      };

      if (initial?.id) {
        await api.patch(`/admin/announcements/${initial.id}`, payload);
      } else {
        await api.post('/admin/announcements', payload);
      }
      onClose(true);
    } catch (ex) {
      setErr(errorText(ex));
    } finally {
      setBusy(false);
    }
  }

  const activeDepts = (departments || []).filter((d) => d.active !== false);

  return (
    <form onSubmit={submit}>
      <label className="form-field" style={{ marginBottom: 14 }}>
        <span>
          Title <em>*</em>
        </span>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. TCS Campus Recruitment Drive Circular"
        />
      </label>

      <div style={{ marginBottom: 14 }}>
        <span
          style={{
            display: 'block',
            fontSize: 12.5,
            fontWeight: 700,
            color: '#102438',
            marginBottom: 8
          }}
        >
          Send To (Audience) <em style={{ color: '#dc2626' }}>*</em>
        </span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 8
          }}
        >
          {[
            { value: 'STUDENTS', label: 'Students Only', sub: 'Direct to students' },
            { value: 'COORDINATORS', label: 'Coordinators Only', sub: 'Staff / Coordinators' },
            { value: 'BOTH', label: 'Both', sub: 'Students & Coordinators' }
          ].map((opt) => {
            const active = audience === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAudience(opt.value)}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: active ? '2px solid #167d8d' : '1px solid #d5e0ea',
                  background: active ? '#eef9fb' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <strong style={{ display: 'block', fontSize: 13, color: '#0f233a' }}>
                  {opt.label}
                </strong>
                <small style={{ fontSize: 11.5, color: '#5a6f82' }}>{opt.sub}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginBottom: 14,
          padding: 12,
          borderRadius: 10,
          border: '1px solid #e3ebf3',
          background: '#f8fbfd'
        }}
      >
        <span
          style={{
            display: 'block',
            fontSize: 12.5,
            fontWeight: 700,
            color: '#102438',
            marginBottom: 8
          }}
        >
          Target Departments
        </span>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: deptScope === 'SELECTED' ? 10 : 0 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="radio"
              name="deptScope"
              checked={deptScope === 'ALL'}
              onChange={() => setDeptScope('ALL')}
            />
            <strong>All Departments</strong>
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="radio"
              name="deptScope"
              checked={deptScope === 'SELECTED'}
              onChange={() => setDeptScope('SELECTED')}
            />
            <strong>Particular Department(s)</strong>
          </label>
        </div>

        {deptScope === 'SELECTED' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                className="mini-btn"
                onClick={() => setDepartmentIds(activeDepts.map((d) => d.id))}
              >
                Select All
              </button>
              <button
                type="button"
                className="mini-btn"
                onClick={() => setDepartmentIds([])}
              >
                Clear
              </button>
              <small className="muted" style={{ alignSelf: 'center' }}>
                {departmentIds.length} selected
              </small>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 6,
                maxHeight: 170,
                overflowY: 'auto',
                padding: 8,
                borderRadius: 8,
                background: '#ffffff',
                border: '1px solid #e2e8f0'
              }}
            >
              {activeDepts.map((d) => (
                <label
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12.5,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={departmentIds.includes(d.id)}
                    onChange={() => toggleDept(d.id)}
                  />
                  <span>
                    {d.name}
                    {d.code ? ` (${d.code})` : ''}
                  </span>
                </label>
              ))}
              {!activeDepts.length && (
                <small className="muted">No active departments available.</small>
              )}
            </div>
          </div>
        )}
      </div>

      <label className="form-field" style={{ marginBottom: 12 }}>
        <span>
          Announcement Message <em>*</em>
        </span>
        <textarea
          rows={5}
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write the circular details, dates, venue, or instructions..."
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
        Publish Immediately
      </label>

      <Notice message={err} type="error" />

      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={() => onClose(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving...' : initial?.id ? 'Update Announcement' : 'Send Announcement'}
        </Button>
      </div>
    </form>
  );
}

export function AdminAnnouncements() {
  const { data, loading, reload } = useLoad('/admin/announcements');
  const { data: departments } = useLoad('/admin/departments');
  const [modal, setModal] = useState(null);
  const [viewing, setViewing] = useState(null);
  const { execute, error, message } = useAction();

  // Filters State
  const [search, setSearch] = useState('');
  const [announcementTab, setAnnouncementTab] = useState('ALL');
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const rawList = data || [];
  const announcementsList = rawList.map((a) => ({
    ...a,
    audienceLabel: audienceLabels[a.audience] || a.audience,
    departmentsLabel:
      a.targetDepartments?.length > 0
        ? a.targetDepartments.map((t) => t.department?.name || 'Dept').join(', ')
        : 'All Departments',
    hasAttachment: Boolean(a.attachmentFileId),
    readsCount: a._count?.reads ?? 0
  }));

  const tabCounts = {
    ALL: announcementsList.length,
    BOTH: announcementsList.filter((a) => a.audience === 'BOTH').length,
    STUDENTS: announcementsList.filter((a) => a.audience === 'STUDENTS').length,
    COORDINATORS: announcementsList.filter((a) => a.audience === 'COORDINATORS').length,
    WITH_ATTACHMENT: announcementsList.filter((a) => a.hasAttachment).length,
    PUBLISHED: announcementsList.filter((a) => a.published).length,
    DRAFT: announcementsList.filter((a) => !a.published).length
  };

  const isFiltered =
    search.trim() !== '' ||
    announcementTab !== 'ALL' ||
    audienceFilter !== 'ALL' ||
    scopeFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    sortBy !== 'newest';

  function resetFilters() {
    setSearch('');
    setAnnouncementTab('ALL');
    setAudienceFilter('ALL');
    setScopeFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('newest');
  }

  const filteredAnnouncements = announcementsList
    .filter((a) => {
      // Tab pill filter
      if (announcementTab === 'BOTH' && a.audience !== 'BOTH') return false;
      if (announcementTab === 'STUDENTS' && a.audience !== 'STUDENTS') return false;
      if (announcementTab === 'COORDINATORS' && a.audience !== 'COORDINATORS') return false;
      if (announcementTab === 'WITH_ATTACHMENT' && !a.hasAttachment) return false;
      if (announcementTab === 'PUBLISHED' && !a.published) return false;
      if (announcementTab === 'DRAFT' && a.published) return false;

      // Dropdown filters
      if (audienceFilter !== 'ALL' && a.audience !== audienceFilter) return false;

      if (scopeFilter === 'CAMPUS' && (a.targetDepartments?.length || 0) > 0) return false;
      if (scopeFilter === 'TARGETED' && (a.targetDepartments?.length || 0) === 0) return false;

      if (statusFilter === 'PUBLISHED' && !a.published) return false;
      if (statusFilter === 'DRAFT' && a.published) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = a.title?.toLowerCase().includes(q);
        const matchBody = a.body?.toLowerCase().includes(q);
        const matchDept = a.departmentsLabel?.toLowerCase().includes(q);
        if (!matchTitle && !matchBody && !matchDept) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'reads_desc') return (b.readsCount || 0) - (a.readsCount || 0);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

  const columns = [
    {
      key: 'title',
      label: 'Announcement',
      render: (r) => (
        <div>
          <strong>{r.title}</strong>
          {r.attachmentFileId && <AnnouncementAttachment announcement={r} compact />}
        </div>
      )
    },
    {
      key: 'audienceLabel',
      label: 'Audience',
      render: (r) => <Badge value={r.audienceLabel} />
    },
    {
      key: 'departmentsLabel',
      label: 'Departments',
      render: (r) => (
        <span style={{ fontSize: 12.5, color: '#334155' }}>{r.departmentsLabel}</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (r) => <DateFmt value={r.createdAt} />
    },
    {
      key: 'published',
      label: 'Status',
      render: (r) => <Badge value={r.published ? 'Published' : 'Draft'} />
    },
    {
      key: 'readsCount',
      label: 'Reads'
    },
    {
      key: 'id',
      label: 'Actions',
      render: (r) => (
        <div className="mini-actions">
          <button className="mini-btn" onClick={() => setViewing(r)}>
            View
          </button>
          <button className="mini-btn" onClick={() => setModal(r)}>
            Edit
          </button>
          <button
            className="mini-btn danger"
            onClick={async () => {
              if (confirm(`Permanently delete announcement "${r.title}"?`)) {
                await execute(() => api.delete(`/admin/announcements/${r.id}`));
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
        eyebrow="Placement communication"
        title="Placement Admin Announcements"
        description="Broadcast announcements with PDF or image attachments directly to Students, Coordinators, Both, or specific Departments."
        action={
          <Button icon={PlusCircle} onClick={() => setModal({})}>
            New Announcement
          </Button>
        }
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      {/* Advanced Filter Toolbar */}
      <div className="filter-panel">
        <div className="filter-pill-row">
          {[
            { id: 'ALL', label: 'All Announcements' },
            { id: 'BOTH', label: 'Campus-Wide (Both)' },
            { id: 'STUDENTS', label: 'Students Only' },
            { id: 'COORDINATORS', label: 'Coordinators Only' },
            { id: 'WITH_ATTACHMENT', label: 'Attachments' },
            { id: 'PUBLISHED', label: 'Published' },
            { id: 'DRAFT', label: 'Drafts' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-pill ${announcementTab === tab.id ? 'active' : ''}`}
              onClick={() => setAnnouncementTab(tab.id)}
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
              placeholder="Search circular title, text, or target department..."
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
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
          >
            <option value="ALL">All Audiences</option>
            <option value="BOTH">Students & Coordinators</option>
            <option value="STUDENTS">Students Only</option>
            <option value="COORDINATORS">Coordinators Only</option>
          </select>

          <select
            className="filter-dropdown"
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
          >
            <option value="ALL">All Scopes</option>
            <option value="CAMPUS">Campus-Wide (All Depts)</option>
            <option value="TARGETED">Department-Specific</option>
          </select>

          <select
            className="filter-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Drafts Only</option>
          </select>

          <select
            className="filter-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Sort: Created Date (Newest)</option>
            <option value="oldest">Sort: Created Date (Oldest)</option>
            <option value="reads_desc">Sort: Highest Reads</option>
            <option value="title">Sort: Title (A–Z)</option>
          </select>

          {isFiltered && (
            <button className="filter-reset-action" onClick={resetFilters}>
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        <div className="filter-meta-bar">
          <span>
            Showing <strong>{filteredAnnouncements.length}</strong> of <strong>{announcementsList.length}</strong> announcements
            {isFiltered && ' (filtered)'}
          </span>
          {isFiltered && <span style={{ color: '#0e7043' }}>✓ Filters Active</span>}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredAnnouncements.length === 0 ? (
        <Card>
          <div className="filter-empty-state">
            <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
            <strong>No matching announcements found</strong>
            <span>No placement circulars match your current search and filter combination.</span>
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
          <DataTable rows={filteredAnnouncements} columns={columns} />
        </Card>
      )}

      {modal && (
        <Modal
          title={modal.id ? 'Edit Announcement' : 'Create Announcement'}
          onClose={() => setModal(null)}
        >
          <AdminAnnouncementForm
            initial={modal}
            departments={departments || []}
            onClose={(ok) => {
              setModal(null);
              if (ok) reload();
            }}
          />
        </Modal>
      )}

      {viewing && (
        <Modal title={viewing.title} onClose={() => setViewing(null)}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <Badge value={viewing.audienceLabel} />
            <Badge value={viewing.published ? 'Published' : 'Draft'} />
            <span
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 999,
                background: '#eef2f6',
                color: '#334155',
                fontWeight: 600
              }}
            >
              {viewing.departmentsLabel}
            </span>
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {viewing.body}
          </p>
          <AnnouncementAttachment announcement={viewing} />
          <div style={{ marginTop: 14, fontSize: 12, color: '#64748b' }}>
            Posted on <DateFmt value={viewing.createdAt} /> · {viewing.readsCount} read(s)
          </div>
        </Modal>
      )}
    </>
  );
}

/**
 * -----------------------------------------------------------------------------
 * 8. AdminStudents
 * -----------------------------------------------------------------------------
 * University-wide student directory and career profiles for Placement Administrators.
 * Displays candidate core information (Name, Reg No, Email, Department, Phone)
 * with deep multi-criteria filtering and executive resume viewer.
 */
export function AdminStudents() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'ALL';
  const { data, loading, reload } = useLoad('/admin/students');
  const { data: departments } = useLoad('/admin/departments');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const { execute, error, message } = useAction();

  // Filters State
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState(initialTab);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [progFilter, setProgFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('regNo_asc');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setStatusTab(tabParam);
  }, [searchParams]);

  useEffect(() => {
    setSelectedIds([]);
  }, [statusTab, deptFilter, progFilter, yearFilter, statusFilter, search]);

  const studentsList = data || [];

  // Derived options for dropdowns
  const deptList = departments || [];
  const selectedDeptObj = deptList.find((d) => d.id === deptFilter);
  const progOptions = selectedDeptObj
    ? selectedDeptObj.programmes || []
    : deptList.flatMap((d) => d.programmes || []);

  const batches = Array.from(
    new Set(studentsList.map((s) => s.passingYear).filter(Boolean))
  ).sort((a, b) => b - a);

  // Tab counts
  const tabCounts = {
    ALL: studentsList.length,
    ACTIVE: studentsList.filter((s) => s.user?.status === 'ACTIVE').length,
    WITH_RESUME: studentsList.filter((s) => (s.resumes?.length || 0) > 0).length,
    WITH_PORTFOLIO: studentsList.filter(
      (s) =>
        (s.education?.length || 0) > 0 ||
        (s.skills?.length || 0) > 0 ||
        (s.projects?.length || 0) > 0
    ).length,
    APPLIED: studentsList.filter((s) => (s._count?.applications || 0) > 0).length,
    DISABLED: studentsList.filter((s) => s.user?.status === 'DISABLED').length
  };

  const isFiltered =
    search.trim() !== '' ||
    statusTab !== 'ALL' ||
    deptFilter !== 'ALL' ||
    progFilter !== 'ALL' ||
    yearFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    sortBy !== 'regNo_asc';

  function resetFilters() {
    setSearch('');
    setStatusTab('ALL');
    setDeptFilter('ALL');
    setProgFilter('ALL');
    setYearFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('regNo_asc');
  }

  const filteredStudents = studentsList
    .filter((s) => {
      // Tab pill filter
      if (statusTab === 'ACTIVE' && s.user?.status !== 'ACTIVE') return false;
      if (statusTab === 'WITH_RESUME' && (s.resumes?.length || 0) === 0) return false;
      if (
        statusTab === 'WITH_PORTFOLIO' &&
        (s.education?.length || 0) === 0 &&
        (s.skills?.length || 0) === 0 &&
        (s.projects?.length || 0) === 0
      )
        return false;
      if (statusTab === 'APPLIED' && (s._count?.applications || 0) === 0) return false;
      if (statusTab === 'DISABLED' && s.user?.status !== 'DISABLED') return false;

      // Dropdown filters
      if (deptFilter !== 'ALL' && s.departmentId !== deptFilter) return false;
      if (progFilter !== 'ALL' && s.programmeId !== progFilter) return false;
      if (yearFilter !== 'ALL' && String(s.passingYear) !== String(yearFilter)) return false;
      if (statusFilter !== 'ALL' && s.user?.status !== statusFilter) return false;

      // Search matching Name, Reg No, Email, Phone, Dept, Programme
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = s.user?.fullName?.toLowerCase().includes(q);
        const matchReg = s.registrationNo?.toLowerCase().includes(q);
        const matchEmail = s.user?.email?.toLowerCase().includes(q);
        const matchPhone = s.phone?.toLowerCase().includes(q);
        const matchDept = s.department?.name?.toLowerCase().includes(q);
        const matchProg = s.programme?.name?.toLowerCase().includes(q);
        if (!matchName && !matchReg && !matchEmail && !matchPhone && !matchDept && !matchProg)
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'regNo_asc') return (a.registrationNo || '').localeCompare(b.registrationNo || '');
      if (sortBy === 'regNo_desc') return (b.registrationNo || '').localeCompare(a.registrationNo || '');
      if (sortBy === 'name_asc') return (a.user?.fullName || '').localeCompare(b.user?.fullName || '');
      if (sortBy === 'dept') return (a.department?.name || '').localeCompare(b.department?.name || '');
      if (sortBy === 'batch_desc') return (b.passingYear || 0) - (a.passingYear || 0);
      if (sortBy === 'apps_desc') return (b._count?.applications || 0) - (a._count?.applications || 0);
      return 0;
    });

  const isAllSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.includes(s.id));
  const isSomeSelected =
    selectedIds.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const buildBatchPrintTitle = (count) => {
    const deptName = deptFilter !== 'ALL' ? (selectedDeptObj?.name || 'Department') : null;
    const yearLabel = yearFilter !== 'ALL' ? `Passing Year ${yearFilter}` : null;
    const parts = ['Periyar University - Student Resumes'];
    if (deptName) parts.push(deptName);
    if (yearLabel) parts.push(yearLabel);
    parts.push(`(${count} Candidates)`);
    return parts.join(' · ');
  };

  const handlePrintSelected = () => {
    const targets = filteredStudents.filter((s) => selectedIds.includes(s.id));
    if (targets.length === 0) return;
    downloadResumePdf(targets, buildBatchPrintTitle(targets.length));
  };

  const handlePrintFiltered = () => {
    if (filteredStudents.length === 0) return;
    downloadResumePdf(filteredStudents, buildBatchPrintTitle(filteredStudents.length));
  };

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={isAllSelected}
          ref={(el) => {
            if (el) el.indeterminate = isSomeSelected;
          }}
          onChange={toggleSelectAll}
          title={isAllSelected ? 'Deselect All' : 'Select All Filtered'}
          style={{ cursor: 'pointer', width: 16, height: 16 }}
        />
      ),
      render: (r) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(r.id)}
          onChange={() => toggleSelectOne(r.id)}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'pointer', width: 16, height: 16 }}
        />
      )
    },
    {
      key: 'registrationNo',
      label: 'Reg. No.',
      render: (r) => <strong>{r.registrationNo}</strong>
    },
    {
      key: 'name',
      label: 'Candidate Name',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {r.photoFileId ? (
            <img
              src={fileUrl(r.photoFileId)}
              alt={r.user?.fullName}
              crossOrigin="anonymous"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #d1d5db',
                flexShrink: 0
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#e2e8f0',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {(r.user?.fullName || 'S').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, color: '#0f233a' }}>{r.user?.fullName}</div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>{r.user?.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (r) => (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>
            {r.department?.name || '—'}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b' }}>{r.programme?.name || '—'}</div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone Number',
      render: (r) => (
        <span style={{ fontSize: 13, color: r.phone ? '#0f233a' : '#94a3b8' }}>
          {r.phone || '—'}
        </span>
      )
    },
    {
      key: 'passingYear',
      label: 'Passing-Out Year',
      render: (r) => (
        <span
          style={{
            fontSize: 12,
            padding: '3px 8px',
            borderRadius: 6,
            background: '#f1f5f9',
            color: '#334155',
            fontWeight: 600
          }}
        >
          {r.passingYear || '—'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge value={r.user?.status || 'ACTIVE'} />
    },
    {
      key: 'id',
      label: 'Actions',
      render: (r) => (
        <div className="mini-actions">
          <button
            className="mini-btn primary"
            style={{ fontWeight: 600 }}
            onClick={() => setSelectedStudent(r)}
          >
            View Full Details
          </button>
          <button
            className="mini-btn danger"
            onClick={async () => {
              if (
                confirm(
                  `Are you sure you want to permanently delete student "${r.user?.fullName}" (${r.registrationNo})? All application records, resume files, and account access will be removed.`
                )
              ) {
                const res = await execute(() => api.delete(`/admin/students/${r.id}`));
                if (res) reload();
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
        eyebrow="Student governance"
        title="Students Directory"
        description="Comprehensive university-wide student profiles with academic history, resumes, contact information, and placement activity."
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              icon={Printer}
              onClick={selectedIds.length > 0 ? handlePrintSelected : handlePrintFiltered}
              disabled={filteredStudents.length === 0}
              title="Print / Save all filtered or selected candidate resumes in a single combined A4 PDF"
            >
              {selectedIds.length > 0
                ? `Print Selected Resumes (${selectedIds.length})`
                : `Print All Filtered Resumes (${filteredStudents.length})`}
            </Button>
            <ExportButton
              onClick={() =>
                download(
                  `/admin/students/export?departmentId=${deptFilter}&programmeId=${progFilter}&passingYear=${yearFilter}`,
                  'periyar_university_students.xlsx'
                )
              }
            />
          </div>
        }
      />

      <Notice message={message} />
      <Notice message={error} type="error" />

      {/* Advanced Filter Toolbar */}
      <div className="filter-panel">
        <div className="filter-pill-row">
          {[
            { id: 'ALL', label: 'All Students' },
            { id: 'ACTIVE', label: 'Active Only' },
            { id: 'WITH_RESUME', label: 'Uploaded Resume' },
            { id: 'WITH_PORTFOLIO', label: 'Complete Portfolio' },
            { id: 'APPLIED', label: 'Applied for Jobs' },
            { id: 'DISABLED', label: 'Disabled' }
          ].map((t) => (
            <button
              key={t.id}
              className={`filter-pill ${statusTab === t.id ? 'active' : ''}`}
              onClick={() => setStatusTab(t.id)}
            >
              <span>{t.label}</span>
              <span className="pill-count">{tabCounts[t.id] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="filter-inputs-grid">
          <div className="filter-search-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by student name, reg no, email, phone, department..."
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
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setProgFilter('ALL');
            }}
          >
            <option value="ALL">All Departments ({deptList.length})</option>
            {deptList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.code ? `(${d.code})` : ''}
              </option>
            ))}
          </select>

          <select
            className="filter-dropdown"
            value={progFilter}
            onChange={(e) => setProgFilter(e.target.value)}
            disabled={progOptions.length === 0}
          >
            <option value="ALL">All Programmes</option>
            {progOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.level ? `(${p.level})` : ''}
              </option>
            ))}
          </select>

          <select
            className="filter-dropdown"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="ALL">All Passing-Out Years</option>
            {batches.map((y) => (
              <option key={y} value={y}>
                Passing-Out Year: {y}
              </option>
            ))}
          </select>

          <select
            className="filter-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="DISABLED">Disabled Accounts</option>
          </select>

          <select
            className="filter-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="regNo_asc">Sort: Reg. No. (Ascending)</option>
            <option value="regNo_desc">Sort: Reg. No. (Descending)</option>
            <option value="name_asc">Sort: Student Name (A–Z)</option>
            <option value="dept">Sort: Department (A–Z)</option>
            <option value="batch_desc">Sort: Passing-Out Year (Newest)</option>
            <option value="apps_desc">Sort: Most Applications</option>
          </select>

          {isFiltered && (
            <button className="filter-reset-action" onClick={resetFilters}>
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        <div
          className="filter-meta-bar"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span>
              Showing <strong>{filteredStudents.length}</strong> of <strong>{studentsList.length}</strong> registered students
              {isFiltered && ' (filtered)'}
            </span>
            {isFiltered && <span style={{ color: '#0e7043' }}>✓ Filters Active</span>}
          </div>
          {filteredStudents.length > 0 && (
            <button
              type="button"
              className="mini-btn"
              onClick={handlePrintFiltered}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                color: '#0e7490'
              }}
              title="Print all currently filtered student resumes into one combined PDF"
            >
              <Printer size={13} /> Print All Filtered Resumes ({filteredStudents.length})
            </button>
          )}
        </div>
      </div>

      {/* Floating Selected Students Batch Bar */}
      {selectedIds.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: '#f0fdfa',
            border: '1.5px solid #99f6e4',
            borderRadius: 8,
            marginBottom: 12,
            color: '#0f766e',
            fontSize: 13.5
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>
              <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'student' : 'students'} selected
            </span>
            <button
              type="button"
              className="mini-btn"
              onClick={() => setSelectedIds([])}
              style={{ fontSize: 12, padding: '3px 8px' }}
            >
              Clear Selection
            </button>
          </div>
          <Button
            icon={Printer}
            onClick={handlePrintSelected}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            Print Selected Resumes ({selectedIds.length}) (A4 PDF)
          </Button>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : filteredStudents.length === 0 ? (
        <Card>
          <div className="filter-empty-state">
            <SlidersHorizontal size={34} style={{ color: '#94a3b8' }} />
            <strong>No matching students found</strong>
            <span>No student records match your search keyword and filter selection.</span>
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
          <DataTable rows={filteredStudents} columns={columns} />
        </Card>
      )}

      {/* Full Details Resume Profile Modal */}
      {selectedStudent && (
        <StudentResumeModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          extraActions={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="mini-btn"
                onClick={async () => {
                  if (
                    confirm(
                      `Reset password for ${selectedStudent.user?.fullName} to their registration number "${selectedStudent.registrationNo}"?`
                    )
                  ) {
                    const res = await execute(() =>
                      api.post(`/admin/students/${selectedStudent.id}/reset-password`)
                    );
                    if (res) reload();
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
                      `Permanently delete student ${selectedStudent.user?.fullName} (${selectedStudent.registrationNo})?`
                    )
                  ) {
                    const res = await execute(() =>
                      api.delete(`/admin/students/${selectedStudent.id}`)
                    );
                    setSelectedStudent(null);
                    if (res) reload();
                  }
                }}
              >
                Delete Student
              </button>
            </div>
          }
        />
      )}
    </>
  );
}
