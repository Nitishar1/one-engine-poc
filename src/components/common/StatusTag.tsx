const TONES: Record<string, string> = {
  Active: 'var(--oe-success)',
  Success: 'var(--oe-success)',
  Inactive: 'var(--oe-text-muted)',
  Failed: 'var(--oe-error)',
  Running: 'var(--oe-info)',
  Maintenance: 'var(--oe-warning)',
};

/** Status chip with a coloured dot; "Running" pulses. */
export function StatusTag({ status }: { status: string }) {
  return (
    <span
      className={`oe-status ${status === 'Running' ? 'is-live' : ''}`}
      style={{ ['--tone' as string]: TONES[status] ?? 'var(--oe-text-muted)' }}
    >
      <span className="oe-status__dot" aria-hidden />
      {status}
    </span>
  );
}
