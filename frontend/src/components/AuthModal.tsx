import { useState, useRef, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  KeyRound,
  GraduationCap,
  BriefcaseBusiness,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Search,
  Check
} from 'lucide-react';
import { AMITY_CAMPUSES, type AmityCourse } from '../data/amityCourses';
import type { User, DepartmentItem } from '../types';

export interface DemoAccountInfo {
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  label: string;
  name: string;
  email: string;
  password: string;
  badge: string;
  subtext: string;
  icon: typeof GraduationCap;
  accentColor: string;
}

export const PRESET_DEMO_ACCOUNTS: DemoAccountInfo[] = [
  {
    role: 'STUDENT',
    label: 'Student Demo',
    name: 'Demo Student',
    email: 'demo.student@s.amity.edu',
    password: 'StudentDemo2025!',
    badge: 'A000000001 • 2024-2028',
    subtext: 'B.Tech Computer Science & Engineering (Noida)',
    icon: GraduationCap,
    accentColor: '#10B981'
  },
  {
    role: 'STAFF',
    label: 'Faculty / Staff Demo',
    name: 'Demo Staff',
    email: 'demo.staff@amity.edu',
    password: 'StaffDemo2025!',
    badge: 'IT & Facilities',
    subtext: 'Campus Operations & Incident Resolution',
    icon: BriefcaseBusiness,
    accentColor: '#3B82F6'
  },
  {
    role: 'ADMIN',
    label: 'Dean / Administrator Demo',
    name: 'Demo Admin',
    email: 'demo.admin@amity.edu',
    password: 'AdminDemo2025!',
    badge: 'Operations Dean',
    subtext: 'Full Campus Oversight, SLA & Workload Metrics',
    icon: ShieldCheck,
    accentColor: '#8B5CF6'
  }
];

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  currentUser: User | null;
  departments: DepartmentItem[];
  authMode: 'DEMO' | 'LOGIN' | 'SIGNUP';
  setAuthMode: (mode: 'DEMO' | 'LOGIN' | 'SIGNUP') => void;
  authLoading: boolean;
  authError: string | null;
  authSuccess: string | null;
  setAuthError: (err: string | null) => void;
  setAuthSuccess: (suc: string | null) => void;
  // Login fields
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginPassword: string;
  setLoginPassword: (pw: string) => void;
  onLogin: (e: React.FormEvent) => void;
  onQuickDemoLogin: (account: DemoAccountInfo) => void;
  // Signup fields
  signupRole: 'STUDENT' | 'STAFF';
  setSignupRole: (role: 'STUDENT' | 'STAFF') => void;
  signupName: string;
  setSignupName: (name: string) => void;
  signupEmail: string;
  setSignupEmail: (email: string) => void;
  signupPassword: string;
  setSignupPassword: (pw: string) => void;
  signupCampus: string;
  setSignupCampus: (campus: string) => void;
  signupEnrollment: string;
  setSignupEnrollment: (enrollment: string) => void;
  selectedCourse: AmityCourse | null;
  setSelectedCourse: (course: AmityCourse | null) => void;
  courseSearchQuery: string;
  setCourseSearchQuery: (query: string) => void;
  filteredCourses: AmityCourse[];
  isCourseDropdownOpen: boolean;
  setIsCourseDropdownOpen: (open: boolean) => void;
  isCampusValid: boolean;
  isDurationValid: boolean;
  selectedDuration: number;
  startYear: number;
  setStartYear: (year: number) => void;
  endYear: number;
  setEndYear: (year: number) => void;
  signupDeptId: string;
  setSignupDeptId: (deptId: string) => void;
  onSignup: (e: React.FormEvent) => void;
  onLogout: () => void;
}

const START_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const END_YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export function AuthModal({
  show,
  onClose,
  currentUser,
  departments,
  authMode,
  setAuthMode,
  authLoading,
  authError,
  authSuccess,
  setAuthError,
  setAuthSuccess,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  onLogin,
  onQuickDemoLogin,
  signupRole,
  setSignupRole,
  signupName,
  setSignupName,
  signupEmail,
  setSignupEmail,
  signupPassword,
  setSignupPassword,
  signupCampus,
  setSignupCampus,
  signupEnrollment,
  setSignupEnrollment,
  selectedCourse,
  setSelectedCourse,
  courseSearchQuery,
  setCourseSearchQuery,
  filteredCourses,
  isCourseDropdownOpen,
  setIsCourseDropdownOpen,
  isCampusValid,
  isDurationValid,
  selectedDuration,
  startYear,
  setStartYear,
  endYear,
  setEndYear,
  signupDeptId,
  setSignupDeptId,
  onSignup,
  onLogout
}: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setIsCourseDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsCourseDropdownOpen]);

  if (!show) return null;

  return (
    <div className="auth-modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal-card demo-auth-card" onClick={(e) => e.stopPropagation()}>
        {/* Header Strip with Institutional Crest & Demo Badge */}
        <div className="auth-modal-header">
          <button
            type="button"
            onClick={onClose}
            className="auth-close-btn"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>

          <div className="auth-brand-mark" aria-hidden="true">
            <img src="/campus-pulse-logo.png" alt="" />
          </div>

          <div className="demo-mode-chip">
            <Sparkles size={13} />
            <span>DEMO AUTHENTICATION MODE</span>
          </div>

          <h3 className="auth-modal-title">
            Campus Pulse Authentication
          </h3>
          <p className="auth-modal-subtitle">
            Secure, database-backed authentication for academic evaluation
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="auth-modal-body">
          {/* Mode Switcher Tabs */}
          <div className="auth-nav-tabs">
            <button
              type="button"
              className={`auth-nav-tab-btn ${authMode === 'DEMO' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('DEMO');
                setAuthError(null);
                setAuthSuccess(null);
              }}
            >
              <Sparkles size={15} /> 1-Click Demo Login
            </button>
            <button
              type="button"
              className={`auth-nav-tab-btn ${authMode === 'LOGIN' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('LOGIN');
                setAuthError(null);
                setAuthSuccess(null);
              }}
            >
              <KeyRound size={15} /> Manual Sign In
            </button>
            <button
              type="button"
              className={`auth-nav-tab-btn ${authMode === 'SIGNUP' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('SIGNUP');
                setAuthError(null);
                setAuthSuccess(null);
              }}
            >
              <UserCheck size={15} /> Register User
            </button>
          </div>

          {/* Demo Mode Notice Banner */}
          <div className="demo-notice-banner">
            <div className="demo-notice-title">
              <ShieldCheck size={16} />
              <span>Zero External Email Dependency</span>
            </div>
            <p className="demo-notice-text">
              Email OTP delivery has been decommissioned. Log in instantly with one-click demo personas below or use database credentials with BCrypt verification.
            </p>
          </div>

          {/* Feedback Alerts */}
          {authError && (
            <div className="auth-error-alert animate-fade-in">
              <AlertTriangle size={17} color="#CF1322" style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}
          {authSuccess && (
            <div className="auth-success-alert animate-fade-in">
              <CheckCircle2 size={17} color="#389E0D" style={{ flexShrink: 0 }} />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* ─── TAB 1: 1-CLICK DEMO LOGIN ─────────────────────────────────── */}
          {authMode === 'DEMO' && (
            <div className="demo-cards-container">
              <div className="demo-cards-header">
                <span>Select a Pre-Configured Campus Persona:</span>
              </div>

              <div className="demo-role-grid">
                {PRESET_DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const isCurrent = currentUser?.email === acc.email;
                  return (
                    <div
                      key={acc.email}
                      className={`demo-role-card ${isCurrent ? 'current-active' : ''}`}
                    >
                      <div className="demo-card-top">
                        <div
                          className="demo-card-avatar"
                          style={{ background: `${acc.accentColor}18`, color: acc.accentColor }}
                        >
                          <Icon size={22} />
                        </div>
                        <div className="demo-card-info">
                          <div className="demo-card-title-row">
                            <span className="demo-card-label">{acc.label}</span>
                            {isCurrent && <span className="demo-active-badge">Active</span>}
                          </div>
                          <div className="demo-card-name">{acc.name}</div>
                          <div className="demo-card-email">{acc.email}</div>
                        </div>
                      </div>

                      <div className="demo-card-meta">
                        <div className="demo-card-subtext">{acc.subtext}</div>
                        <div className="demo-card-password-row">
                          <span className="pw-label">Password:</span>
                          <code className="pw-code">{acc.password}</code>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-demo-login"
                        style={{ '--accent-color': acc.accentColor } as React.CSSProperties}
                        onClick={() => onQuickDemoLogin(acc)}
                        disabled={authLoading}
                      >
                        {authLoading ? 'Signing In...' : (
                          <>
                            <span>Sign in as {acc.name.split(' ')[0]}</span>
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Named Faculty/Student Quick Switchers */}
              <div className="named-personas-box">
                <span className="named-personas-title">Alternative Pre-Seeded Evaluation Personas:</span>
                <div className="named-personas-chips">
                  <button
                    type="button"
                    className="persona-chip"
                    onClick={() => {
                      setLoginEmail('arjun.sharma@s.amity.edu');
                      setLoginPassword('StudentDemo2025!');
                      setAuthMode('LOGIN');
                    }}
                  >
                    <GraduationCap size={13} /> Arjun Sharma (Student)
                  </button>
                  <button
                    type="button"
                    className="persona-chip"
                    onClick={() => {
                      setLoginEmail('priya.patel@amity.edu');
                      setLoginPassword('StaffDemo2025!');
                      setAuthMode('LOGIN');
                    }}
                  >
                    <BriefcaseBusiness size={13} /> Priya Patel (IT Staff)
                  </button>
                  <button
                    type="button"
                    className="persona-chip"
                    onClick={() => {
                      setLoginEmail('ramesh.kumar@amity.edu');
                      setLoginPassword('StaffDemo2025!');
                      setAuthMode('LOGIN');
                    }}
                  >
                    <BriefcaseBusiness size={13} /> Ramesh Kumar (Facilities)
                  </button>
                  <button
                    type="button"
                    className="persona-chip"
                    onClick={() => {
                      setLoginEmail('dr.vikram.sen@amity.edu');
                      setLoginPassword('AdminDemo2025!');
                      setAuthMode('LOGIN');
                    }}
                  >
                    <ShieldCheck size={13} /> Dr. Vikram Sen (Admin Dean)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: MANUAL CREDENTIAL LOGIN ────────────────────────────── */}
          {authMode === 'LOGIN' && (
            <form onSubmit={onLogin} className="auth-form auth-login-form">
              {/* Quick Fill Pills */}
              <div className="quick-fill-section">
                <span className="quick-fill-label">Auto-Fill Credentials:</span>
                <div className="quick-fill-pills">
                  <button
                    type="button"
                    className="quick-fill-pill"
                    onClick={() => {
                      setLoginEmail('demo.student@s.amity.edu');
                      setLoginPassword('StudentDemo2025!');
                      setAuthError(null);
                    }}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className="quick-fill-pill"
                    onClick={() => {
                      setLoginEmail('demo.staff@amity.edu');
                      setLoginPassword('StaffDemo2025!');
                      setAuthError(null);
                    }}
                  >
                    Staff
                  </button>
                  <button
                    type="button"
                    className="quick-fill-pill"
                    onClick={() => {
                      setLoginEmail('demo.admin@amity.edu');
                      setLoginPassword('AdminDemo2025!');
                      setAuthError(null);
                    }}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label className="form-label" htmlFor="login-email">
                  Amity Institutional Email *
                </label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    className="form-input with-left-icon"
                    placeholder="demo.student@s.amity.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="form-label" htmlFor="login-password">
                  Account Password *
                </label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input with-left-icon with-right-icon"
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={authLoading}
                style={{ padding: 13, justifyContent: 'center', marginTop: 4 }}
              >
                {authLoading ? 'Verifying Credentials...' : <>Sign In <ArrowRight size={16} /></>}
              </button>

              <div className="demo-credentials-helper">
                <div className="helper-title">Demo Password Reference</div>
                <div className="helper-grid">
                  <div><span>Student:</span> <code>StudentDemo2025!</code></div>
                  <div><span>Staff:</span> <code>StaffDemo2025!</code></div>
                  <div><span>Admin:</span> <code>AdminDemo2025!</code></div>
                </div>
              </div>
            </form>
          )}

          {/* ─── TAB 3: DIRECT REGISTRATION ────────────────────────────────── */}
          {authMode === 'SIGNUP' && (
            <form onSubmit={onSignup} className="auth-form auth-registration-form">
              <div>
                <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
                  Institutional Role *
                </label>
                <div className="role-selector-cards">
                  <button
                    type="button"
                    className={`role-card-btn ${signupRole === 'STUDENT' ? 'active' : ''}`}
                    onClick={() => { setSignupRole('STUDENT'); setAuthError(null); }}
                  >
                    <span className="role-card-title"><GraduationCap size={17} /> Student</span>
                    <span className="role-card-domain">@s.amity.edu</span>
                  </button>

                  <button
                    type="button"
                    className={`role-card-btn ${signupRole === 'STAFF' ? 'active' : ''}`}
                    onClick={() => { setSignupRole('STAFF'); setAuthError(null); }}
                  >
                    <span className="role-card-title"><BriefcaseBusiness size={17} /> Faculty / Staff</span>
                    <span className="role-card-domain">@amity.edu</span>
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label className="form-label" htmlFor="signup-name">Full Legal Name *</label>
                <input
                  id="signup-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="form-label" htmlFor="signup-email">
                  {signupRole === 'STUDENT' ? 'Student Email (@s.amity.edu) *' : 'Staff Email (@amity.edu) *'}
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className="form-input"
                  placeholder={signupRole === 'STUDENT' ? 'rahul.sharma@s.amity.edu' : 'rahul.sharma@amity.edu'}
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="form-label" htmlFor="signup-password">
                  Account Password *
                </label>
                <input
                  id="signup-password"
                  type="password"
                  className="form-input"
                  placeholder="Choose a password (min 6 chars)"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="auth-field">
                <label className="form-label" htmlFor="signup-campus">Amity Campus *</label>
                <select
                  id="signup-campus"
                  className="form-select"
                  value={signupCampus}
                  onChange={(e) => setSignupCampus(e.target.value)}
                >
                  {AMITY_CAMPUSES.map((c) => (
                    <option key={c} value={c}>Amity University — {c}</option>
                  ))}
                </select>
              </div>

              {signupRole === 'STUDENT' && (
                <>
                  <div className="auth-field">
                    <label className="form-label" htmlFor="signup-enrollment">Amity Enrollment Number *</label>
                    <input
                      id="signup-enrollment"
                      type="text"
                      className="form-input"
                      placeholder="e.g. A2305220099"
                      value={signupEnrollment}
                      onChange={(e) => setSignupEnrollment(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div className="auth-field" ref={courseDropdownRef}>
                    <label className="form-label">Degree / Course *</label>
                    <div className="course-search-box">
                      <Search size={15} className="course-search-icon" />
                      <input
                        type="text"
                        className="form-input with-left-icon"
                        placeholder="Search degree program..."
                        value={courseSearchQuery}
                        onChange={(e) => {
                          setCourseSearchQuery(e.target.value);
                          setIsCourseDropdownOpen(true);
                        }}
                        onFocus={() => setIsCourseDropdownOpen(true)}
                      />
                    </div>
                    {isCourseDropdownOpen && (
                      <div className="course-dropdown-menu">
                        {filteredCourses.map((c) => (
                          <div
                            key={c.name}
                            className={`course-option ${selectedCourse?.name === c.name ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedCourse(c);
                              setCourseSearchQuery(c.name);
                              setIsCourseDropdownOpen(false);
                            }}
                          >
                            <span>{c.name}</span>
                            {selectedCourse?.name === c.name && <Check size={14} />}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedCourse && !isCampusValid && (
                      <span style={{ fontSize: '0.72rem', color: '#D97706', marginTop: 4, display: 'block' }}>
                        Note: Course may not be offered at {signupCampus} campus.
                      </span>
                    )}
                  </div>

                  <div className="batch-years-row">
                    <div className="auth-field" style={{ flex: 1 }}>
                      <label className="form-label">Start Year</label>
                      <select
                        className="form-select"
                        value={startYear}
                        onChange={(e) => setStartYear(Number(e.target.value))}
                      >
                        {START_YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div className="auth-field" style={{ flex: 1 }}>
                      <label className="form-label">Graduation Year</label>
                      <select
                        className="form-select"
                        value={endYear}
                        onChange={(e) => setEndYear(Number(e.target.value))}
                      >
                        {END_YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {selectedCourse && !isDurationValid && (
                    <span style={{ fontSize: '0.72rem', color: '#D97706', marginTop: 4, display: 'block' }}>
                      Notice: Selected duration ({selectedDuration} yrs) differs from standard curriculum ({selectedCourse.durationYears} yrs).
                    </span>
                  )}
                </>
              )}

              {signupRole === 'STAFF' && departments.length > 0 && (
                <div className="auth-field">
                  <label className="form-label" htmlFor="signup-dept">Department *</label>
                  <select
                    id="signup-dept"
                    className="form-select"
                    value={signupDeptId}
                    onChange={(e) => setSignupDeptId(e.target.value)}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={authLoading}
                style={{ padding: 13, justifyContent: 'center' }}
              >
                {authLoading ? 'Registering Account...' : <>Complete Registration & Sign In <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* ─── ACTIVE SESSION CARD (IF LOGGED IN) ─────────────────────────── */}
          {currentUser && (
            <div className="auth-session-card">
              <div className="auth-session-header">
                <div>
                  <div className="auth-session-label">Active University Session</div>
                  <div className="auth-session-name">{currentUser.name}</div>
                  <div className="auth-session-email">{currentUser.email}</div>
                  {currentUser.enrollmentNo && (
                    <div className="auth-session-detail">
                      Enrollment: <strong style={{ color: 'var(--gold-deep)' }}>{currentUser.enrollmentNo}</strong>
                      {currentUser.course ? ` • ${currentUser.course}` : ''}
                      {currentUser.batchYear ? ` (${currentUser.batchYear})` : ''}
                    </div>
                  )}
                  {currentUser.campus && (
                    <div className="auth-session-campus">
                      Campus: <strong>Amity University — {currentUser.campus}</strong>
                    </div>
                  )}
                </div>

                <span className={`status-badge status-${currentUser.role === 'STUDENT' ? 'VERIFIED' : 'ASSIGNED'}`}>
                  {currentUser.role}
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="auth-signout-btn"
              >
                <LogOut size={14} /> Sign Out of Amity Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
