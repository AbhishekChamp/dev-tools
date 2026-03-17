import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/stores';
import { cn } from '@/utils/cn';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          'transition-all duration-300 ease-out',
          isOpen ? 'ml-60' : 'ml-[72px]'
        )}
      >
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </div>
  );
}
