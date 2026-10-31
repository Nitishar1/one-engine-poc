import { useEffect } from 'react';
import { App } from 'antd';
import { useBlocker } from 'react-router-dom';

/** Pass as navigation state to skip the guard (e.g. redirect right after saving). */
export const BYPASS_GUARD_STATE = { bypassUnsavedGuard: true } as const;

/** Warns before leaving the page (in-app navigation or tab close) while `isDirty()` is true. */
export function useUnsavedChangesGuard(isDirty: () => boolean) {
  const { modal } = App.useApp();
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty() &&
      currentLocation.pathname !== nextLocation.pathname &&
      !(nextLocation.state as typeof BYPASS_GUARD_STATE | null)?.bypassUnsavedGuard,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    modal.confirm({
      title: 'Discard unsaved changes?',
      content: 'This runbook has changes that have not been saved.',
      okText: 'Leave',
      okButtonProps: { danger: true },
      cancelText: 'Stay',
      centered: true,
      onOk: () => blocker.proceed(),
      onCancel: () => blocker.reset(),
    });
  }, [blocker, modal]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);
}
