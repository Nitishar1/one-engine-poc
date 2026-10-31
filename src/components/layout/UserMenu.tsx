import { useState } from 'react';
import { Dropdown } from 'antd';
import { ChevronDown, KeyRound, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';
import { formatDateTime } from '@/utils/formatters';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

function Avatar({ name, size }: { name: string; size: number }) {
  return (
    <span
      aria-hidden
      className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-[image:var(--oe-gradient-primary)] font-semibold text-white shadow-sm ring-2 ring-[color-mix(in_srgb,var(--oe-primary)_22%,transparent)]"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials(name)}
      <span
        className="absolute -bottom-px -right-px rounded-full border-2 border-[var(--oe-header-bg)] bg-success"
        style={{ width: Math.max(8, size * 0.3), height: Math.max(8, size * 0.3) }}
      />
    </span>
  );
}

const menuItemClass =
  'flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-[7px] border-0 bg-transparent px-2.5 text-left text-[13.5px] text-fg-secondary transition-colors duration-150 hover:bg-hover hover:text-fg disabled:cursor-wait disabled:opacity-60';

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (!user) return null;

  const panel = (
    <div
      role="menu"
      className="w-[min(288px,calc(100vw-24px))] overflow-hidden rounded-xl border border-line-strong bg-surface-elevated shadow-pop [animation:oe-pop-in_0.16s_var(--oe-ease)_both]"
      style={{ backgroundImage: 'var(--oe-gradient-soft)' }}
    >
      <div className="flex items-center gap-3 p-4">
        <Avatar name={user.displayName} size={40} />
        <div className="min-w-0">
          <p className="m-0 truncate text-[14px] font-semibold text-fg">{user.displayName}</p>
          <p className="m-0 truncate text-[12.5px] text-fg-muted">
            {user.username}@{user.domain}
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-md border border-[color-mix(in_srgb,var(--oe-primary)_25%,transparent)] bg-primary-soft px-1.5 py-0.5 text-[11px] font-medium text-primary">
          {user.role}
        </span>
      </div>
      <dl className="m-0 mx-4 mb-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg border border-line bg-surface-alt px-3 py-2.5 text-[12.5px]">
        <dt className="text-fg-muted">Last login</dt>
        <dd className="m-0 text-right font-mono text-[12px] text-fg-secondary">
          {formatDateTime(user.lastLogin)}
        </dd>
        <dt className="text-fg-muted">Timezone</dt>
        <dd className="m-0 truncate text-right text-fg-secondary">{user.timezone}</dd>
      </dl>
      <div className="border-t border-line p-1.5">
        <button
          type="button"
          role="menuitem"
          className={menuItemClass}
          onClick={() => {
            setOpen(false);
            setChangePasswordOpen(true);
          }}
        >
          <KeyRound size={15} /> Change password
        </button>
        <button
          type="button"
          role="menuitem"
          className={`${menuItemClass} hover:!text-danger`}
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          {logout.isPending ? <span className="oe-btn-spinner" /> : <LogOut size={15} />}
          {logout.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={['click']}
        placement="bottomRight"
        popupRender={() => panel}
      >
        <button
          type="button"
          aria-label="Open user menu"
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex h-9 cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent py-0 pl-0.5 pr-0.5 text-[13px] font-medium text-fg transition-colors duration-150 hover:bg-hover sm:rounded-[9px] sm:pr-2"
        >
          <Avatar name={user.displayName} size={28} />
          <span className="hidden max-w-[140px] truncate lg:inline">{user.displayName}</span>
          <ChevronDown
            size={14}
            className={`hidden text-fg-muted transition-transform duration-200 sm:inline ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </Dropdown>
      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </>
  );
}
