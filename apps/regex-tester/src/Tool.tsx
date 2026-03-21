import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Regex,
  Copy,
  Check,
  AlertCircle,
  Trash2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Zap,
  Search,
  Type,
  Hash,
  Target,
  FileCode,
  Command,
  X,
  Home,
  FileJson,
  KeyRound,
  ArrowLeftRight,
  Lock,
} from 'lucide-react';

// Tool definitions for Cmd+E switcher
const tools = [
  { id: 'json', name: 'JSON Formatter', route: 'http://localhost:3001', icon: FileJson, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'regex', name: 'Regex Tester', route: 'http://localhost:3002', icon: Regex, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'jwt', name: 'JWT Decoder', route: 'http://localhost:3003', icon: KeyRound, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'base64', name: 'Base64 Tool', route: 'http://localhost:3004', icon: ArrowLeftRight, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'password', name: 'Password Generator', route: 'http://localhost:3005', icon: Lock, color: 'text-red-500', bg: 'bg-red-500/10' },
];

interface RegexMatch {
  text: string;
  index: number;
  length: number;
  groups: string[];
}

interface RegexExample {
  name: string;
  pattern: string;
  flags: string;
  description: string;
  testString: string;
}

const REGEX_EXAMPLES: RegexExample[] = [
  {
    name: 'Email Address',
    pattern: '[\\w.-]+@[\\w.-]+\\.\\w+',
    flags: 'g',
    description: 'Match standard email addresses',
    testString: 'contact@example.com\nuser.name@domain.co.uk\ninvalid@email',
  },
  {
    name: 'URL',
    pattern: 'https?://[^\\s/$.?#].[^\\s]*',
    flags: 'gi',
    description: 'Match HTTP/HTTPS URLs',
    testString: 'Visit https://example.com or http://test.org/page',
  },
  {
    name: 'Phone Number (US)',
    pattern: '\\(?(\\d{3})\\)?[-.\\s]?(\\d{3})[-.\\s]?(\\d{4})',
    flags: 'g',
    description: 'Match US phone numbers',
    testString: 'Call (555) 123-4567 or 555.987.6543',
  },
  {
    name: 'IP Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    description: 'Match IPv4 addresses',
    testString: 'Server at 192.168.1.1 or 10.0.0.1',
  },
  {
    name: 'Hex Color',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'g',
    description: 'Match hex color codes',
    testString: 'Colors: #FF5733, #fff, #123ABC',
  },
  {
    name: 'Date (YYYY-MM-DD)',
    pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])',
    flags: 'g',
    description: 'Match dates in ISO format',
    testString: 'Meeting on 2024-03-15 and 2023-12-25',
  },
];

const FLAGS = [
  { flag: 'g', name: 'Global', description: 'Find all matches' },
  { flag: 'i', name: 'Ignore Case', description: 'Case-insensitive' },
  { flag: 'm', name: 'Multiline', description: '^ and $ match lines' },
  { flag: 's', name: 'Dot All', description: '. matches newlines' },
  { flag: 'u', name: 'Unicode', description: 'Unicode aware' },
  { flag: 'y', name: 'Sticky', description: 'Sticky matching' },
];

// Cmd+E Switcher Component
function ToolSwitcher() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
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
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg"
          >
            <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Command className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Switch Application</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  All Tools
                </p>
                {tools.map((tool, index) => {
                  const Icon = tool.icon;
                  const isActive = tool.id === 'regex';
                  return (
                    <motion.a
                      key={tool.id}
                      href={tool.route}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isActive ? 'bg-primary-foreground/20' : tool.bg
                      }`}>
                        <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : tool.color}`} />
                      </div>
                      <span className="flex-1 font-medium">{tool.name}</span>
                      {isActive && (
                        <span className="text-xs opacity-80">Current</span>
                      )}
                    </motion.a>
                  );
                })}
              </div>
              <div className="border-t bg-muted/30 px-4 py-3">
                <a
                  href="http://localhost:3000/"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-4 w-4" />
                  Back to DevTools Home
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Animated Stat Card
function StatCard({ label, value, icon: Icon, delay = 0 }: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
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

// Action Button with animation
// Action Button with animation
function ActionButton({ 
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
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none ${variants[variant]}`}
    >
      {icon}
      {children}
    </motion.button>
  );
}

export default function RegexTester() {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<Set<string>>(new Set(['g']));
  const [testString, setTestString] = useState<string>('');
  const [showExamples, setShowExamples] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleFlag = useCallback((flag: string) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) {
        next.delete(flag);
      } else {
        next.add(flag);
      }
      return next;
    });
  }, []);

  const { regex, error, matches } = useMemo(() => {
    if (!pattern) {
      return { regex: null, error: null, matches: [] };
    }

    try {
      const flagsStr = Array.from(flags).join('');
      const regex = new RegExp(pattern, flagsStr);
      const matches: RegexMatch[] = [];

      if (testString) {
        if (flags.has('g')) {
          let match;
          while ((match = regex.exec(testString)) !== null) {
            matches.push({
              text: match[0],
              index: match.index,
              length: match[0].length,
              groups: match.slice(1),
            });
            if (match.index === regex.lastIndex) {
              regex.lastIndex++;
            }
          }
        } else {
          const match = regex.exec(testString);
          if (match) {
            matches.push({
              text: match[0],
              index: match.index,
              length: match[0].length,
              groups: match.slice(1),
            });
          }
        }
      }

      return { regex, error: null, matches };
    } catch (err) {
      return {
        regex: null,
        error: err instanceof Error ? err.message : 'Invalid regex',
        matches: [],
      };
    }
  }, [pattern, flags, testString]);

  const highlightedText = useMemo(() => {
    if (!testString || !matches.length) return null;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    const matchColors = [
      'bg-purple-500/30 border-purple-500/50',
      'bg-blue-500/30 border-blue-500/50',
      'bg-green-500/30 border-green-500/50',
      'bg-orange-500/30 border-orange-500/50',
      'bg-pink-500/30 border-pink-500/50',
      'bg-cyan-500/30 border-cyan-500/50',
    ];

    matches.forEach((match, matchIndex) => {
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${matchIndex}`}>
            {testString.slice(lastIndex, match.index)}
          </span>
        );
      }

      const colorClass = matchColors[matchIndex % matchColors.length];
      elements.push(
        <motion.mark
          key={`match-${matchIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15, delay: matchIndex * 0.03 }}
          className={`rounded px-0.5 py-0.5 border-b-2 font-medium ${colorClass}`}
          title={`Match ${matchIndex + 1} at position ${match.index}`}
        >
          {match.text}
        </motion.mark>
      );

      lastIndex = match.index + match.length;
    });

    if (lastIndex < testString.length) {
      elements.push(<span key="text-end">{testString.slice(lastIndex)}</span>);
    }

    return elements;
  }, [testString, matches]);

  const loadExample = useCallback((example: RegexExample) => {
    setPattern(example.pattern);
    setFlags(new Set(example.flags.split('')));
    setTestString(example.testString);
    setShowExamples(false);
  }, []);

  const clearAll = useCallback(() => {
    setPattern('');
    setFlags(new Set(['g']));
    setTestString('');
  }, []);

  const handleCopy = useCallback(async () => {
    if (!matches.length) return;
    const text = matches.map(m => m.text).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy errors
    }
  }, [matches]);

  const flagsStr = Array.from(flags).join('');
  const matchCoverage = testString && matches.length > 0
    ? Math.round((matches.reduce((acc, m) => acc + m.length, 0) / testString.length) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Tool Switcher */}
      <ToolSwitcher />

      {/* Tool Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b bg-card shrink-0"
      >
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500 text-white"
              >
                <Regex className="h-5 w-5" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold">Regex Tester</h1>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Test and debug regular expressions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground md:block">
                Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">⌘E</kbd> to switch apps
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowExamples(!showExamples)}
                className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Examples</span>
                {showExamples ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto w-full max-w-[1920px]">
          {/* Examples Panel */}
          <AnimatePresence>
            {showExamples && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-lg font-semibold">Common Patterns</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {REGEX_EXAMPLES.map((example, index) => (
                      <motion.button
                        key={example.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => loadExample(example)}
                        className="rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
                      >
                        <div className="font-medium">{example.name}</div>
                        <div className="mt-1 font-mono text-xs text-muted-foreground truncate">
                          /{example.pattern}/{example.flags}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {example.description}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Grid - Side by Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4"
          >
            {/* Left Panel - Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col gap-4"
            >
              {/* Pattern Input */}
              <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Pattern</span>
                  </div>
                  {pattern && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        !error
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {!error ? 'Valid' : 'Invalid'}
                    </motion.span>
                  )}
                </div>
                <div className="p-4 space-y-4">
                  {/* Pattern Input Field */}
                  <div className="relative">
                    <div className="flex items-center gap-2 rounded-xl border bg-background px-4 py-3">
                      <span className="text-muted-foreground font-mono text-lg">/</span>
                      <input
                        type="text"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                        placeholder="Enter regex pattern..."
                        className="flex-1 bg-transparent font-mono text-base outline-none"
                      />
                      <span className="text-muted-foreground font-mono text-lg">/{flagsStr}</span>
                    </div>
                    
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 flex items-center gap-2 text-sm text-red-500"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Flags */}
                  <div className="flex flex-wrap gap-2">
                    {FLAGS.map(({ flag, name, description }) => (
                      <motion.button
                        key={flag}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleFlag(flag)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          flags.has(flag)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={description}
                      >
                        <span className="font-mono">{flag}</span>
                        <span className="text-xs opacity-80">{name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Test String Input */}
              <div className="flex-1 rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col" style={{ minHeight: '250px' }}>
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Test String</span>
                  </div>
                  {testString && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setTestString('')}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                      title="Clear"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
                <div className="flex-1 relative min-h-0">
                  <textarea
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder="Enter text to test against the regex pattern..."
                    className="absolute inset-0 w-full h-full resize-none border-0 bg-transparent p-4 font-mono text-sm focus:outline-none focus:ring-0"
                    spellCheck={false}
                  />
                </div>
              </div>
            </motion.div>

            {/* Right Panel - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col gap-4"
            >
              {/* Match Preview */}
              <div className="flex-1 rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col" style={{ minHeight: '300px' }}>
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Match Preview</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {matches.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopy}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                        title="Copy matches"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-auto bg-muted/20 min-h-0 p-4">
                  {highlightedText ? (
                    <div className="font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
                      {highlightedText}
                    </div>
                  ) : testString ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <span className="text-sm italic">No matches found</span>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <span className="text-sm">Enter a pattern and test string to see matches</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Match Details */}
              {matches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col"
                  style={{ maxHeight: '250px' }}
                >
                  <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3 shrink-0">
                    <FileCode className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Match Details</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                      {matches.map((match, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-xl border bg-card"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-mono text-sm">
                                {match.text}
                              </code>
                              <span className="text-xs text-muted-foreground">
                                at position {match.index}
                              </span>
                            </div>
                            {match.groups.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                Groups:{' '}
                                {match.groups.map((group, i) => (
                                  <span key={i}>
                                    <code className="text-foreground font-mono bg-muted px-1 rounded">
                                      {group || '(empty)'}
                                    </code>
                                    {i < match.groups.length - 1 && ', '}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Action Bar */}
          {(pattern || testString) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-4"
            >
              <ActionButton
                onClick={clearAll}
                variant="ghost"
                icon={<Trash2 className="h-4 w-4" />}
              >
                Clear All
              </ActionButton>
              {matches.length > 0 && (
                <ActionButton
                  onClick={handleCopy}
                  variant="outline"
                  icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                >
                  {copied ? 'Copied!' : 'Copy Matches'}
                </ActionButton>
              )}
            </motion.div>
          )}

          {/* Statistics Section */}
          {(pattern || testString) && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Match Statistics</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard 
                    label="Matches" 
                    value={matches.length} 
                    icon={Target} 
                    delay={0} 
                  />
                  <StatCard 
                    label="Capture Groups" 
                    value={matches.reduce((acc, m) => acc + m.groups.length, 0)} 
                    icon={Hash} 
                    delay={0.05} 
                  />
                  <StatCard 
                    label="Pattern Valid" 
                    value={!error && pattern ? 'Yes' : 'No'} 
                    icon={Check} 
                    delay={0.1} 
                  />
                  <StatCard 
                    label="Test Length" 
                    value={testString.length} 
                    icon={Type} 
                    delay={0.15} 
                  />
                  <StatCard 
                    label="Match Coverage" 
                    value={`${matchCoverage}%`} 
                    icon={Target} 
                    delay={0.2} 
                  />
                  <StatCard 
                    label="Flags Used" 
                    value={flagsStr || 'None'} 
                    icon={FileCode} 
                    delay={0.25} 
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Empty State */}
          {!pattern && !testString && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center mt-8"
            >
              <div className="rounded-full bg-primary/10 p-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Ready to test</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                Enter a regex pattern and test string to see matches in real-time.
                Try the Examples dropdown for common patterns.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
