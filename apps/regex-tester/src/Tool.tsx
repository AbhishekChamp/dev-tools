import React, { useState, useMemo, useCallback } from 'react';
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
import {
  ToolLayout,
  ActionButton,
  SectionCard,
  StatCard,
  InputArea,
} from '@dev-tools/tool-sdk';
import { cn } from '@dev-tools/ui/utils';

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
    pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$',
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

export default function RegexTester() {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<Set<string>>(new Set(['g']));
  const [testString, setTestString] = useState<string>('');
  const [showExamples, setShowExamples] = useState(false);

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
      'bg-blue-500/30 border-blue-500/50',
      'bg-green-500/30 border-green-500/50',
      'bg-purple-500/30 border-purple-500/50',
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
          className={cn(
            'rounded px-0.5 py-0.5 border-b-2 font-medium',
            colorClass
          )}
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

  const flagsStr = Array.from(flags).join('');

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test and debug regular expressions with real-time matching and visual feedback"
      icon={<Regex className="h-8 w-8" />}
      color="text-purple-500"
      bgColor="bg-purple-500/10"
      actions={
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
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
      }
    >
      <div className="space-y-6">
        {/* Examples Panel */}
        <AnimatePresence>
          {showExamples && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <SectionCard title="Common Patterns" icon={<Lightbulb className="h-5 w-5 text-yellow-500" />}>
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
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pattern Input */}
        <SectionCard title="Pattern" icon={<Hash className="h-5 w-5" />} delay={0.1}>
          <div className="space-y-4">
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
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    flags.has(flag)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                  title={description}
                >
                  <span className="font-mono">{flag}</span>
                  <span className="text-xs opacity-80">{name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Test String Input */}
        <SectionCard title="Test String" icon={<Type className="h-5 w-5" />} delay={0.2}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              Enter text to test against the regex pattern
            </span>
            {testString && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTestString('')}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </motion.button>
            )}
          </div>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test..."
            rows={5}
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </SectionCard>

        {/* Results */}
        {testString && regex && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Match Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard 
                label="Matches" 
                value={matches.length} 
                icon={<Target className="h-4 w-4" />}
                delay={0}
              />
              <StatCard 
                label="Capture Groups" 
                value={matches.reduce((acc, m) => acc + m.groups.length, 0)} 
                icon={<Hash className="h-4 w-4" />}
                delay={0.1}
              />
              <StatCard 
                label="Pattern Valid" 
                value="Yes" 
                icon={<Check className="h-4 w-4 text-green-500" />}
                delay={0.2}
              />
            </div>

            {/* Highlighted Text */}
            <SectionCard title="Match Preview" icon={<Search className="h-5 w-5" />} delay={0.1}>
              <div className="rounded-xl bg-muted/50 p-4 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
                {highlightedText || (
                  <span className="text-muted-foreground italic">
                    No matches found
                  </span>
                )}
              </div>
            </SectionCard>

            {/* Match Details */}
            {matches.length > 0 && (
              <SectionCard title="Match Details" icon={<FileCode className="h-5 w-5" />} delay={0.2}>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
              </SectionCard>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!pattern && !testString && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center"
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

        {/* Clear Button */}
        {(pattern || testString) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <ActionButton 
              onClick={clearAll} 
              variant="ghost"
              icon={<Trash2 className="h-4 w-4" />}
            >
              Clear All
            </ActionButton>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
