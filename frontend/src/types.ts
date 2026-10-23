import type { AmityCourse } from './data/amityCourses';

export interface User {
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

export interface DepartmentItem {
  id: string;
  name: string;
}

export interface LocationItem {
  id: string;
  buildingId: string;
  floor: number;
  roomCode: string;
  name: string;
  qrToken: string;
  type: string;
}

export interface CommentItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  body: string;
  internal: boolean;
  createdAt: string;
}

export interface StatusHistoryItem {
  id: string;
  fromStatus?: string;
  toStatus: string;
  changedByName: string;
  reason?: string;
  changedAt: string;
}

export interface IssueItem {
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

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  readAt?: string;
  createdAt: string;
}

export interface Metrics {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  issuesByDepartment: Record<string, number>;
  issuesByCategory: Record<string, number>;
}

export type { AmityCourse };
