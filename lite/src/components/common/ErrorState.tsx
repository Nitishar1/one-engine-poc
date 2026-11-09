import { RotateCw, TriangleAlert } from 'lucide-react';
import { getErrorMessage } from '@/utils/helpers';
import { AppButton } from './AppButton';

interface ErrorStateProps {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
}

export function ErrorState({ error, title = 'Unable to load data', onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-1.5 px-4 py-14 text-center"
    >
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--oe-error)_30%,transparent)] bg-[color-mix(in_srgb,var(--oe-error)_10%,transparent)] text-danger">
        <TriangleAlert size={20} strokeWidth={1.9} />
      </span>
      <p className="m-0 text-[14px] font-medium text-fg">{title}</p>
      <p className="m-0 max-w-md text-[13px] text-fg-muted">
        {getErrorMessage(error, 'An unexpected error occurred.')}
      </p>
      {onRetry && (
        <AppButton
          tone="secondary"
          className="mt-4"
          icon={<RotateCw size={14} />}
          onClick={onRetry}
        >
          Try again
        </AppButton>
      )}
    </div>
  );
}
