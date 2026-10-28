import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface RoomPlacardData {
  id: string;
  roomCode: string;
  name: string;
  floor: number | string;
  type: string;
  blockId?: string;
  qrToken?: string;
}

export function getEffectiveQrToken(room: { qrToken?: string; roomCode?: string; id?: string }): string {
  if (room.qrToken && room.qrToken.trim()) return room.qrToken.trim();
  const raw = (room.roomCode || room.id || 'room').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `qrt-${raw}`;
}

export function getScanUrl(qrToken: string, roomCode?: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const token = encodeURIComponent(qrToken);
  const code = encodeURIComponent(roomCode || '');
  return `${origin}/?qr=${token}&room=${code}`;
}

export async function generateQrDataUrl(qrToken: string, roomCode?: string): Promise<string> {
  const url = getScanUrl(qrToken, roomCode);
  return QRCode.toDataURL(url, {
    width: 600,
    margin: 1,
    color: {
      dark: '#17243A',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });
}

export async function downloadRoomPlacardPdf(room: RoomPlacardData): Promise<void> {
  const qrToken = getEffectiveQrToken(room);
  const qrDataUrl = await generateQrDataUrl(qrToken, room.roomCode);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  renderPlacardPage(doc, room, qrToken, qrDataUrl);

  const safeFilename = `CampusPulse_Placard_${room.roomCode.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(safeFilename);
}

export async function downloadBatchPlacardsPdf(rooms: RoomPlacardData[], filename = 'CampusPulse_Placards_Batch.pdf'): Promise<void> {
  if (rooms.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    const qrToken = getEffectiveQrToken(room);
    const qrDataUrl = await generateQrDataUrl(qrToken, room.roomCode);

    if (i > 0) {
      doc.addPage();
    }
    renderPlacardPage(doc, room, qrToken, qrDataUrl);
  }

  doc.save(filename);
}

function renderPlacardPage(doc: jsPDF, room: RoomPlacardData, qrToken: string, qrDataUrl: string) {
  const pw = 210;
  const ph = 297;

  // Navy Top Banner (#17243A)
  doc.setFillColor(23, 36, 58);
  doc.rect(0, 0, pw, 44, 'F');

  // Gold accent line (#D4A017)
  doc.setFillColor(212, 160, 23);
  doc.rect(0, 44, pw, 3.5, 'F');

  // University Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('AMITY UNIVERSITY', pw / 2, 18, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(212, 160, 23);
  doc.text('CAMPUS PULSE • INSTANT RAPID INCIDENT DISPATCH PLACARD', pw / 2, 28, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(205, 215, 230);
  doc.text('OFFICIAL QR DOORPLATE • POINT SMARTPHONE CAMERA TO LOG TICKET', pw / 2, 36, { align: 'center' });

  // Outer Placard Border Card
  doc.setDrawColor(220, 226, 236);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, 56, pw - 28, ph - 74, 5, 5, 'D');

  // Room Identifier Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(18, 62, pw - 36, 38, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.roundedRect(18, 62, pw - 36, 38, 3, 3, 'D');

  // Room Code text
  doc.setTextColor(23, 36, 58);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(room.roomCode, pw / 2, 77, { align: 'center' });

  // Room Name
  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 85, 105);
  doc.text(room.name, pw / 2, 88, { align: 'center' });

  // Metadata Chips (Block, Floor, Space Type)
  const blockText = `BLOCK: ${room.blockId || room.roomCode.match(/^([A-Z]\d?)-/i)?.[1]?.toUpperCase() || 'MAIN'}`;
  const floorVal = Number(room.floor);
  const floorText = isNaN(floorVal)
    ? `FLOOR: ${room.floor}`
    : floorVal === 0
    ? 'GROUND FLOOR'
    : `FLOOR ${floorVal}`;
  const typeText = (room.type || 'ROOM').toUpperCase();

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  // Chip 1: Block
  doc.setFillColor(23, 36, 58);
  doc.roundedRect(28, 106, 44, 9, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(blockText, 50, 112, { align: 'center' });

  // Chip 2: Floor
  doc.setFillColor(212, 160, 23);
  doc.roundedRect(83, 106, 44, 9, 2.5, 2.5, 'F');
  doc.setTextColor(23, 36, 58);
  doc.text(floorText, 105, 112, { align: 'center' });

  // Chip 3: Type
  doc.setFillColor(36, 133, 104);
  doc.roundedRect(138, 106, 44, 9, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(typeText, 160, 112, { align: 'center' });

  // QR Frame & Image
  const qrSize = 85;
  const qrX = (pw - qrSize) / 2;
  const qrY = 124;

  doc.setDrawColor(212, 160, 23);
  doc.setLineWidth(1.4);
  doc.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 4, 4, 'D');

  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Scan Action Call-to-Action
  doc.setTextColor(23, 36, 58);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text('SCAN WITH ANY SMARTPHONE CAMERA', pw / 2, 227, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(90, 105, 125);
  doc.text('Instantly opens Campus Pulse and auto-selects this room to submit a problem report in < 30s.', pw / 2, 234, { align: 'center' });

  // Quick Category Badges Section
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(22, 241, pw - 44, 18, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 105, 125);
  doc.text('REPORTABLE AT THIS SPOT:', pw / 2, 246.5, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setTextColor(23, 36, 58);
  doc.text('Hardware / PC  •  AC / HVAC  •  Projector & Audio  •  Electrical  •  Cleaning  •  Safety Hazard', pw / 2, 253.5, { align: 'center' });

  // SLA & Security Footer note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 145, 160);
  doc.text(`Official SLA: Under 2 Hours Dispatch • Direct Facility Work Order • QR Token: ${qrToken}`, pw / 2, 269, { align: 'center' });

  // Bottom Footer Bar
  doc.setFillColor(23, 36, 58);
  doc.rect(0, ph - 12, pw, 12, 'F');
  doc.setTextColor(205, 215, 230);
  doc.setFontSize(8);
  doc.text('Campus Pulse University Incident Response • Powered by Real-Time Facility Dispatch', pw / 2, ph - 5, { align: 'center' });
}
