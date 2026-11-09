/** Placeholder shown instead of a secret; the real value never reaches the browser. */
export function MaskedValue() {
  return (
    <span className="font-mono tracking-[0.2em] text-fg-muted" aria-label="Hidden value">
      ********
    </span>
  );
}
