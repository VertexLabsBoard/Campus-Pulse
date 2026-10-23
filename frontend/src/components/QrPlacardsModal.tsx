import { Printer, X } from 'lucide-react';
import type { LocationItem } from '../types';

interface QrPlacardsModalProps {
  show: boolean;
  onClose: () => void;
  locations: LocationItem[];
}

export function QrPlacardsModal({ show, onClose, locations }: QrPlacardsModalProps) {
  if (!show) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: 980 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--gold-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-deep)'
            }}>
              <Printer size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--ink-primary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                Official Campus Door Placards (A-Block)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Printable physical wall placards formatted for standard A4 paper / laminator.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.print()}
              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            >
              <Printer size={15} />
              <span>Print Placards</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', color: 'var(--text-muted)', padding: 6 }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Placards Grid */}
        <div className="qr-placards-sheet">
          {locations.map((loc) => (
            <div key={loc.id} className="qr-placard-item">
              <div className="qr-placard-header">Campus Pulse • Issue Dispatch</div>
              <div className="qr-placard-room">{loc.roomCode}</div>
              <div className="qr-placard-name">{loc.name}</div>

              {/* High-contrast QR Graphic */}
              <div className="qr-placard-svg-box">
                <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="white" />
                  {/* Top-Left Finder */}
                  <rect x="10" y="10" width="24" height="24" fill="#0F172A" />
                  <rect x="14" y="14" width="16" height="16" fill="white" />
                  <rect x="18" y="18" width="8" height="8" fill="#0F172A" />
                  {/* Top-Right Finder */}
                  <rect x="66" y="10" width="24" height="24" fill="#0F172A" />
                  <rect x="70" y="14" width="16" height="16" fill="white" />
                  <rect x="74" y="18" width="8" height="8" fill="#0F172A" />
                  {/* Bottom-Left Finder */}
                  <rect x="10" y="66" width="24" height="24" fill="#0F172A" />
                  <rect x="14" y="70" width="16" height="16" fill="white" />
                  <rect x="18" y="74" width="8" height="8" fill="#0F172A" />
                  {/* Data Grid Pattern */}
                  <rect x="42" y="10" width="6" height="6" fill="#0F172A" />
                  <rect x="52" y="10" width="6" height="6" fill="#0F172A" />
                  <rect x="42" y="22" width="6" height="6" fill="#0F172A" />
                  <rect x="10" y="42" width="6" height="6" fill="#0F172A" />
                  <rect x="22" y="42" width="6" height="6" fill="#0F172A" />
                  <rect x="36" y="36" width="28" height="28" fill="#0F172A" />
                  <rect x="42" y="42" width="16" height="16" fill="white" />
                  <rect x="47" y="47" width="6" height="6" fill="#0F172A" />
                  <rect x="72" y="42" width="6" height="6" fill="#0F172A" />
                  <rect x="84" y="42" width="6" height="6" fill="#0F172A" />
                  <rect x="42" y="72" width="6" height="6" fill="#0F172A" />
                  <rect x="54" y="72" width="6" height="6" fill="#0F172A" />
                  <rect x="66" y="66" width="6" height="6" fill="#0F172A" />
                  <rect x="78" y="78" width="12" height="12" fill="#0F172A" />
                </svg>
              </div>

              <div className="qr-placard-instructions">
                Scan with phone camera to report or track issues at this room in under 30 seconds
              </div>
              <div className="qr-placard-url">
                amity.campus-pulse/?qr={loc.qrToken}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
