import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Card, Skeleton } from '@dev-tools/ui';
import { getToolByRoute } from '@/utils/tools';

export function RemoteToolLoader() {
  const { toolId } = useParams({ strict: false });
  const [error, setError] = useState<Error | null>(null);
  const tool = toolId ? getToolByRoute(`/${toolId}`) : null;

  useEffect(() => {
    setError(null);
  }, [toolId]);

  if (!tool) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Tool not found</h2>
        <p className="text-muted-foreground">
          The requested tool could not be found.
        </p>
      </Card>
    );
  }

  if (!tool.component) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Tool not available</h2>
        <p className="text-muted-foreground">
          This tool is not currently loaded.
        </p>
      </Card>
    );
  }

  const ToolComponent = tool.component;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tool.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Suspense
          fallback={
            <Card className="w-full">
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <div className="space-y-2">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </Card>
          }
        >
          {error ? (
            <Card className="p-8 text-center border-destructive">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <h2 className="mt-4 text-lg font-semibold text-destructive">
                Failed to load tool
              </h2>
              <p className="text-muted-foreground mt-2">{error.message}</p>
            </Card>
          ) : (
            <ToolComponent />
          )}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
