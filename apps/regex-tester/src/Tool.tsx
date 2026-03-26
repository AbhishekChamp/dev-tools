import { useState, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
import { useEmbedded } from '@dev-tools/tool-sdk';

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
    pattern:
      '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
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

// Animated Stat Card
function StatCard({
  label,
  value,
  icon: Icon,
  delay = 0,
}: {
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
      className="bg-card rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Action Button with animation
function ActionButton({
  children,
  onClick,
  variant = 'primary',
  icon,
  disabled = false,
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
      className={`inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 ${variants[variant]}`}
    >
      {icon}
      {children}
    </motion.button>
  );
}

export default function RegexTester() {
  const { isEmbedded } = useEmbedded();
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

  const { error, matches } = useMemo(() => {
    if (!pattern) {
      return { error: null, matches: [] };
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

      return { error: null, matches };
    } catch (err) {
      return {
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
          <span key={`text-${matchIndex}`}>{testString.slice(lastIndex, match.index)}</span>
        );
      }

      const colorClass = matchColors[matchIndex % matchColors.length];
      elements.push(
        <motion.mark
          key={`match-${matchIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15, delay: matchIndex * 0.03 }}
          className={`rounded border-b-2 px-0.5 py-0.5 font-medium ${colorClass}`}
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
    const text = matches.map((m) => m.text).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy errors
    }
  }, [matches]);

  const flagsStr = Array.from(flags).join('');
  const matchCoverage =
    testString && matches.length > 0
      ? Math.round((matches.reduce((acc, m) => acc + m.length, 0) / testString.length) * 100)
      : 0;

  // Standalone header
  const StandaloneHeader = () => (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card shrink-0 border-b"
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
              <p className="text-muted-foreground hidden text-xs sm:block">
                Test and debug regular expressions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden text-xs md:block">
              Press <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono">⌘E</kbd> to switch
              apps
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExamples(!showExamples)}
              className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
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
  );

  return (
    <div className="bg-background flex h-full flex-col">
      {!isEmbedded && <StandaloneHeader />}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto w-full max-w-[1920px]">
          {/* Examples Panel - Always available in embedded mode via button */}
          <AnimatePresence>
            {showExamples && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <h2 className="text-lg font-semibold">Common Patterns</h2>
                    </div>
                    <button
                      onClick={() => setShowExamples(false)}
                      className="text-muted-foreground hover:bg-muted rounded-lg p-1"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
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
                        className="bg-card hover:border-primary/50 rounded-xl border p-4 text-left transition-all hover:shadow-md"
                      >
                        <div className="font-medium">{example.name}</div>
                        <div className="text-muted-foreground mt-1 truncate font-mono text-xs">
                          /{example.pattern}/{example.flags}
                        </div>
                        <div className="text-muted-foreground mt-2 text-xs">
                          {example.description}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Examples Toggle Button for Embedded Mode */}
          {isEmbedded && !showExamples && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowExamples(true)}
                className="hover:bg-accent flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Show Examples</span>
              </motion.button>
            </motion.div>
          )}

          {/* Main Grid - Side by Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            {/* Left Panel - Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col gap-4"
            >
              {/* Pattern Input */}
              <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
                <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Hash className="text-muted-foreground h-4 w-4" />
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
                <div className="space-y-4 p-4">
                  {/* Pattern Input Field */}
                  <div className="relative">
                    <div className="bg-background flex items-center gap-2 rounded-xl border px-4 py-3">
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
              <div
                className="bg-card flex flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm"
                style={{ minHeight: '250px' }}
              >
                <div className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Type className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-semibold">Test String</span>
                  </div>
                  {testString && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setTestString('')}
                      className="text-muted-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
                      title="Clear"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
                <div className="relative min-h-0 flex-1">
                  <textarea
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder="Enter text to test against the regex pattern..."
                    className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm focus:outline-none focus:ring-0"
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
              <div
                className="bg-card flex flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm"
                style={{ minHeight: '300px' }}
              >
                <div className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Search className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-semibold">Match Preview</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {matches.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopy}
                        className="text-muted-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
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
                <div className="bg-muted/20 min-h-0 flex-1 overflow-auto p-4">
                  {highlightedText ? (
                    <div className="whitespace-pre-wrap break-all font-mono text-sm leading-relaxed">
                      {highlightedText}
                    </div>
                  ) : testString ? (
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                      <span className="text-sm italic">No matches found</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                      <span className="text-sm">
                        Enter a pattern and test string to see matches
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Match Details */}
              {matches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm"
                  style={{ maxHeight: '250px' }}
                >
                  <div className="bg-muted/30 flex shrink-0 items-center gap-2 border-b px-4 py-3">
                    <FileCode className="text-muted-foreground h-4 w-4" />
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
                          className="bg-card flex items-start gap-3 rounded-xl border p-3"
                        >
                          <span className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <code className="bg-primary/10 text-primary rounded-lg px-2 py-1 font-mono text-sm">
                                {match.text}
                              </code>
                              <span className="text-muted-foreground text-xs">
                                at position {match.index}
                              </span>
                            </div>
                            {match.groups.length > 0 && (
                              <div className="text-muted-foreground text-sm">
                                Groups:{' '}
                                {match.groups.map((group, i) => (
                                  <span key={i}>
                                    <code className="text-foreground bg-muted rounded px-1 font-mono">
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
              className="mb-4 flex flex-wrap items-center justify-center gap-3"
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
                  <Zap className="text-muted-foreground h-5 w-5" />
                  <h2 className="text-lg font-semibold">Match Statistics</h2>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <StatCard label="Matches" value={matches.length} icon={Target} delay={0} />
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
              className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center"
            >
              <div className="bg-primary/10 rounded-full p-4">
                <Zap className="text-primary h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Ready to test</h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                Enter a regex pattern and test string to see matches in real-time. Try the Examples
                dropdown for common patterns.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
