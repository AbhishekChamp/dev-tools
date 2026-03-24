import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn(
          'relative inline-flex h-6 w-11 cursor-pointer items-center',
          'rounded-full bg-muted transition-colors',
          'has-[:checked]:bg-primary',
          className
        )}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          {...props}
        />
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-background',
            'shadow-lg ring-0 transition-transform',
            'translate-x-0.5 peer-checked:translate-x-5'
          )}
        />
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
