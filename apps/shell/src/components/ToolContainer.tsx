import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import type { Tool } from '@/types';

interface ToolContainerProps {
  tool: Tool;
  children: React.ReactNode;
}

function ToolSkeleton() {
  return (
    <div className="flex h-full flex-col space-y-4 p-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

function ToolError({ error }: { error: Error }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Failed to load tool</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message || 'An error occurred while loading the tool.'}
      </p>
    </div>
  );
}

export function ToolContainer({ tool, children }: ToolContainerProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Tool Header - Shell provides this */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b bg-card px-4 py-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <span className="text-lg font-bold">{tool.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">{tool.name}</h1>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </div>
        </div>
      </motion.header>

      {/* Tool Content */}
      <div className="flex-1 overflow-hidden">
        <ErrorBoundary fallback={ToolError}>
          <Suspense fallback={<ToolSkeleton />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
