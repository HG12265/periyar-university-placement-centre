import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth, roleHomes, api } from './context/Auth.jsx';
import {
  DashboardLayout,
  Loading,
  PageHeading,
  Card,
  Badge,
  DataTable,
  useLoad,
  Button,
  Notice,
  useAction,
  DateFmt
} from './components/UI.jsx';

// Public & Authentication Pages
import Home from './pages/Public.jsx';
import {
  Login,
  Activate,
  Forgot,
  Reset,
  ChangePassword
} from './pages/Auth.jsx';

// University Administrator Pages
import {
  AdminDashboard,
  Departments,
  Companies,
  Coordinators,
  JobApprovals,
  AdminReports,
  AdminAnnouncements,
  AdminStudents
} from './pages/Admin.jsx';

// Department Coordinator Pages
import {
  CoordinatorDashboard,
  CoordinatorStudents,
  CoordinatorUpload,
  CoordinatorJobs,
  CoordinatorApplied,
  CoordinatorSelected,
  CoordinatorAnnouncements
} from './pages/Coordinator.jsx';

// Student Candidate Pages
import {
  StudentDashboard,
  StudentProfile,
  StudentCollection,
  ResumeManager,
  StudentJobs,
  ApplyJob,
  ApplicationTracking,
  StudentAnnouncements
} from './pages/Student.jsx';

// Recruiter / Company Pages
import {
  CompanyDashboard,
  CompanyProfile,
  CompanyJobs,
  CompanyApplicants,
  CompanyReport
} from './pages/Company.jsx';

/**
 * Route Guard Component
 * Ensures the user is logged in, has the required role, and is not pending mandatory password change.
 */
function Protected({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={roleHomes[user.role]} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

/**
 * Enforces first-time password reset for users flagged with mustChangePassword
 */
function ChangeGuard() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  return <ChangePassword />;
}

/**
 * Notifications Centre (Available across all authenticated roles)
 */
function Notifications() {
  const { data, loading, reload } = useLoad('/common/notifications');
  const { execute, message, error } = useAction();

  const columns = [
    { key: 'message', label: 'Notification' },
    {
      key: 'createdAt',
      label: 'Date',
      render: (r) => <DateFmt value={r.createdAt} />
    },
    {
      key: 'read',
      label: 'Status',
      render: (r) => <Badge value={r.read ? 'Read' : 'New'} />
    },
    {
      key: 'id',
      label: 'Actions',
      render: (r) => (
        <Button
          variant="ghost"
          disabled={r.read}
          onClick={async () => {
            await execute(() => api.post(`/common/notifications/${r.id}/read`));
            reload();
          }}
        >
          Mark Read
        </Button>
      )
    }
  ];

  return (
    <>
      <PageHeading
        title="Notifications"
        eyebrow="Portal activity"
        description="System updates and circulars relevant to your account."
      />
      <Notice message={message} />
      <Notice message={error} type="error" />
      {loading ? (
        <Loading />
      ) : (
        <Card>
          <DataTable rows={data || []} columns={columns} />
        </Card>
      )}
    </>
  );
}

const protectedRoute = (role, component) => (
  <Protected role={role}>{component}</Protected>
);

/**
 * Main Application Component & Route Table
 */
export default function App() {
  return (
    <Routes>
      {/* ---------------- Public & Guest Routes ---------------- */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/activate-account" element={<Activate />} />
      <Route path="/forgot-password" element={<Forgot />} />
      <Route path="/reset-password" element={<Reset />} />
      <Route path="/change-password" element={<ChangeGuard />} />

      {/* ---------------- Notifications ---------------- */}
      <Route
        path="/notifications"
        element={<Protected>{<Notifications />}</Protected>}
      />

      {/* ---------------- University Admin Routes ---------------- */}
      <Route
        path="/admin/dashboard"
        element={protectedRoute('UNIVERSITY_ADMIN', <AdminDashboard />)}
      />
      <Route
        path="/admin/students"
        element={protectedRoute('UNIVERSITY_ADMIN', <AdminStudents />)}
      />
      <Route
        path="/admin/departments"
        element={protectedRoute('UNIVERSITY_ADMIN', <Departments />)}
      />
      <Route
        path="/admin/companies"
        element={protectedRoute('UNIVERSITY_ADMIN', <Companies />)}
      />
      <Route
        path="/admin/coordinators"
        element={protectedRoute('UNIVERSITY_ADMIN', <Coordinators />)}
      />
      <Route
        path="/admin/job-approvals"
        element={protectedRoute('UNIVERSITY_ADMIN', <JobApprovals />)}
      />
      <Route
        path="/admin/reports"
        element={protectedRoute('UNIVERSITY_ADMIN', <AdminReports />)}
      />
      <Route
        path="/admin/announcements"
        element={protectedRoute('UNIVERSITY_ADMIN', <AdminAnnouncements />)}
      />

      {/* ---------------- Department Coordinator Routes ---------------- */}
      <Route
        path="/coordinator/dashboard"
        element={protectedRoute('DEPARTMENT_COORDINATOR', <CoordinatorDashboard />)}
      />
      <Route
        path="/coordinator/students"
        element={protectedRoute('DEPARTMENT_COORDINATOR', <CoordinatorStudents />)}
      />
      <Route
        path="/coordinator/students/add"
        element={protectedRoute('DEPARTMENT_COORDINATOR', <CoordinatorStudents />)}
      />
      <Route
        path="/coordinator/upload"
        element={protectedRoute('DEPARTMENT_COORDINATOR', <CoordinatorUpload />)}
      />
      <Route
        path="/coordinator/jobs"
        element={protectedRoute('DEPARTMENT_COORDINATOR', <CoordinatorJobs />)}
      />
      <Route
        path="/coordinator/applied-students"
        element={protectedRoute('DEPARTMENT_COORDINATOR', <CoordinatorApplied />)}
      />
      <Route
        path="/coordinator/selected-students-report"
        element={protectedRoute('DEPARTMENT_COORDINATOR', <CoordinatorSelected />)}
      />
      <Route
        path="/coordinator/announcements"
        element={protectedRoute('DEPARTMENT_COORDINATOR', <CoordinatorAnnouncements />)}
      />
      <Route
        path="/coordinator/admin-announcements"
        element={protectedRoute('DEPARTMENT_COORDINATOR', <CoordinatorAnnouncements admin />)}
      />

      {/* ---------------- Student Candidate Routes ---------------- */}
      <Route
        path="/dashboard"
        element={protectedRoute('STUDENT', <StudentDashboard />)}
      />
      <Route
        path="/dashboard/profile"
        element={protectedRoute('STUDENT', <StudentProfile />)}
      />
      <Route
        path="/dashboard/portfolio"
        element={protectedRoute('STUDENT', <StudentCollection kind="education" />)}
      />
      <Route
        path="/dashboard/skills"
        element={protectedRoute('STUDENT', <StudentCollection kind="skills" />)}
      />
      <Route
        path="/dashboard/projects"
        element={protectedRoute('STUDENT', <StudentCollection kind="projects" />)}
      />
      <Route
        path="/dashboard/internship"
        element={protectedRoute('STUDENT', <StudentCollection kind="internships" />)}
      />
      <Route
        path="/dashboard/experience"
        element={protectedRoute('STUDENT', <StudentCollection kind="experiences" />)}
      />
      <Route
        path="/dashboard/certifications"
        element={protectedRoute('STUDENT', <StudentCollection kind="certificates" />)}
      />
      <Route
        path="/dashboard/resume"
        element={protectedRoute('STUDENT', <ResumeManager />)}
      />
      <Route
        path="/dashboard/companies"
        element={protectedRoute('STUDENT', <StudentJobs />)}
      />
      <Route
        path="/dashboard/apply/:jobId"
        element={protectedRoute('STUDENT', <ApplyJob />)}
      />
      <Route
        path="/dashboard/status"
        element={protectedRoute('STUDENT', <ApplicationTracking />)}
      />
      <Route
        path="/dashboard/announcements"
        element={protectedRoute('STUDENT', <StudentAnnouncements />)}
      />

      {/* ---------------- Recruiter Company Routes ---------------- */}
      <Route
        path="/company/dashboard"
        element={protectedRoute('COMPANY', <CompanyDashboard />)}
      />
      <Route
        path="/company/dashboard/profile"
        element={protectedRoute('COMPANY', <CompanyProfile />)}
      />
      <Route
        path="/company/dashboard/post-job"
        element={protectedRoute('COMPANY', <CompanyJobs />)}
      />
      <Route
        path="/company/dashboard/applicants"
        element={protectedRoute('COMPANY', <CompanyApplicants />)}
      />
      <Route
        path="/company/dashboard/report"
        element={protectedRoute('COMPANY', <CompanyReport />)}
      />

      {/* ---------------- Role Root Redirects ---------------- */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/coordinator" element={<Navigate to="/coordinator/dashboard" replace />} />
      <Route path="/company" element={<Navigate to="/company/dashboard" replace />} />

      {/* ---------------- 404 Not Found ---------------- */}
      <Route
        path="*"
        element={
          <div style={{ maxWidth: 500, margin: '12vh auto', textAlign: 'center' }}>
            <h1>Page not found</h1>
            <p>The page you requested does not exist or may have moved.</p>
            <Link className="btn btn-primary" to="/">
              Return Home
            </Link>
          </div>
        }
      />
    </Routes>
  );
}
