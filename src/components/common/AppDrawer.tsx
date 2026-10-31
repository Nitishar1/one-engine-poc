import { Drawer, type DrawerProps } from 'antd';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface AppDrawerProps extends DrawerProps {
  /** Desktop width in px; drawers become full-width on small screens. */
  width?: number;
}

export function AppDrawer({ width = 480, ...props }: AppDrawerProps) {
  const isSmall = useMediaQuery(`(max-width: ${width + 40}px)`);
  return <Drawer destroyOnHidden size={isSmall ? '100%' : width} {...props} />;
}
