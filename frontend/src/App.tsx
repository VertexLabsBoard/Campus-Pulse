import { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import {
  Shield,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Send,
  Bell,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Layers,
  Wrench,
  BarChart3,
  RefreshCw,
  Star,
  Flame,
  X,
  Compass,
  FileCheck2,
  Printer,
  LogOut,
  UserCircle2,
  Search,
  School,
  Check
} from 'lucide-react';
import { AMITY_CAMPUSES, AMITY_COURSES, type AmityCourse } from './data/amityCourses';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  enrollmentNo?: string;
  course?: string;
  batchYear?: string;
  campus?: string;
  departmentId?: string;
  departmentName?: string;
}

interface DepartmentItem {
  id: string;
  name: string;
}

interface LocationItem {
  id: string;
  buildingId: string;
  floor: number;
  roomCode: string;
  name: string;
  qrToken: string;
  type: string;
}

interface CommentItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  body: string;
  internal: boolean;
  createdAt: string;
}

interface StatusHistoryItem {
  id: string;
  fromStatus?: string;
  toStatus: string;
  changedByName: string;
  reason?: string;
  changedAt: string;
}

interface IssueItem {
  id: string;
  ticketNo: string;
  reporterId: string;
  reporterName: string;
  locationId: string;
  locationName: string;
  roomCode: string;
  buildingName: string;
  category: string;
  description: string;
  severity: number;
  safetyFlag: boolean;
  status: 'SUBMITTED' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED' | 'REJECTED' | 'DUPLICATE';
  priorityScore: number;
  priorityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priorityExplanation?: { score: number; level: string; reasons: string[] };
  priorityOverrideReason?: string;
  departmentId?: string;
  departmentName?: string;
  assigneeName?: string;
  supporterCount: number;
  userHasSupported: boolean;
  createdAt: string;
  resolvedAt?: string;
  closedAt?: string;
  comments: CommentItem[];
  history: StatusHistoryItem[];
}

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  readAt?: string;
  createdAt: string;
}

interface Metrics {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  issuesByDepartment: Record<string, number>;
  issuesByCategory: Record<string, number>;
}

const START_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const END_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];

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

  // New Report Form state
  const [reportLocId, setReportLocId] = useState('');
  const [reportCategory, setReportCategory] = useState('IT');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSeverity, setReportSeverity] = useState(3);
  const [reportSafety, setReportSafety] = useState(false);

  // Comments & Feedback state
  const [newCommentText, setNewCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Priority Override State
  const [overrideLevel, setOverrideLevel] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('CRITICAL');
  const [overrideReason, setOverrideReason] = useState('');

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

  // Searchable Course State (Amity Official Courses only - no 'Other' allowed)
  const defaultCourse = useMemo(() => {
    return (
      AMITY_COURSES.find(c => c.name.includes("B.Tech (Computer Science & Engineering) (4Years )")) ||
      AMITY_COURSES[0]
    );
  }, []);

  const [courseSearchQuery, setCourseSearchQuery] = useState(defaultCourse ? defaultCourse.name : '');
  const [selectedCourse, setSelectedCourse] = useState<AmityCourse | null>(defaultCourse || null);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  // Dual Year Selector State (Selector 1 - Selector 2)
  const [startYear, setStartYear] = useState(2024);
  const [endYear, setEndYear] = useState(2028);
  const [signupDeptId, setSignupDeptId] = useState('');

  // Close course dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setIsCourseDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter courses live based on search query
  const filteredCourses = useMemo(() => {
    const q = courseSearchQuery.trim().toLowerCase();
    if (!q) return AMITY_COURSES.slice(0, 40);
    return AMITY_COURSES.filter(c => c.name.toLowerCase().includes(q)).slice(0, 50);
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

  // Handle URL query parameters for QR scanning (e.g., ?qr=qrt-a-103-lab or ?room=A-103)
  useEffect(() => {
    if (locations.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const qrParam = params.get('qr') || params.get('room');
      if (qrParam) {
        const found = locations.find(
          l => l.qrToken === qrParam || l.roomCode.toLowerCase() === qrParam.toLowerCase()
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
        if (data.length > 0) {
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
  async function handleConfirmResolution(issueId: string, fixed: boolean) {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/issues/${issueId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fixedConfirmed: fixed,
          rating: feedbackRating,
          comment: feedbackComment
        })
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(fixed ? 'Resolution confirmed! Ticket closed.' : 'Ticket reopened for further review.');
        loadIssues();
        setSelectedIssue(updated);
        setFeedbackComment('');
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
  async function handleAddComment(issueId: string) {
    if (!newCommentText.trim()) return;
    try {
      const res = await fetch(`/api/v1/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body: newCommentText, internal: isInternalComment })
      });
      if (res.ok) {
        setNewCommentText('');
        showToast('Comment posted');
        const fresh = await fetch(`/api/v1/issues/${issueId}`, { credentials: 'include' });
        if (fresh.ok) setSelectedIssue(await fresh.json());
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Priority Override (Admin)
  async function handleOverridePriority(issueId: string) {
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
        setOverrideReason('');
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

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    if (feedFilter === 'MINE') return currentUser && issue.reporterId === currentUser.id;
    if (feedFilter === 'CRITICAL') return issue.priorityLevel === 'CRITICAL';
    if (feedFilter === 'OPEN') return !['RESOLVED', 'CLOSED', 'REJECTED'].includes(issue.status);
    return true;
  });

  return (
    <div className="app-wrapper">
      {/* ─── Academic Crest Header ────────────────────────────────────────── */}
      <header className="academic-header">
        <div className="header-top">
          <div className="brand-crest" onClick={() => setActiveTab('feed')}>
            <div className="crest-shield">
              <Shield size={24} />
            </div>
            <div className="brand-text">
              <h1>Campus Pulse</h1>
              <span className="subtext">Collegiate Operations & Dispatch</span>
            </div>
          </div>

          {/* Quick Persona Switcher */}
          <div className="persona-switcher">
            <button
              className={`persona-btn ${currentUser?.email === 'arjun.sharma@s.amity.edu' ? 'active' : ''}`}
              onClick={() => switchPersona('arjun.sharma@s.amity.edu')}
            >
              🎓 Arjun (Amity Student)
            </button>
            <button
              className={`persona-btn ${currentUser?.email === 'priya.patel@amity.edu' ? 'active' : ''}`}
              onClick={() => switchPersona('priya.patel@amity.edu')}
            >
              💻 Priya (IT Staff)
            </button>
            <button
              className={`persona-btn ${currentUser?.email === 'ramesh.kumar@amity.edu' ? 'active' : ''}`}
              onClick={() => switchPersona('ramesh.kumar@amity.edu')}
            >
              🔧 Ramesh (Facilities)
            </button>
            <button
              className={`persona-btn ${currentUser?.email === 'dr.vikram.sen@amity.edu' ? 'active' : ''}`}
              onClick={() => switchPersona('dr.vikram.sen@amity.edu')}
            >
              🏛️ Dr. Vikram (Dean)
            </button>

            {/* Identity & SSO Modal Trigger */}
            <button
              className="persona-btn"
              onClick={() => { setShowAuthModal(true); setAuthError(null); setAuthSuccess(null); }}
              style={{
                border: '1px solid var(--gold-accent)',
                color: 'var(--gold-warm)',
                background: 'rgba(245, 158, 11, 0.08)'
              }}
              title="Amity University OTP Portal & Identity"
            >
              <UserCircle2 size={16} />
              <span>{currentUser ? `${currentUser.name} (${currentUser.role})` : 'Amity Portal Sign In'}</span>
              {currentUser?.enrollmentNo && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.2)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                  {currentUser.enrollmentNo}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <button
              className="notification-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs-bar">
          <button
            className={`nav-tab ${activeTab === 'hub' ? 'active' : ''}`}
            onClick={() => setActiveTab('hub')}
          >
            <Compass size={16} /> Campus Hub & QR Spot
          </button>
          <button
            className={`nav-tab ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <Send size={16} /> Report Problem (&lt;30s)
          </button>
          <button
            className={`nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <Layers size={16} /> Campus Feed & Tickets ({issues.length})
          </button>
          {(currentUser?.role === 'STAFF' || currentUser?.role === 'ADMIN') && (
            <button
              className={`nav-tab ${activeTab === 'queue' ? 'active' : ''}`}
              onClick={() => setActiveTab('queue')}
            >
              <Wrench size={16} /> Staff Queue (My Jobs)
            </button>
          )}
          {currentUser?.role === 'ADMIN' && (
            <button
              className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => { setActiveTab('admin'); loadMetrics(); }}
            >
              <BarChart3 size={16} /> Dean's Operations & Analytics
            </button>
          )}
        </nav>
      </header>

      {/* ─── Safety Notice ────────────────────────────────────────────────── */}
      <div className="safety-banner">
        <div className="safety-content">
          <AlertTriangle size={16} color="#ef4444" />
          <span>
            <strong>CAMPUS SAFETY PROTOCOL:</strong> This portal handles facility repairs and maintenance. For active fire, medical trauma, or security threats, immediately contact Campus Security at <strong>+1 (555) 019-911</strong>.
          </span>
        </div>
      </div>

      {/* ─── Notification Toast ───────────────────────────────────────────── */}
      {statusMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#1e293b',
          color: '#f8fafc',
          padding: '12px 20px',
          borderRadius: 10,
          border: '1px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} color="#f59e0b" />
          {statusMessage}
        </div>
      )}

      {/* ─── Main Content Views ───────────────────────────────────────────── */}
      <main className="main-content">
        {/* TAB 1: CAMPUS HUB & QR SCANNER */}
        {activeTab === 'hub' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="blueprint-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#f8fafc' }}>
                    A-Block Interactive Directory & QR Simulation
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                    In a physical pilot, students scan QR stickers on room doorframes. Click any location below to simulate scanning its code.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowQrPrintModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', padding: '6px 14px' }}
                  >
                    <Printer size={16} /> Printable QR Placards (A4)
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245, 158, 11, 0.1)', padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--gold-warm)', fontSize: '0.85rem' }}>
                    <QrCode size={18} /> Tap Room to Scan
                  </div>
                </div>
              </div>

              {/* Rooms Grid */}
              <div className="floor-plan-grid">
                {locations.map(loc => (
                  <div
                    key={loc.id}
                    className={`room-card ${selectedLocation?.id === loc.id ? 'selected' : ''}`}
                    onClick={() => scanQrLocation(loc.qrToken)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="room-code-tag">{loc.roomCode}</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4 }}>
                        Floor {loc.floor} • {loc.type}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{loc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <QrCode size={12} /> {loc.qrToken}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Location Details & Known Issues */}
            {selectedLocation && (
              <div className="blueprint-card" style={{ padding: 24, border: '1px solid var(--gold-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ color: 'var(--gold-warm)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Active QR Session Verified
                    </div>
                    <h3 style={{ fontSize: '1.3rem', color: '#fff', marginTop: 4 }}>
                      {selectedLocation.roomCode} — {selectedLocation.name}
                    </h3>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setReportLocId(selectedLocation.id);
                      setActiveTab('report');
                    }}
                  >
                    <Send size={16} /> File New Report Here
                  </button>
                </div>

                <h4 style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} color="#f59e0b" /> Known Open Issues at this Spot ({locationActiveIssues.length})
                </h4>

                {locationActiveIssues.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 10, color: '#94a3b8' }}>
                    No reported open issues here. Everything looks clean and functional!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {locationActiveIssues.map(issue => (
                      <div
                        key={issue.id}
                        style={{
                          background: '#0e172a',
                          padding: 16,
                          borderRadius: 8,
                          border: '1px solid var(--navy-border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span className="ticket-number" style={{ color: 'var(--gold-warm)' }}>{issue.ticketNo}</span>
                            <span className={`status-badge status-${issue.status}`}>{issue.status}</span>
                            <span className={`priority-pill priority-${issue.priorityLevel}`}>{issue.priorityLevel}</span>
                          </div>
                          <div style={{ color: '#e2e8f0', fontSize: '0.92rem' }}>{issue.description}</div>
                        </div>
                        <button
                          className={`support-btn ${issue.userHasSupported ? 'supported' : ''}`}
                          onClick={(e) => handleToggleSupport(issue.id, e)}
                        >
                          <ThumbsUp size={14} /> Affected too ({issue.supporterCount})
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REPORT PROBLEM FORM (< 30s) */}
        {activeTab === 'report' && (
          <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
            <div className="blueprint-card" style={{ padding: 32 }}>
              <div style={{ marginBottom: 24 }}>
                <span style={{ color: 'var(--gold-warm)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Under 30-Second Reporting Protocol
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#f8fafc', marginTop: 4 }}>
                  Log a Campus Issue
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Your report triggers automatic explainable prioritization and department dispatch.
                </p>
              </div>

              <form onSubmit={handleSubmitReport}>
                {/* Location Picker */}
                <div className="form-group">
                  <label className="form-label">Location / Room Code</label>
                  <select
                    className="form-select"
                    value={reportLocId}
                    onChange={(e) => setReportLocId(e.target.value)}
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.roomCode} — {loc.name} (Floor {loc.floor})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Picker */}
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <div className="category-chips">
                    {['IT', 'Maintenance', 'Housekeeping', 'Electrical', 'Lab'].map(cat => (
                      <button
                        type="button"
                        key={cat}
                        className={`category-chip ${reportCategory === cat ? 'active' : ''}`}
                        onClick={() => setReportCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time Duplicate Hint (§8) */}
                {(() => {
                  const existingAtSpot = issues.filter(i =>
                    i.locationId === reportLocId &&
                    !['RESOLVED', 'CLOSED', 'REJECTED'].includes(i.status)
                  );
                  if (existingAtSpot.length > 0) {
                    return (
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1.5px dashed rgba(245, 158, 11, 0.4)',
                        borderRadius: 10,
                        padding: 14,
                        marginBottom: 16
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold-warm)', fontWeight: 600, fontSize: '0.86rem', marginBottom: 6 }}>
                          <AlertTriangle size={16} /> Open issue already active at this spot:
                        </div>
                        {existingAtSpot.slice(0, 2).map(ex => (
                          <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#cbd5e1', marginTop: 4, background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: 6 }}>
                            <span><strong>{ex.ticketNo}</strong>: {ex.description.slice(0, 55)}...</span>
                            <button
                              type="button"
                              className="support-btn"
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                              onClick={() => { setSelectedIssue(ex); }}
                            >
                              View / Support
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Problem Description</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="e.g. HDMI projector not connecting to laptop; audio buzzing intermittently"
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    required
                  />
                </div>

                {/* Severity (1–5) */}
                <div className="form-group">
                  <label className="form-label">Severity Level: {reportSeverity}/5</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setReportSeverity(lvl)}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          background: reportSeverity === lvl ? 'var(--gold-accent)' : '#111a30',
                          color: reportSeverity === lvl ? '#000' : '#cbd5e1',
                          fontWeight: 700,
                          borderRadius: 8,
                          border: '1px solid var(--navy-border)'
                        }}
                      >
                        {lvl} {lvl === 5 ? '🔥 Blocker' : lvl === 1 ? 'Minor' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Safety Hazard Toggle */}
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: 16,
                  borderRadius: 10,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Flame size={24} color="#ef4444" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#f87171' }}>Safety Hazard Override</div>
                      <div style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
                        Exposed wiring, chemical spill, water leak near electrics, broken stairs.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reportSafety}
                    onChange={(e) => setReportSafety(e.target.checked)}
                    style={{ width: 22, height: 22, cursor: 'pointer' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px' }}
                  disabled={loading}
                >
                  <Send size={18} /> {loading ? 'Submitting...' : 'Submit Campus Report'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: CAMPUS FEED & TICKETS */}
        {activeTab === 'feed' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`category-chip ${feedFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setFeedFilter('ALL')}
                >
                  All Campus Reports ({issues.length})
                </button>
                <button
                  className={`category-chip ${feedFilter === 'MINE' ? 'active' : ''}`}
                  onClick={() => setFeedFilter('MINE')}
                >
                  My Reports
                </button>
                <button
                  className={`category-chip ${feedFilter === 'CRITICAL' ? 'active' : ''}`}
                  onClick={() => setFeedFilter('CRITICAL')}
                >
                  🔥 Critical Only
                </button>
                <button
                  className={`category-chip ${feedFilter === 'OPEN' ? 'active' : ''}`}
                  onClick={() => setFeedFilter('OPEN')}
                >
                  Active Pipeline
                </button>
              </div>

              <button
                className="btn-secondary"
                onClick={loadIssues}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Tickets Grid */}
            {filteredIssues.length === 0 ? (
              <div className="blueprint-card" style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                <FileCheck2 size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                <h3>No tickets match this filter</h3>
                <p style={{ marginTop: 6, fontSize: '0.9rem' }}>Submit a new problem report or change your filter.</p>
              </div>
            ) : (
              <div className="issues-grid">
                {filteredIssues.map(issue => (
                  <div
                    key={issue.id}
                    className="ticket-card"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="ticket-card-header">
                      <span className="ticket-number" style={{ color: 'var(--gold-warm)' }}>
                        {issue.ticketNo}
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span className={`priority-pill priority-${issue.priorityLevel}`}>
                          {issue.priorityLevel}
                        </span>
                        <span className={`status-badge status-${issue.status}`}>
                          {issue.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="ticket-loc-badge">
                        <MapPin size={12} /> {issue.roomCode}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{issue.category}</span>
                    </div>

                    <div className="ticket-desc">{issue.description}</div>

                    <div className="ticket-meta">
                      <button
                        className={`support-btn ${issue.userHasSupported ? 'supported' : ''}`}
                        onClick={(e) => handleToggleSupport(issue.id, e)}
                      >
                        <ThumbsUp size={13} /> Affected too ({issue.supporterCount})
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MessageSquare size={13} /> {issue.comments?.length || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STAFF JOB QUEUE */}
        {activeTab === 'queue' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="blueprint-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#f8fafc' }}>
                    Technician Dispatch Workbench — {currentUser?.departmentName || 'Campus'} Queue
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                    One-tap lifecycle transitions. Validated against university SLAs and workflow state machine.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {issues.map(job => (
                  <div
                    key={job.id}
                    style={{
                      background: '#111a30',
                      border: '1px solid var(--navy-border)',
                      borderRadius: 10,
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="ticket-number" style={{ color: 'var(--gold-warm)', fontSize: '1rem' }}>{job.ticketNo}</span>
                        <span className={`status-badge status-${job.status}`}>{job.status}</span>
                        <span className={`priority-pill priority-${job.priorityLevel}`}>{job.priorityLevel}</span>
                        <span className="ticket-loc-badge"><MapPin size={12} /> {job.roomCode}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        Reported by: {job.reporterName}
                      </span>
                    </div>

                    <div style={{ color: '#f1f5f9', fontSize: '0.95rem' }}>{job.description}</div>

                    {/* Quick Staff Actions */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {job.status === 'SUBMITTED' && (
                        <>
                          <button
                            className="btn-primary"
                            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                            onClick={() => handleAdvanceStatus(job.id, 'VERIFIED', 'Verified on-site by staff')}
                          >
                            ✓ Verify Ticket
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '6px 14px', fontSize: '0.82rem', color: '#f87171' }}
                            onClick={() => handleAdvanceStatus(job.id, 'REJECTED', 'Duplicate or invalid report')}
                          >
                            ✕ Reject / Spam
                          </button>
                        </>
                      )}

                      {job.status === 'VERIFIED' && (
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                          onClick={() => handleAdvanceStatus(job.id, 'ASSIGNED', 'Assigned to duty technician')}
                        >
                          → Claim / Assign Job
                        </button>
                      )}

                      {job.status === 'ASSIGNED' && (
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem', background: '#3b82f6' }}
                          onClick={() => handleAdvanceStatus(job.id, 'IN_PROGRESS', 'Work initiated on site')}
                        >
                          ▶ Start Working (In Progress)
                        </button>
                      )}

                      {job.status === 'IN_PROGRESS' && (
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem', background: '#10b981' }}
                          onClick={() => handleAdvanceStatus(job.id, 'RESOLVED', 'Issue resolved and tested')}
                        >
                          ✓ Mark Resolved
                        </button>
                      )}

                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        onClick={() => setSelectedIssue(job)}
                      >
                        View Full Details & Timeline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DEAN'S OPERATIONS & ANALYTICS */}
        {activeTab === 'admin' && metrics && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="blueprint-card" style={{ padding: 20 }}>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Logged</div>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
                  {metrics.totalIssues}
                </div>
              </div>
              <div className="blueprint-card" style={{ padding: 20 }}>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Active In Pipeline</div>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-warm)', marginTop: 4 }}>
                  {metrics.openIssues + metrics.inProgressIssues}
                </div>
              </div>
              <div className="blueprint-card" style={{ padding: 20 }}>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Resolved & Closed</div>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                  {metrics.resolvedIssues}
                </div>
              </div>
              <div className="blueprint-card" style={{ padding: 20 }}>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Critical Safety Flags</div>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f87171', marginTop: 4 }}>
                  {metrics.criticalIssues}
                </div>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="blueprint-card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#f8fafc', marginBottom: 16 }}>
                Department Workload Distribution
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {Object.entries(metrics.issuesByDepartment).map(([dept, count]) => (
                  <div key={dept} style={{ background: '#0e172a', padding: 16, borderRadius: 8, border: '1px solid var(--navy-border)' }}>
                    <div style={{ color: 'var(--gold-warm)', fontWeight: 600 }}>{dept}</div>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: 4 }}>{count} issues</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Issue Detail Drawer / Modal ─────────────────────────────────── */}
        {selectedIssue && (
          <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="ticket-number" style={{ color: 'var(--gold-warm)', fontSize: '1.2rem' }}>
                    {selectedIssue.ticketNo}
                  </span>
                  <span className={`status-badge status-${selectedIssue.status}`}>
                    {selectedIssue.status}
                  </span>
                  <span className={`priority-pill priority-${selectedIssue.priorityLevel}`}>
                    {selectedIssue.priorityLevel}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  style={{ background: 'transparent', color: '#94a3b8', padding: 6 }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Location & Metadata */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 8 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>LOCATION</span>
                    <strong style={{ color: '#fff' }}>{selectedIssue.roomCode} — {selectedIssue.locationName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>CATEGORY</span>
                    <strong style={{ color: 'var(--gold-warm)' }}>{selectedIssue.category}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>DEPARTMENT</span>
                    <strong style={{ color: '#60a5fa' }}>{selectedIssue.departmentName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>REPORTER</span>
                    <strong style={{ color: '#fff' }}>{selectedIssue.reporterName}</strong>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                    Description
                  </h4>
                  <p style={{ fontSize: '1rem', color: '#f1f5f9', lineHeight: 1.5 }}>
                    {selectedIssue.description}
                  </p>
                </div>

                {/* Explainable Priority Breakdown */}
                {selectedIssue.priorityExplanation && (
                  <div style={{ background: '#0e172a', border: '1px solid rgba(245, 158, 11, 0.25)', padding: 16, borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--gold-warm)', fontSize: '0.85rem' }}>
                        Explainable Priority Score: {selectedIssue.priorityScore || selectedIssue.priorityExplanation.score} / 100
                      </span>
                      <span className={`priority-pill priority-${selectedIssue.priorityLevel}`}>
                        {selectedIssue.priorityLevel}
                      </span>
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {selectedIssue.priorityExplanation.reasons?.map((r, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: 'var(--gold-warm)' }}>•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Admin Priority Override Tool */}
                {currentUser?.role === 'ADMIN' && (
                  <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: 16, borderRadius: 8 }}>
                    <h5 style={{ color: '#60a5fa', fontWeight: 700, marginBottom: 8 }}>Admin Priority Override</h5>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                      <select
                        className="form-select"
                        value={overrideLevel}
                        onChange={(e) => setOverrideLevel(e.target.value as any)}
                        style={{ width: 140 }}
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Written reason required per policy..."
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="btn-primary"
                        onClick={() => handleOverridePriority(selectedIssue.id)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}

                {/* RESOLUTION CONFIRMATION ("Is it fixed?") */}
                {selectedIssue.status === 'RESOLVED' && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    border: '1.5px solid #10b981',
                    borderRadius: 10,
                    padding: 20
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <CheckCircle2 size={24} color="#10b981" />
                      <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>Staff marked this as RESOLVED. Is it fixed?</h4>
                    </div>
                    <p style={{ color: '#a7f3d0', fontSize: '0.88rem', marginBottom: 14 }}>
                      Student verification ensures accountability. Confirming closes the ticket; clicking 'No' reopens it with your note.
                    </p>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: '0.85rem', color: '#fff' }}>Rating:</span>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            size={18}
                            color={s <= feedbackRating ? '#f59e0b' : '#64748b'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setFeedbackRating(s)}
                          />
                        ))}
                      </div>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Optional feedback comment..."
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        className="btn-primary"
                        style={{ background: '#10b981', flex: 1 }}
                        onClick={() => handleConfirmResolution(selectedIssue.id, true)}
                      >
                        ✓ Yes, It's Fixed (Close Ticket)
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ color: '#f87171', border: '1px solid #ef4444' }}
                        onClick={() => handleConfirmResolution(selectedIssue.id, false)}
                      >
                        ✕ No, Still Broken (Reopen)
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>
                    Audit History & Timeline
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedIssue.history?.map((h, i) => (
                      <div key={h.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.84rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold-accent)', marginTop: 6 }} />
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{h.toStatus}</span>
                          <span style={{ color: '#94a3b8' }}> — {h.reason || 'Status update'} (by {h.changedByName})</span>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {new Date(h.changedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments Section */}
                <div style={{ borderTop: '1px solid var(--navy-border)', paddingTop: 16 }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>
                    Discussion & Activity ({selectedIssue.comments?.length || 0})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {selectedIssue.comments?.map(c => (
                      <div
                        key={c.id}
                        style={{
                          background: c.internal ? 'rgba(245, 158, 11, 0.08)' : '#0b1120',
                          border: c.internal ? '1px dashed rgba(245, 158, 11, 0.3)' : '1px solid var(--navy-border)',
                          padding: 12,
                          borderRadius: 8
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.78rem' }}>
                          <strong style={{ color: c.internal ? 'var(--gold-warm)' : '#cbd5e1' }}>
                            {c.authorName} ({c.authorRole}) {c.internal && '• Internal Staff Note'}
                          </strong>
                          <span style={{ color: '#64748b' }}>{new Date(c.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div style={{ color: '#f1f5f9', fontSize: '0.9rem' }}>{c.body}</div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Input */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Add a comment or operational update..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      style={{ flex: 1 }}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(selectedIssue.id)}
                    />
                    {currentUser?.role !== 'STUDENT' && (
                      <button
                        type="button"
                        onClick={() => setIsInternalComment(!isInternalComment)}
                        style={{
                          padding: '0 12px',
                          background: isInternalComment ? 'var(--gold-accent)' : '#1e293b',
                          color: isInternalComment ? '#000' : '#cbd5e1',
                          borderRadius: 6,
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}
                        title="Toggle Staff-Only Note"
                      >
                        Internal Note
                      </button>
                    )}
                    <button
                      className="btn-primary"
                      onClick={() => handleAddComment(selectedIssue.id)}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Notifications Drawer Popover ─────────────────────────────────── */}
        {showNotifications && (
          <div style={{
            position: 'fixed',
            top: 70,
            right: 24,
            width: 380,
            maxHeight: 500,
            background: '#111a30',
            border: '1px solid var(--navy-border)',
            borderRadius: 12,
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            zIndex: 90,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--navy-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>Notifications ({unreadCount} unread)</strong>
              <button
                onClick={() => setShowNotifications(false)}
                style={{ background: 'transparent', color: '#94a3b8' }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No notifications yet.
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      background: n.readAt ? '#0b1120' : 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid var(--navy-border)',
                      padding: 10,
                      borderRadius: 8,
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ color: '#f1f5f9' }}>{n.message}</div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── Printable QR Placards Sheet Modal (Step 7) ───────────────────── */}
        {showQrPrintModal && (
          <div className="modal-overlay" onClick={() => setShowQrPrintModal(false)}>
            <div className="modal-content" style={{ maxWidth: 960 }} onClick={(e) => e.stopPropagation()}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Printer size={22} color="var(--gold-warm)" />
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Official Campus Door Placards (A-Block)</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Printable wall badges ready for campus deployment.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-primary" onClick={() => window.print()} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    <Printer size={16} /> Print Sheet
                  </button>
                  <button onClick={() => setShowQrPrintModal(false)} style={{ background: 'transparent', color: '#94a3b8', padding: 6 }}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="qr-placards-sheet">
                {locations.map(loc => (
                  <div key={loc.id} className="qr-placard-item">
                    <div className="qr-placard-header">Campus Pulse • Issue Dispatch</div>
                    <div className="qr-placard-room">{loc.roomCode}</div>
                    <div className="qr-placard-name">{loc.name}</div>
                    
                    {/* High-contrast QR Graphic */}
                    <div className="qr-placard-svg-box">
                      <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="white" />
                        {/* Corner Top-Left */}
                        <rect x="10" y="10" width="24" height="24" fill="#0f172a" />
                        <rect x="14" y="14" width="16" height="16" fill="white" />
                        <rect x="18" y="18" width="8" height="8" fill="#0f172a" />
                        {/* Corner Top-Right */}
                        <rect x="66" y="10" width="24" height="24" fill="#0f172a" />
                        <rect x="70" y="14" width="16" height="16" fill="white" />
                        <rect x="74" y="18" width="8" height="8" fill="#0f172a" />
                        {/* Corner Bottom-Left */}
                        <rect x="10" y="66" width="24" height="24" fill="#0f172a" />
                        <rect x="14" y="70" width="16" height="16" fill="white" />
                        <rect x="18" y="74" width="8" height="8" fill="#0f172a" />
                        {/* Data Pattern */}
                        <rect x="42" y="10" width="6" height="6" fill="#0f172a" />
                        <rect x="52" y="10" width="6" height="6" fill="#0f172a" />
                        <rect x="42" y="22" width="6" height="6" fill="#0f172a" />
                        <rect x="10" y="42" width="6" height="6" fill="#0f172a" />
                        <rect x="22" y="42" width="6" height="6" fill="#0f172a" />
                        <rect x="36" y="36" width="28" height="28" fill="#0f172a" />
                        <rect x="42" y="42" width="16" height="16" fill="white" />
                        <rect x="47" y="47" width="6" height="6" fill="#0f172a" />
                        <rect x="72" y="42" width="6" height="6" fill="#0f172a" />
                        <rect x="84" y="42" width="6" height="6" fill="#0f172a" />
                        <rect x="42" y="72" width="6" height="6" fill="#0f172a" />
                        <rect x="54" y="72" width="6" height="6" fill="#0f172a" />
                        <rect x="66" y="66" width="6" height="6" fill="#0f172a" />
                        <rect x="78" y="78" width="12" height="12" fill="#0f172a" />
                      </svg>
                    </div>

                    <div className="qr-placard-instructions">
                      Scan with mobile camera to report or track issues at this spot in &lt;30 seconds
                    </div>
                    <div className="qr-placard-url">
                      http://localhost:5173/?qr={loc.qrToken}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Amity University Institutional Auth & OTP Portal ──────────────── */}
        {showAuthModal && (
          <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
              <div className="auth-modal-header">
                <button
                  onClick={() => setShowAuthModal(false)}
                  style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', color: '#94a3b8' }}
                >
                  <X size={20} />
                </button>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', border: '1.5px solid var(--gold-accent)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-warm)' }}>
                  <Shield size={22} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: '#f8fafc', letterSpacing: '0.04em' }}>
                  Amity University Dispatch Portal
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: 4 }}>
                  Official Student & Staff Verification System
                </p>
              </div>

              <div className="auth-modal-body">
                {/* Auth Mode Tabs */}
                <div className="auth-nav-tabs">
                  <button
                    type="button"
                    className={`auth-nav-tab-btn ${authMode === 'LOGIN' ? 'active' : ''}`}
                    onClick={() => { setAuthMode('LOGIN'); setAuthStep('FORM'); setAuthError(null); setAuthSuccess(null); }}
                  >
                    🔑 Sign In (OTP)
                  </button>
                  <button
                    type="button"
                    className={`auth-nav-tab-btn ${authMode === 'SIGNUP' ? 'active' : ''}`}
                    onClick={() => { setAuthMode('SIGNUP'); setAuthStep('FORM'); setAuthError(null); setAuthSuccess(null); }}
                  >
                    📝 Amity Registration
                  </button>
                  <button
                    type="button"
                    className={`auth-nav-tab-btn ${authMode === 'FASTPASS' ? 'active' : ''}`}
                    onClick={() => { setAuthMode('FASTPASS'); setAuthError(null); setAuthSuccess(null); }}
                  >
                    ⚡ Fast-Pass
                  </button>
                </div>

                {/* Feedback Alerts */}
                {authError && (
                  <div className="auth-error-alert animate-fade-in">
                    <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span>{authError}</span>
                  </div>
                )}
                {authSuccess && (
                  <div className="auth-success-alert animate-fade-in">
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* ─── TAB 1: REGISTRATION (SIGNUP) ───────────────────────────────── */}
                {authMode === 'SIGNUP' && (
                  <div>
                    {authStep === 'FORM' ? (
                      <form onSubmit={handleSendSignupOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Role Selector: Student vs Staff */}
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
                              <span className="role-card-title">🎓 Student</span>
                              <span className="role-card-domain">@s.amity.edu only</span>
                            </button>
                            <button
                              type="button"
                              className={`role-card-btn ${signupRole === 'STAFF' ? 'active' : ''}`}
                              onClick={() => { setSignupRole('STAFF'); setAuthError(null); }}
                            >
                              <span className="role-card-title">👔 Faculty / Staff</span>
                              <span className="role-card-domain">@amity.edu only</span>
                            </button>
                          </div>
                        </div>

                        {/* Official Amity Moderation Notice Banner */}
                        <div className="moderation-warning-box">
                          <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <strong style={{ color: '#fca5a5' }}>Official University Moderation Warning:</strong>
                            <p style={{ margin: '3px 0 0', color: '#cbd5e1', fontSize: '0.74rem', lineHeight: 1.45 }}>
                              All registrations are strictly verified against Amity University records. Accounts created with fraudulent details, fake enrollment numbers, or misinformation will be <strong>permanently suspended and reported to the Dean of Student Affairs & Campus Administration</strong>.
                            </p>
                          </div>
                        </div>

                        {/* Campus Selector */}
                        <div>
                          <label className="form-label">
                            <School size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
                            Amity Campus / Branch *
                          </label>
                          <select
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
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 3, display: 'block' }}>
                            Select the official campus branch where you are registered.
                          </span>
                        </div>

                        {/* Full Legal Name */}
                        <div>
                          <label className="form-label">Actual Full Name *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Arjun Sharma"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            required
                          />
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 3, display: 'block' }}>
                            As printed on your Amity ID Card or Amizone portal.
                          </span>
                        </div>

                        {/* Institutional Email with Suffix Check */}
                        <div>
                          <label className="form-label">
                            Official Amity Email * ({signupRole === 'STUDENT' ? '@s.amity.edu' : '@amity.edu'})
                          </label>
                          <input
                            type="email"
                            className="form-input"
                            placeholder={signupRole === 'STUDENT' ? 'username@s.amity.edu' : 'username@amity.edu'}
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                          />
                          {signupRole === 'STUDENT' && signupEmail && !signupEmail.toLowerCase().endsWith('@s.amity.edu') && (
                            <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: 4, display: 'block' }}>
                              ⚠️ Student emails must end with @s.amity.edu
                            </span>
                          )}
                          {signupRole === 'STAFF' && signupEmail && (!signupEmail.toLowerCase().endsWith('@amity.edu') || signupEmail.toLowerCase().endsWith('@s.amity.edu')) && (
                            <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: 4, display: 'block' }}>
                              ⚠️ Staff emails must end with @amity.edu (not @s.amity.edu)
                            </span>
                          )}
                        </div>

                        {/* Student Specific Fields */}
                        {signupRole === 'STUDENT' && (
                          <>
                            {/* Enrollment Number starting with 'A' */}
                            <div>
                              <label className="form-label">Amity Enrollment Number * (Must start with 'A')</label>
                              <div style={{ position: 'relative' }}>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="e.g. A2305220001"
                                  value={signupEnrollment}
                                  onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    setSignupEnrollment(val);
                                  }}
                                  required
                                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                                />
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 3, display: 'block' }}>
                                All Amity University enrollment numbers begin with the letter <strong>'A'</strong>.
                              </span>
                            </div>

                            {/* Searchable Course Combobox (No 'Other' option permitted) */}
                            <div className="course-combobox-wrapper" ref={courseDropdownRef}>
                              <label className="form-label">
                                Course / Academic Program * (Search & Select from Official Catalog)
                              </label>
                              <div className="course-search-input-box">
                                <Search size={16} className="course-search-icon" />
                                <input
                                  type="text"
                                  className="course-search-input"
                                  placeholder="Type to search your course (e.g. B.Tech, BCA, MBA, Psychology)..."
                                  value={courseSearchQuery}
                                  onFocus={() => setIsCourseDropdownOpen(true)}
                                  onChange={(e) => {
                                    setCourseSearchQuery(e.target.value);
                                    setIsCourseDropdownOpen(true);
                                    const exact = AMITY_COURSES.find(c => c.name.toLowerCase() === e.target.value.trim().toLowerCase());
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
                                            <span>⏱ Duration: {c.durationYears} Years</span>
                                            <span style={{ color: isOfferedAtCampus ? '#10b981' : '#f87171' }}>
                                              {isOfferedAtCampus ? `✓ Offered at ${signupCampus}` : `✗ Not at ${signupCampus}`}
                                            </span>
                                          </div>
                                        </li>
                                      );
                                    })
                                  ) : (
                                    <li style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center' }}>
                                      No official Amity course matches "{courseSearchQuery}".
                                      <div style={{ color: '#f87171', fontSize: '0.72rem', marginTop: 4 }}>
                                        Only recognized courses from Amity University full-time catalog can be selected.
                                      </div>
                                    </li>
                                  )}
                                </ul>
                              )}

                              {selectedCourse ? (
                                <div className="course-selected-pill">
                                  <div style={{ fontSize: '0.78rem', color: '#f8fafc' }}>
                                    Selected: <strong>{selectedCourse.name}</strong>
                                    <span style={{ display: 'block', color: 'var(--gold-warm)', fontSize: '0.72rem' }}>
                                      Catalog Duration: {selectedCourse.durationYears} Years • Campuses: {selectedCourse.campuses.length}
                                    </span>
                                  </div>
                                  <Check size={16} color="#10b981" />
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: 4, display: 'block' }}>
                                  ⚠️ Please click a course from the search dropdown list to select it.
                                </span>
                              )}

                              {/* Campus Availability Alert */}
                              {!isCampusValid && selectedCourse && (
                                <div className="campus-mismatch-alert animate-fade-in">
                                  <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                                  <div>
                                    <strong style={{ color: '#fca5a5' }}>Course Not Available at this Campus:</strong>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem' }}>
                                      "{selectedCourse.name}" is not offered at the <strong>{signupCampus}</strong> campus.
                                      <span style={{ display: 'block', marginTop: 3, color: '#fca5a5', fontSize: '0.72rem' }}>
                                        Offered only at: {selectedCourse.campuses.join(', ')}
                                      </span>
                                      <span style={{ display: 'block', marginTop: 4, color: '#e2e8f0', fontSize: '0.72rem' }}>
                                        Please recheck your campus selection or contact admissions support at <a href="mailto:admissions-help@amity.edu" style={{ color: 'var(--gold-warm)', textDecoration: 'underline' }}>admissions-help@amity.edu</a>.
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Dual Year Selectors (Year selector 1 - selector 2) */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                                <label className="form-label" style={{ marginBottom: 0 }}>Course Batch Years *</label>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gold-warm)', fontFamily: 'var(--font-mono)' }}>
                                  Selected: {startYear}–{endYear} ({selectedDuration} Yrs)
                                </span>
                              </div>
                              <div className="dual-year-grid">
                                <div>
                                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 3 }}>
                                    Start Year (Selector 1)
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
                                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 3 }}>
                                    End Year (Selector 2)
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

                              {/* Duration Mismatch Alert */}
                              {!isDurationValid && selectedCourse && (
                                <div className="duration-mismatch-alert animate-fade-in">
                                  <AlertTriangle size={16} color="var(--gold-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                                  <div>
                                    <strong style={{ color: 'var(--gold-warm)' }}>Duration Mismatch:</strong>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem' }}>
                                      Selected batch duration is {selectedDuration} year(s) ({startYear}–{endYear}), but <strong>{selectedCourse.name}</strong> requires exactly <strong>{selectedCourse.durationYears} year(s)</strong>.
                                      <br />
                                      <button
                                        type="button"
                                        onClick={() => setEndYear(startYear + Math.max(1, Math.round(selectedCourse.durationYears)))}
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          color: 'var(--gold-warm)',
                                          textDecoration: 'underline',
                                          cursor: 'pointer',
                                          padding: 0,
                                          fontSize: '0.74rem',
                                          fontWeight: 600,
                                          marginTop: 4
                                        }}
                                      >
                                        Click here to auto-align End Year to {startYear + Math.max(1, Math.round(selectedCourse.durationYears))} ✓
                                      </button>
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* Staff Specific Fields */}
                        {signupRole === 'STAFF' && (
                          <div>
                            <label className="form-label">Department / Unit *</label>
                            <select
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
                          disabled={authLoading || (signupRole === 'STUDENT' && (!selectedCourse || !isCampusValid || !isDurationValid))}
                          style={{ marginTop: 8, padding: 14, justifyContent: 'center' }}
                        >
                          {authLoading ? 'Generating Secure OTP...' : 'Send 6-Digit OTP to Amity Email →'}
                        </button>
                      </form>
                    ) : (
                      /* Step 2: OTP Verification */
                      <form onSubmit={handleVerifySignupOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                            Enter the 6-digit verification code sent to:
                          </span>
                          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-warm)', fontWeight: 700, fontSize: '1rem', marginTop: 4 }}>
                            {otpEmail}
                          </div>
                        </div>

                        {/* Dev OTP Helper */}
                        {activeDevOtp && (
                          <div className="dev-otp-pill">
                            <span>⚡ Dev Testing OTP: <strong>{activeDevOtp}</strong></span>
                            <button
                              type="button"
                              onClick={() => setOtpInput(activeDevOtp)}
                              style={{
                                background: 'var(--gold-accent)',
                                color: '#0f172a',
                                border: 'none',
                                borderRadius: 4,
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Auto-Fill OTP
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.78rem', color: '#94a3b8' }}>
                            <span>
                              Expires in: {Math.floor(otpCountdown / 60)}:{('0' + (otpCountdown % 60)).slice(-2)}
                            </span>
                            <button
                              type="button"
                              onClick={handleSendSignupOtp}
                              disabled={resendCooldown > 0 || authLoading}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: resendCooldown > 0 ? '#64748b' : 'var(--gold-warm)',
                                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                fontSize: '0.78rem',
                                textDecoration: 'underline'
                              }}
                            >
                              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend Code'}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={authLoading || otpInput.length !== 6}
                          style={{ padding: 14, justifyContent: 'center' }}
                        >
                          {authLoading ? 'Verifying...' : 'Verify OTP & Complete Registration ✓'}
                        </button>

                        <button
                          type="button"
                          onClick={() => { setAuthStep('FORM'); setAuthError(null); }}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--navy-border)',
                            color: '#94a3b8',
                            padding: 10,
                            borderRadius: 8,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          ← Edit Registration Details
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* ─── TAB 2: SIGN IN (LOGIN WITH OTP) ────────────────────────────── */}
                {authMode === 'LOGIN' && (
                  <div>
                    {authStep === 'FORM' ? (
                      <form onSubmit={handleSendLoginOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                          <label className="form-label">
                            Registered Amity Email (@s.amity.edu or @amity.edu) *
                          </label>
                          <input
                            type="email"
                            className="form-input"
                            placeholder="e.g. arjun.sharma@s.amity.edu or priya.patel@amity.edu"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                            We will send a 6-digit one-time passcode to verify your Amity account.
                          </span>
                        </div>

                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={authLoading}
                          style={{ padding: 14, justifyContent: 'center' }}
                        >
                          {authLoading ? 'Sending Sign-in Code...' : 'Send Sign-in Code →'}
                        </button>

                        <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                          Don't have an account yet?{' '}
                          <button
                            type="button"
                            onClick={() => { setAuthMode('SIGNUP'); setAuthStep('FORM'); setAuthError(null); }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--gold-warm)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Register as Student or Staff
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Login Step 2: Enter OTP */
                      <form onSubmit={handleVerifyLoginOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                            Enter the 6-digit sign-in passcode sent to:
                          </span>
                          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-warm)', fontWeight: 700, fontSize: '1rem', marginTop: 4 }}>
                            {otpEmail}
                          </div>
                        </div>

                        {/* Dev OTP Helper */}
                        {activeDevOtp && (
                          <div className="dev-otp-pill">
                            <span>⚡ Dev Testing OTP: <strong>{activeDevOtp}</strong></span>
                            <button
                              type="button"
                              onClick={() => setOtpInput(activeDevOtp)}
                              style={{
                                background: 'var(--gold-accent)',
                                color: '#0f172a',
                                border: 'none',
                                borderRadius: 4,
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Auto-Fill OTP
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.78rem', color: '#94a3b8' }}>
                            <span>
                              Expires in: {Math.floor(otpCountdown / 60)}:{('0' + (otpCountdown % 60)).slice(-2)}
                            </span>
                            <button
                              type="button"
                              onClick={handleSendLoginOtp}
                              disabled={resendCooldown > 0 || authLoading}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: resendCooldown > 0 ? '#64748b' : 'var(--gold-warm)',
                                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                fontSize: '0.78rem',
                                textDecoration: 'underline'
                              }}
                            >
                              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend Code'}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={authLoading || otpInput.length !== 6}
                          style={{ padding: 14, justifyContent: 'center' }}
                        >
                          {authLoading ? 'Verifying...' : 'Verify & Sign In ✓'}
                        </button>

                        <button
                          type="button"
                          onClick={() => { setAuthStep('FORM'); setAuthError(null); }}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--navy-border)',
                            color: '#94a3b8',
                            padding: 10,
                            borderRadius: 8,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          ← Change Amity Email
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* ─── TAB 3: FAST-PASS (DEV/EVALUATION PERSONAS) ──────────────────── */}
                {authMode === 'FASTPASS' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="auth-divider">Official Amity Sample Personas</div>
                    <div className="persona-fastpass-grid">
                      <div
                        className="persona-fastpass-card"
                        onClick={() => { switchPersona('arjun.sharma@s.amity.edu'); setShowAuthModal(false); }}
                      >
                        <strong>🎓 Arjun Sharma</strong>
                        <span>Student • A230522001</span>
                        <span style={{ color: 'var(--gold-warm)', fontSize: '0.7rem' }}>B.Tech CSE (2023-2027)</span>
                      </div>
                      <div
                        className="persona-fastpass-card"
                        onClick={() => { switchPersona('priya.patel@amity.edu'); setShowAuthModal(false); }}
                      >
                        <strong>💻 Priya Patel</strong>
                        <span>Staff • IT & Lab Specialist</span>
                        <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>priya.patel@amity.edu</span>
                      </div>
                      <div
                        className="persona-fastpass-card"
                        onClick={() => { switchPersona('ramesh.kumar@amity.edu'); setShowAuthModal(false); }}
                      >
                        <strong>🔧 Ramesh Kumar</strong>
                        <span>Staff • Facilities Maintenance</span>
                        <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>ramesh.kumar@amity.edu</span>
                      </div>
                      <div
                        className="persona-fastpass-card"
                        onClick={() => { switchPersona('dr.vikram.sen@amity.edu'); setShowAuthModal(false); }}
                      >
                        <strong>🏛️ Dr. Vikram Sen</strong>
                        <span>Dean • Operations & Admin</span>
                        <span style={{ color: '#e879f9', fontSize: '0.7rem' }}>dr.vikram.sen@amity.edu</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── ACTIVE SESSION CARD (IF LOGGED IN) ─────────────────────────── */}
                {currentUser && (
                  <div style={{
                    marginTop: 8,
                    background: '#0d1527',
                    border: '1px solid var(--navy-border)',
                    borderRadius: 8,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--gold-warm)', fontWeight: 700 }}>
                          Active Amity Session
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                          {currentUser.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                          {currentUser.email}
                        </div>
                        {currentUser.enrollmentNo && (
                          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: 4 }}>
                            Enrollment: <strong style={{ color: 'var(--gold-warm)' }}>{currentUser.enrollmentNo}</strong>
                            {currentUser.course ? ` • ${currentUser.course}` : ''}
                            {currentUser.batchYear ? ` (${currentUser.batchYear})` : ''}
                          </div>
                        )}
                        {currentUser.campus && (
                          <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginTop: 2 }}>
                            Campus Branch: <strong style={{ color: '#bae6fd' }}>Amity University — {currentUser.campus}</strong>
                          </div>
                        )}
                      </div>
                      <span className={`status-badge status-${currentUser.role === 'STUDENT' ? 'VERIFIED' : 'ASSIGNED'}`}>
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '8px 12px',
                        borderRadius: 6,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={15} /> Sign Out Current Session
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
