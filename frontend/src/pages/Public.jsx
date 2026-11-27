import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  GraduationCap,
  Building2,
  Users,
  BriefcaseBusiness,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  ChartNoAxesCombined,
  FileBadge,
  ClipboardCheck,
  Target,
  MapPin,
  Award,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Brand, UniversityBanner } from '../components/UI.jsx';
import { api } from '../context/Auth.jsx';

/**
 * Feature highlights displayed in the features showcase section
 */
const features = [
  {
    icon: Target,
    title: 'Smart Eligibility Matching',
    text: 'Career opportunities matched with the right department, programme and graduating batch.'
  },
  {
    icon: ClipboardCheck,
    title: 'End-to-End Applications',
    text: 'A structured campus recruitment journey, from application to final selection.'
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Placement Analytics',
    text: 'Actionable reports for university staff and departmental coordinators.'
  },
  {
    icon: ShieldCheck,
    title: 'Secure Student Records',
    text: 'Role-based access and controlled document sharing safeguard academic information.'
  },
  {
    icon: Users,
    title: 'Department Coordination',
    text: 'Student onboarding, communication and placement tracking in one workspace.'
  },
  {
    icon: FileBadge,
    title: 'Digital Career Profiles',
    text: 'Manage projects, internships, skills, certifications and professional resumes.'
  }
];

/**
 * Four Dedicated Portals Showcase Data
 */
const portals = [
  {
    name: 'Student Portal',
    roleTa: 'மாணவர் பணித்தளம்',
    badge: 'Students',
    description:
      'Discover verified recruitment drives, build rich digital profiles, and track selection progress in real-time.',
    features: [
      'Smart Eligibility Match',
      'Digital Resume & Portfolio',
      'Live Application Tracker'
    ],
    stat: 'Active Placement Drives',
    icon: GraduationCap,
    to: '/login',
    c: 'teal'
  },
  {
    name: 'Recruiter Portal',
    roleTa: 'நிறுவனத் தளம்',
    badge: 'Recruiters',
    description:
      'Schedule on-campus drives, browse pre-screened talent pools, shortlist candidates, and issue direct offers.',
    features: [
      'Job & Internship Postings',
      'Cohort Talent Shortlisting',
      'Direct Offer Processing'
    ],
    stat: '100+ Hiring Partners',
    icon: BriefcaseBusiness,
    to: '/login',
    c: 'blue'
  },
  {
    name: 'Placement Administration',
    roleTa: 'வேலைவாய்ப்பு நிர்வாகம்',
    badge: 'Placement Cell',
    description:
      'Oversee university-wide placement drives, verify recruiter profiles, and generate NIRF & NAAC compliance reports.',
    features: [
      'Drive Approvals & Policy',
      'NIRF & NAAC Analytics',
      'Institutional Audit Trail'
    ],
    stat: 'Central Governance',
    icon: Building2,
    to: '/login',
    c: 'gold'
  },
  {
    name: 'Department Coordinator',
    roleTa: 'ஒருங்கிணைப்பாளர் தளம்',
    badge: 'Faculty Cell',
    description:
      'Verify student cohorts, publish department announcements, review applications, and coordinate interviews.',
    features: [
      'Batch Roster Verification',
      'Department Broadcasts',
      'Placement Statistics'
    ],
    stat: '30+ Departments',
    icon: Users,
    to: '/login',
    c: 'purple'
  }
];

/**
 * 7-step Placement Lifecycle Steps
 */
const steps = [
  'University accounts created',
  'Students complete profiles',
  'Recruiters post opportunities',
  'University approves job drives',
  'Eligible students apply',
  'Recruiters evaluate candidates',
  'Results and reports update'
];

/**
 * Frequently Asked Questions
 */
const faqs = [
  [
    'How do students sign in for the first time?',
    'Students can sign in directly using their registered email and University Registration Number as their initial password. You will be prompted to choose a new password upon your first sign in.'
  ],
  [
    'Can everyone see all recruitment opportunities?',
    'No. Only active, approved recruitment drives matching the student’s department, programme and passing-out year are shown.'
  ],
  [
    'Who can publish recruitment drives?',
    'Placement-admin-created company accounts can submit job postings. Placement administrators review and approve them.'
  ],
  [
    'How can I track applications?',
    'Sign in to the Student Portal and open Application Tracking to see shortlist, selection and rejection updates.'
  ],
  [
    'Who should I contact about account problems?',
    'Please contact your department placement coordinator or the placement administrator through institution-approved channels.'
  ]
];

/**
 * Moving Recruitment Drives Ticker (Marquee under Main Navigation Bar)
 * Displays newly approved, active company recruitment drives moving right-to-left.
 */
function RecruitmentTicker() {
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    let active = true;
    api
      .get('/public/live-drives')
      .then((res) => {
        if (active && Array.isArray(res.data)) {
          setDrives(res.data);
        }
      })
      .catch(() => {
        // Fallback or offline, non-blocking
      });

    return () => {
      active = false;
    };
  }, []);

  const formatSalary = (j) => {
    if (!j.salaryMin && !j.salaryMax) return null;
    const unit = j.salaryUnit || 'LPA';
    if (j.salaryMin && j.salaryMax) return `${j.salaryMin}–${j.salaryMax} ${unit}`;
    return `${j.salaryMin || j.salaryMax} ${unit}`;
  };

  const formatDeadline = (d) => {
    if (!d) return null;
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Ensure enough items exist for seamless, infinite continuous scrolling
  const items = drives.length === 1
    ? [...drives, ...drives, ...drives, ...drives]
    : drives.length === 2
      ? [...drives, ...drives, ...drives]
      : drives.length === 3
        ? [...drives, ...drives]
        : drives;

  const renderContent = (prefix) => {
    if (!items.length) {
      return (
        <>
          <Link to="/login" className="ticker-item">
            <span className="ticker-company">🎓 Periyar University Placement & Training Cell</span>
            <span className="ticker-role">Official Campus Recruitment Drives 2025–2026</span>
            <span className="ticker-meta-pill">Recruitment Drives Active</span>
            <span className="ticker-apply-btn">
              Portal Sign In <ArrowRight size={11} />
            </span>
          </Link>
          <span className="ticker-separator">✦</span>
          <Link to="/login" className="ticker-item">
            <span className="ticker-company">📢 Top Corporate Partners</span>
            <span className="ticker-role">IT, ITES, Banking, Core & Management Drives Open for Students</span>
            <span className="ticker-apply-btn">
              View & Apply <ArrowRight size={11} />
            </span>
          </Link>
          <span className="ticker-separator">✦</span>
        </>
      );
    }

    return items.map((j, idx) => {
      const salary = formatSalary(j);
      const deadline = formatDeadline(j.deadline);
      const depts = j.departments?.map((d) => d.department?.name).filter(Boolean);
      const deptText = depts && depts.length > 0 ? depts.slice(0, 2).join(', ') : 'All Depts';

      return (
        <React.Fragment key={`${prefix}-${j.id}-${idx}`}>
          <Link
            to="/login"
            className="ticker-item"
            title={`View ${j.company?.name || 'Company'} recruitment drive details and apply`}
          >
            <span className="ticker-company">🔥 {j.company?.name || 'Recruiter'}</span>
            <span className="ticker-role">{j.title}</span>
            <span className="ticker-meta-pill">{j.jobType || 'Full Time'}</span>
            {salary && <span className="ticker-salary">💰 {salary}</span>}
            {deadline && (
              <span className="ticker-deadline">
                <Calendar size={12} /> Apply by: {deadline}
              </span>
            )}
            <span className="ticker-meta-pill" style={{ color: '#cbd5e1' }}>
              🎯 {deptText}
            </span>
            <span className="ticker-apply-btn">
              Apply Now <ArrowRight size={11} />
            </span>
          </Link>
          <span className="ticker-separator">✦</span>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="recruitment-ticker-bar" role="region" aria-label="Live Recruitment Announcements">
      <div className="ticker-badge">
        <span className="ticker-badge-dot" />
        <Sparkles size={13} />
        <span>RECRUITMENT ALERTS</span>
      </div>

      <div className="ticker-viewport">
        <div className="ticker-track">
          <div className="ticker-content">{renderContent('set1')}</div>
          <div className="ticker-content" aria-hidden="true">
            {renderContent('set2')}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Periyar University Public Landing Homepage
 */
export default function Home() {
  const [menu, setMenu] = useState(false);
  const [faq, setFaq] = useState(0);

  return (
    <div className="public-site">
      {/* ---------------- Official Bilingual University Banner ---------------- */}
      <UniversityBanner pillText="Placement & Training Cell • வேலைவாய்ப்பு & பயிற்சி மையம்" />

      {/* ---------------- Institutional Main Navigation Bar ---------------- */}
      <header className="public-nav">
        <div className="site-container nav-inner">
          <Link to="/" className="nav-portal-badge">
            <span className="nav-pulse-dot" />
            <span>PLACEMENT MANAGEMENT PORTAL</span>
          </Link>

          <nav className={menu ? 'nav-open' : ''} aria-label="Public website">
            <a href="#about" onClick={() => setMenu(false)}>
              About
            </a>
            <a href="#process" onClick={() => setMenu(false)}>
              How it Works
            </a>
            <a href="#portals" onClick={() => setMenu(false)}>
              Our Portals
            </a>
            <a href="#features" onClick={() => setMenu(false)}>
              Features
            </a>
            <a href="#faq" onClick={() => setMenu(false)}>
              FAQs
            </a>
            <Link className="btn btn-gold nav-login" to="/login">
              Portal Login <ArrowRight size={15} />
            </Link>
          </nav>

          <button
            className="menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ---------------- Moving Recruitment Drives Ticker ---------------- */}
      <RecruitmentTicker />

      {/* ---------------- Hero Section ---------------- */}
      <section className="hero">
        <div className="hero-shape one" />
        <div className="hero-shape two" />
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <div className="hero-chip">
              <span className="chip-dot" /> THE FUTURE OF CAMPUS PLACEMENTS
            </div>
            <p className="hero-university">PERIYAR UNIVERSITY</p>
            <h1>
              Where academic <em>potential</em> meets opportunity.
            </h1>
            <p className="hero-text">
              A smarter, connected and transparent university-wide placement experience.
              Empowering our students, supporting our recruiters and shaping meaningful careers.
            </p>
            <div className="hero-ctas">
              <Link to="/login" className="btn btn-gold">
                Access Placement Portal <ArrowRight size={19} />
              </Link>
              <a href="#process" className="btn btn-hero-secondary">
                Explore the Process <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="hero-trust">
              <span>
                <CheckCircle2 size={17} /> Verified opportunities
              </span>
              <span>
                <CheckCircle2 size={17} /> Streamlined processes
              </span>
              <span>
                <CheckCircle2 size={17} /> Role-based access
              </span>
            </div>
          </div>

          <div
            className="hero-art"
            aria-label="Illustration of placement pathways and career progress"
          >
            <div className="hero-art-glow" />
            <div className="art-small art-small-top">
              <div className="art-small-icon">
                <GraduationCap size={22} />
              </div>
              <span>
                <strong>Student Success</strong>
                <small>Career-first opportunities</small>
              </span>
              <span className="green-dot" />
            </div>

            <div className="art-main">
              <div className="art-main-top">
                <div className="art-mini-logo">
                  <GraduationCap size={18} />
                </div>
                <span>YOUR CAREER PATHWAY</span>
                <span className="art-dots">•••</span>
              </div>
              <div className="art-welcome">
                Explore a world of <strong>possibilities</strong>
              </div>
              <div className="art-chart">
                <div className="art-axis">
                  <span>GROWTH</span>
                  <span>PROGRESS</span>
                </div>
                <div className="art-bar b1" />
                <div className="art-bar b2" />
                <div className="art-bar b3" />
                <div className="art-bar b4" />
                <div className="art-bar b5" />
                <svg viewBox="0 0 330 130" preserveAspectRatio="none">
                  <path
                    d="M0 105 C50 90,50 80,94 90 S155 65,193 68 S265 18,330 15"
                    fill="none"
                    stroke="#F4B942"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="330" cy="15" r="6" fill="#F4B942" />
                </svg>
              </div>
              <div className="art-bottom">
                <span>
                  <span className="art-round teal">
                    <BriefcaseBusiness size={19} />
                  </span>{' '}
                  Campus opportunities
                </span>
                <span>
                  <span className="art-round blue">
                    <ClipboardCheck size={19} />
                  </span>{' '}
                  Selection progress
                </span>
              </div>
            </div>

            <div className="art-small art-small-bottom">
              <div className="art-small-icon gold">
                <ShieldCheck size={22} />
              </div>
              <span>
                <strong>Trusted Platform</strong>
                <small>Secure university system</small>
              </span>
            </div>

            <div className="art-orbit orbit-1" />
            <div className="art-orbit orbit-2" />
          </div>
        </div>
      </section>

      {/* ---------------- Intro Strip ---------------- */}
      <section className="intro-strip">
        <div className="site-container strip-grid">
          <div>
            <GraduationCap />
            <span>
              <strong>Students First</strong>
              <small>Simple access to career growth</small>
            </span>
          </div>
          <div>
            <BriefcaseBusiness />
            <span>
              <strong>Recruiter Friendly</strong>
              <small>Efficient campus hiring</small>
            </span>
          </div>
          <div>
            <ShieldCheck />
            <span>
              <strong>Institution Led</strong>
              <small>Secure & approved processes</small>
            </span>
          </div>
          <div>
            <ChartNoAxesCombined />
            <span>
              <strong>Data Informed</strong>
              <small>Meaningful placement outcomes</small>
            </span>
          </div>
        </div>
      </section>

      {/* ---------------- About Section with Campus Photograph ---------------- */}
      <section id="about" className="section about-section">
        <div className="site-container two-col">
          <div className="section-campus-frame">
            <div className="campus-image-glow" />
            <div className="campus-image-wrap">
              <img
                src={`${import.meta.env.BASE_URL}periyar-campus.jpg`}
                alt="Periyar University Salem Campus"
                className="campus-main-img"
              />
            </div>
            <div className="campus-floating-badge top">
              <MapPin size={16} />
              <span>Periyar University · Salem, Tamil Nadu</span>
            </div>
            <div className="campus-floating-badge bottom">
              <span className="campus-badge-icon">
                <Award size={20} />
              </span>
              <div>
                <strong>State University · NAAC 'A++' Grade</strong>
                <small>Centralized Placement & Career Cell</small>
              </div>
            </div>
          </div>

          <div className="section-copy">
            <span className="section-kicker">ABOUT THE PLATFORM</span>
            <h2>
              A connected ecosystem for <span>better career outcomes.</span>
            </h2>
            <p>
              Our centralized platform brings every part of the placement process together—making
              it easier for students to prepare, recruiters to discover talent, and university
              teams to coordinate with confidence.
            </p>
            <div className="about-points">
              <div>
                <span>
                  <CheckCircle2 />
                </span>
                <div>
                  <strong>One unified experience</strong>
                  <p>
                    Profiles, opportunities, applications and updates—organized in one secure place.
                  </p>
                </div>
              </div>
              <div>
                <span>
                  <CheckCircle2 />
                </span>
                <div>
                  <strong>Designed for every stakeholder</strong>
                  <p>
                    Purpose-built workspaces for students, companies, administrators and coordinators.
                  </p>
                </div>
              </div>
              <div>
                <span>
                  <CheckCircle2 />
                </span>
                <div>
                  <strong>Clarity at every step</strong>
                  <p>
                    Transparent processes and reliable data from recruitment approval to final
                    results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Four Dedicated Portals Section ---------------- */}
      <section id="portals" className="section portals-section">
        <div className="portals-bg-glow" />
        <div className="site-container">
          <div className="section-center">
            <span className="section-kicker">
              <span className="kicker-dot" /> DEDICATED WORKSPACES
            </span>
            <h2>
              One Unified Platform. <span>Four Purpose-Built Portals.</span>
            </h2>
            <p>
              Purpose-built environments engineered for students, campus recruiters, central
              administration, and department coordinators.
            </p>
          </div>

          <div className="portal-grid">
            {portals.map((p) => (
              <Link
                to={p.to}
                className={`portal-card portal-card-${p.c}`}
                key={p.name}
              >
                <div className="portal-card-top-row">
                  <span className={`portal-icon p-${p.c}`}>
                    <p.icon size={26} />
                  </span>
                  <span className={`portal-badge badge-${p.c}`}>{p.badge}</span>
                </div>

                <div className="portal-card-body">
                  <div className="portal-title-wrap">
                    <h3>{p.name}</h3>
                    <span className="portal-title-ta">{p.roleTa}</span>
                  </div>
                  <p>{p.description}</p>

                  <ul className="portal-feature-pills">
                    {p.features.map((f) => (
                      <li key={f}>
                        <CheckCircle2 size={13} className="feat-check" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="portal-card-footer">
                  <span className="portal-stat-pill">{p.stat}</span>
                  <span className="portal-action-pill">
                    <span>Access</span> <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- How It Works Process ---------------- */}
      <section id="process" className="section process-section">
        <div className="site-container">
          <div className="section-center">
            <span className="section-kicker">A CLEAR JOURNEY FORWARD</span>
            <h2>
              How the placement <span>process works</span>
            </h2>
            <p>Seven connected steps, from your first sign-in to career milestones.</p>
          </div>
          <div className="process-grid">
            {steps.map((s, i) => (
              <div className="process-step" key={s}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <strong>{s}</strong>
                <div className="process-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Features Section ---------------- */}
      <section id="features" className="section features-section">
        <div className="site-container">
          <div className="section-center">
            <span className="section-kicker">BUILT FOR REAL PLACEMENT NEEDS</span>
            <h2>
              Thoughtfully designed. <span>Powerfully connected.</span>
            </h2>
            <p>Comprehensive tools that simplify coordination, communication and recruitment.</p>
          </div>
          <div className="feature-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">
                  <f.icon size={24} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA Banner ---------------- */}
      <section className="cta-band">
        <div className="site-container cta-band-inner">
          <div>
            <span className="section-kicker">TAKE YOUR NEXT STEP</span>
            <h2>Your journey begins with a single sign-in.</h2>
            <p>
              Access your dedicated workspace to explore and manage your campus placement
              experience.
            </p>
          </div>
          <Link className="btn btn-gold" to="/login">
            Sign In to the Portal <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ---------------- Frequently Asked Questions ---------------- */}
      <section id="faq" className="section faq-section">
        <div className="site-container faq-layout">
          <div>
            <span className="section-kicker">FREQUENTLY ASKED QUESTIONS</span>
            <h2>
              Got questions? <span>We have answers.</span>
            </h2>
            <p>Find quick guidance for your account and the placement journey.</p>
            <Link to="/login" className="faq-support">
              Need to access your account? <ArrowRight size={17} />
            </Link>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a], i) => (
              <div
                className={`faq-item ${faq === i ? 'expanded' : ''}`}
                key={q}
              >
                <button
                  onClick={() => setFaq(faq === i ? -1 : i)}
                  aria-expanded={faq === i}
                >
                  {q}
                  <ChevronDown size={20} />
                </button>
                {faq === i && <p>{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Public Footer ---------------- */}
      <footer className="public-footer">
        <div className="site-container footer-top">
          <div>
            <Brand inverse />
            <p>
              Connecting education and opportunity with a modern campus placement management
              experience.
            </p>
          </div>
          <div>
            <strong>Quick Links</strong>
            <a href="#about">About the Portal</a>
            <a href="#process">Placement Process</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQs</a>
          </div>
          <div>
            <strong>Portal Access</strong>
            <Link to="/login">Student Login</Link>
            <Link to="/login">Recruiter Login</Link>
            <Link to="/login">Coordinator Login</Link>
            <Link to="/login">Admin Login</Link>
          </div>
          <div>
            <strong>Support</strong>
            <p>
              For account support, contact your authorized department coordinator or university
              placement office.
            </p>
            <Link to="/login">Student Sign In</Link>
          </div>
        </div>
        <div className="site-container footer-bottom">
          <span>
            © {new Date().getFullYear()} Periyar University Placement Portal. Project implementation · Branding subject to institutional approval.
          </span>
          <span>Privacy by design · Secure role-based access</span>
        </div>
      </footer>
    </div>
  );
}
