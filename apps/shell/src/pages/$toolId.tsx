import * as React from 'react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button, Badge } from '@dev-tools/ui';
import { RemoteToolLoader } from '@/components/RemoteToolLoader';
import { useFavorites } from '@/stores';
import { getToolByRoute } from '@/utils/tools';

export const Route = createFileRoute('/$toolId')({
  component: ToolPage,
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-2xl font-bold">Tool not found</h1>
      <p className="text-muted-foreground">
        The requested tool could not be found.
      </p>
      <Link to="/">
        <Button className="mt-4">Go Home</Button>
      </Link>
    </div>
  ),
});

function ToolPage() {
  const { toolId } = Route.useParams();
  const tool = getToolByRoute(`/${toolId}`);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!tool) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFavorite(tool.id)}
          >
            <Heart
              className={
                isFavorite(tool.id)
                  ? 'fill-red-500 text-red-500 mr-2'
                  : 'mr-2'
              }
            />
            {isFavorite(tool.id) ? 'Remove from Favorites' : 'Add to Favorites'}
          </Button>
        </div>

        <div className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight">{tool.name}</h1>
          <p className="mt-2 text-muted-foreground">{tool.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{tool.category}</Badge>
            {tool.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tool Workspace */}
      <div className="tool-workspace">
        <RemoteToolLoader />
      </div>
    </div>
  );
}
