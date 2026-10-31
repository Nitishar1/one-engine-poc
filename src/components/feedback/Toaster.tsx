import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { useToastStore, type ToastItem, type ToastType } from './toastStore';

const META: Record<ToastType, { icon: LucideIcon; title: string }> = {
  success: { icon: CircleCheck, title: 'Success' },
  error: { icon: CircleAlert, title: 'Error' },
  warning: { icon: TriangleAlert, title: 'Warning' },
  info: { icon: Info, title: 'Info' },
};

function Toast({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(item.duration);
  const startedAt = useRef(0);
  const { icon: Icon, title } = META[item.type];

  useEffect(() => {
    if (paused || item.leaving) return;
    startedAt.current = Date.now();
    const timer = setTimeout(() => dismiss(item.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, item.leaving, item.id, dismiss]);

  return (
    <div
      role={item.type === 'error' ? 'alert' : 'status'}
      className={`oe-toast oe-toast--${item.type} ${item.leaving ? 'is-leaving' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="oe-toast__icon" aria-hidden>
        <Icon size={17} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="oe-toast__title">{title}</p>
        <p className="oe-toast__body">{item.content}</p>
      </div>
      <button
        type="button"
        className="oe-toast__close"
        aria-label="Dismiss notification"
        onClick={() => dismiss(item.id)}
      >
        <X size={14} />
      </button>
      <span
        aria-hidden
        className="oe-toast__progress"
        style={{
          animationDuration: `${item.duration}ms`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      />
    </div>
  );
}

/** Toast stack (bottom-right). Mounted once by ThemeProvider; fed by `toast.*`. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return createPortal(
    <div className="oe-toaster" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} item={t} />
      ))}
    </div>,
    document.body,
  );
}
