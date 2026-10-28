import { useState, useMemo } from 'react';
import { Check, X, ArrowRight, ArrowUpRight, Play, CheckCircle2, MapPin, Search } from 'lucide-react';
import type { IssueItem, User } from '../types';

interface StaffQueueProps {
  issues: IssueItem[];
  currentUser: User | null;
  onAdvanceStatus: (issueId: string, toStatus: string, reason?: string) => void;
  onSelectIssue: (issue: IssueItem) => void;
}

export function StaffQueue({
  issues,
  currentUser: _currentUser,
  onAdvanceStatus,
  onSelectIssue
}: StaffQueueProps) {
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const stageFilteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (filterStage !== 'ALL' && issue.status !== filterStage) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          issue.ticketNo.toLowerCase().includes(q) ||
          issue.description.toLowerCase().includes(q) ||
          issue.roomCode.toLowerCase().includes(q) ||
          issue.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [issues, filterStage, searchQuery]);

  return (
    <div className="register-container animate-fade-in">
      {/* Action Queue Header Toolbar */}
      <div className="register-toolbar">
        <div className="register-filter-pills">
          {['ALL', 'SUBMITTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((stage) => {
            const count = stage === 'ALL' ? issues.length : issues.filter((i) => i.status === stage).length;
            return (
              <button
                type="button"
                key={stage}
                className={`register-pill ${filterStage === stage ? 'active' : ''}`}
                onClick={() => setFilterStage(stage)}
              >
                {stage === 'ALL' ? 'All Jobs' : stage} ({count})
              </button>
            );
          })}
        </div>

        <div className="register-toolbar-tools">
          <div className="register-search-box">
            <Search size={14} className="register-search-icon" />
            <input
              type="text"
              placeholder="Filter jobs..."
              className="register-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Jobs Work Order Register */}
      {stageFilteredIssues.length === 0 ? (
        <div className="register-empty-state">
          <div className="register-empty-title">Queue is clear</div>
          <p className="register-empty-sub">
            No work orders currently pending in {filterStage}.
          </p>
        </div>
      ) : (
        <div className="register-table-wrapper">
          <table className="register-table">
            <thead>
              <tr>
                <th style={{ width: 120 }}>Ticket</th>
                <th style={{ width: 105 }}>Status</th>
                <th style={{ width: 100 }}>Priority</th>
                <th style={{ width: 130 }}>Location</th>
                <th>Work Order Description</th>
                <th style={{ width: 130 }}>Reporter</th>
                <th style={{ width: 230, textAlign: 'right' }}>Action Transition</th>
              </tr>
            </thead>
            <tbody>
              {stageFilteredIssues.map((job) => (
                <tr key={job.id} className="register-row" onClick={() => onSelectIssue(job)}>
                  <td>
                    <span className="register-ticket-code">{job.ticketNo}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${job.status}`}>{job.status}</span>
                  </td>
                  <td>
                    <span className={`priority-pill priority-${job.priorityLevel}`}>{job.priorityLevel}</span>
                  </td>
                  <td>
                    <div className="register-loc-cell">
                      <MapPin size={12} color="var(--gold-hover)" />
                      <span className="register-room-code">{job.roomCode}</span>
                    </div>
                  </td>
                  <td>
                    <div className="register-desc-cell">
                      <span className="register-desc-text">{job.description}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#68758A' }}>{job.reporterName}</span>
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {job.status === 'SUBMITTED' && (
                        <>
                          <button
                            type="button"
                            className="queue-action-btn queue-verify"
                            onClick={() => onAdvanceStatus(job.id, 'VERIFIED', 'Verified on-site by staff')}
                          >
                            <Check size={12} /> Verify
                          </button>
                          <button
                            type="button"
                            className="queue-action-btn queue-reject"
                            onClick={() => onAdvanceStatus(job.id, 'REJECTED', 'Marked as invalid')}
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}

                      {job.status === 'VERIFIED' && (
                        <button
                          type="button"
                          className="queue-action-btn queue-claim"
                          onClick={() => onAdvanceStatus(job.id, 'ASSIGNED', 'Assigned to duty technician')}
                        >
                          <ArrowRight size={12} /> Claim Job
                        </button>
                      )}

                      {job.status === 'ASSIGNED' && (
                        <button
                          type="button"
                          className="queue-action-btn queue-start"
                          onClick={() => onAdvanceStatus(job.id, 'IN_PROGRESS', 'Work started on-site')}
                        >
                          <Play size={12} /> Start Work
                        </button>
                      )}

                      {job.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          className="queue-action-btn queue-resolve"
                          onClick={() => onAdvanceStatus(job.id, 'RESOLVED', 'Issue resolved and tested')}
                        >
                          <CheckCircle2 size={12} /> Resolve
                        </button>
                      )}

                      <button
                        type="button"
                        className="queue-action-btn"
                        onClick={() => onSelectIssue(job)}
                      >
                        Dossier <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
