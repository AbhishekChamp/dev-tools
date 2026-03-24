import { Suspense } from 'react';
import { useParams } from '@tanstack/react-router';
import { AlertCircle } from 'lucide-react';
import { getToolByRoute } from '@/utils/tools';

export function RemoteToolLoader() {
  const { toolId } = useParams({ strict: false });
  const tool = toolId ? getToolByRoute(`/${toolId}`) : null;

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Tool not found</h2>
        <p className="text-muted-foreground">
          The requested tool could not be found.
        </p>
      </div>
    );
  }

  if (!tool.component) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Tool not available</h2>
        <p className="text-muted-foreground">
          This tool is not currently loaded.
        </p>
      </div>
    );
  }

  const ToolComponent = tool.component;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ToolComponent />
    </Suspense>
  );
}
