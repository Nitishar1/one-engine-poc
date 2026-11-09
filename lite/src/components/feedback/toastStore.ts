import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  content: string;
  duration: number;
  leaving?: boolean;
}

interface ToastState {
  toasts: ToastItem[];
  push: (type: ToastType, content: string, duration?: number) => number;
  dismiss: (id: number) => void;
  remove: (id: number) => void;
}

const MAX_VISIBLE = 5;
const EXIT_MS = 260;
const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3500,
  info: 4000,
  warning: 5000,
  error: 6000,
};

let nextId = 1;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (type, content, duration = DEFAULT_DURATION[type]) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, type, content, duration }].slice(-MAX_VISIBLE) }));
    return id;
  },
  dismiss: (id) => {
    if (!get().toasts.some((t) => t.id === id && !t.leaving)) return;
    set((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)) }));
    setTimeout(() => get().remove(id), EXIT_MS);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const show = (type: ToastType) => (content: string, duration?: number) =>
  useToastStore.getState().push(type, content, duration);

/** App-wide notifications, callable from components, hooks and mutation callbacks alike. */
export const toast = {
  success: show('success'),
  error: show('error'),
  warning: show('warning'),
  info: show('info'),
  dismiss: (id: number) => useToastStore.getState().dismiss(id),
};
