import { useCallback, useMemo } from 'react';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LockKeyholeOpen } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppTable } from '@/components/common/AppTable';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusTag } from '@/components/common/StatusTag';
import { formatDateTime } from '@/utils/formatters';
import { useLockedAccounts, useUnlockAccount, type LockedAccount } from './lockedAccount.api';

export default function LockedAccountListPage() {
  const { modal } = App.useApp();
  const accounts = useLockedAccounts();
  const unlock = useUnlockAccount();

  const confirmUnlock = useCallback(
    (row: LockedAccount) =>
      modal.confirm({
        title: 'Unlock account',
        content: `Allow "${row.userAccountName}" to sign in again?`,
        okText: 'Unlock',
        centered: true,
        onOk: () => unlock.mutateAsync(row.id),
      }),
    [modal, unlock],
  );

  const columns = useMemo<ColumnsType<LockedAccount>>(
    () => [
      {
        title: 'User Account Name',
        dataIndex: 'userAccountName',
        sorter: (a, b) => a.userAccountName.localeCompare(b.userAccountName),
      },
      {
        title: 'Status',
        key: 'status',
        render: (_, row) => <StatusTag status={row.unlockedOn ? 'Active' : 'Locked'} />,
      },
      {
        title: 'Locked On',
        dataIndex: 'lockedOn',
        render: (v: string) => <span className="tabular-nums">{formatDateTime(v)}</span>,
        sorter: (a, b) => a.lockedOn.localeCompare(b.lockedOn),
        defaultSortOrder: 'descend',
      },
      { title: 'Unlocked By', dataIndex: 'unlockedBy', render: (v: string | null) => v ?? '-' },
      {
        title: 'Unlocked On',
        dataIndex: 'unlockedOn',
        render: (v: string | null) => <span className="tabular-nums">{formatDateTime(v)}</span>,
      },
      {
        title: <span className="sr-only">Actions</span>,
        key: 'actions',
        align: 'right',
        render: (_, row) =>
          row.unlockedOn ? null : (
            <AppButton
              tone="secondary"
              size="small"
              icon={<LockKeyholeOpen size={14} />}
              onClick={() => confirmUnlock(row)}
            >
              Unlock
            </AppButton>
          ),
      },
    ],
    [confirmUnlock],
  );

  const searchValues = useCallback(
    (row: LockedAccount) => [row.userAccountName, row.unlockedBy],
    [],
  );

  return (
    <>
      <PageHeader
        title="Locked Accounts"
        description="Accounts locked after repeated failed sign-ins. Unlocking lets the user sign in again."
      />
      <AppCard title="View Locked Account(s)" bodyClassName="p-4">
        <AppTable<LockedAccount>
          rowKey="id"
          columns={columns}
          data={accounts.data}
          loading={accounts.isLoading}
          error={accounts.error}
          onRetry={() => void accounts.refetch()}
          searchValues={searchValues}
          searchPlaceholder="Search accounts..."
        />
      </AppCard>
    </>
  );
}
