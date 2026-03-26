import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { cn } from '../utils/cn';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

function EmptyState({
  title = 'No items found',
  description = 'Get started by creating a new item.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed',
        'animate-in fade-in-50 p-8 text-center',
        className
      )}
    >
      <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
        {icon || <Package className="text-muted-foreground h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export { EmptyState };
