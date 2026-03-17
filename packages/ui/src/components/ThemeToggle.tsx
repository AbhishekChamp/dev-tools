import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@dev-tools/theme';
import { Button } from './Button';
import { cn } from '../utils/cn';

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
];

function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={theme === value ? 'secondary' : 'ghost'}
          size="icon"
          className="relative"
          onClick={() => setTheme(value)}
          title={label}
        >
          <AnimatePresence mode="wait">
            {theme === value && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 rounded-md bg-secondary"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </AnimatePresence>
          <Icon className="relative z-10 h-4 w-4" />
          {showLabel && <span className="sr-only">{label}</span>}
        </Button>
      ))}
    </div>
  );
}

export { ThemeToggle };
