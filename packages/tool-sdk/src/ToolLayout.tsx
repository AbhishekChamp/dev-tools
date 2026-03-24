import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Wrench,
  FileJson,
  Regex,
  KeyRound,
  ArrowLeftRight,
  Lock,
  Home,
  Command
} from 'lucide-react';
import { useRouter } from '@tanstack/react-router';

// Tool definitions for navigation
const tools = [
  { id: 'json', name: 'JSON Formatter', route: '/json', icon: FileJson, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'regex', name: 'Regex Tester', route: '/regex', icon: Regex, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { id: 'jwt', name: 'JWT Decoder', route: '/jwt', icon: KeyRound, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { id: 'base64', name: 'Base64 Tool', route: '/base64', icon: ArrowLeftRight, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { id: 'password', name: 'Password Generator', route: '/password', icon: Lock, color: 'text-red-500', bgColor: 'bg-red-500/10' },
];

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  bgColor?: string;
  actions?: React.ReactNode;
}

// Quick switcher dropdown
function ToolSwitcher({ currentTool }: { currentTool: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentToolData = tools.find(t => t.id === currentTool) || tools[0];
  const Icon = currentToolData.icon;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        <Icon className={`h-4 w-4 ${currentToolData.color}`} />
        <span className="hidden sm:inline">{currentToolData.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border bg-card shadow-xl"
            >
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Switch Tool
                </p>
                {tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const isActive = tool.id === currentTool;
                  return (
                    <a
                      key={tool.id}
                      href={`http://localhost:3000${tool.route}`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tool.bgColor}`}>
                        <ToolIcon className={`h-4 w-4 ${tool.color}`} />
                      </div>
                      <span className="flex-1">{tool.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="h-2 w-2 rounded-full bg-primary-foreground"
                        />
                      )}
                    </a>
                  );
                })}
              </div>
              <div className="border-t p-2">
                <a
                  href="http://localhost:3000/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Home className="h-4 w-4" />
                  <span>Back to Home</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ToolLayout({ 
  children, 
  title, 
  description, 
  icon, 
  color = 'text-primary',
  bgColor = 'bg-primary/10',
  actions 
}: ToolLayoutProps) {
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const currentToolId = currentPath.replace('/', '') || 'json';

  return (
    <div className="min-h-screen bg-background">
      {/* Nested Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Back to Shell */}
              <a
                href="http://localhost:3000/"
                className="flex items-center gap-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="Back to DevTools Home"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Wrench className="h-4 w-4" />
                </div>
              </a>

              <div className="h-6 w-px bg-border" />

              {/* Tool Switcher */}
              <ToolSwitcher currentTool={currentToolId} />
            </div>

            {/* Center - Keyboard hint */}
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">
                <Command className="inline h-3 w-3" />E
              </kbd>
              <span>Switch Tool</span>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
              {actions}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bgColor} ${color}`}
            >
              {icon}
            </motion.div>

            {/* Title & Description */}
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold tracking-tight"
              >
                {title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-1 text-lg text-muted-foreground"
              >
                {description}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Tool Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

// Stat Card Component for tools
export function StatCard({ 
  label, 
  value, 
  icon, 
  delay = 0 
}: { 
  label: string; 
  value: string | number; 
  icon?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Action Button Component
export function ActionButton({ 
  children, 
  onClick, 
  variant = 'primary',
  icon,
  disabled = false
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]}`}
    >
      {icon}
      {children}
    </motion.button>
  );
}

// Section Card Component
export function SectionCard({ 
  children, 
  title, 
  icon,
  delay = 0,
  className = ''
}: { 
  children: React.ReactNode; 
  title?: string;
  icon?: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-2xl border bg-card shadow-sm overflow-hidden ${className}`}
    >
      {title && (
        <div className="flex items-center gap-3 border-b bg-muted/30 px-6 py-4">
          {icon && <div className="text-primary">{icon}</div>}
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}

// Input Area Component
export function InputArea({ 
  value, 
  onChange, 
  placeholder,
  label,
  error,
  rows = 10
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string;
  label?: string;
  error?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">{label}</label>
      )}
      <motion.div
        animate={error ? { x: [-2, 2, -2, 2, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full rounded-xl border bg-background px-4 py-3 font-mono text-sm resize-y transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            error ? 'border-red-500 focus:border-red-500' : 'border-input'
          }`}
          spellCheck={false}
        />
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 flex items-center gap-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Output Area Component
export function OutputArea({ 
  children, 
  label,
  actions,
  copyValue,
  onCopy
}: { 
  children: React.ReactNode; 
  label?: string;
  actions?: React.ReactNode;
  copyValue?: string;
  onCopy?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyValue) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy errors
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <label className="text-sm font-medium">{label}</label>}
        <div className="flex items-center gap-2">
          {actions}
          {copyValue && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors bg-muted hover:bg-muted/80"
            >
              {copied ? (
                <>
                  <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
      <div className="relative rounded-xl border bg-muted/30 overflow-hidden">
        <div className="p-4 min-h-[200px]">
          {children}
        </div>
      </div>
    </div>
  );
}
