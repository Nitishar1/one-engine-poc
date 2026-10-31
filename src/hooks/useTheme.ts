import { useThemeStore } from '@/stores/themeStore';
import { themeTokens } from '@/components/theme/themeTokens';

export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);
  const setMode = useThemeStore((s) => s.setMode);
  return { mode, isDark: mode === 'dark', tokens: themeTokens[mode], toggle, setMode };
}
