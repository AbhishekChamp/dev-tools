import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Settings2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Switch } from '@dev-tools/ui';
import { ThemeToggle } from '@dev-tools/ui';
import { useFavorites, useSidebar } from '@/stores';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { favorites, removeFavorite } = useFavorites();
  const { isOpen, toggle } = useSidebar();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Settings2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Customize your Dev Tools experience
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color theme
                </p>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sidebar</p>
                <p className="text-sm text-muted-foreground">
                  Keep sidebar expanded by default
                </p>
              </div>
              <Switch checked={isOpen} onChange={toggle} />
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Favorites</p>
                <p className="text-sm text-muted-foreground">
                  {favorites.length} tool{favorites.length !== 1 ? 's' : ''} in favorites
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  favorites.forEach((id) => removeFavorite(id))
                }
                disabled={favorites.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Dev Tools Platform</strong> - Version 1.0.0
            </p>
            <p className="text-sm text-muted-foreground">
              A micro-frontend developer tools platform built with React,
              TypeScript, and Vite.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
