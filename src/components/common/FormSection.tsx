import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Titled group of fields inside a form card. Sections stack with a divider between them; on wide
 * screens the heading sits in a narrow left column next to the fields.
 */
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-x-10 gap-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0 lg:grid-cols-[220px_1fr]">
      <div>
        <h3 className="m-0 font-sans text-[13px] font-semibold tracking-normal text-fg">{title}</h3>
        {description && (
          <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-fg-muted">{description}</p>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** Vertical stack of form sections. */
export function FormSections({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-6">{children}</div>;
}
