import { useRef, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, School, Search, Check, LogOut, Sparkles, KeyRound, ClipboardPenLine, Zap, GraduationCap, BriefcaseBusiness, Monitor, Wrench, Landmark, ArrowRight, ArrowLeft } from 'lucide-react';
import { AMITY_CAMPUSES, type AmityCourse } from '../data/amityCourses';
import type { User, DepartmentItem } from '../types';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  currentUser: User | null;
  departments: DepartmentItem[];
  authMode: 'LOGIN' | 'SIGNUP' | 'FASTPASS';
  setAuthMode: (mode: 'LOGIN' | 'SIGNUP' | 'FASTPASS') => void;
  authStep: 'FORM' | 'OTP';
  setAuthStep: (step: 'FORM' | 'OTP') => void;
  authLoading: boolean;
  authError: string | null;
  authSuccess: string | null;
  setAuthError: (err: string | null) => void;
  setAuthSuccess: (suc: string | null) => void;
  // Login fields
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  onSendLoginOtp: (e: React.FormEvent) => void;
  onVerifyLoginOtp: (e: React.FormEvent) => void;
  // Signup fields
  signupRole: 'STUDENT' | 'STAFF';
  setSignupRole: (role: 'STUDENT' | 'STAFF') => void;
  signupName: string;
  setSignupName: (name: string) => void;
  signupEmail: string;
  setSignupEmail: (email: string) => void;
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
  onSendSignupOtp: (e: React.FormEvent) => void;
  onVerifySignupOtp: (e: React.FormEvent) => void;
  // OTP state
  otpInput: string;
  setOtpInput: (otp: string) => void;
  otpEmail: string;
  activeDevOtp: string | null;
  otpCountdown: number;
  resendCooldown: number;
  // Fastpass & Logout
  onSwitchPersona: (email: string) => void;
  onLogout: () => void;
}

const START_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const END_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];

export function AuthModal({
  show,
  onClose,
  currentUser,
  departments,
  authMode,
  setAuthMode,
  authStep,
  setAuthStep,
  authLoading,
  authError,
  authSuccess,
  setAuthError,
  setAuthSuccess,
  loginEmail,
  setLoginEmail,
  onSendLoginOtp,
  onVerifyLoginOtp,
  signupRole,
  setSignupRole,
  signupName,
  setSignupName,
  signupEmail,
  setSignupEmail,
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
  onSendSignupOtp,
  onVerifySignupOtp,
  otpInput,
  setOtpInput,
  otpEmail,
  activeDevOtp,
  otpCountdown,
  resendCooldown,
  onSwitchPersona,
  onLogout
}: AuthModalProps) {
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  // Close course dropdown when clicking outside
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
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header Strip with Institutional Crest */}
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

          <h3 className="auth-modal-title">
            Campus Pulse
          </h3>
          <p className="auth-modal-subtitle">
            Secure campus access and identity verification
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="auth-modal-body">
          {/* Mode Switcher Tabs */}
          <div className="auth-nav-tabs">
            <button
              type="button"
              className={`auth-nav-tab-btn ${authMode === 'LOGIN' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('LOGIN');
                setAuthStep('FORM');
                setAuthError(null);
                setAuthSuccess(null);
              }}
            >
              <KeyRound size={16} /> Sign In (OTP)
            </button>
            <button
              type="button"
              className={`auth-nav-tab-btn ${authMode === 'SIGNUP' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('SIGNUP');
                setAuthStep('FORM');
                setAuthError(null);
                setAuthSuccess(null);
              }}
            >
              <ClipboardPenLine size={16} /> Registration
            </button>
            <button
              type="button"
              className={`auth-nav-tab-btn ${authMode === 'FASTPASS' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('FASTPASS');
                setAuthError(null);
                setAuthSuccess(null);
              }}
            >
              <Zap size={16} /> Fast-Pass
            </button>
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

          {/* ─── TAB 1: REGISTRATION (SIGNUP) ───────────────────────────────── */}
          {authMode === 'SIGNUP' && (
            <div>
              {authStep === 'FORM' ? (
                <form onSubmit={onSendSignupOtp} className="auth-form auth-registration-form">
                  {/* Institutional Role Selector */}
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
                        <span className="role-card-domain">@s.amity.edu domain</span>
                      </button>

                      <button
                        type="button"
                        className={`role-card-btn ${signupRole === 'STAFF' ? 'active' : ''}`}
                        onClick={() => { setSignupRole('STAFF'); setAuthError(null); }}
                      >
                        <span className="role-card-title"><BriefcaseBusiness size={17} /> Faculty / Staff</span>
                        <span className="role-card-domain">@amity.edu domain</span>
                      </button>
                    </div>
                  </div>

                  {/* Official Moderation Notice Banner */}
                  <div className="moderation-warning-box">
                    <AlertTriangle size={16} />
                    <div>
                      <strong>Verification policy</strong>
                      <p>
                        Your registration details are verified against University records before account activation.
                      </p>
                    </div>
                  </div>

                  <section className="auth-section">
                    <div className="auth-section-heading">Identity</div>
                  {/* Campus Selector */}
                  <div className="auth-field">
                    <label className="form-label" htmlFor="signup-campus">
                      <School size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: '-2px' }} />
                      Amity Campus Branch *
                    </label>
                    <select
                      id="signup-campus"
                      className="form-select"
                      value={signupCampus}
                      onChange={(e) => {
                        setSignupCampus(e.target.value);
                        setAuthError(null);
                      }}
                      required
                    >
                      {AMITY_CAMPUSES.map((campus) => (
                        <option key={campus} value={campus}>
                          Amity University — {campus}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Full Name */}
                  <div className="auth-field">
                    <label className="form-label" htmlFor="signup-name">Full Legal Name *</label>
                    <input
                      id="signup-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Arjun Sharma"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                      As printed on your Amity University ID Card.
                    </span>
                  </div>

                  {/* Institutional Email */}
                  <div className="auth-field">
                    <label className="form-label" htmlFor="signup-email">
                      Official Amity Email * ({signupRole === 'STUDENT' ? '@s.amity.edu' : '@amity.edu'})
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      className="form-input"
                      placeholder={signupRole === 'STUDENT' ? 'name@s.amity.edu' : 'name@amity.edu'}
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                    {signupRole === 'STUDENT' && signupEmail && !signupEmail.toLowerCase().endsWith('@s.amity.edu') && (
                      <span className="auth-field-alert">
                        <AlertTriangle size={14} /> Student emails must strictly end with @s.amity.edu
                      </span>
                    )}
                    {signupRole === 'STAFF' && signupEmail && (!signupEmail.toLowerCase().endsWith('@amity.edu') || signupEmail.toLowerCase().endsWith('@s.amity.edu')) && (
                      <span className="auth-field-alert">
                        <AlertTriangle size={14} /> Faculty/Staff emails must end with @amity.edu (not @s.amity.edu)
                      </span>
                    )}
                  </div>
                  </section>

                  {/* Student Specific Fields */}
                  {signupRole === 'STUDENT' && (
                    <section className="auth-section">
                      <div className="auth-section-heading">Academic record</div>
                      {/* Enrollment Number starting with 'A' */}
                      <div className="auth-field">
                        <label className="form-label" htmlFor="signup-enrollment">
                          Amity Enrollment Number * (Must begin with 'A')
                        </label>
                        <input
                          id="signup-enrollment"
                          type="text"
                          className="form-input"
                          placeholder="e.g. A2305220001"
                          value={signupEnrollment}
                          onChange={(e) => setSignupEnrollment(e.target.value.toUpperCase())}
                          required
                          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                          All official Amity enrollment numbers begin with the letter 'A'.
                        </span>
                      </div>

                      {/* Searchable Course Combobox */}
                      <div className="course-combobox-wrapper" ref={courseDropdownRef}>
                        <label className="form-label" htmlFor="signup-course-search">
                          Course / Academic Program * (Official Catalog Only)
                        </label>
                        <div className="course-search-input-box">
                          <Search size={15} className="course-search-icon" />
                          <input
                            id="signup-course-search"
                            type="text"
                            className="course-search-input"
                            placeholder="Type course name (e.g. B.Tech, BCA, MBA, Law)..."
                            value={courseSearchQuery}
                            onFocus={() => setIsCourseDropdownOpen(true)}
                            onChange={(e) => {
                              setCourseSearchQuery(e.target.value);
                              setIsCourseDropdownOpen(true);
                              const exact = filteredCourses.find(
                                (c) => c.name.toLowerCase() === e.target.value.trim().toLowerCase()
                              );
                              if (exact) {
                                setSelectedCourse(exact);
                                setEndYear(startYear + Math.max(1, Math.round(exact.durationYears)));
                              } else {
                                setSelectedCourse(null);
                              }
                            }}
                            required
                          />
                        </div>

                        {isCourseDropdownOpen && (
                          <ul className="course-dropdown-list animate-fade-in">
                            {filteredCourses.length > 0 ? (
                              filteredCourses.map((c) => {
                                const isOfferedAtCampus = c.campuses.includes(signupCampus);
                                const isCurrent = selectedCourse?.name === c.name;
                                return (
                                  <li
                                    key={c.name}
                                    className={`course-dropdown-item ${isCurrent ? 'selected' : ''}`}
                                    onClick={() => {
                                      setSelectedCourse(c);
                                      setCourseSearchQuery(c.name);
                                      setIsCourseDropdownOpen(false);
                                      setEndYear(startYear + Math.max(1, Math.round(c.durationYears)));
                                      setAuthError(null);
                                    }}
                                  >
                                    <div className="course-dropdown-name">{c.name}</div>
                                    <div className="course-dropdown-meta">
                                      <span>Duration: {c.durationYears} Years</span>
                                      <span className="course-availability" style={{ color: isOfferedAtCampus ? 'var(--success)' : '#CF1322' }}>
                                        {isOfferedAtCampus ? <CheckCircle2 size={13} /> : <X size={13} />} {isOfferedAtCampus ? `Offered at ${signupCampus}` : `Not at ${signupCampus}`}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })
                            ) : (
                              <li style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                                No official Amity course matches "{courseSearchQuery}".
                              </li>
                            )}
                          </ul>
                        )}

                        {selectedCourse ? (
                          <div className="course-selected-pill">
                            <div style={{ fontSize: '0.78rem', color: 'var(--ink-primary)' }}>
                              Selected: <strong>{selectedCourse.name}</strong>
                              <span style={{ display: 'block', color: 'var(--gold-deep)', fontSize: '0.72rem' }}>
                                Required Duration: {selectedCourse.durationYears} Years • Campuses: {selectedCourse.campuses.length}
                              </span>
                            </div>
                            <Check size={16} color="var(--success)" />
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--warning)', marginTop: 4, display: 'block' }}>
                            <AlertTriangle size={14} /> Please click a course from the search list to select it.
                          </span>
                        )}

                        {/* Campus Availability Alert */}
                        {!isCampusValid && selectedCourse && (
                          <div className="campus-mismatch-alert animate-fade-in">
                            <AlertTriangle size={16} color="#CF1322" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <strong style={{ color: '#820014' }}>Course Not Available at this Campus:</strong>
                              <p style={{ margin: '2px 0 0', fontSize: '0.75rem' }}>
                                "{selectedCourse.name}" is not offered at the <strong>{signupCampus}</strong> branch. Offered at: {selectedCourse.campuses.join(', ')}.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dual Year Selectors */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                          <label className="form-label" style={{ marginBottom: 0 }}>Course Batch Years *</label>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gold-deep)', fontFamily: 'var(--font-mono)' }}>
                            Batch: {startYear}–{endYear} ({selectedDuration} Yrs)
                          </span>
                        </div>

                        <div className="dual-year-grid">
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                              Start Year
                            </span>
                            <select
                              className="form-select"
                              value={startYear}
                              onChange={(e) => {
                                const s = parseInt(e.target.value, 10);
                                setStartYear(s);
                                if (selectedCourse) {
                                  setEndYear(s + Math.max(1, Math.round(selectedCourse.durationYears)));
                                }
                              }}
                            >
                              {START_YEARS.map((y) => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                              End Year
                            </span>
                            <select
                              className="form-select"
                              value={endYear}
                              onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
                            >
                              {END_YEARS.map((y) => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Duration Mismatch Alert with Auto-align */}
                        {!isDurationValid && selectedCourse && (
                          <div className="duration-mismatch-alert animate-fade-in">
                            <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <strong>Batch Duration Mismatch:</strong>
                              <p style={{ margin: '2px 0 0', fontSize: '0.75rem' }}>
                                Selected duration is {selectedDuration} year(s) ({startYear}–{endYear}), but <strong>{selectedCourse.name}</strong> requires exactly <strong>{selectedCourse.durationYears} year(s)</strong>.
                                <br />
                                <button
                                  type="button"
                                  onClick={() => setEndYear(startYear + Math.max(1, Math.round(selectedCourse.durationYears)))}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--gold-deep)',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    marginTop: 4
                                  }}
                                >
                                  <Check size={14} /> Auto-align End Year to {startYear + Math.max(1, Math.round(selectedCourse.durationYears))}
                                </button>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Staff Specific Fields */}
                  {signupRole === 'STAFF' && (
                    <section className="auth-section">
                      <div className="auth-section-heading">Professional details</div>
                      <div className="auth-field">
                      <label className="form-label" htmlFor="signup-dept">Department / Unit *</label>
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
                    </section>
                  )}

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={authLoading || (signupRole === 'STUDENT' && (!selectedCourse || !isCampusValid || !isDurationValid))}
                    style={{ marginTop: 8, padding: 13, justifyContent: 'center' }}
                  >
                    {authLoading ? 'Generating Security OTP...' : <>Send 6-Digit OTP to Amity Email <ArrowRight size={16} /></>}
                  </button>
                </form>
              ) : (
                /* Step 2: OTP Verification */
                <form onSubmit={onVerifySignupOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Enter the 6-digit verification code sent to:
                    </span>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-primary)', fontWeight: 800, fontSize: '1.05rem', marginTop: 3 }}>
                      {otpEmail}
                    </div>
                  </div>

                  {/* Dev Testing OTP Pill */}
                  {activeDevOtp && (
                    <div className="dev-otp-pill">
                      <span><Zap size={14} /> Dev Testing Passcode: <strong>{activeDevOtp}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpInput(activeDevOtp)}
                        style={{
                          background: 'var(--gold-primary)',
                          color: '#101827',
                          border: 'none',
                          borderRadius: 4,
                          padding: '3px 9px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      className="otp-digit-input"
                      placeholder="• • • • • •"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      autoFocus
                      required
                      aria-label="Enter 6-digit OTP"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>
                        Expires in: {Math.floor(otpCountdown / 60)}:{('0' + (otpCountdown % 60)).slice(-2)}
                      </span>
                      <button
                        type="button"
                        onClick={onSendSignupOtp}
                        disabled={resendCooldown > 0 || authLoading}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--gold-deep)',
                          cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                          fontSize: '0.78rem',
                          textDecoration: 'underline',
                          fontWeight: 600
                        }}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={authLoading || otpInput.length !== 6}
                    style={{ padding: 13, justifyContent: 'center' }}
                  >
                    {authLoading ? 'Verifying...' : <><CheckCircle2 size={16} /> Verify OTP & Complete Registration</>}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAuthStep('FORM'); setAuthError(null); }}
                    className="btn-secondary"
                    style={{ justifyContent: 'center' }}
                  >
                    <ArrowLeft size={16} /> Edit Registration Details
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ─── TAB 2: SIGN IN (LOGIN WITH OTP) ────────────────────────────── */}
          {authMode === 'LOGIN' && (
            <div>
              {authStep === 'FORM' ? (
                <form onSubmit={onSendLoginOtp} className="auth-form auth-login-form">
                  <div className="auth-field">
                    <label className="form-label" htmlFor="login-email">
                      Registered Amity Email (@s.amity.edu or @amity.edu) *
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      className="form-input"
                      placeholder="e.g. arjun.sharma@s.amity.edu or priya.patel@amity.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      We send a secure 6-digit one-time passcode to verify your Amity account.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={authLoading}
                    style={{ padding: 13, justifyContent: 'center' }}
                  >
                    {authLoading ? 'Sending Sign-in Passcode...' : <>Send Sign-in Code <ArrowRight size={16} /></>}
                  </button>

                  <div className="auth-registration-link">
                    Don't have an Amity account yet?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('SIGNUP'); setAuthStep('FORM'); setAuthError(null); }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--gold-deep)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Register as Student or Staff
                    </button>
                  </div>
                </form>
              ) : (
                /* Login Step 2: Enter OTP */
                <form onSubmit={onVerifyLoginOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Enter the 6-digit sign-in passcode sent to:
                    </span>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-primary)', fontWeight: 800, fontSize: '1.05rem', marginTop: 3 }}>
                      {otpEmail}
                    </div>
                  </div>

                  {activeDevOtp && (
                    <div className="dev-otp-pill">
                      <span><Zap size={14} /> Dev Testing Passcode: <strong>{activeDevOtp}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpInput(activeDevOtp)}
                        style={{
                          background: 'var(--gold-primary)',
                          color: '#101827',
                          border: 'none',
                          borderRadius: 4,
                          padding: '3px 9px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      className="otp-digit-input"
                      placeholder="• • • • • •"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      autoFocus
                      required
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>
                        Expires in: {Math.floor(otpCountdown / 60)}:{('0' + (otpCountdown % 60)).slice(-2)}
                      </span>
                      <button
                        type="button"
                        onClick={onSendLoginOtp}
                        disabled={resendCooldown > 0 || authLoading}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--gold-deep)',
                          cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                          fontSize: '0.78rem',
                          textDecoration: 'underline',
                          fontWeight: 600
                        }}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={authLoading || otpInput.length !== 6}
                    style={{ padding: 13, justifyContent: 'center' }}
                  >
                    {authLoading ? 'Verifying...' : <><CheckCircle2 size={16} /> Verify & Sign In</>}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAuthStep('FORM'); setAuthError(null); }}
                    className="btn-secondary"
                    style={{ justifyContent: 'center' }}
                  >
                    <ArrowLeft size={16} /> Change Email
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ─── TAB 3: FAST-PASS (DEV/EVALUATION PERSONAS) ──────────────────── */}
          {authMode === 'FASTPASS' && (
            <div className="fastpass-content">
              <div className="fastpass-intro">
                <Sparkles size={16} />
                <span>
                  <strong>Developer / Demo Fast-Pass:</strong> Instant single-click authentication as one of the pre-configured university personas.
                </span>
              </div>

              <div className="persona-fastpass-grid">
                <div
                  className="persona-fastpass-card"
                  onClick={() => { onSwitchPersona('arjun.sharma@s.amity.edu'); onClose(); }}
                >
                  <strong><GraduationCap size={17} /> Arjun Sharma</strong>
                  <span>Student • A230522001</span>
                  <span style={{ color: 'var(--gold-deep)', fontSize: '0.72rem', fontWeight: 600 }}>B.Tech CSE (2023-2027)</span>
                </div>

                <div
                  className="persona-fastpass-card"
                  onClick={() => { onSwitchPersona('priya.patel@amity.edu'); onClose(); }}
                >
                  <strong><Monitor size={17} /> Priya Patel</strong>
                  <span>Staff • IT & Lab Specialist</span>
                  <span style={{ color: 'var(--info-sapphire)', fontSize: '0.72rem' }}>priya.patel@amity.edu</span>
                </div>

                <div
                  className="persona-fastpass-card"
                  onClick={() => { onSwitchPersona('ramesh.kumar@amity.edu'); onClose(); }}
                >
                  <strong><Wrench size={17} /> Ramesh Kumar</strong>
                  <span>Staff • Facilities Maintenance</span>
                  <span style={{ color: 'var(--info-sapphire)', fontSize: '0.72rem' }}>ramesh.kumar@amity.edu</span>
                </div>

                <div
                  className="persona-fastpass-card"
                  onClick={() => { onSwitchPersona('dr.vikram.sen@amity.edu'); onClose(); }}
                >
                  <strong><Landmark size={17} /> Dr. Vikram Sen</strong>
                  <span>Dean • Operations & Admin</span>
                  <span style={{ color: '#7E22CE', fontSize: '0.72rem' }}>dr.vikram.sen@amity.edu</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── ACTIVE SESSION CARD (IF LOGGED IN) ─────────────────────────── */}
          {currentUser && (
            <div className="auth-session-card">
              <div className="auth-session-header">
                <div>
                  <div className="auth-session-label">
                    Active University Session
                  </div>
                  <div className="auth-session-name">
                    {currentUser.name}
                  </div>
                  <div className="auth-session-email">
                    {currentUser.email}
                  </div>
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
