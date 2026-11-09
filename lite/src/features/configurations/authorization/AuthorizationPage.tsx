import { useMemo, useState } from 'react';
import { Select, Tree, type TreeDataNode } from 'antd';
import { Save } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { resolveIcon } from '@/components/common/iconRegistry';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { menuHooks } from '../menus/menu.api';
import type { MenuEntity } from '../menus/menu.schema';
import { roleHooks } from '../roles/role.api';
import { useRoleAuthorization, useSaveAuthorization } from './authorization.api';

/** Menu list -> tree for the checkbox tree, ordered like the sidebar. */
function buildTree(menus: MenuEntity[], parentId: string | null = null): TreeDataNode[] {
  return menus
    .filter((m) => m.parentId === parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m) => {
      const Icon = resolveIcon(m.icon);
      const children = buildTree(menus, m.id);
      return {
        key: m.id,
        title: (
          <span className="inline-flex items-center gap-2">
            <Icon size={14} /> {m.menuName}
          </span>
        ),
        children: children.length ? children : undefined,
      };
    });
}

/** Ticks of one role; `null` until the user changes something. */
function RoleTree({ roleId, menus }: { roleId: string; menus: MenuEntity[] }) {
  const authorization = useRoleAuthorization(roleId);
  const save = useSaveAuthorization();
  const [checked, setChecked] = useState<string[] | null>(null);
  const [halfChecked, setHalfChecked] = useState<string[]>([]);
  const tree = useMemo(() => buildTree(menus), [menus]);

  if (authorization.isLoading) return <LoadingState />;
  if (authorization.error)
    return <ErrorState error={authorization.error} onRetry={() => void authorization.refetch()} />;

  // Only leaf ids are "checked"; the tree works out the groups from them.
  const leafIds = new Set(
    menus.filter((m) => !menus.some((c) => c.parentId === m.id)).map((m) => m.id),
  );
  const current = checked ?? (authorization.data?.menuIds ?? []).filter((id) => leafIds.has(id));

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[60vh] overflow-y-auto rounded-[var(--oe-radius)] border border-line bg-surface-alt p-3">
        <Tree
          checkable
          defaultExpandAll
          selectable={false}
          treeData={tree}
          checkedKeys={current}
          onCheck={(keys, info) => {
            setChecked((Array.isArray(keys) ? keys : keys.checked).map(String));
            setHalfChecked((info.halfCheckedKeys ?? []).map(String));
          }}
        />
      </div>
      <div className="flex justify-end">
        <AppButton
          icon={<Save size={15} />}
          loading={save.isPending}
          disabled={checked === null}
          onClick={() =>
            // Groups that are partly ticked are saved too, so their children stay reachable.
            save.mutate(
              { roleId, menuIds: [...current, ...halfChecked] },
              { onSuccess: () => setChecked(null) },
            )
          }
        >
          Save
        </AppButton>
      </div>
    </div>
  );
}

export default function AuthorizationPage() {
  const roles = roleHooks.useList();
  const menus = menuHooks.useList();
  const [roleId, setRoleId] = useState<string>();

  return (
    <>
      <PageHeader
        title="Page Authorization"
        description="Choose a role, then tick the pages its users may open."
      />
      <AppCard
        title="Role"
        extra={
          <Select
            id="authorization-role"
            showSearch={{ optionFilterProp: 'label' }}
            placeholder="Select Role"
            className="!w-[260px]"
            value={roleId}
            onChange={setRoleId}
            loading={roles.isLoading}
            options={(roles.data ?? []).map((r) => ({ label: r.roleName, value: r.id }))}
            aria-label="Role"
          />
        }
      >
        {menus.error ? (
          <ErrorState error={menus.error} onRetry={() => void menus.refetch()} />
        ) : !roleId ? (
          <EmptyState compact title="Select a role" description="Its pages are shown here." />
        ) : menus.isLoading ? (
          <LoadingState />
        ) : (
          // key: start with fresh ticks when the role changes.
          <RoleTree key={roleId} roleId={roleId} menus={menus.data ?? []} />
        )}
      </AppCard>
    </>
  );
}
