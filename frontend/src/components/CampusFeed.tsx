import { useState, useMemo } from 'react';
import { RefreshCw, MapPin, ThumbsUp, Search, Send, Clock, ArrowUpRight, Flame, RotateCcw, Filter } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Dynamic filter options extracted from active issues
  const statusOptions = useMemo(() => {
    return Array.from(new Set(issues.map((i) => i.status))).sort();
  }, [issues]);

  const priorityOptions = useMemo(() => {
    return Array.from(new Set(issues.map((i) => i.priorityLevel))).sort();
  }, [issues]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(issues.map((i) => i.category))).sort();
  }, [issues]);

  const isAnyFilterActive =
    searchQuery.trim() !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    categoryFilter !== 'ALL';

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
  };

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // 1. Existing tabs
      if (feedFilter === 'MINE') {
        if (!currentUser || issue.reporterId !== currentUser.id) return false;
      }
      if (feedFilter === 'CRITICAL') {
        if (issue.priorityLevel !== 'CRITICAL') return false;
      }
      if (feedFilter === 'OPEN') {
        if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(issue.status)) return false;
      }

      // 2. Dropdown filters (Abhishek feature)
      if (statusFilter !== 'ALL' && issue.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && issue.priorityLevel !== priorityFilter) return false;
      if (categoryFilter !== 'ALL' && issue.category !== categoryFilter) return false;

      // 3. Search query
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
  }, [issues, feedFilter, currentUser, searchQuery, statusFilter, priorityFilter, categoryFilter]);

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
              aria-label="Filter tickets"
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

      {/* Multi-Dropdown Filter Bar (Abhishek's search & filter feature) */}
      <div className="register-secondary-filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
          <Filter size={13} />
          <span>Filters:</span>
        </div>

        <select
          className="register-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="ALL">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        <select
          className="register-filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="ALL">All Priorities</option>
          {priorityOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          className="register-filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="ALL">All Categories</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {isAnyFilterActive && (
          <button
            type="button"
            className="register-clear-btn"
            onClick={handleClearFilters}
            title="Reset all active filters"
          >
            <RotateCcw size={12} />
            <span>Clear filters</span>
          </button>
        )}

        <span className="register-filter-count">
          Showing {filteredIssues.length} of {issues.length}
        </span>
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
              : isAnyFilterActive
              ? 'No issues match your active search and filter combination.'
              : 'Try clearing your search query or log a new campus problem.'}
          </p>
          {isAnyFilterActive ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClearFilters}
              style={{ marginTop: 12, fontSize: '0.84rem', padding: '8px 16px' }}
            >
              <RotateCcw size={14} /> Clear Active Filters
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={onNavigateToReport}
              style={{ marginTop: 12, fontSize: '0.84rem', padding: '8px 16px' }}
            >
              <Send size={14} /> Report an Issue
            </button>
          )}
        </div>
      ) : (
        <div className="register-table-wrapper">
          <table className="register-table">
            <colgroup>
              <col className="register-col-ticket" />
              <col className="register-col-status" />
              <col className="register-col-priority" />
              <col className="register-col-location" />
              <col className="register-col-description" />
              <col className="register-col-support" />
              <col className="register-col-time" />
              <col className="register-col-action" />
            </colgroup>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Location</th>
                <th>Issue Description</th>
                <th>Support</th>
                <th className="register-time-column">Logged</th>
                <th className="register-action-column" aria-label="View details"></th>
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
                        <span className="register-room-code" title={issue.roomCode}>{issue.roomCode}</span>
                        <span className="register-room-sub" title={issue.category}>{issue.category}</span>
                      </div>
                    </td>
                    <td>
                      <div className="register-desc-cell">
                        <span className="register-desc-text" title={issue.description}>{issue.description}</span>
                        {issue.departmentName && (
                          <span className="register-dept-tag">{issue.departmentName}</span>
                        )}
                      </div>
                    </td>
                    <td className="register-time-column">
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
                    <td className="register-action-column">
                      <ArrowUpRight size={15} className="register-inspect-icon" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="register-mobile-list">
            {filteredIssues.map((issue) => (
              <article
                key={issue.id}
                className={`register-mobile-card ${issue.priorityLevel === 'CRITICAL' ? 'critical-row' : ''}`}
                onClick={() => onSelectIssue(issue)}
              >
                <div className="register-mobile-card-top">
                  <span className="register-ticket-code">{issue.ticketNo}</span>
                  <span className={`status-badge status-${issue.status}`}>{issue.status}</span>
                </div>
                <p className="register-mobile-description" title={issue.description}>{issue.description}</p>
                <div className="register-mobile-location">
                  <MapPin size={14} />
                  <strong title={issue.roomCode}>{issue.roomCode}</strong>
                  <span title={issue.category}>{issue.category}</span>
                </div>
                <div className="register-mobile-card-bottom">
                  <span className={`priority-pill priority-${issue.priorityLevel}`}>{issue.priorityLevel}</span>
                  <button
                    type="button"
                    className={`support-btn ${issue.userHasSupported ? 'supported' : ''}`}
                    onClick={(e) => onToggleSupport(issue.id, e)}
                    title="Mark affected"
                  >
                    <ThumbsUp size={12} /> <span>+{issue.supporterCount}</span>
                  </button>
                  <span className="register-time-text">{new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
