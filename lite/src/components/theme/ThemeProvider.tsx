import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { App as AntApp, ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { useThemeStore } from '@/stores/themeStore';
import { Toaster } from '@/components/feedback/Toaster';
import { getAntdTheme } from './antdTheme';
import { applyThemeVariables } from './themeTokens';

// Apply before the first render so CSS variables exist on initial paint.
applyThemeVariables(useThemeStore.getState().mode);

const TRANSITION_CLASS = 'oe-theme-transition';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const antdTheme = useMemo(() => getAntdTheme(mode), [mode]);
  const previous = useRef(mode);

  useLayoutEffect(() => {
    applyThemeVariables(mode);
    if (previous.current === mode) return;
    previous.current = mode;
    // Cross-fade colours only while switching, so normal interactions keep their own timing.
    const root = document.documentElement;
    root.classList.add(TRANSITION_CLASS);
    const timer = window.setTimeout(() => root.classList.remove(TRANSITION_CLASS), 260);
    return () => {
      window.clearTimeout(timer);
      root.classList.remove(TRANSITION_CLASS);
    };
  }, [mode]);

  return (
    // `layer` puts antd styles in `@layer antd`, below Tailwind utilities (see tailwind.css).
    <StyleProvider layer>
      <ConfigProvider
        theme={antdTheme}
        componentSize="middle"
        wave={{ disabled: true }}
        tooltip={{ unique: true, arrow: false }}
      >
        <AntApp>{children}</AntApp>
        <Toaster />
      </ConfigProvider>
    </StyleProvider>
  );
}
