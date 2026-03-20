import * as React from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { RemoteToolLoader } from '@/components/RemoteToolLoader';
import { getToolByRoute } from '@/utils/tools';

export const Route = createFileRoute('/$toolId')({
  component: ToolPage,
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-2xl font-bold">Tool not found</h1>
      <p className="text-muted-foreground">
        The requested tool could not be found.
      </p>
    </div>
  ),
});

function ToolPage() {
  const { toolId } = Route.useParams();
  const tool = getToolByRoute(`/${toolId}`);

  if (!tool) {
    return notFound();
  }

  // Render the tool directly - it has its own complete layout
  return <RemoteToolLoader />;
}
