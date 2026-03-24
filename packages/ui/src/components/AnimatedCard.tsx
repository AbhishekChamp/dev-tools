import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glow?: boolean;
  delay?: number;
}

export function AnimatedCard({
  children,
  className,
  onClick,
  hover = true,
  glow = false,
  delay = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        hover
          ? {
              y: -4,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm',
        hover && 'cursor-pointer transition-shadow duration-300 hover:shadow-lg',
        glow && 'glow-effect dark:glow-effect-dark',
        className
      )}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// App Card for home page
interface AppCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
  delay?: number;
}

export function AppCard({ title, description, icon, onClick, delay = 0 }: AppCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl',
        'border bg-card p-8 shadow-sm',
        'transition-all duration-300',
        'hover:shadow-xl hover:border-primary/50'
      )}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Glow effect */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className={cn(
            'mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl',
            'bg-primary/10 text-primary',
            'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3'
          )}
        >
          {icon}
        </motion.div>
        
        {/* Title */}
        <h3 className="mb-2 text-xl font-semibold tracking-tight text-card-foreground">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
        
        {/* Arrow indicator */}
        <motion.div
          className="mt-6 flex items-center text-sm font-medium text-primary"
          initial={{ x: 0, opacity: 0.7 }}
          whileHover={{ x: 4, opacity: 1 }}
        >
          <span>Open Tool</span>
          <svg
            className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Stat Card for displaying metrics
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
}

export function StatCard({ label, value, icon, trend, trendValue, delay = 0 }: StatCardProps) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="rounded-xl border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <motion.h4
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay + 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight"
          >
            {value}
          </motion.h4>
          {trend && trendValue && (
            <p className={cn('mt-1 text-sm', trendColors[trend])}>
              {trend === 'up' && '↑ '}
              {trend === 'down' && '↓ '}
              {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
