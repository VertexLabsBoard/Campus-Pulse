import { AlertOctagon, CheckCircle2, Clock, Layers } from 'lucide-react';
import type { Metrics } from '../types';

interface AdminDashboardProps {
  metrics: Metrics | null;
}

export function AdminDashboard({ metrics }: AdminDashboardProps) {
  if (!metrics) {
    return (
      <div className="editorial-panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Dean's operations analytics...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview Title */}
      <div className="editorial-panel" style={{ padding: '24px 28px' }}>
        <span className="section-pretitle">Executive Administrative Oversight</span>
        <h2 className="section-title">Dean's Operations & Campus Analytics</h2>
        <p className="section-description">
          Real-time institutional register of facilities triage, SLA status, and departmental resolution bandwidth across Amity University.
        </p>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Card 1: Total */}
        <div className="editorial-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
              Total Logged
            </span>
            <Layers size={18} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '2.1rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink-primary)', marginTop: 6 }}>
            {metrics.totalIssues}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Historical ticket intake
          </div>
        </div>

        {/* Card 2: Active Pipeline */}
        <div className="editorial-panel" style={{ padding: 20, borderTop: '3px solid var(--gold-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gold-deep)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
              Active Pipeline
            </span>
            <Clock size={18} color="var(--gold-deep)" />
          </div>
          <div style={{ fontSize: '2.1rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--gold-deep)', marginTop: 6 }}>
            {metrics.openIssues + metrics.inProgressIssues}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {metrics.openIssues} open • {metrics.inProgressIssues} in progress
          </div>
        </div>

        {/* Card 3: Resolved */}
        <div className="editorial-panel" style={{ padding: 20, borderTop: '3px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#166534', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
              Resolved & Closed
            </span>
            <CheckCircle2 size={18} color="#166534" />
          </div>
          <div style={{ fontSize: '2.1rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#166534', marginTop: 6 }}>
            {metrics.resolvedIssues}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Fix verified on-site
          </div>
        </div>

        {/* Card 4: Critical Hazards */}
        <div className="editorial-panel" style={{ padding: 20, borderTop: '3px solid var(--critical)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#CF1322', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
              Critical Safety Flags
            </span>
            <AlertOctagon size={18} color="#CF1322" />
          </div>
          <div style={{ fontSize: '2.1rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#CF1322', marginTop: 6 }}>
            {metrics.criticalIssues}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Direct dean triage priority
          </div>
        </div>
      </div>

      {/* Department Workload Distribution */}
      <div className="editorial-panel" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--ink-primary)', marginBottom: 16 }}>
          Departmental Dispatch Distribution
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {Object.entries(metrics.issuesByDepartment || {}).map(([dept, count]) => (
            <div
              key={dept}
              style={{
                background: '#FAFBFC',
                padding: '16px 18px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-base)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ color: 'var(--ink-primary)', fontWeight: 700, fontSize: '0.94rem' }}>{dept}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>Assigned queue</div>
              </div>
              <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--gold-deep)' }}>
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown if available */}
      {metrics.issuesByCategory && Object.keys(metrics.issuesByCategory).length > 0 && (
        <div className="editorial-panel" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--ink-primary)', marginBottom: 16 }}>
            Issue Category Breakdown
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {Object.entries(metrics.issuesByCategory).map(([cat, count]) => (
              <div
                key={cat}
                style={{
                  background: '#FAFBFC',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-base)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.86rem' }}>{cat}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-primary)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
