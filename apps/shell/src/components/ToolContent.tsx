import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ToolContentProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * ToolContent wrapper with consistent padding and styling
 * Used by the shell to wrap tool content area
 */
export function ToolContent({ children, className, noPadding = false }: ToolContentProps) {
  return (
    <div className={cn('flex-1 overflow-auto', !noPadding && 'p-4 sm:p-6 lg:p-8', className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[1920px]"
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Container for tool page layout with max width and centering
 */
export function ToolContainer({
  children,
  className,
  size = 'default',
}: ToolContentProps & { size?: 'default' | 'small' | 'large' | 'full' }) {
  const sizeClasses = {
    small: 'max-w-3xl',
    default: 'max-w-7xl',
    large: 'max-w-[1920px]',
    full: 'max-w-none',
  };

  return <div className={cn('mx-auto w-full', sizeClasses[size], className)}>{children}</div>;
}

/**
 * Section divider for tool content
 */
export function ToolSection({
  children,
  title,
  description,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Grid layout for tool panels (side by side layouts)
 */
export function ToolPanelGrid({
  children,
  columns = 2,
  className,
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
  };

  return <div className={cn('grid gap-4', columnClasses[columns], className)}>{children}</div>;
}

/**
 * Individual tool panel/card
 */
export function ToolPanel({
  children,
  title,
  icon: Icon,
  actions,
  className,
  minHeight,
}: {
  children: React.ReactNode;
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
  minHeight?: string | number;
}) {
  return (
    <div
      className={cn(
        'bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm',
        className
      )}
      style={{ minHeight }}
    >
      {(title || actions) && (
        <div className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
            {title && <span className="text-sm font-semibold">{title}</span>}
          </div>
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>
      )}
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * Text area specifically designed for tool input/output
 */
export function ToolTextArea({
  value,
  onChange,
  placeholder,
  readOnly = false,
  className,
}: {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      className={cn(
        'absolute inset-0 h-full w-full resize-none',
        'border-0 bg-transparent p-4 font-mono text-sm',
        'focus:outline-none focus:ring-0',
        readOnly && 'bg-muted/20',
        className
      )}
      spellCheck={false}
    />
  );
}

/**
 * Action bar for tool buttons
 */
export function ToolActionBar({
  children,
  className,
  align = 'center',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-3', alignClasses[align], className)}>
      {children}
    </div>
  );
}

/**
 * Stats grid for tool statistics
 */
export function ToolStatsGrid({
  children,
  className,
  columns = 6,
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4 | 6 | 9;
}) {
  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    9: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-9',
  };

  return <div className={cn('grid gap-3', columnClasses[columns], className)}>{children}</div>;
}

/**
 * Stat card for tool statistics
 */
export function ToolStatCard({
  label,
  value,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
      className="bg-card rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-xs font-medium uppercase tracking-wider">
            {label}
          </p>
          <p className="truncate text-xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
