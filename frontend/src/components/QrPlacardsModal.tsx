import { useState, useEffect } from 'react';
import { Printer, X, Download, FileDown, QrCode } from 'lucide-react';
import type { LocationItem } from '../types';
import {
  downloadRoomPlacardPdf,
  downloadBatchPlacardsPdf,
  generateQrDataUrl,
  getEffectiveQrToken,
  getScanUrl,
  type RoomPlacardData
} from '../utils/qrPdfGenerator';

interface QrPlacardsModalProps {
  show: boolean;
  onClose: () => void;
  locations: LocationItem[];
}

export function QrPlacardsModal({ show, onClose, locations }: QrPlacardsModalProps) {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);

  // Generate real scannable QR code data URLs for all locations in the modal
  useEffect(() => {
    if (!show || locations.length === 0) return;

    let isMounted = true;
    const generateAllQrs = async () => {
      const map: Record<string, string> = {};
      for (const loc of locations) {
        const token = getEffectiveQrToken(loc);
        try {
          const dataUrl = await generateQrDataUrl(token, loc.roomCode);
          if (isMounted) {
            map[loc.id] = dataUrl;
          }
        } catch (e) {
          console.error('Failed to generate QR for modal item:', loc.roomCode, e);
        }
      }
      if (isMounted) {
        setQrMap(map);
      }
    };

    generateAllQrs();

    return () => {
      isMounted = false;
    };
  }, [show, locations]);

  if (!show) return null;

  const handleDownloadSinglePdf = async (loc: LocationItem) => {
    try {
      setDownloadingId(loc.id);
      await downloadRoomPlacardPdf({
        id: loc.id,
        roomCode: loc.roomCode,
        name: loc.name,
        floor: loc.floor,
        type: loc.type,
        qrToken: loc.qrToken
      });
    } catch (e) {
      console.error('Single PDF error:', e);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAllPdf = async () => {
    try {
      setIsBatchDownloading(true);
      const rooms: RoomPlacardData[] = locations.map((loc) => ({
        id: loc.id,
        roomCode: loc.roomCode,
        name: loc.name,
        floor: loc.floor,
        type: loc.type,
        qrToken: loc.qrToken
      }));
      await downloadBatchPlacardsPdf(rooms, 'CampusPulse_All_Doorplates.pdf');
    } catch (e) {
      console.error('Batch PDF error:', e);
    } finally {
      setIsBatchDownloading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: 1040 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--gold-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-deep)'
            }}>
              <QrCode size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--ink-primary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                Campus Doorplate QR Placards
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Real scannable wall placards formatted for official A4 lamination.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDownloadAllPdf}
              disabled={isBatchDownloading || locations.length === 0}
              style={{ padding: '8px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <FileDown size={15} color="var(--gold-deep)" />
              <span>{isBatchDownloading ? 'Generating Batch PDF...' : `Download All as PDF (${locations.length})`}</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => window.print()}
              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            >
              <Printer size={15} />
              <span>Print Sheet</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', color: 'var(--text-muted)', padding: 6, cursor: 'pointer' }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Placards Grid */}
        <div className="qr-placards-sheet">
          {locations.map((loc) => {
            const qrUrl = qrMap[loc.id];
            const isDownloading = downloadingId === loc.id;
            const scanUrl = getScanUrl(getEffectiveQrToken(loc), loc.roomCode);

            return (
              <div key={loc.id} className="qr-placard-item" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="qr-placard-header">Campus Pulse • Issue Dispatch</div>
                  <div className="qr-placard-room">{loc.roomCode}</div>
                  <div className="qr-placard-name">{loc.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    Floor {loc.floor} • {loc.type}
                  </div>

                  {/* Real Scannable High-Resolution QR Graphic */}
                  <div className="qr-placard-svg-box" style={{ background: '#FFFFFF', padding: 8, borderRadius: 8, border: '1px solid var(--border-base)', display: 'inline-block' }}>
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`Scannable QR Code for ${loc.roomCode}`}
                        style={{ width: 130, height: 130, display: 'block', margin: '0 auto' }}
                      />
                    ) : (
                      <div style={{ width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <QrCode size={36} color="var(--text-muted)" />
                      </div>
                    )}
                  </div>

                  <div className="qr-placard-instructions" style={{ marginTop: 8 }}>
                    Point smartphone camera to report any issue at this room in under 30 seconds
                  </div>
                  <div className="qr-placard-url" title={scanUrl} style={{ fontSize: '0.68rem', wordBreak: 'break-all' }}>
                    {scanUrl}
                  </div>
                </div>

                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-base)' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: '100%', padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={() => handleDownloadSinglePdf(loc)}
                    disabled={isDownloading}
                  >
                    <Download size={13} color="var(--gold-deep)" />
                    <span>{isDownloading ? 'Saving PDF...' : 'Download A4 Placard (PDF)'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
