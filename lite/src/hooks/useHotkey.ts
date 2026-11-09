import { useEffect, useRef } from 'react';

interface HotkeyOptions {
  /** Require Cmd (macOS) or Ctrl (elsewhere). */
  mod?: boolean;
  /** Fire even while focus is in a text field. Defaults to `mod`. */
  allowInInputs?: boolean;
}

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return Boolean(
    el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)),
  );
};

/** Registers a global keyboard shortcut for the lifetime of the component. */
export function useHotkey(key: string, handler: () => void, options: HotkeyOptions = {}) {
  const { mod = false, allowInInputs = mod } = options;
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (mod !== (e.metaKey || e.ctrlKey) || e.altKey) return;
      if (!allowInInputs && isTyping(e.target)) return;
      e.preventDefault();
      handlerRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, mod, allowInInputs]);
}
