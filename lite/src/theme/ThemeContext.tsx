import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'oneengine-lite-theme';

/** The user's saved choice, otherwise the operating system's light / dark setting. */
function initialMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage blocked (e.g. private window): fall back to the system setting.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface ThemeValue {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

/**
 * Light / dark theme. Ant Design components switch through `ConfigProvider`; the layout colours
 * in styles.css switch through the `data-theme` attribute on <html>.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  // Runs before the browser paints, so the page never flashes in the wrong theme.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not saved; the theme still changes for this visit.
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <ConfigProvider
        theme={{
          algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: { colorPrimary: '#2563eb', borderRadius: 8 },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>');
  return value;
}
