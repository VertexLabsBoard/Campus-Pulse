import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Printer,
  FileDown,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Send,
  ArrowUpRight,
  ThumbsUp,
  RotateCcw,
  Building2,
  Download
} from 'lucide-react';
import type { LocationItem, IssueItem } from '../types';
import {
  CAMPUS_BLOCKS,
  LOCATION_CANDIDATES,
  LOCATION_TYPES,
  inferBlockId
} from '../data/locationCatalog';
import {
  downloadRoomPlacardPdf,
  downloadBatchPlacardsPdf,
  generateQrDataUrl,
  getEffectiveQrToken,
  getScanUrl,
  type RoomPlacardData
} from '../utils/qrPdfGenerator';

interface CampusHubProps {
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  locationActiveIssues: IssueItem[];
  onScanLocation: (qrToken: string) => void;
  onFileReportAtLocation: (locationId: string) => void;
  onOpenPrintModal: () => void;
  onSelectIssue: (issue: IssueItem) => void;
  onToggleSupport: (issueId: string, e?: React.MouseEvent) => void;
}

export function CampusHub({
  locations,
  selectedLocation,
  locationActiveIssues,
  onScanLocation,
  onFileReportAtLocation,
  onOpenPrintModal,
  onSelectIssue,
  onToggleSupport
}: CampusHubProps) {
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isBatchDownloading, setIsBatchDownloading] = useState<boolean>(false);
  const [liveQrDataUrl, setLiveQrDataUrl] = useState<string | null>(null);

  // Combine backend database locations with the full campus catalog
  const allDirectoryRooms = useMemo<RoomPlacardData[]>(() => {
    const list: RoomPlacardData[] = [];
    const seenCodes = new Set<string>();

    // 1. Registered database locations
    locations.forEach((loc) => {
      const code = loc.roomCode.toUpperCase();
      seenCodes.add(code);
      list.push({
        id: loc.id,
        roomCode: loc.roomCode,
        name: loc.name,
        floor: loc.floor,
        type: loc.type,
        blockId: inferBlockId(loc.roomCode) || 'A',
        qrToken: loc.qrToken,
      });
    });

    // 2. Catalog candidate locations across all blocks
    LOCATION_CANDIDATES.forEach((candidate) => {
      const code = (candidate.roomCode || candidate.label).toUpperCase();
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        list.push({
          id: candidate.id,
          roomCode: candidate.roomCode || candidate.label,
          name: candidate.label,
          floor: candidate.floor ?? 0,
          type: candidate.locationType,
          blockId: candidate.blockId || inferBlockId(candidate.roomCode || '') || 'MAIN',
          qrToken: getEffectiveQrToken(candidate),
        });
      }
    });

    return list;
  }, [locations]);

  // Unique floors available (based on selected block)
  const availableFloors = useMemo(() => {
    const target = selectedBlock === 'ALL'
      ? allDirectoryRooms
      : allDirectoryRooms.filter((r) => r.blockId === selectedBlock);
    const set = new Set(target.map((r) => String(r.floor)));
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [allDirectoryRooms, selectedBlock]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return allDirectoryRooms.filter((room) => {
      // Block filter
      if (selectedBlock !== 'ALL' && room.blockId !== selectedBlock) return false;

      // Floor filter
      if (selectedFloor !== 'ALL' && String(room.floor) !== selectedFloor) return false;

      // Type filter
      if (selectedType !== 'ALL') {
        const t = room.type.toLowerCase();
        if (selectedType === 'academic' && !t.includes('classroom') && !t.includes('academic')) return false;
        if (selectedType === 'laboratory' && !t.includes('lab')) return false;
        if (selectedType === 'common' && !t.includes('corridor') && !t.includes('washroom') && !t.includes('common')) return false;
        if (selectedType === 'office' && !t.includes('office')) return false;
        if (selectedType === 'facility' && !t.includes('facility') && !t.includes('library')) return false;
        if (selectedType === 'outdoor' && !t.includes('outdoor')) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = room.roomCode.toLowerCase().includes(q);
        const matchesName = room.name.toLowerCase().includes(q);
        const matchesBlock = (room.blockId || '').toLowerCase().includes(q);
        const matchesType = room.type.toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesBlock && !matchesType) return false;
      }

      return true;
    });
  }, [allDirectoryRooms, selectedBlock, selectedFloor, selectedType, searchQuery]);

  const isAnyFilterActive =
    selectedBlock !== 'ALL' ||
    selectedFloor !== 'ALL' ||
    selectedType !== 'ALL' ||
    searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedBlock('ALL');
    setSelectedFloor('ALL');
    setSelectedType('ALL');
    setSearchQuery('');
  };

  // Currently inspected room
  const inspectedRoom = useMemo<RoomPlacardData | null>(() => {
    if (selectedLocation) {
      return {
        id: selectedLocation.id,
        roomCode: selectedLocation.roomCode,
        name: selectedLocation.name,
        floor: selectedLocation.floor,
        type: selectedLocation.type,
        blockId: inferBlockId(selectedLocation.roomCode) || 'A',
        qrToken: selectedLocation.qrToken,
      };
    }
    return filteredRooms[0] || null;
  }, [selectedLocation, filteredRooms]);

  // Generate live real QR Code for the inspected room
  useEffect(() => {
    if (inspectedRoom) {
      const qrToken = getEffectiveQrToken(inspectedRoom);
      generateQrDataUrl(qrToken, inspectedRoom.roomCode)
        .then((dataUrl) => setLiveQrDataUrl(dataUrl))
        .catch((err) => console.error('Error generating live QR preview:', err));
    } else {
      setLiveQrDataUrl(null);
    }
  }, [inspectedRoom]);

  // Single-click PDF Download Handler
  const handleDownloadSinglePdf = async (room: RoomPlacardData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setDownloadingId(room.id);
      await downloadRoomPlacardPdf(room);
    } catch (err) {
      console.error('Failed to generate PDF placard:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Batch PDF Download Handler (multi-page PDF)
  const handleDownloadBatchPdf = async () => {
    if (filteredRooms.length === 0) return;
    try {
      setIsBatchDownloading(true);
      const batchToDownload = filteredRooms.slice(0, 60); // Clean, fast export up to 60 placards
      const blockLabel = selectedBlock === 'ALL' ? 'Campus_Wide' : `Block_${selectedBlock}`;
      await downloadBatchPlacardsPdf(batchToDownload, `CampusPulse_${blockLabel}_Placards.pdf`);
    } catch (err) {
      console.error('Failed to generate batch PDF:', err);
    } finally {
      setIsBatchDownloading(false);
    }
  };

  // Simulate scanning QR: redirects to Report Issue tab with this room auto-selected!
  const handleSimulateScanAndReport = (room: RoomPlacardData) => {
    const qrToken = getEffectiveQrToken(room);
    onScanLocation(qrToken);
    onFileReportAtLocation(room.id);
  };

  return (
    <div className="hub-container animate-fade-in">
      {/* ─── Top Filter & Actions Toolbar ────────────────────────────── */}
      <div className="hub-toolbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={20} color="var(--gold-deep)" />
            Campus Infrastructure Directory & QR Placards
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Every campus room and facility has its own specific scannable QR code and downloadable A4 doorplate PDF.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleDownloadBatchPdf}
            disabled={isBatchDownloading || filteredRooms.length === 0}
            style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
            title="Download multi-page PDF for all currently filtered rooms"
          >
            <FileDown size={14} color="var(--gold-deep)" />
            <span>{isBatchDownloading ? 'Generating Batch PDF...' : `Download Placards PDF (${Math.min(filteredRooms.length, 60)})`}</span>
          </button>

          <button
            type="button"
            className="hub-print-btn"
            onClick={onOpenPrintModal}
            title="Preview and print doorplates"
          >
            <Printer size={14} />
            <span>Print Placards Modal</span>
          </button>
        </div>
      </div>

      {/* ─── Multi-Level Filter Toolbar ──────────────────────────────── */}
      <div className="hub-filters-panel" style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-base)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {/* Row 1: Search & Dropdowns */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div className="hub-search-box" style={{ flex: '1 1 260px' }}>
            <Search size={14} className="hub-search-icon" />
            <input
              type="text"
              placeholder="Search by room code, name, block, or alias (e.g. 5LA1, MDP, Library)..."
              className="hub-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search rooms"
            />
          </div>

          {/* Block Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Block:</span>
            <select
              className="register-filter-select"
              value={selectedBlock}
              onChange={(e) => {
                setSelectedBlock(e.target.value);
                setSelectedFloor('ALL');
              }}
              aria-label="Filter by block"
            >
              <option value="ALL">All Blocks ({CAMPUS_BLOCKS.length})</option>
              {CAMPUS_BLOCKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Floor Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Floor:</span>
            <select
              className="register-filter-select"
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              aria-label="Filter by floor"
            >
              <option value="ALL">All Floors</option>
              {availableFloors.map((fl) => (
                <option key={fl} value={fl}>
                  {fl === '0' ? 'Ground Floor (0)' : `Floor ${fl}`}
                </option>
              ))}
            </select>
          </div>

          {/* Space / Facility Type Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Facility:</span>
            <select
              className="register-filter-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by space type"
            >
              <option value="ALL">All Types</option>
              {LOCATION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {isAnyFilterActive && (
            <button
              type="button"
              className="register-clear-btn"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={12} />
              <span>Clear filters</span>
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Showing <strong>{filteredRooms.length}</strong> of {allDirectoryRooms.length} spots
          </div>
        </div>

        {/* Row 2: Quick Block Filter Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', paddingTop: 4, borderTop: '1px dashed var(--border-base)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Blocks:
          </span>
          {['ALL', 'A', 'C', 'D', 'E1', 'E2', 'E3', 'F1', 'F2', 'F3', 'H6', 'I2', 'J2', 'L3', 'Gate 1'].map((b) => (
            <button
              type="button"
              key={b}
              className={`register-pill ${selectedBlock === b ? 'active' : ''}`}
              onClick={() => {
                setSelectedBlock(b);
                setSelectedFloor('ALL');
              }}
              style={{ padding: '3px 9px', fontSize: '0.74rem' }}
            >
              {b === 'ALL' ? 'All' : b}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Directory Split View ───────────────────────────────── */}
      <div className="hub-split-view">
        {/* Spatial Room Matrix */}
        <div className="hub-spatial-index">
          {filteredRooms.length === 0 ? (
            <div className="hub-empty-index">
              <AlertTriangle size={32} color="#C58A28" style={{ margin: '0 auto 10px', opacity: 0.6 }} />
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--ink-primary)' }}>
                No campus locations match your filter
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Try selecting "All Blocks" or clearing your search term.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResetFilters}
                style={{ marginTop: 12, fontSize: '0.8rem', padding: '6px 14px' }}
              >
                <RotateCcw size={13} /> Reset Filters
              </button>
            </div>
          ) : (
            <div className="hub-rooms-matrix">
              {filteredRooms.map((room) => {
                const isSelected = inspectedRoom?.id === room.id || inspectedRoom?.roomCode === room.roomCode;
                const isDownloadingThis = downloadingId === room.id;
                const qrToken = getEffectiveQrToken(room);

                return (
                  <div
                    key={room.id}
                    className={`hub-room-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onScanLocation(qrToken);
                    }}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Left: Room Code & Name */}
                    <div className="hub-room-left" style={{ flex: '1 1 200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="hub-room-code-tag">{room.roomCode}</span>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: '#F1F5F9',
                          color: '#475569',
                          fontWeight: 600
                        }}>
                          Block {room.blockId || 'MAIN'}
                        </span>
                      </div>
                      <div className="hub-room-name-text" title={room.name}>{room.name}</div>
                    </div>

                    {/* Middle: Badges */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className="hub-room-badge">
                        {String(room.floor) === '0' ? 'Ground' : `Fl ${room.floor}`} • {room.type}
                      </span>
                    </div>

                    {/* Right: Actions (Single-Click PDF Download + Simulate Scan) */}
                    <div className="hub-room-right" style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                      {/* Download PDF Placard Button */}
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          padding: '5px 9px',
                          fontSize: '0.74rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          borderRadius: 'var(--radius-sm)',
                          borderColor: 'var(--border-base)'
                        }}
                        onClick={(e) => handleDownloadSinglePdf(room, e)}
                        disabled={isDownloadingThis}
                        title={`Download official A4 PDF placard for ${room.roomCode}`}
                      >
                        <FileDown size={13} color="var(--gold-deep)" />
                        <span>{isDownloadingThis ? 'PDF...' : 'PDF'}</span>
                      </button>

                      {/* Inspect QR / Simulate scan */}
                      <button
                        type="button"
                        className="support-btn"
                        style={{ padding: '5px 9px', fontSize: '0.74rem' }}
                        onClick={() => handleSimulateScanAndReport(room)}
                        title={`Report issue directly at ${room.roomCode}`}
                      >
                        <Send size={12} />
                        <span>Report</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Right: Selected Room Inspector Pane with LIVE Scannable QR ── */}
        <div className="hub-inspector-pane">
          {inspectedRoom ? (
            <div className="hub-inspector-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Header */}
              <div className="hub-inspector-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#248568', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <CheckCircle2 size={13} /> Verified QR Doorplate Spot
                </div>
                <h3 className="hub-inspector-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink-primary)', marginTop: 2 }}>
                  {inspectedRoom.roomCode}
                </h3>
                <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {inspectedRoom.name}
                </div>
                <div className="hub-inspector-sub" style={{ marginTop: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Block: <strong>{inspectedRoom.blockId || 'MAIN'}</strong> • Floor: <strong>{String(inspectedRoom.floor) === '0' ? 'Ground' : inspectedRoom.floor}</strong> • Space: <strong>{inspectedRoom.type}</strong>
                </div>
              </div>

              {/* Real, Live Generated Scannable QR Code */}
              <div style={{
                background: '#FFFFFF',
                border: '2px solid var(--gold-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(23, 36, 58, 0.06)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold-deep)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Real Scannable Doorplate QR
                </div>

                {liveQrDataUrl ? (
                  <div style={{ display: 'inline-block', padding: 8, background: '#FFFFFF', borderRadius: 8, border: '1px solid var(--border-base)' }}>
                    <img
                      src={liveQrDataUrl}
                      alt={`Scannable QR code for ${inspectedRoom.roomCode}`}
                      style={{ width: 160, height: 160, display: 'block', margin: '0 auto' }}
                    />
                  </div>
                ) : (
                  <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', background: '#F8FAFC', borderRadius: 8 }}>
                    <QrCode size={36} color="var(--text-muted)" />
                  </div>
                )}

                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 8, fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                  {getScanUrl(getEffectiveQrToken(inspectedRoom), inspectedRoom.roomCode)}
                </div>

                {/* Primary Action 1: Download Single-Click PDF */}
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: 12, padding: '10px 14px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => handleDownloadSinglePdf(inspectedRoom)}
                  disabled={downloadingId === inspectedRoom.id}
                >
                  <Download size={15} />
                  <span>{downloadingId === inspectedRoom.id ? 'Generating PDF...' : 'Download Official A4 Placard (PDF)'}</span>
                </button>

                {/* Primary Action 2: Simulate Scan & Report */}
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '100%', marginTop: 8, padding: '9px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={() => handleSimulateScanAndReport(inspectedRoom)}
                >
                  <Send size={14} color="var(--gold-deep)" />
                  <span>Report Problem at {inspectedRoom.roomCode}</span>
                </button>
              </div>

              {/* Active Spot Tickets */}
              <div className="hub-inspector-issues-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 8 }}>
                  <AlertTriangle size={14} color="#C58A28" />
                  <span>Active Work Orders at this Spot ({locationActiveIssues.length})</span>
                </div>

                {locationActiveIssues.length === 0 ? (
                  <div className="hub-inspector-clean-note" style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#166534' }}>
                    <CheckCircle2 size={16} color="#16A34A" />
                    <span>No unresolved issues logged at this room.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {locationActiveIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="hub-inspector-issue-item"
                        onClick={() => onSelectIssue(issue)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="register-ticket-code">{issue.ticketNo}</span>
                          <span className={`status-badge status-${issue.status}`}>{issue.status}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--ink-primary)', marginTop: 4 }}>
                          {issue.description}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border-base)' }}>
                          <button
                            type="button"
                            className="support-btn"
                            onClick={(e) => onToggleSupport(issue.id, e)}
                            style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                          >
                            <ThumbsUp size={11} /> +{issue.supporterCount}
                          </button>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            Dossier <ArrowUpRight size={13} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hub-inspector-placeholder">
              <QrCode size={36} style={{ opacity: 0.35, margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--ink-primary)' }}>Select a Room to Inspect</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Choose any campus room to view its live scannable QR code, download its A4 PDF placard, or inspect active spot issues.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
