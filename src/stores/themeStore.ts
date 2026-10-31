import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/components/theme/themeTokens';
import { STORAGE_KEYS } from '@/utils/constants';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      setMode: (mode) => set({ mode }),
      toggle: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),
    }),
    { name: STORAGE_KEYS.theme, partialize: (s) => ({ mode: s.mode }) },
  ),
);
