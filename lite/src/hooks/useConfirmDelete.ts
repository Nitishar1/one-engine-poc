import { App } from 'antd';
import { useCallback } from 'react';

/** Shows a standard delete confirmation and runs `onConfirm` when accepted. */
export function useConfirmDelete() {
  const { modal } = App.useApp();
  return useCallback(
    (entityLabel: string, name: string, onConfirm: () => Promise<unknown> | void) =>
      modal.confirm({
        title: `Delete ${entityLabel}`,
        content: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        okText: 'Delete',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        centered: true,
        onOk: () => onConfirm(),
      }),
    [modal],
  );
}
