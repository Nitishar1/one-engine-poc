import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}

/** Label + control + validation or hint text. */
export function FormField({
  label,
  required,
  error,
  htmlFor,
  children,
  className = '',
  hint,
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-fg">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <span role="alert" className="oe-animate-in text-[12.5px] text-danger">
          {error}
        </span>
      ) : (
        hint && <span className="text-[12.5px] text-fg-muted">{hint}</span>
      )}
    </div>
  );
}
