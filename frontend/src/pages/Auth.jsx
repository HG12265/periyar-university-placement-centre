import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail
} from 'lucide-react';
import { api, useAuth, roleHomes, errorText } from '../context/Auth.jsx';
import { Notice } from '../components/UI.jsx';

/**
 * Centered Institutional Authentication Shell
 * Wraps Login, Activation, Password Reset, and Password Change views
 * on top of the Periyar University Campus panorama backdrop.
 */
function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-unified-page">
      {/* Scenic University Campus Panorama Backdrop */}
      <div
        className="auth-bg-panorama"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}periyar-campus.jpg')` }}
      />
      <div className="auth-bg-gradient" />

      {/* Top Glassmorphic Navigation Bar */}
      <header className="auth-top-bar">
        <Link to="/" className="auth-brand-pill">
          <img
            src={`${import.meta.env.BASE_URL}periyar-logo.png`}
            alt="Periyar University"
            className="auth-pill-logo"
          />
          <span>PERIYAR UNIVERSITY</span>
        </Link>
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={16} /> <span>Back to website</span>
        </Link>
      </header>

      {/* Centered Modal Card */}
      <main className="auth-center-wrap">
        <div className="auth-modal-card">
          {/* Institutional Crest and Bilingual Typography */}
          <div className="auth-card-top">
            <div className="auth-crest-wrapper">
              <img
                src={`${import.meta.env.BASE_URL}periyar-logo.png`}
                alt="Periyar University Logo"
                className="auth-crest-img"
              />
            </div>
            <h2 className="auth-univ-ta">பெரியார் பல்கலைக்கழகம்</h2>
            <h3 className="auth-univ-en">PERIYAR UNIVERSITY</h3>
            <div className="auth-portal-badge">
              <span>PLACEMENT MANAGEMENT PORTAL</span>
            </div>
          </div>

          <div className="auth-card-divider" />

          {/* Form Context Heading */}
          <div className="auth-form-heading">
            <h4>{title}</h4>
            {subtitle && <p>{subtitle}</p>}
          </div>

          {/* Form Body */}
          {children}

          {/* Card Footer Return Link */}
          <div className="auth-card-foot">
            <Link to="/" className="auth-home-link">
              <ArrowLeft size={14} /> Return to homepage
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Legal Attribution */}
      <footer className="auth-page-footer">
        <span>
          © {new Date().getFullYear()} Periyar University, Salem · Centralized Placement Management Portal
        </span>
      </footer>
    </div>
  );
}

/**
 * Reusable Password Field with Lock Icon and Interactive Visibility Toggle
 */
function Password({
  value,
  onChange,
  label = 'Password',
  autoComplete = 'current-password'
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className="input-with-icon password-wrap">
        <LockKeyhole size={18} className="field-icon" />
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minLength={1}
          required
          autoComplete={autoComplete}
          placeholder="Enter your password"
        />
        <button
          type="button"
          className="pwd-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

/**
 * Universal Portal Login Component
 * Supports Student, Coordinator, Recruiter, and Placement Administrator authentication.
 */
export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(
        user.mustChangePassword
          ? '/change-password'
          : roleHomes[user.role],
        { replace: true }
      );
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Sign In to Portal"
      subtitle="Access your student, recruiter or staff workspace"
    >
      <form onSubmit={submit} className="auth-form-core">
        <label className="auth-field">
          <span>Registered Email Address</span>
          <div className="input-with-icon">
            <Mail size={18} className="field-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="username"
              required
            />
          </div>
        </label>

        <Password value={password} onChange={setPassword} />

        <div className="auth-row">
          <label className="remember-me">
            <input type="checkbox" defaultChecked />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="forgot-link">
            Forgot password?
          </Link>
        </div>

        <Notice message={error} type="error" />

        <button className="auth-submit-btn" type="submit" disabled={busy}>
          {busy ? (
            <>
              <span className="spinner-sm" /> Signing in...
            </>
          ) : (
            <>
              <span>Sign In to Your Workspace</span> <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="auth-student-hint">
          <div className="hint-icon">🎓</div>
          <div>
            <strong>Students:</strong> Default password is your{' '}
            <strong>University Registration Number</strong>.
          </div>
        </div>
      </form>
    </AuthShell>
  );
}

/**
 * Student Account Activation Form
 */
export function Activate() {
  const [values, setValues] = useState({
    registrationNo: '',
    email: '',
    token: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api.post('/auth/activate', values);
      setMessage(r.data.message);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Activate Account"
      subtitle="Use the private activation code provided by your department coordinator."
    >
      <form onSubmit={submit}>
        {[
          ['registrationNo', 'University Registration Number'],
          ['email', 'Registered Email Address'],
          ['token', 'Private Activation Code']
        ].map(([key, label]) => (
          <label className="auth-field" key={key}>
            <span>{label}</span>
            <input
              value={values[key]}
              type={key === 'email' ? 'email' : 'text'}
              required
              onChange={(e) =>
                setValues((v) => ({ ...v, [key]: e.target.value }))
              }
            />
          </label>
        ))}

        <Password
          autoComplete="new-password"
          label="Create a strong password"
          value={values.password}
          onChange={(x) => setValues((v) => ({ ...v, password: x }))}
        />
        <small
          className="muted"
          style={{ display: 'block', marginTop: -10, marginBottom: 14 }}
        >
          At least 6 characters.
        </small>

        <Notice message={error} type="error" />
        <Notice message={message} />

        <button className="auth-submit-btn" disabled={busy}>
          Activate Account <ArrowRight size={18} />
        </button>
      </form>

      <p className="auth-helper" style={{ marginTop: 16 }}>
        Already activated?{' '}
        <Link to="/login" style={{ color: 'var(--teal-600)', fontWeight: 700 }}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

/**
 * Forgot Password Request Form (Triggers email link or console token)
 */
export function Forgot() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your registered email address to receive a secure reset link."
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setMessage('');
          setBusy(true);
          try {
            const r = await api.post('/auth/forgot-password', { email });
            setMessage(r.data.message);
          } catch (err) {
            setError(errorText(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="auth-field">
          <span>Registered Email Address</span>
          <div className="input-with-icon">
            <Mail size={18} className="field-icon" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={busy}
            />
          </div>
        </label>

        <Notice message={error} type="error" />
        <Notice message={message} />

        <button className="auth-submit-btn" disabled={busy}>
          {busy ? 'Requesting Reset Link...' : 'Request Reset Link'} <ArrowRight size={18} />
        </button>
      </form>
    </AuthShell>
  );
}

/**
 * Password Reset Form (Invoked with one-time security token from email link)
 */
export function Reset() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <AuthShell
      title="Choose New Password"
      subtitle="This secure reset link can be used only once."
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setMessage('');
          setBusy(true);
          try {
            const r = await api.post('/auth/reset-password', {
              token: params.get('token'),
              password
            });
            setMessage(r.data.message);
          } catch (err) {
            setError(errorText(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <Password
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />

        <Notice message={error} type="error" />
        <Notice message={message} />

        <button className="auth-submit-btn" disabled={busy}>
          {busy ? 'Updating Password...' : 'Update Password'} <ArrowRight size={18} />
        </button>
      </form>
    </AuthShell>
  );
}

/**
 * Forced First-Time Password Change Form
 */
export function ChangePassword() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [error, setError] = useState('');

  return (
    <AuthShell
      title="Secure Your Account"
      subtitle="For security, change your temporary password before accessing the portal."
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await api.post('/auth/change-password', {
              currentPassword,
              newPassword
            });
            await refresh();
            nav(roleHomes[user.role]);
          } catch (err) {
            setError(errorText(err));
          }
        }}
      >
        <Password
          label="Current password"
          value={currentPassword}
          onChange={setCurrent}
        />
        <Password
          label="New strong password"
          autoComplete="new-password"
          value={newPassword}
          onChange={setNew}
        />
        <small
          className="muted"
          style={{ display: 'block', marginTop: -10, marginBottom: 16 }}
        >
          At least 6 characters.
        </small>

        <Notice message={error} type="error" />

        <button className="auth-submit-btn">
          Save New Password <ArrowRight size={18} />
        </button>
      </form>
    </AuthShell>
  );
}
