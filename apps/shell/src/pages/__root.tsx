import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Navbar } from '@/components/Navbar';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </div>
  );
}
