import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from './Card';
import { cn } from '../utils/cn';

export interface ToolContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

function ToolContainer({
  title,
  description,
  children,
  className,
  headerAction,
}: ToolContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn('w-full', className)}
    >
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </CardHeader>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </Card>
    </motion.div>
  );
}

export { ToolContainer };
