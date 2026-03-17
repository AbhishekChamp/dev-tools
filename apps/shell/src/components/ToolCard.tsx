import React from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Heart, ExternalLink } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@dev-tools/ui';
import { useFavorites } from '@/stores';
import type { Tool } from '@/types';
import { getIconComponent } from '@/utils/tools';

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const Icon = getIconComponent(tool.icon);
  const favorite = isFavorite(tool.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Link to={tool.route}>
        <Card
          hover
          className="group relative cursor-pointer overflow-hidden"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {tool.description}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(tool.id);
                }}
              >
                <Heart
                  className={
                    favorite ? 'fill-red-500 text-red-500' : ''
                  }
                />
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{tool.category}</Badge>
              {tool.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
              {tool.tags.length > 2 && (
                <Badge variant="outline">+{tool.tags.length - 2}</Badge>
              )}
            </div>
          </CardContent>

          {/* Hover gradient */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </Card>
      </Link>
    </motion.div>
  );
}
