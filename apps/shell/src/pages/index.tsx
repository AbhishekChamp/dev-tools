import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Wrench, Sparkles, Zap, Shield } from 'lucide-react';
import { AppCard } from '@dev-tools/ui';
import { CategoryFilter } from '@/components/CategoryFilter';
import { builtInTools, filterTools, getIconComponent } from '@/utils/tools';
import type { ToolCategory } from '@/types';

export const Route = createFileRoute('/')({
  component: HomePage,
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

function HomePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  const filteredTools = filterTools(builtInTools, '', selectedCategory);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="from-primary/10 via-primary/5 to-background relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 lg:p-12"
      >
        {/* Background decoration */}
        <div className="bg-primary/10 absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            <span>5 Developer Tools Available</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight lg:text-5xl"
          >
            Developer Tools Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mt-4 max-w-2xl text-lg"
          >
            A collection of powerful utilities to help you format, validate, and transform data. All
            tools run locally in your browser for maximum privacy.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-6"
          >
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Lightning Fast</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Privacy First</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Wrench className="text-primary h-4 w-4" />
              <span>Always Free</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Category Filter */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Available Tools</h2>
          <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />
        </div>
      </motion.section>

      {/* Tools Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredTools.map((tool, index) => {
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
      </motion.section>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center"
        >
          <div className="bg-muted rounded-full p-4">
            <Sparkles className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No tools found</h3>
          <p className="text-muted-foreground">Try selecting a different category.</p>
        </motion.div>
      )}

      {/* Footer Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-muted-foreground text-center text-sm"
      >
        Press <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono">⌘K</kbd> or{' '}
        <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono">Ctrl+K</kbd> to quickly search
        tools
      </motion.p>
    </div>
  );
}
