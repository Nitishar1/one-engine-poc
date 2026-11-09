import { Button, Tooltip } from 'antd';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';

/** Round button that switches between the light and dark theme. */
export function ThemeToggle({ className }: { className?: string }) {
  const { mode, toggle } = useTheme();
  const label = mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Tooltip title={label}>
      <Button
        type="text"
        shape="circle"
        className={className}
        aria-label={label}
        icon={mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        onClick={toggle}
      />
    </Tooltip>
  );
}
