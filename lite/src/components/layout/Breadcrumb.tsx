import { Breadcrumb as AntBreadcrumb } from 'antd';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigation } from '@/features/navigation/hooks/useNavigation';

export function Breadcrumb({ pathname }: { pathname: string }) {
  const crumbs = useNavigation().breadcrumbs(pathname);
  const items = crumbs.map((crumb, index) => {
    const isLast = index === crumbs.length - 1;
    // On small screens only the current page is shown.
    const className = isLast ? 'font-medium' : 'max-md:!hidden';
    return {
      key: `${crumb.label}-${index}`,
      className,
      title:
        crumb.path && !isLast ? (
          <Link to={crumb.path}>{crumb.label}</Link>
        ) : (
          <span aria-current={isLast ? 'page' : undefined}>{crumb.label}</span>
        ),
    };
  });
  return (
    <AntBreadcrumb
      items={items}
      separator={<ChevronRight size={13} className="relative top-[2px] max-md:hidden" />}
      className="min-w-0 truncate whitespace-nowrap"
    />
  );
}
