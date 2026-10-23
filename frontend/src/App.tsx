import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { AMITY_COURSES, type AmityCourse } from './data/amityCourses';
import type { User, DepartmentItem, LocationItem, IssueItem, NotificationItem, Metrics } from './types';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { CampusHub } from './components/CampusHub';
import { ReportIssue } from './components/ReportIssue';
import { CampusFeed } from './components/CampusFeed';
import { StaffQueue } from './components/StaffQueue';
import { AdminDashboard } from './components/AdminDashboard';
import { IssueDetailModal } from './components/IssueDetailModal';
import { AuthModal } from './components/AuthModal';
import { QrPlacardsModal } from './components/QrPlacardsModal';
import { NotificationsPopover } from './components/NotificationsPopover';
import { Toast } from './components/Toast';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'hub' | 'report' | 'feed' | 'queue' | 'admin'>('feed');
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [locationActiveIssues, setLocationActiveIssues] = useState<IssueItem[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'MINE' | 'CRITICAL' | 'OPEN'>('ALL');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // New Report Form state
  const [reportLocId, setReportLocId] = useState('');
  const [reportCategory, setReportCategory] = useState('IT');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSeverity, setReportSeverity] = useState(3);
  const [reportSafety, setReportSafety] = useState(false);

  // Modals & Amity Auth State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showQrPrintModal, setShowQrPrintModal] = useState(false);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  // Auth Modal Tab & Flow State
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'FASTPASS'>('LOGIN');
  const [authStep, setAuthStep] = useState<'FORM' | 'OTP'>('FORM');

  // Signup fields
  const [signupRole, setSignupRole] = useState<'STUDENT' | 'STAFF'>('STUDENT');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCampus, setSignupCampus] = useState('Noida');
  const [signupEnrollment, setSignupEnrollment] = useState('');

  // Course Selector State
  const defaultCourse = useMemo(() => {
    return (
      AMITY_COURSES.find((c) => c.name.includes('B.Tech (Computer Science & Engineering) (4Years )')) ||
      AMITY_COURSES[0]
    );
  }, []);

  const [courseSearchQuery, setCourseSearchQuery] = useState(defaultCourse ? defaultCourse.name : '');
  const [selectedCourse, setSelectedCourse] = useState<AmityCourse | null>(defaultCourse || null);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  // Dual Year Selector State
  const [startYear, setStartYear] = useState(2024);
  const [endYear, setEndYear] = useState(2028);
  const [signupDeptId, setSignupDeptId] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');

  // OTP Verification state
  const [otpInput, setOtpInput] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [activeDevOtp, setActiveDevOtp] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Filter courses live based on search query
  const filteredCourses = useMemo(() => {
    const q = courseSearchQuery.trim().toLowerCase();
    if (!q) return AMITY_COURSES.slice(0, 40);
    return AMITY_COURSES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 50);
  }, [courseSearchQuery]);

  // Validation: Check if course is offered at the chosen campus
  const isCampusValid = useMemo(() => {
    if (!selectedCourse) return true;
    return selectedCourse.campuses.includes(signupCampus);
  }, [selectedCourse, signupCampus]);

  // Validation: Check if batch duration matches course duration
  const selectedDuration = endYear - startYear;
  const isDurationValid = useMemo(() => {
    if (!selectedCourse) return true;
    const required = Math.round(selectedCourse.durationYears);
    if (selectedCourse.durationYears <= 1) {
      return selectedDuration === 0 || selectedDuration === 1;
    }
    return selectedDuration === required;
  }, [selectedCourse, selectedDuration]);

  // OTP Countdown Timers
  useEffect(() => {
    let timer: any;
    if (authStep === 'OTP' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, otpCountdown]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Initial load
  useEffect(() => {
    checkCurrentUser();
    loadLocations();
    loadDepartments();
    loadIssues();
  }, []);

  // Handle URL query parameters for QR scanning (e.g. ?qr=qrt-a-103-lab or ?room=A-103)
  useEffect(() => {
    if (locations.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const qrParam = params.get('qr') || params.get('room');
      if (qrParam) {
        const found = locations.find(
          (l) => l.qrToken === qrParam || l.roomCode.toLowerCase() === qrParam.toLowerCase()
        );
        if (found) {
          scanQrLocation(found.qrToken);
          setActiveTab('hub');
        }
      }
    }
  }, [locations]);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      if (currentUser.role === 'ADMIN') {
        loadMetrics();
      }
    }
  }, [currentUser]);

  // Load Departments for Staff & System
  async function loadDepartments() {
    try {
      const res = await fetch('/api/v1/departments', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
        if (data.length > 0 && !signupDeptId) {
          setSignupDeptId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Auth Functions
  async function checkCurrentUser() {
    try {
      const res = await fetch('/api/v1/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      } else {
        // Auto sign in as Amity student for instant first load
        switchPersona('arjun.sharma@s.amity.edu');
      }
    } catch {
      switchPersona('arjun.sharma@s.amity.edu');
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
      setCurrentUser(null);
      setShowAuthModal(false);
      showToast('Signed out of Amity session');
    } catch (e) {
      console.error(e);
    }
  }

  async function switchPersona(email: string) {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        loadIssues();
        loadNotifications();
        showToast(`Signed in as ${user.name} (${user.role})`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Amity Signup: Step 1 Send OTP
  async function handleSendSignupOtp(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!signupName.trim()) {
      setAuthError('Please enter your actual full name as registered on Amity Student/Staff ID.');
      return;
    }

    const cleanEmail = signupEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError('Please enter your Amity University institutional email.');
      return;
    }

    if (signupRole === 'STUDENT') {
      if (cleanEmail.endsWith('@amity.edu') && !cleanEmail.endsWith('@s.amity.edu')) {
        setAuthError('Staff email (@amity.edu) cannot be used for student registration. Please use your student email (@s.amity.edu).');
        return;
      }
      if (!cleanEmail.endsWith('@s.amity.edu')) {
        setAuthError('Student registration strictly requires an official Amity email ending with @s.amity.edu to prevent unauthorized botting.');
        return;
      }

      const cleanEnroll = signupEnrollment.trim().toUpperCase();
      if (!cleanEnroll) {
        setAuthError('Please enter your Amity Enrollment Number.');
        return;
      }
      if (!cleanEnroll.startsWith('A')) {
        setAuthError('All Amity enrollment numbers must begin with the letter "A" (e.g., A2305220001).');
        return;
      }

      if (!selectedCourse) {
        setAuthError('Please search and select a recognized Amity University course from the dropdown (no other or custom courses are permitted).');
        return;
      }

      if (!isCampusValid) {
        setAuthError(`This course is not available at the ${signupCampus} campus. Please recheck your campus selection or contact admissions support at admissions-help@amity.edu.`);
        return;
      }

      if (endYear <= startYear) {
        setAuthError('Course Batch End Year must be strictly after the Start Year.');
        return;
      }

      if (!isDurationValid) {
        setAuthError(`Batch duration mismatch: You selected ${selectedDuration} years (${startYear}–${endYear}), but ${selectedCourse.name} requires ${selectedCourse.durationYears} year(s). Please align your batch years.`);
        return;
      }
    } else {
      // Staff
      if (cleanEmail.endsWith('@s.amity.edu')) {
        setAuthError('Student email (@s.amity.edu) cannot be used for faculty/staff registration. Please use your staff email (@amity.edu).');
        return;
      }
      if (!cleanEmail.endsWith('@amity.edu')) {
        setAuthError('Faculty/Staff registration strictly requires an official Amity email ending with @amity.edu.');
        return;
      }
    }

    try {
      setAuthLoading(true);
      const effectiveBatch = `${startYear}-${endYear}`;

      const payload = {
        role: signupRole,
        name: signupName.trim(),
        email: cleanEmail,
        campus: signupCampus,
        enrollmentNo: signupRole === 'STUDENT' ? signupEnrollment.trim().toUpperCase() : undefined,
        course: signupRole === 'STUDENT' ? selectedCourse?.name : undefined,
        batchYear: signupRole === 'STUDENT' ? effectiveBatch : undefined,
        departmentId: signupRole === 'STAFF' && signupDeptId ? signupDeptId : undefined
      };

      const res = await fetch('/api/v1/auth/signup/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.message || 'Failed to send verification code.');
        return;
      }

      setOtpEmail(cleanEmail);
      setActiveDevOtp(data.devOtp || null);
      setOtpInput('');
      setAuthStep('OTP');
      setOtpCountdown(600);
      setResendCooldown(30);
      setAuthSuccess(`6-digit verification code sent to ${cleanEmail}`);
    } catch {
      setAuthError('Network error connecting to Amity auth server.');
    } finally {
      setAuthLoading(false);
    }
  }

  // Amity Signup: Step 2 Verify OTP
  async function handleVerifySignupOtp(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);

    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setAuthError('Please enter the complete 6-digit OTP code.');
      return;
    }

    try {
      setAuthLoading(true);
      const effectiveBatch = `${startYear}-${endYear}`;

      const payload = {
        role: signupRole,
        name: signupName.trim(),
        email: otpEmail,
        campus: signupCampus,
        enrollmentNo: signupRole === 'STUDENT' ? signupEnrollment.trim().toUpperCase() : undefined,
        course: signupRole === 'STUDENT' ? (selectedCourse ? selectedCourse.name : courseSearchQuery) : undefined,
        batchYear: signupRole === 'STUDENT' ? effectiveBatch : undefined,
        departmentId: signupRole === 'STAFF' && signupDeptId ? signupDeptId : undefined,
        otp: otpInput.trim()
      };

      const res = await fetch('/api/v1/auth/signup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.message || 'OTP verification failed.');
        return;
      }

      setCurrentUser(data);
      setShowAuthModal(false);
      setAuthStep('FORM');
      showToast(`Welcome to Campus Pulse, ${data.name}! Verified as Amity ${data.role}`);
      loadIssues();
      loadNotifications();
    } catch {
      setAuthError('Failed to verify OTP with campus server.');
    } finally {
      setAuthLoading(false);
    }
  }

  // Amity Login: Step 1 Send OTP
  async function handleSendLoginOtp(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError('Please enter your Amity email (@s.amity.edu or @amity.edu).');
      return;
    }

    if (!cleanEmail.endsWith('@s.amity.edu') && !cleanEmail.endsWith('@amity.edu')) {
      setAuthError('Only official Amity email addresses (@s.amity.edu or @amity.edu) are eligible to sign in.');
      return;
    }

    try {
      setAuthLoading(true);
      const res = await fetch('/api/v1/auth/login/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.message || 'Failed to send login code.');
        return;
      }

      setOtpEmail(cleanEmail);
      setActiveDevOtp(data.devOtp || null);
      setOtpInput('');
      setAuthStep('OTP');
      setOtpCountdown(600);
      setResendCooldown(30);
      setAuthSuccess(`Sign-in verification code sent to ${cleanEmail}`);
    } catch {
      setAuthError('Network error communicating with authentication service.');
    } finally {
      setAuthLoading(false);
    }
  }

  // Amity Login: Step 2 Verify OTP
  async function handleVerifyLoginOtp(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);

    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setAuthError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setAuthLoading(true);
      const res = await fetch('/api/v1/auth/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: otpEmail, otp: otpInput.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.message || 'Invalid or expired OTP.');
        return;
      }

      setCurrentUser(data);
      setShowAuthModal(false);
      setAuthStep('FORM');
      showToast(`Welcome back, ${data.name}!`);
      loadIssues();
      loadNotifications();
    } catch {
      setAuthError('Failed to verify OTP with campus server.');
    } finally {
      setAuthLoading(false);
    }
  }

  // Load Data
  async function loadLocations() {
    try {
      const res = await fetch('/api/v1/locations', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLocations(data);
        if (data.length > 0 && !reportLocId) {
          setReportLocId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadIssues() {
    try {
      const res = await fetch('/api/v1/issues', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadNotifications() {
    try {
      const res = await fetch('/api/v1/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadMetrics() {
    try {
      const res = await fetch('/api/v1/admin/metrics/summary', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Simulate scanning QR code
  async function scanQrLocation(token: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/locations/qr/${token}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSelectedLocation(data);
        setLocationActiveIssues(data.activeIssues || []);
        setReportLocId(data.id);
        showToast(`Scanned QR: ${data.roomCode} - ${data.name}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Submit Report
  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportDesc.trim()) {
      showToast('Please provide an issue description');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/v1/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          locationId: reportLocId,
          category: reportCategory,
          description: reportDesc,
          severity: reportSeverity,
          safetyFlag: reportSafety
        })
      });

      if (res.ok) {
        const created = await res.json();
        showToast(`Report filed successfully! Ticket: ${created.ticketNo}`);
        setReportDesc('');
        setReportSafety(false);
        setReportSeverity(3);
        loadIssues();
        setActiveTab('feed');
        setSelectedIssue(created);
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to submit report');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Toggle "I'm Affected Too"
  async function handleToggleSupport(issueId: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/v1/issues/${issueId}/support`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.supported ? "Marked as 'I'm affected too' (+1)" : 'Support removed');
        loadIssues();
        if (selectedIssue && selectedIssue.id === issueId) {
          const fresh = await fetch(`/api/v1/issues/${issueId}`, { credentials: 'include' });
          if (fresh.ok) setSelectedIssue(await fresh.json());
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Advance Status (Staff / Admin)
  async function handleAdvanceStatus(issueId: string, toStatus: string, reason?: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ toStatus, reason })
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(`Status updated to ${toStatus}`);
        loadIssues();
        setSelectedIssue(updated);
      } else {
        const err = await res.json();
        showToast(err.message || 'Transition rejected');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Confirm Fix or Reopen (Student)
  async function handleConfirmResolution(
    issueId: string,
    fixed: boolean,
    rating: number,
    comment: string
  ) {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/issues/${issueId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fixedConfirmed: fixed,
          rating,
          comment
        })
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(fixed ? 'Resolution confirmed! Ticket closed.' : 'Ticket reopened for further review.');
        loadIssues();
        setSelectedIssue(updated);
      } else {
        const err = await res.json();
        showToast(err.message || 'Action failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Add Comment
  async function handleAddComment(issueId: string, text: string, isInternal: boolean) {
    if (!text.trim()) return;
    try {
      const res = await fetch(`/api/v1/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body: text, internal: isInternal })
      });
      if (res.ok) {
        showToast('Comment posted');
        const fresh = await fetch(`/api/v1/issues/${issueId}`, { credentials: 'include' });
        if (fresh.ok) setSelectedIssue(await fresh.json());
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Priority Override (Admin)
  async function handleOverridePriority(
    issueId: string,
    overrideLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    overrideReason: string
  ) {
    if (!overrideReason.trim()) {
      showToast('Written reason is required by university policy');
      return;
    }
    try {
      const res = await fetch(`/api/v1/issues/${issueId}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ priorityLevel: overrideLevel, reason: overrideReason })
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(`Priority adjusted to ${overrideLevel}`);
        setSelectedIssue(updated);
        loadIssues();
      }
    } catch (e) {
      console.error(e);
    }
  }

  function showToast(msg: string) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3800);
  }

  return (
    <div className="app-layout">
      {/* ─── Compact Navigation Sidebar Rail ─────────────────────────────── */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        isOpen={mobileSidebarOpen}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        issues={issues}
        onOpenAuth={() => {
          setShowAuthModal(true);
          setAuthError(null);
          setAuthSuccess(null);
        }}
        onSwitchPersona={switchPersona}
        onLoadMetrics={loadMetrics}
      />

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ─── Workspace Main Section ────────────────────────────────────────── */}
      <div className="workspace-main">
        {/* Topbar Utility Header */}
        <Topbar
          activeTab={activeTab}
          currentUser={currentUser}
          unreadCount={unreadCount}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          onOpenAuth={() => {
            setShowAuthModal(true);
            setAuthError(null);
            setAuthSuccess(null);
          }}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Notifications Popover */}
        <NotificationsPopover
          show={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
          unreadCount={unreadCount}
        />

        {/* Main Workspace Body */}
        <main className="workspace-body">
          {/* TAB 1: CAMPUS DIRECTORY & QR */}
          {activeTab === 'hub' && (
            <CampusHub
              locations={locations}
              selectedLocation={selectedLocation}
              locationActiveIssues={locationActiveIssues}
              onScanLocation={scanQrLocation}
              onOpenPrintModal={() => setShowQrPrintModal(true)}
              onFileReportAtLocation={(locationId) => {
                setReportLocId(locationId);
                setActiveTab('report');
              }}
              onToggleSupport={handleToggleSupport}
              onSelectIssue={(issue) => setSelectedIssue(issue)}
            />
          )}

          {/* TAB 2: REPORT PROBLEM */}
          {activeTab === 'report' && (
            <ReportIssue
              locations={locations}
              issues={issues}
              reportLocId={reportLocId}
              setReportLocId={setReportLocId}
              reportCategory={reportCategory}
              setReportCategory={setReportCategory}
              reportDesc={reportDesc}
              setReportDesc={setReportDesc}
              reportSeverity={reportSeverity}
              setReportSeverity={setReportSeverity}
              reportSafety={reportSafety}
              setReportSafety={setReportSafety}
              loading={loading}
              onSubmitReport={handleSubmitReport}
              onSelectIssue={(issue) => setSelectedIssue(issue)}
            />
          )}

          {/* TAB 3: CAMPUS FEED & TICKETS REGISTER */}
          {activeTab === 'feed' && (
            <CampusFeed
              issues={issues}
              currentUser={currentUser}
              feedFilter={feedFilter}
              setFeedFilter={setFeedFilter}
              onRefresh={loadIssues}
              onSelectIssue={(issue) => setSelectedIssue(issue)}
              onToggleSupport={handleToggleSupport}
              onNavigateToReport={() => setActiveTab('report')}
            />
          )}

          {/* TAB 4: STAFF ACTION QUEUE */}
          {activeTab === 'queue' && (
            <StaffQueue
              issues={issues}
              currentUser={currentUser}
              onAdvanceStatus={handleAdvanceStatus}
              onSelectIssue={(issue) => setSelectedIssue(issue)}
            />
          )}

          {/* TAB 5: DEAN'S OPERATIONS OVERVIEW */}
          {activeTab === 'admin' && (
            <AdminDashboard metrics={metrics} />
          )}

          {/* ─── Issue Detail Dossier Modal ─────────────────────────────────── */}
          {selectedIssue && (
            <IssueDetailModal
              selectedIssue={selectedIssue}
              currentUser={currentUser}
              onClose={() => setSelectedIssue(null)}
              onConfirmResolution={handleConfirmResolution}
              onAddComment={handleAddComment}
              onOverridePriority={handleOverridePriority}
            />
          )}

          {/* ─── Printable QR Placards Sheet Modal ──────────────────────────── */}
          <QrPlacardsModal
            show={showQrPrintModal}
            onClose={() => setShowQrPrintModal(false)}
            locations={locations}
          />

          {/* ─── Amity Auth & Fast-Pass Modal ──────────────────────────────── */}
          <AuthModal
            show={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            currentUser={currentUser}
            departments={departments}
            authMode={authMode}
            setAuthMode={setAuthMode}
            authStep={authStep}
            setAuthStep={setAuthStep}
            authLoading={authLoading}
            authError={authError}
            authSuccess={authSuccess}
            setAuthError={setAuthError}
            setAuthSuccess={setAuthSuccess}
            loginEmail={loginEmail}
            setLoginEmail={setLoginEmail}
            onSendLoginOtp={handleSendLoginOtp}
            onVerifyLoginOtp={handleVerifyLoginOtp}
            signupRole={signupRole}
            setSignupRole={setSignupRole}
            signupName={signupName}
            setSignupName={setSignupName}
            signupEmail={signupEmail}
            setSignupEmail={setSignupEmail}
            signupCampus={signupCampus}
            setSignupCampus={setSignupCampus}
            signupEnrollment={signupEnrollment}
            setSignupEnrollment={setSignupEnrollment}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            courseSearchQuery={courseSearchQuery}
            setCourseSearchQuery={setCourseSearchQuery}
            filteredCourses={filteredCourses}
            isCourseDropdownOpen={isCourseDropdownOpen}
            setIsCourseDropdownOpen={setIsCourseDropdownOpen}
            isCampusValid={isCampusValid}
            isDurationValid={isDurationValid}
            selectedDuration={selectedDuration}
            startYear={startYear}
            setStartYear={setStartYear}
            endYear={endYear}
            setEndYear={setEndYear}
            signupDeptId={signupDeptId}
            setSignupDeptId={setSignupDeptId}
            onSendSignupOtp={handleSendSignupOtp}
            onVerifySignupOtp={handleVerifySignupOtp}
            otpInput={otpInput}
            setOtpInput={setOtpInput}
            otpEmail={otpEmail}
            activeDevOtp={activeDevOtp}
            otpCountdown={otpCountdown}
            resendCooldown={resendCooldown}
            onSwitchPersona={switchPersona}
            onLogout={handleLogout}
          />
        </main>
      </div>

      {/* Floating Status Notification Toast */}
      <Toast message={statusMessage} />
    </div>
  );
}

export default App;
