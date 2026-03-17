import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Regex,
  Copy,
  Check,
  AlertCircle,
  Trash2,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import {
  ToolContainer,
  Button,
  Input,
  Textarea,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyButton,
} from '@dev-tools/ui';
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
    description: 'Match US phone numbers with optional separators',
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
  { flag: 'i', name: 'Ignore Case', description: 'Case-insensitive matching' },
  { flag: 'm', name: 'Multiline', description: '^ and $ match line boundaries' },
  { flag: 's', name: 'Dot All', description: '. matches newlines' },
  { flag: 'u', name: 'Unicode', description: 'Unicode-aware matching' },
  { flag: 'y', name: 'Sticky', description: 'Match from lastIndex only' },
];

function Tool() {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<Set<string>>(new Set(['g']));
  const [testString, setTestString] = useState<string>('');
  const [showExamples, setShowExamples] = useState(false);
  const [copiedPattern, setCopiedPattern] = useState(false);

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

  const copyRegex = useCallback(async () => {
    if (!regex) return;
    const flagsStr = Array.from(flags).join('');
    const regexLiteral = `/${pattern}/${flagsStr}`;
    try {
      await navigator.clipboard.writeText(regexLiteral);
      setCopiedPattern(true);
      setTimeout(() => setCopiedPattern(false), 2000);
    } catch {
      // Ignore copy errors
    }
  }, [regex, pattern, flags]);

  const flagsStr = Array.from(flags).join('');
  const regexLiteral = pattern ? `/${pattern}/${flagsStr}` : '//g';

  return (
    <ToolContainer
      title="Regex Tester"
      description="Test and debug regular expressions with real-time matching"
      headerAction={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExamples(!showExamples)}
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            Examples
            {showExamples ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
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
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Common Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {REGEX_EXAMPLES.map((example) => (
                      <button
                        key={example.name}
                        onClick={() => loadExample(example)}
                        className="text-left p-3 rounded-lg border bg-card hover:bg-accent hover:border-accent transition-all duration-200 group"
                      >
                        <div className="font-medium text-sm group-hover:text-accent-foreground">
                          {example.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 font-mono truncate">
                          /{example.pattern}/{example.flags}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {example.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pattern Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Regular Expression</label>
            <div className="flex items-center gap-2">
              {regex && !error && (
                <CopyButton
                  text={() => regexLiteral}
                  variant="ghost"
                  size="sm"
                />
              )}
              <Badge variant={error ? 'destructive' : 'secondary'}>
                {regexLiteral}
              </Badge>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-lg">
                /
              </span>
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className={cn(
                  'pl-7 pr-4 font-mono text-base',
                  error && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-lg">
                /{flagsStr}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flags */}
          <div className="flex flex-wrap gap-2">
            {FLAGS.map(({ flag, name, description }) => (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                  flags.has(flag)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
                title={description}
              >
                <span className="font-mono">{flag}</span>
                <span className="text-xs opacity-80">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Test String Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Test String</label>
            {testString && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTestString('')}
              >
                Clear
              </Button>
            )}
          </div>
          <Textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against the regex..."
            className="min-h-[120px] font-mono text-sm resize-y"
          />
        </div>

        {/* Match Results */}
        {testString && regex && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Highlighted Text */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Match Preview
                  </CardTitle>
                  <Badge variant={matches.length > 0 ? 'default' : 'secondary'}>
                    {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
                  {highlightedText || (
                    <span className="text-muted-foreground italic">
                      No matches found
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Match Details */}
            {matches.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Match Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {matches.map((match, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                      >
                        <Badge variant="outline" className="mt-0.5 shrink-0">
                          #{index + 1}
                        </Badge>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="px-2 py-1 rounded bg-primary/10 text-primary font-mono text-sm">
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
                                  <code className="text-foreground font-mono">
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
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!pattern && !testString && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Regex className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Ready to test</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Enter a regex pattern and test string to see matches in real-time.
              Try the Examples dropdown for common patterns.
            </p>
          </motion.div>
        )}
      </div>
    </ToolContainer>
  );
}

export default Tool;
