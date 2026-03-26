import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  // If no items provided, generate from current path
  const breadcrumbItems: BreadcrumbItem[] = items || [
    { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
    ...generatePathItems(currentPath),
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('text-muted-foreground flex items-center gap-1 text-sm', className)}
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <React.Fragment key={item.label + index}>
            {index > 0 && <ChevronRight className="text-muted-foreground/50 h-4 w-4" />}

            {isLast || !item.href ? (
              <span
                className={cn('flex items-center gap-1.5', isLast && 'text-foreground font-medium')}
              >
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

function generatePathItems(path: string): BreadcrumbItem[] {
  if (path === '/' || path === '') return [];

  const segments = path.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Map of path segments to display names
  const displayNames: Record<string, string> = {
    json: 'JSON Formatter',
    regex: 'Regex Tester',
    jwt: 'JWT Decoder',
    base64: 'Base64 Tool',
    password: 'Password Generator',
    about: 'About',
    settings: 'Settings',
    favorites: 'Favorites',
  };

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    items.push({
      label: displayNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href,
    });
  });

  return items;
}

export function ToolBreadcrumb({ toolName }: { toolName: string }) {
  return (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
        { label: toolName },
      ]}
    />
  );
}
