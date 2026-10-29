import { Bell, KeyRound, Menu } from 'lucide-react';
import type { User } from '../types';

interface TopbarProps {
  activeTab: 'hub' | 'report' | 'feed' | 'queue' | 'admin';
  currentUser: User | null;
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  onOpenAuth: () => void;
  onToggleMobileSidebar?: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  feed: { title: 'Campus Issue Register', subtitle: 'Live incident log across all Amity facilities' },
  report: { title: 'Dispatch Campus Problem', subtitle: 'Report an issue in under 30 seconds' },
  hub: { title: 'A-Block Spatial Directory', subtitle: 'Room directory, doorplates and QR dispatch' },
  queue: { title: 'Technician Action Queue', subtitle: 'Work order triage and lifecycle dispatch' },
  admin: { title: "Dean's Operations Overview", subtitle: 'High-level operational metrics and workload balance' }
};

export function Topbar({
  activeTab,
  currentUser,
  unreadCount,
  showNotifications,
  setShowNotifications,
  onOpenAuth,
  onToggleMobileSidebar
}: TopbarProps) {
  const current = TAB_TITLES[activeTab] || { title: 'Campus Pulse', subtitle: '' };

  return (
    <header className="workspace-topbar">
      <div className="topbar-left">
        {onToggleMobileSidebar && (
          <button
            type="button"
            className="mobile-menu-trigger"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle menu"
          >
            <Menu size={18} />
          </button>
        )}
        <div>
          <h1 className="topbar-page-title">{current.title}</h1>
          <span className="topbar-page-subtitle">{current.subtitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Amity Auth Modal Trigger */}
        <button
          type="button"
          className="topbar-auth-btn"
          onClick={onOpenAuth}
          title="Campus Pulse Demo Authentication Portal"
        >
          <KeyRound size={14} color="var(--gold-hover)" />
          <span>{currentUser ? `${currentUser.name.split(' ')[0]} (${currentUser.role})` : 'Demo Sign In'}</span>
          {currentUser?.enrollmentNo && (
            <span className="topbar-enrollment-tag">{currentUser.enrollmentNo}</span>
          )}
        </button>

        {/* Notifications Bell */}
        <button
          type="button"
          className="topbar-bell-btn"
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label="Open notifications"
          title="Notifications"
        >
          <Bell size={17} />
          {unreadCount > 0 && <span className="topbar-bell-badge">{unreadCount}</span>}
        </button>
      </div>
    </header>
  );
}
