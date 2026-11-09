import type { ReactNode } from 'react';
import { Descriptions } from 'antd';
import { AppDrawer } from './AppDrawer';

export interface DetailItem {
  label: string;
  value: ReactNode;
}

interface DetailsDrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  items: DetailItem[];
  children?: ReactNode;
}

/** Read-only side panel for the "View" action of a grid row. */
export function DetailsDrawer({ title, open, onClose, items, children }: DetailsDrawerProps) {
  return (
    <AppDrawer title={title} open={open} onClose={onClose} width={520}>
      <Descriptions
        column={1}
        size="small"
        bordered
        items={items.map((item) => ({ key: item.label, label: item.label, children: item.value }))}
      />
      {children && <div className="mt-5">{children}</div>}
    </AppDrawer>
  );
}
