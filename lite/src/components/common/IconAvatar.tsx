import { resolveIcon } from './iconRegistry';

interface IconAvatarProps {
  icon?: string | null;
  size?: number;
}

/** Blue-tinted tile with an icon from the registry (menus, reports). */
export function IconAvatar({ icon, size = 40 }: IconAvatarProps) {
  const Icon = resolveIcon(icon);
  return (
    <span
      aria-hidden
      className="oe-icon-tile is-reactive relative"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.26) }}
    >
      <Icon size={Math.round(size * 0.46)} strokeWidth={1.75} />
    </span>
  );
}
