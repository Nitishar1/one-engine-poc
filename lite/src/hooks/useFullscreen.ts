import { useCallback, useSyncExternalStore, type RefObject } from 'react';

const subscribe = (onChange: () => void) => {
  document.addEventListener('fullscreenchange', onChange);
  return () => document.removeEventListener('fullscreenchange', onChange);
};

/** Toggles fullscreen for the given element, or the whole document when no ref is passed. */
export function useFullscreen(ref?: RefObject<HTMLElement | null>) {
  const isFullscreen = useSyncExternalStore(
    subscribe,
    () =>
      ref
        ? document.fullscreenElement !== null && document.fullscreenElement === ref.current
        : document.fullscreenElement !== null,
    () => false,
  );

  const toggle = useCallback(async () => {
    const el = ref ? ref.current : document.documentElement;
    if (!el) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await el.requestFullscreen?.();
  }, [ref]);

  return { isFullscreen, toggle };
}
