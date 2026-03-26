import { useState, useEffect } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, Home, Heart } from 'lucide-react';
import { getToolByRoute, getIconComponent } from '@/utils/tools';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useFavorites } from '@/stores/favorites';
import { cn } from '@/utils/cn';

export const Route = createFileRoute('/$toolId')({
  component: ToolPage,
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-2xl font-bold">Tool not found</h1>
      <p className="text-muted-foreground">The requested tool could not be found.</p>
    </div>
  ),
});

// Tool loading skeleton
function ToolSkeleton() {
  return (
    <div className="flex h-full flex-col space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div className="bg-muted h-12 w-12 animate-pulse rounded-xl" />
        <div className="space-y-2">
          <div className="bg-muted h-6 w-48 animate-pulse rounded" />
          <div className="bg-muted h-4 w-64 animate-pulse rounded" />
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <div className="bg-muted h-48 animate-pulse rounded-xl" />
        <div className="bg-muted h-48 animate-pulse rounded-xl" />
      </div>
    </div>
  );
}

// Tool error fallback
function ToolError({ error }: { error: Error }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Failed to load tool</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {error.message || 'An error occurred while loading the tool.'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-primary text-primary-foreground mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
      >
        <Loader2 className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}

// Favorite button component
function FavoriteButton({ toolId }: { toolId: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(toolId);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => toggleFavorite(toolId)}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
        favorite
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      )}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart className={cn('h-5 w-5', favorite && 'fill-current')} />
    </motion.button>
  );
}

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ToolPage() {
  const { toolId } = Route.useParams();
  const tool = getToolByRoute(`/${toolId}`);
  const IconComponent = tool ? getIconComponent(tool.icon) : () => null;
  const [isLoading, setIsLoading] = useState(true);

  // Track recent tool access
  useEffect(() => {
    if (tool) {
      const recent = JSON.parse(localStorage.getItem('dev-tools-recent') || '[]');
      const updated = [tool.id, ...recent.filter((id: string) => id !== tool.id)].slice(0, 5);
      localStorage.setItem('dev-tools-recent', JSON.stringify(updated));
    }
  }, [tool]);

  // Set embedded context when tool changes
  useEffect(() => {
    if (tool && typeof window !== 'undefined') {
      const context = {
        isEmbedded: true,
        parentOrigin: window.location.origin,
        toolId: tool.id,
      };
      sessionStorage.setItem('__dev_tools_embedded_context__', JSON.stringify(context));

      // Add embed query param without reload
      const url = new URL(window.location.href);
      url.searchParams.set('embed', 'true');
      window.history.replaceState({}, '', url);

      // Simulate loading complete after a short delay
      const timer = setTimeout(() => setIsLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [tool]);

  if (!tool) {
    return notFound();
  }

  // Get the pre-loaded component
  const ToolComponent = tool.component;

  if (!ToolComponent) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Tool component not available</p>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Shell-Provided Tool Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card border-b"
      >
        <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-3">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
                { label: tool.name },
              ]}
            />
          </div>

          {/* Tool Header Content */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-xl"
              >
                <IconComponent className="h-6 w-6" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold">{tool.name}</h1>
                <p className="text-muted-foreground text-sm">{tool.description}</p>
              </div>
            </div>

            {/* Favorite Button */}
            <FavoriteButton toolId={tool.id} />
          </div>
        </div>
      </motion.header>

      {/* Tool Content Area */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-background absolute inset-0 z-10"
            >
              <ToolSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        <ErrorBoundary fallback={ToolError}>
          <PageTransition>
            <div className="h-full overflow-auto">
              <ToolComponent />
            </div>
          </PageTransition>
        </ErrorBoundary>
      </div>
    </div>
  );
}
