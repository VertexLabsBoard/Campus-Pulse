import { X, Bell, Clock } from 'lucide-react';
import type { NotificationItem } from '../types';

interface NotificationsPopoverProps {
  show: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
}

export function NotificationsPopover({
  show,
  onClose,
  notifications,
  unreadCount
}: NotificationsPopoverProps) {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 68,
      right: 28,
      width: 390,
      maxHeight: 520,
      background: '#FFFFFF',
      border: '1px solid var(--border-base)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-dropdown)',
      zIndex: 90,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }} className="animate-fade-in">
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--surface-raised)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={16} color="var(--gold-deep)" />
          <strong style={{ color: 'var(--ink-primary)', fontSize: '0.94rem' }}>
            Notifications ({unreadCount} unread)
          </strong>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'transparent', color: 'var(--text-muted)', padding: 4 }}
          aria-label="Close notifications"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            No notifications yet. You're all caught up!
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              style={{
                background: n.readAt ? '#FFFFFF' : 'var(--gold-tint)',
                border: n.readAt ? '1px solid var(--border-subtle)' : '1px solid rgba(221, 170, 53, 0.4)',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <div style={{ color: 'var(--text-primary)', fontWeight: n.readAt ? 500 : 600, lineHeight: 1.4 }}>
                {n.message}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)' }}>
                <Clock size={11} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
