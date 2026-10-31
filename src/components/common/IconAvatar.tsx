import { ICON_REGISTRY, type IconKey } from './iconRegistry';

interface IconAvatarProps {
  icon: IconKey;
  size?: number;
}

/** Blue-tinted tile with the entity's icon — the agent / AI agent / CI type avatar. */
export function IconAvatar({ icon, size = 40 }: IconAvatarProps) {
  const entry = ICON_REGISTRY[icon] ?? ICON_REGISTRY.globe;
  const Icon = entry.icon;
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
