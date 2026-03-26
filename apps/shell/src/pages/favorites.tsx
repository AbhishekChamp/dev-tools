import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Button, AppCard } from '@dev-tools/ui';
import { useFavorites } from '@/stores';
import { builtInTools, getIconComponent } from '@/utils/tools';

export const Route = createFileRoute('/favorites')({
  component: FavoritesPage,
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function FavoritesPage() {
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const favoriteTools = builtInTools.filter((tool) => favorites.includes(tool.id));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="to-background relative overflow-hidden rounded-3xl border bg-gradient-to-br from-red-500/10 via-red-500/5 p-8 lg:p-12"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-red-500/5 blur-3xl" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-600 dark:text-red-400"
          >
            <Heart className="h-4 w-4" />
            <span>
              {favoriteTools.length} Favorite{favoriteTools.length !== 1 ? 's' : ''}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight lg:text-5xl"
          >
            Your Favorites
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mt-4 max-w-2xl text-lg"
          >
            Quick access to your most-used developer tools
          </motion.p>
        </div>
      </motion.div>

      {/* Favorites Grid */}
      {favoriteTools.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {favoriteTools.map((tool, index) => {
            const Icon = getIconComponent(tool.icon);
            return (
              <motion.div key={tool.id} variants={itemVariants}>
                <AppCard
                  title={tool.name}
                  description={tool.description}
                  icon={<Icon className="h-8 w-8" />}
                  onClick={() => navigate({ to: tool.route })}
                  delay={index * 0.1}
                />
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed p-16 text-center"
        >
          <div className="bg-muted rounded-full p-6">
            <Heart className="text-muted-foreground h-12 w-12" />
          </div>
          <h3 className="mt-6 text-xl font-semibold">No favorites yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Add tools to your favorites by clicking the heart icon on any tool page
          </p>
          <Link to="/">
            <Button className="mt-8 gap-2" size="lg">
              Browse All Tools
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Quick Actions */}
      {favoriteTools.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Link to="/">
            <Button variant="outline" size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Discover More Tools
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
