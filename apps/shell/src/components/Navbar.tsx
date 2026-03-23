import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Wrench,
  Command,
  X,
  Home,
  Heart,
  Settings,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button, ThemeToggle } from '@dev-tools/ui';
import { builtInTools, getIconComponent } from '@/utils/tools';
import { cn } from '@/utils/cn';

// Global Search Component
function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tools based on search query
  const filteredTools = query.trim()
    ? builtInTools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query.toLowerCase()) ||
          tool.description.toLowerCase().includes(query.toLowerCase()) ||
          tool.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      )
    : [];

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (route: string) => {
      navigate({ to: route });
      setIsOpen(false);
      setQuery('');
    },
    [navigate]
  );

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-background/50 px-3 py-2',
          'text-sm text-muted-foreground transition-colors hover:bg-accent',
          'w-64 lg:w-80'
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search tools...</span>
        <kbd className="hidden rounded bg-muted px-1.5 py-0.5 text-xs font-medium lg:inline-block">
          <Command className="inline h-3 w-3" />K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />

            {/* Search Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2"
            >
              <div className="overflow-hidden rounded-xl border bg-card shadow-2xl">
                {/* Search Input */}
                <div className="flex items-center gap-3 border-b px-4 py-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search tools by name, description, or tags..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="rounded p-1 hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <kbd className="hidden rounded bg-muted px-2 py-1 text-xs lg:block">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {query.trim() ? (
                    filteredTools.length > 0 ? (
                      <div className="space-y-1">
                        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          Tools
                        </p>
                        {filteredTools.map((tool) => {
                          const Icon = getIconComponent(tool.icon);
                          return (
                            <button
                              key={tool.id}
                              onClick={() => handleSelect(tool.route)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-2 py-2.5',
                                'text-left transition-colors hover:bg-accent'
                              )}
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{tool.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {tool.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Sparkles className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium">No tools found</p>
                        <p className="text-xs text-muted-foreground">
                          Try a different search term
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-1">
                      <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        All Tools
                      </p>
                      {builtInTools.map((tool) => {
                        const Icon = getIconComponent(tool.icon);
                        return (
                          <button
                            key={tool.id}
                            onClick={() => handleSelect(tool.route)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-lg px-2 py-2.5',
                              'text-left transition-colors hover:bg-accent'
                            )}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{tool.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {tool.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
                  <div className="flex gap-3">
                    <span>
                      <kbd className="rounded bg-background px-1.5 py-0.5">↑↓</kbd> Navigate
                    </span>
                    <span>
                      <kbd className="rounded bg-background px-1.5 py-0.5">↵</kbd> Select
                    </span>
                  </div>
                  <span>
                    <kbd className="rounded bg-background px-1.5 py-0.5">ESC</kbd> Close
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Navbar Link
interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

function NavLink({ to, icon, label, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// Main Navbar
export function Navbar() {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 right-0 top-0 z-40 border-b bg-card/80 backdrop-blur-xl"
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ duration: 0.2 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          >
            <Wrench className="h-5 w-5" />
          </motion.div>
          <span className="hidden text-xl font-bold tracking-tight lg:block">
            DevTools
          </span>
        </Link>

        {/* Search */}
        <div className="mx-4 flex-1 max-w-xl">
          <GlobalSearch />
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/"
              icon={<Home className="h-4 w-4" />}
              label="Home"
              isActive={currentPath === '/'}
            />
            <NavLink
              to="/favorites"
              icon={<Heart className="h-4 w-4" />}
              label="Favorites"
              isActive={currentPath === '/favorites'}
            />
            <NavLink
              to="/settings"
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              isActive={currentPath === '/settings'}
            />
            <NavLink
              to="/about"
              icon={<Info className="h-4 w-4" />}
              label="About"
              isActive={currentPath === '/about'}
            />
          </nav>

          <div className="ml-2 pl-2 border-l">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
