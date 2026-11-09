import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { EmptyState } from '@/components/common/EmptyState';
import { ROUTES } from '@/config/routes';

/** Shown for URLs that are not in the user's menu. */
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="This page doesn't exist or isn't assigned to your role. Use the menu to find what you need."
        action={<AppButton onClick={() => navigate(ROUTES.home)}>Back to home</AppButton>}
      />
    </div>
  );
}
