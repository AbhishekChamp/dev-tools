import type { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  pulse?: boolean;
}

function Skeleton({ className, pulse = true, ...props }: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        'rounded-md bg-muted',
        pulse && 'animate-pulse',
        className
      )}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      {...props}
    />
  );
}

export { Skeleton };
