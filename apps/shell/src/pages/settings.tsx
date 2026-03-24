import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Settings2, Trash2, Palette, Database, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@dev-tools/ui';
import { ThemeToggle } from '@dev-tools/ui';
import { useFavorites } from '@/stores';
import { useTheme } from '@dev-tools/theme';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { favorites, removeFavorite } = useFavorites();
  const { theme, resolvedTheme } = useTheme();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8"
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Settings2 className="h-7 w-7" />
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
        className="grid gap-6"
      >
        {/* Appearance */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Appearance</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize the look and feel
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Current: <Badge variant="outline" className="ml-1 capitalize">{theme}</Badge>
                  {' '}
                  (Resolved: <Badge variant="outline" className="capitalize">{resolvedTheme}</Badge>)
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Data</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your saved preferences
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Favorites</p>
                <p className="text-sm text-muted-foreground">
                  {favorites.length} tool{favorites.length !== 1 ? 's' : ''} saved to favorites
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
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Info className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">About</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Information about the platform
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Version</span>
              <Badge variant="outline">1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Built with</span>
              <span className="text-sm text-muted-foreground">React + TypeScript + Vite</span>
            </div>
            <p className="text-sm text-muted-foreground pt-2 border-t">
              A modern micro-frontend developer tools platform with a focus on 
              performance, privacy, and user experience.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Keyboard Shortcuts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Open Search</span>
                <kbd className="rounded bg-muted px-2 py-1 text-xs font-mono">⌘K / Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Toggle Theme</span>
                <kbd className="rounded bg-muted px-2 py-1 text-xs font-mono">Auto</kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
