import { Tooltip } from 'antd';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

/** Icon button that switches between the dark and light themes. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggle } = useTheme();
  const label = `Switch to ${isDark ? 'light' : 'dark'} theme`;
  return (
    <Tooltip title={label}>
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className={`oe-icon-btn group relative overflow-hidden ${className}`}
      >
        <span className="relative inline-flex h-4 w-4">
          <Sun
            size={16}
            aria-hidden
            className={`absolute inset-0 transition-all duration-300 ease-[var(--oe-ease)] ${
              isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
            }`}
          />
          <Moon
            size={16}
            aria-hidden
            className={`absolute inset-0 transition-all duration-300 ease-[var(--oe-ease)] ${
              isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
            }`}
          />
        </span>
        <span className="sr-only">{isDark ? 'Dark' : 'Light'}</span>
      </button>
    </Tooltip>
  );
}
