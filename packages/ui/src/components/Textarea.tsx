import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'border-input bg-background flex min-h-[80px] w-full rounded-md border',
        'ring-offset-background placeholder:text-muted-foreground px-3 py-2 text-sm',
        'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        'resize-y transition-all duration-200',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
