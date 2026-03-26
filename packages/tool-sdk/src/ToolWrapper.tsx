import React, { Suspense, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, Skeleton } from '@dev-tools/ui';
import type { ToolMetadata } from './types';

export interface ToolWrapperProps {
  children: ReactNode;
  metadata: ToolMetadata;
  isLoading?: boolean;
}

export function ToolWrapper({
  children,
  metadata: _metadata,
  isLoading = false,
}: ToolWrapperProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function withToolWrapper<P extends object>(
  Component: React.ComponentType<P>,
  metadata: ToolMetadata
) {
  return function WrappedComponent(props: P) {
    return (
      <ToolWrapper metadata={metadata}>
        <Component {...props} />
      </ToolWrapper>
    );
  };
}

export interface ToolErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ToolErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ToolErrorBoundary extends React.Component<
  ToolErrorBoundaryProps,
  ToolErrorBoundaryState
> {
  constructor(props: ToolErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ToolErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Tool Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card className="border-destructive p-6">
            <h3 className="text-destructive text-lg font-semibold">Something went wrong</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}

export function ToolSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <Card className="w-full">
          <div className="space-y-4 p-6">
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
      {children}
    </Suspense>
  );
}
