import { Send, AlertTriangle, Flame, Monitor, Wrench, Sparkles, Zap, FlaskConical, Clock, ShieldCheck } from 'lucide-react';
import type { LocationItem, IssueItem } from '../types';

interface ReportIssueProps {
  locations: LocationItem[];
  issues: IssueItem[];
  reportLocId: string;
  setReportLocId: (id: string) => void;
  reportCategory: string;
  setReportCategory: (cat: string) => void;
  reportDesc: string;
  setReportDesc: (desc: string) => void;
  reportSeverity: number;
  setReportSeverity: (sev: number) => void;
  reportSafety: boolean;
  setReportSafety: (safety: boolean) => void;
  loading: boolean;
  onSubmitReport: (e: React.FormEvent) => void;
  onSelectIssue: (issue: IssueItem) => void;
}

const CATEGORIES = [
  { id: 'IT', label: 'IT & AV', icon: Monitor },
  { id: 'Maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'Housekeeping', label: 'Housekeeping', icon: Sparkles },
  { id: 'Electrical', label: 'Electrical', icon: Zap },
  { id: 'Lab', label: 'Lab Equipment', icon: FlaskConical },
];

const SEVERITIES = [
  { level: 1, title: 'Minor', sub: 'Low disruption' },
  { level: 2, title: 'Moderate', sub: 'Impaired use' },
  { level: 3, title: 'Standard', sub: 'Core malfunction' },
  { level: 4, title: 'Urgent', sub: 'Severe impact' },
  { level: 5, title: 'Blocker', sub: 'Immediate halt' },
];

export function ReportIssue({
  locations,
  issues,
  reportLocId,
  setReportLocId,
  reportCategory,
  setReportCategory,
  reportDesc,
  setReportDesc,
  reportSeverity,
  setReportSeverity,
  reportSafety,
  setReportSafety,
  loading,
  onSubmitReport,
  onSelectIssue
}: ReportIssueProps) {
  // Existing open issues at the selected location
  const duplicateCandidates = issues.filter(
    (i) =>
      i.locationId === reportLocId &&
      !['RESOLVED', 'CLOSED', 'REJECTED'].includes(i.status)
  );

  const selectedLoc = locations.find((l) => l.id === reportLocId);

  return (
    <div className="report-split-layout animate-fade-in">
      {/* Main Form Column */}
      <div className="report-form-column">
        <div className="report-form-intro">
          <h2 className="report-headline">File a Campus Problem</h2>
          <p className="report-subtext">
            Submit facilities, IT, electrical, or equipment issues for immediate dispatch.
          </p>
        </div>

        <form onSubmit={onSubmitReport} className="report-form-flow">
          {/* Location Picker */}
          <div className="form-group">
            <label className="form-label" htmlFor="report-location">
              Campus Room / Space *
            </label>
            <select
              id="report-location"
              className="form-select"
              value={reportLocId}
              onChange={(e) => setReportLocId(e.target.value)}
              required
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.roomCode} — {loc.name} (Floor {loc.floor} • {loc.type})
                </option>
              ))}
            </select>
          </div>

          {/* Category Picker */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <div className="category-chips">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = reportCategory === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    className={`category-chip ${isActive ? 'active' : ''}`}
                    onClick={() => setReportCategory(cat.id)}
                  >
                    <Icon size={14} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="report-description">
              Problem Description *
            </label>
            <textarea
              id="report-description"
              rows={4}
              className="form-textarea"
              placeholder="Provide specific details: device name, room position, or error message (e.g., Projector ceiling HDMI drops connection after 5 mins)"
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              required
            />
          </div>

          {/* Restrained Severity Segmented Control */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="form-label">
                Operational Severity (Level {reportSeverity})
              </label>
              <span style={{ fontSize: '0.74rem', color: 'var(--gold-hover)', fontWeight: 600 }}>
                {SEVERITIES.find((s) => s.level === reportSeverity)?.title} Impact
              </span>
            </div>

            <div className="severity-segmented-grid">
              {SEVERITIES.map((sev) => {
                const isSelected = reportSeverity === sev.level;
                return (
                  <button
                    type="button"
                    key={sev.level}
                    className={`severity-segment-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setReportSeverity(sev.level)}
                  >
                    <span className="severity-number">{sev.level}</span>
                    <span className="severity-title">{sev.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safety Hazard Override */}
          <div className={`safety-override-card ${reportSafety ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="safety-override-icon">
                <Flame size={18} />
              </div>
              <div>
                <div className="safety-override-title">Safety Hazard Override</div>
                <div className="safety-override-desc">
                  Exposed wiring, chemical spill, water near electricals. Triages priority to 100.
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              id="safety-checkbox"
              checked={reportSafety}
              onChange={(e) => setReportSafety(e.target.checked)}
              className="safety-override-checkbox"
              aria-label="Safety hazard override"
            />
          </div>

          {/* Submit Action */}
          <div style={{ paddingTop: 8 }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px 24px', fontSize: '0.94rem' }}
              disabled={loading}
            >
              <Send size={16} />
              <span>{loading ? 'Submitting & Dispatching...' : 'Submit Campus Work Order'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Side Context & Duplicate Alert Column */}
      <div className="report-context-column">
        {/* Selected Room Metadata */}
        {selectedLoc && (
          <div className="context-card">
            <div className="context-card-label">TARGET LOCATION</div>
            <div className="context-room-name">{selectedLoc.roomCode} — {selectedLoc.name}</div>
            <div className="context-room-sub">
              Floor {selectedLoc.floor} • Type: {selectedLoc.type}
            </div>
          </div>
        )}

        {/* Real-time Duplicate Hint */}
        {duplicateCandidates.length > 0 ? (
          <div className="context-duplicate-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#C58A28', fontWeight: 700, fontSize: '0.8rem' }}>
              <AlertTriangle size={15} />
              <span>Active Reports at this Spot ({duplicateCandidates.length})</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#68758A', margin: '4px 0 10px' }}>
              Support an existing issue with "+1" to boost its dispatch urgency rather than submitting a duplicate.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {duplicateCandidates.slice(0, 3).map((ex) => (
                <div key={ex.id} className="duplicate-item-row">
                  <div>
                    <span className="duplicate-ticket-code">{ex.ticketNo}</span>
                    <span className="duplicate-desc-snippet">{ex.description}</span>
                  </div>
                  <button
                    type="button"
                    className="duplicate-support-btn"
                    onClick={() => onSelectIssue(ex)}
                  >
                    View / +1
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="context-card" style={{ background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#248568', fontWeight: 600, fontSize: '0.78rem' }}>
              <ShieldCheck size={15} />
              <span>No Prior Open Tickets</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#68758A', marginTop: 4 }}>
              This spot has no pending unresolved reports.
            </p>
          </div>
        )}

        {/* Dispatch Protocol Note */}
        <div className="context-card">
          <div className="context-card-label">DISPATCH PROTOCOL</div>
          <ul className="context-protocol-list">
            <li>
              <Clock size={12} />
              <span>Standard response SLA: Under 2 hours during class hours</span>
            </li>
            <li>
              <ShieldCheck size={12} />
              <span>Student verification required upon work completion</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
