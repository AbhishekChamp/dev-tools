import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { ToolCategory } from '@/types';

const categories: { value: ToolCategory; label: string }[] = [
  { value: 'all', label: 'All Tools' },
  { value: 'formatter', label: 'Formatters' },
  { value: 'encoder', label: 'Encoders' },
  { value: 'generator', label: 'Generators' },
  { value: 'tester', label: 'Testers' },
  { value: 'converter', label: 'Converters' },
];

interface CategoryFilterProps {
  value: ToolCategory;
  onChange: (category: ToolCategory) => void;
  className?: string;
}

export function CategoryFilter({ value, onChange, className }: CategoryFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChange(category.value)}
          className={cn(
            'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
            'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2',
            value === category.value
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          {value === category.value && (
            <motion.div
              layoutId="activeCategory"
              className="bg-primary absolute inset-0 rounded-full"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{category.label}</span>
        </button>
      ))}
    </div>
  );
}
