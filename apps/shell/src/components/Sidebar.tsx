import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Heart,
  Settings,
  Menu,
  ChevronLeft,
  Wrench,
} from 'lucide-react';
import { Button, ThemeToggle } from '@dev-tools/ui';
import { useSidebar } from '@/stores';
import { cn } from '@/utils/cn';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

function SidebarItem({
  to,
  icon,
  label,
  isActive,
  isCollapsed,
}: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
        'transition-colors duration-200',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {icon}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export function Sidebar() {
  const { isOpen, toggle } = useSidebar();
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const mainItems = [
    { to: '/', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { to: '/favorites', icon: <Heart className="h-5 w-5" />, label: 'Favorites' },
  ];

  const bottomItems = [
    { to: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card',
        'transition-colors duration-200'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Wrench className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">DevTools</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn('shrink-0', !isOpen && 'mx-auto')}
        >
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.div>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto sidebar-scroll">
        {mainItems.map((item) => (
          <SidebarItem
            key={item.to}
            {...item}
            isActive={currentPath === item.to}
            isCollapsed={!isOpen}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t p-3 space-y-1">
        {bottomItems.map((item) => (
          <SidebarItem
            key={item.to}
            {...item}
            isActive={currentPath === item.to}
            isCollapsed={!isOpen}
          />
        ))}
        <div className={cn('pt-2', !isOpen && 'flex justify-center')}> 
          <ThemeToggle showLabel={isOpen} />
        </div>
      </div>
    </motion.aside>
  );
}
