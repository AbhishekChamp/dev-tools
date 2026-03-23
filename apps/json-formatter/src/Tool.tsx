import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileJson,
  AlignLeft,
  Minimize2,
  Trash2,
  Download,
  Upload,
  Check,
  AlertCircle,
  Wand2,
  Code2,
  Layers,
  Type,
  Hash,
  Braces,
  FileCode,
  Copy,
} from 'lucide-react';
import { isValidJSON } from '@dev-tools/utils';
import { useEmbedded } from '@dev-tools/tool-sdk';

interface JSONStats {
  size: string;
  lines: number;
  keys: number;
  arrays: number;
  objects: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
}

// Syntax highlighter component for JSON
const SyntaxHighlightedJSON: React.FC<{ json: string }> = ({ json }) => {
  if (!json) return null;
  
  const highlightJSON = (jsonStr: string): React.ReactNode[] => {
    const tokens: React.ReactNode[] = [];
    let key = 0;
    const lines = jsonStr.split('\n');

    lines.forEach((line, lineIndex) => {
      let remaining = line;
      let lineTokens: React.ReactNode[] = [];

      while (remaining.length > 0) {
        // Match strings
        const stringMatch = remaining.match(/^"(?:[^"\\]|\\.)*"/);
        if (stringMatch) {
          const isKey = remaining[stringMatch[0].length] === ':';
          lineTokens.push(
            <span
              key={key++}
              className={isKey ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}
            >
              {stringMatch[0]}
            </span>
          );
          remaining = remaining.slice(stringMatch[0].length);
          continue;
        }

        // Match numbers
        const numberMatch = remaining.match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
        if (numberMatch) {
          lineTokens.push(
            <span key={key++} className="text-blue-600 dark:text-blue-400">
              {numberMatch[0]}
            </span>
          );
          remaining = remaining.slice(numberMatch[0].length);
          continue;
        }

        // Match booleans and null
        const keywordMatch = remaining.match(/^(true|false|null)/);
        if (keywordMatch) {
          const isNull = keywordMatch[0] === 'null';
          lineTokens.push(
            <span
              key={key++}
              className={isNull ? 'text-gray-500 dark:text-gray-400' : 'text-orange-600 dark:text-orange-400'}
            >
              {keywordMatch[0]}
            </span>
          );
          remaining = remaining.slice(keywordMatch[0].length);
          continue;
        }

        // Match punctuation
        const punctMatch = remaining.match(/^[:{},\[\]]/);
        if (punctMatch) {
          lineTokens.push(
            <span key={key++} className="text-gray-600 dark:text-gray-400">
              {punctMatch[0]}
            </span>
          );
          remaining = remaining.slice(punctMatch[0].length);
          continue;
        }

        // Match whitespace
        const wsMatch = remaining.match(/^\s+/);
        if (wsMatch) {
          lineTokens.push(<span key={key++}>{wsMatch[0]}</span>);
          remaining = remaining.slice(wsMatch[0].length);
          continue;
        }

        // Default: take one character
        lineTokens.push(<span key={key++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }

      tokens.push(
        <div key={lineIndex} className="flex">
          <span className="select-none text-gray-400 dark:text-gray-600 w-8 text-right pr-3 text-xs shrink-0">
            {lineIndex + 1}
          </span>
          <span className="flex-1">{lineTokens}</span>
        </div>
      );
    });

    return tokens;
  };

  return (
    <pre className="font-mono text-sm leading-relaxed overflow-x-auto">
      {highlightJSON(json)}
    </pre>
  );
};

// Calculate JSON statistics
const calculateStats = (obj: unknown): Omit<JSONStats, 'size' | 'lines'> => {
  let keys = 0;
  let arrays = 0;
  let objects = 0;
  let strings = 0;
  let numbers = 0;
  let booleans = 0;
  let nulls = 0;

  const traverse = (value: unknown) => {
    if (value === null) {
      nulls++;
    } else if (typeof value === 'boolean') {
      booleans++;
    } else if (typeof value === 'number') {
      numbers++;
    } else if (typeof value === 'string') {
      strings++;
    } else if (Array.isArray(value)) {
      arrays++;
      value.forEach(traverse);
    } else if (typeof value === 'object') {
      objects++;
      Object.entries(value).forEach(([k, v]) => {
        keys++;
        traverse(v);
      });
    }
  };

  traverse(obj);
  return { keys, arrays, objects, strings, numbers, booleans, nulls };
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

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
function ActionButton({ 
  children, 
  onClick, 
  variant = 'primary',
  icon: Icon,
  disabled = false
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: React.ElementType;
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
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </motion.button>
  );
}

export default function JSONFormatter() {
  const { isEmbedded } = useEmbedded();
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<JSONStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [isMinified, setIsMinified] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Load sample JSON on mount
  useEffect(() => {
    const sampleJSON = JSON.stringify({
      name: 'John Doe',
      age: 30,
      email: 'john.doe@example.com',
      isActive: true,
      balance: 1234.56,
      address: {
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
        zipCode: '10001',
      },
      hobbies: ['reading', 'gaming', 'coding'],
      metadata: null,
    }, null, 2);
    setInput(sampleJSON);
    setOutput(sampleJSON);
    updateStats(sampleJSON);
  }, []);

  const updateStats = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      const calculatedStats = calculateStats(parsed);
      const size = new Blob([jsonStr]).size;
      const lines = jsonStr.split('\n').length;

      setStats({
        size: formatBytes(size),
        lines,
        ...calculatedStats,
      });
    } catch {
      setStats(null);
    }
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setError('');

    if (isValidJSON(value)) {
      setOutput(value);
      updateStats(value);
    } else {
      setOutput('');
      setStats(null);
    }
  }, [updateStats]);

  const formatJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsMinified(false);
      setError('');
      updateStats(formatted);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid JSON';
      setError(message);
    }
  }, [input, updateStats]);

  const minifyJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setInput(minified);
      setIsMinified(true);
      setError('');
      updateStats(minified);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid JSON';
      setError(message);
    }
  }, [input, updateStats]);

  const toggleFormatMinify = useCallback(() => {
    if (isMinified) {
      formatJSON();
    } else {
      minifyJSON();
    }
  }, [isMinified, formatJSON, minifyJSON]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError('');
    setStats(null);
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy errors
    }
  }, [output]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(content);
      if (isValidJSON(content)) {
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        setOutput(formatted);
        updateStats(formatted);
      }
    };
    reader.readAsText(file);
  }, [updateStats]);

  const isValid = isValidJSON(input);

  // Standalone header (only shown when not embedded)
  const StandaloneHeader = () => (
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
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white"
            >
              <FileJson className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold">JSON Formatter</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Format, validate, and beautify JSON
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground md:block">
              Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">⌘E</kbd> to switch apps
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="json-upload"
            />
            <label htmlFor="json-upload">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </motion.button>
            </label>
          </div>
        </div>
      </div>
    </motion.header>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Standalone Header - Only show when not embedded */}
      {!isEmbedded && <StandaloneHeader />}

      {/* Main Content */}
      <main className={`flex-1 overflow-auto ${isEmbedded ? 'p-4' : 'p-4'}`}>
        <div className="mx-auto w-full max-w-[1920px]">
          {/* File Upload - Show in embedded mode */}
          {isEmbedded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex justify-end"
            >
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="json-upload-embedded"
              />
              <label htmlFor="json-upload-embedded">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload JSON</span>
                </motion.button>
              </label>
            </motion.div>
          )}

          {/* Input/Output Grid - Side by Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4"
          >
            {/* Input Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden"
              style={{ minHeight: isEmbedded ? '350px' : '400px' }}
            >
              {/* Input Header */}
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Input</span>
                  {input && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                        isValid
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isValid ? 'Valid' : 'Invalid'}
                    </motion.span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClear}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                  title="Clear"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Input Area */}
              <div className="flex-1 relative min-h-0">
                <textarea
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Paste your JSON here..."
                  className="absolute inset-0 w-full h-full resize-none border-0 bg-transparent p-4 font-mono text-sm focus:outline-none focus:ring-0"
                  spellCheck={false}
                />
              </div>
            </motion.div>

            {/* Output Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden"
              style={{ minHeight: isEmbedded ? '350px' : '400px' }}
            >
              {/* Output Header */}
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Formatted Output</span>
                </div>
                <div className="flex items-center gap-1">
                  {output && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopy}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                        title="Copy"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleDownload}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {/* Output Area */}
              <div ref={outputRef} className="flex-1 overflow-auto bg-muted/20 min-h-0">
                {output ? (
                  <div className="p-4">
                    <SyntaxHighlightedJSON json={output} />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <span className="text-sm">Output will appear here</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-4"
          >
            <ActionButton
              onClick={toggleFormatMinify}
              variant="primary"
              icon={isMinified ? AlignLeft : Minimize2}
              disabled={!input}
            >
              {isMinified ? 'Format / Prettify' : 'Minify'}
            </ActionButton>
            <ActionButton
              onClick={handleCopy}
              variant="outline"
              icon={copied ? Check : Copy}
              disabled={!output}
            >
              {copied ? 'Copied!' : 'Copy Result'}
            </ActionButton>
            <ActionButton
              onClick={handleDownload}
              variant="outline"
              icon={Download}
              disabled={!output}
            >
              Download
            </ActionButton>
          </motion.div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Statistics Section */}
          <AnimatePresence>
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">JSON Statistics</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
                  <StatCard label="Size" value={stats.size} icon={FileCode} delay={0} />
                  <StatCard label="Lines" value={stats.lines} icon={AlignLeft} delay={0.05} />
                  <StatCard label="Keys" value={stats.keys} icon={Hash} delay={0.1} />
                  <StatCard label="Objects" value={stats.objects} icon={Braces} delay={0.15} />
                  <StatCard label="Arrays" value={stats.arrays} icon={Layers} delay={0.2} />
                  <StatCard label="Strings" value={stats.strings} icon={Type} delay={0.25} />
                  <StatCard label="Numbers" value={stats.numbers} icon={Hash} delay={0.3} />
                  <StatCard label="Booleans" value={stats.booleans} icon={Check} delay={0.35} />
                  <StatCard label="Nulls" value={stats.nulls} icon={Code2} delay={0.4} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
