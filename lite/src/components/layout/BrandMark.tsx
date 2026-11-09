/**
 * OneEngine logo: a hub node orchestrating three connected nodes, on the brand gradient.
 * The only place (with the login visual) where the brand gradient is used.
 */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="oe-brand-fill relative inline-flex shrink-0 items-center justify-center shadow-sm"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
    >
      <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 12 5.5 6.5M12 12l6.5-5.5M12 12v7.5"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="5.5" cy="6.5" r="2.1" fill="currentColor" />
        <circle cx="18.5" cy="6.5" r="2.1" fill="currentColor" />
        <circle cx="12" cy="19.5" r="2.1" fill="currentColor" />
        <circle cx="12" cy="12" r="3.2" fill="currentColor" />
      </svg>
    </span>
  );
}
