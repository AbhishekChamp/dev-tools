import React, { Suspense, lazy } from 'react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { useTheme } from '@dev-tools/theme';
import { ErrorBoundary } from './components/ErrorBoundary';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const { resolvedTheme } = useTheme();

  return (
    <div className={resolvedTheme}>
      <RouterProvider router={router} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
