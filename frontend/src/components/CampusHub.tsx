import { useState, useMemo } from 'react';
import { QrCode, Printer, AlertTriangle, Send, ThumbsUp, CheckCircle2, Search, Filter } from 'lucide-react';
import type { LocationItem, IssueItem } from '../types';

interface CampusHubProps {
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  locationActiveIssues: IssueItem[];
  onScanLocation: (token: string) => void;
  onOpenPrintModal: () => void;
  onFileReportAtLocation: (locationId: string) => void;
  onToggleSupport: (issueId: string, e?: React.MouseEvent) => void;
  onSelectIssue: (issue: IssueItem) => void;
}

export function CampusHub({
  locations,
  selectedLocation,
  locationActiveIssues,
  onScanLocation,
  onOpenPrintModal,
  onFileReportAtLocation,
  onToggleSupport,
  onSelectIssue
}: CampusHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');

  // Filter locations by search and floor
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch =
        loc.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFloor = selectedFloor === 'ALL' || loc.floor === selectedFloor;
      return matchesSearch && matchesFloor;
    });
  }, [locations, searchQuery, selectedFloor]);

  // Unique floors
  const floors = useMemo(() => {
    return Array.from(new Set(locations.map((l) => l.floor))).sort((a, b) => a - b);
  }, [locations]);

  return (
    <div className="hub-container animate-fade-in">
      {/* Top Filter and Actions Toolbar */}
      <div className="hub-toolbar">
        <div className="hub-search-box">
          <Search size={14} className="hub-search-icon" />
          <input
            type="text"
            placeholder="Search A-Block rooms, labs, auditoriums..."
            className="hub-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="hub-floor-chips">
          <span className="hub-floor-label">
            <Filter size={12} /> Floor:
          </span>
          <button
            type="button"
            className={`hub-floor-chip ${selectedFloor === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedFloor('ALL')}
          >
            All ({locations.length})
          </button>
          {floors.map((fl) => (
            <button
              type="button"
              key={fl}
              className={`hub-floor-chip ${selectedFloor === fl ? 'active' : ''}`}
              onClick={() => setSelectedFloor(fl)}
            >
              Floor {fl}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="hub-print-btn"
          onClick={onOpenPrintModal}
        >
          <Printer size={14} />
          <span>Door Placards (A4)</span>
        </button>
      </div>

      {/* Main Directory Split View */}
      <div className="hub-split-view">
        {/* Spatial Room Index */}
        <div className="hub-spatial-index">
          {filteredLocations.length === 0 ? (
            <div className="hub-empty-index">
              No campus rooms match "{searchQuery}" on the selected floor.
            </div>
          ) : (
            <div className="hub-rooms-matrix">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    className={`hub-room-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => onScanLocation(loc.qrToken)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="hub-room-left">
                      <div className="hub-room-code-tag">{loc.roomCode}</div>
                      <div className="hub-room-name-text">{loc.name}</div>
                    </div>

                    <div className="hub-room-right">
                      <span className="hub-room-badge">Floor {loc.floor} • {loc.type}</span>
                      <span className="hub-qr-sim-pill" title="Simulate QR scan">
                        <QrCode size={12} /> {loc.qrToken}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Room Inspector Panel */}
        <div className="hub-inspector-pane">
          {selectedLocation ? (
            <div className="hub-inspector-card animate-fade-in">
              <div className="hub-inspector-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#248568', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <CheckCircle2 size={13} /> Active QR Spot Verified
                </div>
                <h3 className="hub-inspector-title">
                  {selectedLocation.roomCode} — {selectedLocation.name}
                </h3>
                <div className="hub-inspector-sub">
                  Building: A-Block • Floor: {selectedLocation.floor} • Space: {selectedLocation.type}
                </div>
              </div>

              <div style={{ margin: '14px 0' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', padding: '9px 14px', fontSize: '0.84rem' }}
                  onClick={() => onFileReportAtLocation(selectedLocation.id)}
                >
                  <Send size={14} /> Report Problem at {selectedLocation.roomCode}
                </button>
              </div>

              <div className="hub-inspector-issues-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: '#202B3C', marginBottom: 8 }}>
                  <AlertTriangle size={14} color="#C58A28" />
                  <span>Open Reports at this Spot ({locationActiveIssues.length})</span>
                </div>

                {locationActiveIssues.length === 0 ? (
                  <div className="hub-inspector-clean-note">
                    <CheckCircle2 size={16} color="#248568" />
                    <span>No active unresolved issues reported here.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {locationActiveIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="hub-inspector-issue-item"
                        onClick={() => onSelectIssue(issue)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="register-ticket-code">{issue.ticketNo}</span>
                          <span className={`status-badge status-${issue.status}`}>{issue.status}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#202B3C', marginTop: 3 }}>
                          {issue.description}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px solid #E2E6EC' }}>
                          <button
                            type="button"
                            className="support-btn"
                            onClick={(e) => onToggleSupport(issue.id, e)}
                            style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                          >
                            <ThumbsUp size={11} /> +{issue.supporterCount}
                          </button>
                          <span style={{ fontSize: '0.72rem', color: '#68758A' }}>Click to view dossier →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hub-inspector-placeholder">
              <QrCode size={28} style={{ opacity: 0.35, margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#202B3C' }}>Select a Room to Inspect</div>
              <p style={{ fontSize: '0.76rem', color: '#68758A', marginTop: 3 }}>
                Click any room on the left to simulate doorplate QR scanning and view active spot tickets.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
