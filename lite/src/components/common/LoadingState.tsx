export function LoadingState({
  label = 'Loading...',
  fullHeight = false,
}: {
  label?: string;
  fullHeight?: boolean;
}) {
  return (
    <div
      role="status"
      className={`oe-animate-in flex flex-col items-center justify-center gap-3 py-12 text-fg-muted ${fullHeight ? 'h-full min-h-[50vh]' : ''}`}
    >
      <span className="oe-spinner" aria-hidden />
      <span className="text-[12.5px] font-medium">{label}</span>
    </div>
  );
}
