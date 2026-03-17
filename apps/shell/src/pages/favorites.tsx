import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@dev-tools/ui';
import { ToolCard } from '@/components/ToolCard';
import { useFavorites } from '@/stores';
import { builtInTools } from '@/utils/tools';

export const Route = createFileRoute('/favorites')({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites } = useFavorites();

  const favoriteTools = builtInTools.filter((tool) =>
    favorites.includes(tool.id)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tools
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
            <Heart className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
            <p className="text-muted-foreground">
              Your favorite developer tools
            </p>
          </div>
        </div>
      </motion.div>

      {/* Favorites Grid */}
      {favoriteTools.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {favoriteTools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center"
        >
          <Heart className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No favorites yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Add tools to your favorites by clicking the heart icon on any tool
            card.
          </p>
          <Link to="/">
            <Button className="mt-6">Browse Tools</Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
