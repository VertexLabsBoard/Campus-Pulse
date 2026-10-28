import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: '#131C2D',
        color: '#F8FAFC',
        padding: '12px 20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(221, 170, 53, 0.45)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontWeight: 600,
        fontSize: '0.88rem'
      }}
      className="animate-fade-in"
      role="status"
    >
      <CheckCircle2 size={18} color="var(--gold-primary)" />
      <span>{message}</span>
    </div>
  );
}
