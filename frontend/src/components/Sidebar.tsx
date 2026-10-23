import { Shield, Compass, Send, Layers, Wrench, BarChart3, PhoneCall, UserCircle2, ChevronDown } from 'lucide-react';
import type { User, IssueItem } from '../types';

interface SidebarProps {
  currentUser: User | null;
  activeTab: 'hub' | 'report' | 'feed' | 'queue' | 'admin';
  setActiveTab: (tab: 'hub' | 'report' | 'feed' | 'queue' | 'admin') => void;
  issues: IssueItem[];
  isOpen?: boolean;
  onOpenAuth: () => void;
  onSwitchPersona: (email: string) => void;
  onLoadMetrics: () => void;
}

export function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  issues,
  isOpen = false,
  onOpenAuth,
  onSwitchPersona,
  onLoadMetrics
}: SidebarProps) {
  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`} aria-label="Main sidebar navigation">
      {/* Brand Header */}
      <div className="sidebar-brand" onClick={() => setActiveTab('feed')} role="button" tabIndex={0}>
        <div className="sidebar-brand-shield">
          <Shield size={20} />
        </div>
        <div>
          <span className="sidebar-brand-title">Campus Pulse</span>
          <span className="sidebar-brand-sub">Amity Operations</span>
        </div>
      </div>

      {/* Primary Navigation Rail */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-group-title">WORKSPACE</div>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <Layers size={17} />
          <span className="sidebar-nav-label">Issue Register</span>
          <span className="sidebar-nav-counter">{issues.length}</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          <Send size={17} />
          <span className="sidebar-nav-label">Report Problem</span>
          <span className="sidebar-nav-tag">&lt;30s</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'hub' ? 'active' : ''}`}
          onClick={() => setActiveTab('hub')}
        >
          <Compass size={17} />
          <span className="sidebar-nav-label">Campus Directory & QR</span>
        </button>

        {(currentUser?.role === 'STAFF' || currentUser?.role === 'ADMIN') && (
          <>
            <div className="sidebar-nav-group-title" style={{ marginTop: 16 }}>OPERATIONS</div>
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'queue' ? 'active' : ''}`}
              onClick={() => setActiveTab('queue')}
            >
              <Wrench size={17} />
              <span className="sidebar-nav-label">Staff Queue</span>
            </button>
          </>
        )}

        {currentUser?.role === 'ADMIN' && (
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('admin');
              onLoadMetrics();
            }}
          >
            <BarChart3 size={17} />
            <span className="sidebar-nav-label">Dean's Overview</span>
          </button>
        )}
      </nav>

      {/* Quick Persona Switcher in Sidebar */}
      <div className="sidebar-persona-section">
        <div className="sidebar-nav-group-title">SWITCH PERSONA</div>
        <div className="sidebar-persona-select-wrapper">
          <select
            className="sidebar-persona-select"
            value={currentUser?.email || ''}
            onChange={(e) => onSwitchPersona(e.target.value)}
            aria-label="Select user persona"
          >
            <option value="arjun.sharma@s.amity.edu">🎓 Arjun Sharma (Student)</option>
            <option value="priya.patel@amity.edu">💻 Priya Patel (IT Staff)</option>
            <option value="ramesh.kumar@amity.edu">🔧 Ramesh Kumar (Facilities)</option>
            <option value="dr.vikram.sen@amity.edu">🏛️ Dr. Vikram Sen (Dean)</option>
          </select>
          <ChevronDown size={14} className="sidebar-persona-chevron" />
        </div>
      </div>

      {/* Discreet Safety Protocol Notice */}
      <div className="sidebar-safety-notice">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#C84A4A', fontWeight: 700, fontSize: '0.72rem' }}>
          <PhoneCall size={12} />
          <span>CAMPUS EMERGENCY</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#68758A', marginTop: 2 }}>
          Security Control: <strong style={{ color: '#202B3C' }}>+1 (555) 019-911</strong>
        </div>
      </div>

      {/* User Session Profile Footprint */}
      <div className="sidebar-user-footer">
        <button
          type="button"
          className="sidebar-user-card"
          onClick={onOpenAuth}
          title="Open Amity Portal & Session"
        >
          <div className="sidebar-user-avatar">
            <UserCircle2 size={24} />
          </div>
          <div className="sidebar-user-meta">
            <span className="sidebar-user-name">
              {currentUser ? currentUser.name : 'Sign in to Amity'}
            </span>
            <span className="sidebar-user-role">
              {currentUser ? `${currentUser.role} • ${currentUser.campus || 'Noida'}` : 'Click to authenticate'}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
