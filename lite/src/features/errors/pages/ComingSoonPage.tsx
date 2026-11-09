import { Construction } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';

/** A page that is in the backend menu but not built in this app yet. */
export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <section className="oe-card oe-card--tinted">
        <EmptyState
          icon={Construction}
          title={`${title} isn't available yet`}
          description="This page is in your menu but hasn't been built in this app yet."
        />
      </section>
    </>
  );
}
