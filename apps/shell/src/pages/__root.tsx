import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Navbar } from '@/components/Navbar';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col pt-16">
        <Outlet />
      </div>
      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </div>
  );
}
