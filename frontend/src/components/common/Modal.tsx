import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const SIZES = {
  md: 'sm:max-w-md',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

// One popup layout used by checkout, tracking and nutrition screens
export default function Modal({ title, subtitle, onClose, children, size = 'lg' }: ModalProps) {
  useLockBodyScroll();

  // Close when the user presses Escape
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Dark background - clicking it closes the popup */}
      <div className="absolute inset-0 animate-fade-in bg-ink/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative max-h-[92vh] w-full animate-slide-up overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl ${SIZES[size]}`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink/10 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-cream text-ink transition hover:bg-saffron-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
