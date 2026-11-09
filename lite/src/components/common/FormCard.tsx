import type { FormEventHandler, ReactNode } from 'react';
import { AppButton } from './AppButton';
import { AppCard } from './AppCard';
import { LoadingState } from './LoadingState';

interface FormCardProps {
  title: string;
  description?: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onBack: () => void;
  saving?: boolean;
  loading?: boolean;
  submitLabel?: string;
  children: ReactNode;
}

/** Create / edit form surface: grouped fields with Cancel and Save in the footer. */
export function FormCard({
  title,
  description,
  onSubmit,
  onBack,
  saving,
  loading,
  submitLabel = 'Save',
  children,
}: FormCardProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="oe-animate-in">
      <AppCard
        title={title}
        description={description ?? 'Fields marked * are required.'}
        bodyClassName="px-5 py-6 sm:px-6"
        footer={
          <>
            <AppButton tone="secondary" onClick={onBack} disabled={saving}>
              Cancel
            </AppButton>
            <AppButton htmlType="submit" loading={saving} disabled={loading}>
              {submitLabel}
            </AppButton>
          </>
        }
      >
        {loading ? <LoadingState /> : children}
      </AppCard>
    </form>
  );
}
