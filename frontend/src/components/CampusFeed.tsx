import { useState, useMemo } from 'react';
import { RefreshCw, MapPin, ThumbsUp, Search, Send, Clock, ArrowUpRight, Flame } from 'lucide-react';
import type { IssueItem, User } from '../types';

interface CampusFeedProps {
  issues: IssueItem[];
  currentUser: User | null;
  feedFilter: 'ALL' | 'MINE' | 'CRITICAL' | 'OPEN';
  setFeedFilter: (filter: 'ALL' | 'MINE' | 'CRITICAL' | 'OPEN') => void;
  onRefresh: () => void;
  onSelectIssue: (issue: IssueItem) => void;
  onToggleSupport: (issueId: string, e?: React.MouseEvent) => void;
  onNavigateToReport: () => void;
}

export function CampusFeed({
  issues,
  currentUser,
  feedFilter,
  setFeedFilter,
  onRefresh,
  onSelectIssue,
  onToggleSupport,
  onNavigateToReport
}: CampusFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (feedFilter === 'MINE') {
        if (!currentUser || issue.reporterId !== currentUser.id) return false;
      }
      if (feedFilter === 'CRITICAL') {
        if (issue.priorityLevel !== 'CRITICAL') return false;
      }
      if (feedFilter === 'OPEN') {
        if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(issue.status)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTicket = issue.ticketNo.toLowerCase().includes(q);
        const matchesDesc = issue.description.toLowerCase().includes(q);
        const matchesLoc = issue.roomCode.toLowerCase().includes(q) || (issue.locationName || '').toLowerCase().includes(q);
        const matchesCat = issue.category.toLowerCase().includes(q);
        const matchesDept = (issue.departmentName || '').toLowerCase().includes(q);
        if (!matchesTicket && !matchesDesc && !matchesLoc && !matchesCat && !matchesDept) return false;
      }

      return true;
    });
  }, [issues, feedFilter, currentUser, searchQuery]);

  return (
    <div className="register-container animate-fade-in">
      {/* Operational Filter Toolbar */}
      <div className="register-toolbar">
        <div className="register-filter-pills">
          <button
            type="button"
            className={`register-pill ${feedFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFeedFilter('ALL')}
          >
            All Reports ({issues.length})
          </button>
          <button
            type="button"
            className={`register-pill ${feedFilter === 'MINE' ? 'active' : ''}`}
            onClick={() => setFeedFilter('MINE')}
          >
            My Reports
          </button>
          <button
            type="button"
            className={`register-pill ${feedFilter === 'CRITICAL' ? 'active' : ''}`}
            onClick={() => setFeedFilter('CRITICAL')}
          >
            <Flame size={13} color={feedFilter === 'CRITICAL' ? '#FFFFFF' : '#C84A4A'} />
            Critical Only
          </button>
          <button
            type="button"
            className={`register-pill ${feedFilter === 'OPEN' ? 'active' : ''}`}
            onClick={() => setFeedFilter('OPEN')}
          >
            Active Pipeline
          </button>
        </div>

        <div className="register-toolbar-tools">
          <div className="register-search-box">
            <Search size={14} className="register-search-icon" />
            <input
              type="text"
              placeholder="Filter by ticket, room, description..."
              className="register-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="register-refresh-btn"
            onClick={onRefresh}
            title="Refresh register"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Structured Operational Register Table / List */}
      {filteredIssues.length === 0 ? (
        <div className="register-empty-state">
          <div className="register-empty-title">No issues matching this filter</div>
          <p className="register-empty-sub">
            {feedFilter === 'MINE'
              ? 'You have not submitted any reports yet.'
              : feedFilter === 'CRITICAL'
              ? 'No critical safety hazards are currently open on campus.'
              : 'Try clearing your search query or log a new campus problem.'}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={onNavigateToReport}
            style={{ marginTop: 12, fontSize: '0.84rem', padding: '8px 16px' }}
          >
            <Send size={14} /> Report an Issue
          </button>
        </div>
      ) : (
        <div className="register-table-wrapper">
          <table className="register-table">
            <thead>
              <tr>
                <th style={{ width: 130 }}>Ticket</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 110 }}>Priority</th>
                <th style={{ width: 140 }}>Location</th>
                <th>Issue Description</th>
                <th style={{ width: 130 }}>Support</th>
                <th style={{ width: 90 }}>Logged</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => {
                const isCritical = issue.priorityLevel === 'CRITICAL';
                return (
                  <tr
                    key={issue.id}
                    className={`register-row ${isCritical ? 'critical-row' : ''}`}
                    onClick={() => onSelectIssue(issue)}
                  >
                    <td>
                      <span className="register-ticket-code">{issue.ticketNo}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${issue.status}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-pill priority-${issue.priorityLevel}`}>
                        {issue.priorityLevel}
                      </span>
                    </td>
                    <td>
                      <div className="register-loc-cell">
                        <MapPin size={12} color="var(--gold-hover)" />
                        <span className="register-room-code">{issue.roomCode}</span>
                        <span className="register-room-sub">{issue.category}</span>
                      </div>
                    </td>
                    <td>
                      <div className="register-desc-cell">
                        <span className="register-desc-text">{issue.description}</span>
                        {issue.departmentName && (
                          <span className="register-dept-tag">{issue.departmentName}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`support-btn ${issue.userHasSupported ? 'supported' : ''}`}
                        onClick={(e) => onToggleSupport(issue.id, e)}
                        title="Mark affected"
                      >
                        <ThumbsUp size={12} />
                        <span>+{issue.supporterCount}</span>
                      </button>
                    </td>
                    <td>
                      <span className="register-time-text">
                        <Clock size={11} style={{ verticalAlign: '-1px', marginRight: 3 }} />
                        {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ArrowUpRight size={15} className="register-inspect-icon" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
