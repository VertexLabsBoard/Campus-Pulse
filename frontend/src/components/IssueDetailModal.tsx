import { useState } from 'react';
import { X, MapPin, CheckCircle2, Star, Send, ShieldAlert, User, Tag, Building, AlertCircle } from 'lucide-react';
import type { IssueItem, User as CurrentUser } from '../types';

interface IssueDetailModalProps {
  selectedIssue: IssueItem;
  currentUser: CurrentUser | null;
  onClose: () => void;
  onConfirmResolution: (issueId: string, fixed: boolean, rating: number, comment: string) => void;
  onAddComment: (issueId: string, text: string, isInternal: boolean) => void;
  onOverridePriority: (issueId: string, level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', reason: string) => void;
}

export function IssueDetailModal({
  selectedIssue,
  currentUser,
  onClose,
  onConfirmResolution,
  onAddComment,
  onOverridePriority
}: IssueDetailModalProps) {
  // Feedback state for student verification
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Comment input state
  const [newCommentText, setNewCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  // Admin Priority Override state
  const [overrideLevel, setOverrideLevel] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>(
    selectedIssue.priorityLevel || 'CRITICAL'
  );
  const [overrideReason, setOverrideReason] = useState('');

  const handleCommentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(selectedIssue.id, newCommentText.trim(), isInternalComment);
    setNewCommentText('');
  };

  const handleOverrideSubmit = () => {
    if (!overrideReason.trim()) return;
    onOverridePriority(selectedIssue.id, overrideLevel, overrideReason.trim());
    setOverrideReason('');
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 820 }}>
        {/* Header Strip */}
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span className="ticket-number" style={{ fontSize: '1.25rem', color: 'var(--ink-primary)' }}>
              {selectedIssue.ticketNo}
            </span>
            <span className={`status-badge status-${selectedIssue.status}`}>
              {selectedIssue.status}
            </span>
            <span className={`priority-pill priority-${selectedIssue.priorityLevel}`}>
              {selectedIssue.priorityLevel}
            </span>
            {selectedIssue.safetyFlag && (
              <span style={{
                background: '#FFF1F0',
                color: '#CF1322',
                border: '1px solid #FFA39E',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)'
              }}>
                🚨 SAFETY FLAG OVERRIDE
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', color: 'var(--text-muted)', padding: 6, borderRadius: 4 }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Dossier Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 12,
            background: 'var(--surface-raised)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-base)'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} /> Location
              </span>
              <strong style={{ color: 'var(--ink-primary)', fontSize: '0.88rem', display: 'block', marginTop: 2 }}>
                {selectedIssue.roomCode} — {selectedIssue.locationName}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Tag size={11} /> Category
              </span>
              <strong style={{ color: 'var(--gold-deep)', fontSize: '0.88rem', display: 'block', marginTop: 2 }}>
                {selectedIssue.category}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Building size={11} /> Dispatch Unit
              </span>
              <strong style={{ color: 'var(--info-sapphire)', fontSize: '0.88rem', display: 'block', marginTop: 2 }}>
                {selectedIssue.departmentName || 'General Campus Operations'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={11} /> Logged By
              </span>
              <strong style={{ color: 'var(--ink-primary)', fontSize: '0.88rem', display: 'block', marginTop: 2 }}>
                {selectedIssue.reporterName}
              </strong>
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <h4 style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 6 }}>
              Incident Description
            </h4>
            <div style={{
              fontSize: '0.96rem',
              color: 'var(--text-primary)',
              lineHeight: 1.55,
              background: '#FAFBFC',
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              {selectedIssue.description}
            </div>
          </div>

          {/* Explainable Priority Breakdown */}
          {selectedIssue.priorityExplanation && (
            <div style={{
              background: '#FFFDF7',
              border: '1px solid rgba(221, 170, 53, 0.4)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={16} color="var(--gold-deep)" />
                  <span style={{ fontWeight: 700, color: 'var(--gold-deep)', fontSize: '0.86rem' }}>
                    Algorithmic Explainable Priority Score: {selectedIssue.priorityScore || selectedIssue.priorityExplanation.score} / 100
                  </span>
                </div>
                <span className={`priority-pill priority-${selectedIssue.priorityLevel}`}>
                  {selectedIssue.priorityLevel}
                </span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {selectedIssue.priorityExplanation.reasons?.map((r, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {selectedIssue.priorityOverrideReason && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(221, 170, 53, 0.25)', fontSize: '0.78rem', color: 'var(--info-sapphire)' }}>
                  <strong>Dean's Override Note:</strong> {selectedIssue.priorityOverrideReason}
                </div>
              )}
            </div>
          )}

          {/* Admin Priority Override Tool (Staff / Dean) */}
          {currentUser?.role === 'ADMIN' && (
            <div style={{
              background: '#F0F7FF',
              border: '1px solid #BFDBFE',
              padding: '16px 18px',
              borderRadius: 'var(--radius-md)'
            }}>
              <h5 style={{ color: '#1E40AF', fontWeight: 700, fontSize: '0.86rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={15} /> Dean's Priority Override Tool
              </h5>
              <p style={{ fontSize: '0.76rem', color: '#1E3A8A', marginBottom: 10 }}>
                University policy requires an explicit written justification for manual priority adjustments.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select
                  className="form-select"
                  value={overrideLevel}
                  onChange={(e) => setOverrideLevel(e.target.value as any)}
                  style={{ width: 130, fontSize: '0.84rem' }}
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>

                <input
                  type="text"
                  className="form-input"
                  placeholder="Mandatory administrative justification..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  style={{ flex: '1 1 240px', fontSize: '0.84rem' }}
                />

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleOverrideSubmit}
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  Apply Override
                </button>
              </div>
            </div>
          )}

          {/* Student Resolution Verification Card ("Is it fixed?") */}
          {selectedIssue.status === 'RESOLVED' && (
            <div style={{
              background: '#F0FDF4',
              border: '1.5px solid #22C55E',
              borderRadius: 'var(--radius-md)',
              padding: '20px 22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <CheckCircle2 size={22} color="#16A34A" />
                <h4 style={{ color: '#14532D', fontSize: '1.05rem', fontWeight: 700 }}>
                  Staff marked this as RESOLVED. Can you confirm it's fixed?
                </h4>
              </div>
              <p style={{ color: '#166534', fontSize: '0.84rem', marginBottom: 14 }}>
                Student on-site verification guarantees facilities accountability. Confirming closes the ticket; clicking 'No' reopens it with your note.
              </p>

              {/* Star Rating & Comment */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#14532D' }}>Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      color={star <= feedbackRating ? 'var(--gold-primary)' : '#CBD5E1'}
                      fill={star <= feedbackRating ? 'var(--gold-primary)' : 'none'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setFeedbackRating(star)}
                    />
                  ))}
                </div>

                <input
                  type="text"
                  className="form-input"
                  placeholder="Optional verification note or feedback..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  style={{ flex: '1 1 240px', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ background: '#16A34A', border: '1px solid #15803D', flex: '1 1 200px' }}
                  onClick={() => onConfirmResolution(selectedIssue.id, true, feedbackRating, feedbackComment)}
                >
                  ✓ Yes, It's Fixed (Close Ticket)
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ color: '#CF1322', borderColor: '#FFCCC7', background: '#FFF1F0', flex: '1 1 200px' }}
                  onClick={() => onConfirmResolution(selectedIssue.id, false, feedbackRating, feedbackComment)}
                >
                  ✕ Still Broken (Reopen Ticket)
                </button>
              </div>
            </div>
          )}

          {/* Audit History & Status Timeline */}
          <div>
            <h4 style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 12 }}>
              Audit History & Status Timeline
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderLeft: '2px solid var(--border-base)', paddingLeft: 16, marginLeft: 6 }}>
              {selectedIssue.history && selectedIssue.history.length > 0 ? (
                selectedIssue.history.map((h, i) => (
                  <div key={h.id || i} style={{ position: 'relative', fontSize: '0.84rem' }}>
                    <div style={{
                      position: 'absolute',
                      left: -21,
                      top: 4,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--gold-primary)',
                      border: '2px solid #FFFFFF'
                    }} />
                    <div>
                      <span style={{ color: 'var(--ink-primary)', fontWeight: 700 }}>{h.toStatus}</span>
                      <span style={{ color: 'var(--text-secondary)' }}> — {h.reason || 'Status update'} (by {h.changedByName})</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>
                      {new Date(h.changedAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Reported on {new Date(selectedIssue.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Discussion & Comments Activity */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 18 }}>
            <h4 style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 14 }}>
              Activity & Comments ({selectedIssue.comments?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {selectedIssue.comments?.length === 0 ? (
                <div style={{ padding: '14px 16px', background: '#FAFBFC', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No comments yet on this ticket.
                </div>
              ) : (
                selectedIssue.comments?.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: c.internal ? '#FFFDF5' : '#FAFBFC',
                      border: c.internal ? '1px dashed var(--gold-primary)' : '1px solid var(--border-base)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: '0.76rem' }}>
                      <strong style={{ color: c.internal ? 'var(--gold-deep)' : 'var(--ink-primary)' }}>
                        {c.authorName} ({c.authorRole}) {c.internal && '• Internal Staff Note'}
                      </strong>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.45 }}>
                      {c.body}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add an operational update or comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                style={{ flex: 1, fontSize: '0.86rem' }}
              />

              {currentUser?.role !== 'STUDENT' && (
                <button
                  type="button"
                  onClick={() => setIsInternalComment(!isInternalComment)}
                  style={{
                    padding: '8px 12px',
                    background: isInternalComment ? 'var(--gold-primary)' : '#EDF1F7',
                    color: isInternalComment ? '#101827' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                  title="Toggle Staff Internal Note"
                >
                  Internal Note {isInternalComment ? '✓' : ''}
                </button>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '9px 16px' }}
                disabled={!newCommentText.trim()}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
