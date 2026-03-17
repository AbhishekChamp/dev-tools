import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Copy,
  FileJson,
  Minimize2,
  AlertCircle,
  Trash2,
  AlignLeft,
  Download,
  Upload,
  Wand2,
} from 'lucide-react';

// UI Components from @dev-tools/ui
import { Button } from '@dev-tools/ui/components/Button';
import { Textarea } from '@dev-tools/ui/components/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@dev-tools/ui/components/Card';
import { Badge } from '@dev-tools/ui/components/Badge';
import { Alert, AlertDescription } from '@dev-tools/ui/components/Alert';

// Utilities from @dev-tools/utils
import { isValidJSON, copyToClipboard } from '@dev-tools/utils';

// Tool SDK hooks
import { useToolConfig, useToolAnalytics } from '@dev-tools/tool-sdk';

interface JSONError {
  message: string;
  line?: number;
  column?: number;
}

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Syntax highlighter component for JSON
const SyntaxHighlightedJSON: React.FC<{ json: string }> = ({ json }) => {
  const highlightJSON = (jsonStr: string): React.ReactNode[] => {
    const tokens: React.ReactNode[] = [];
    let key = 0;

    // Simple syntax highlighting using regex
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

// Format bytes to human readable
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Tool: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<JSONError | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<JSONStats | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const { config } = useToolConfig();
  const { trackEvent } = useToolAnalytics();

  // Load sample JSON on mount
  useEffect(() => {
    const sampleJSON = JSON.stringify(
      {
        name: 'John Doe',
        age: 30,
        email: 'john.doe@example.com',
        address: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
        },
        hobbies: ['reading', 'gaming', 'coding'],
        isActive: true,
        balance: 1234.56,
        metadata: null,
      },
      null,
      2
    );
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

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      setError(null);

      // Auto-format if valid JSON
      if (isValidJSON(value)) {
        setOutput(value);
        updateStats(value);
      } else {
        setOutput('');
        setStats(null);
      }
    },
    [updateStats]
  );

  const formatJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
      updateStats(formatted);
      addToHistory(formatted);
      trackEvent('json_format', { action: 'format' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid JSON';
      setError({ message });
      trackEvent('json_error', { action: 'format', error: message });
    }
  }, [input, trackEvent, updateStats]);

  const minifyJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setInput(minified);
      setError(null);
      updateStats(minified);
      addToHistory(minified);
      trackEvent('json_format', { action: 'minify' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid JSON';
      setError({ message });
      trackEvent('json_error', { action: 'minify', error: message });
    }
  }, [input, trackEvent, updateStats]);

  const validateJSON = useCallback(() => {
    try {
      JSON.parse(input);
      setError(null);
      trackEvent('json_validate', { valid: true });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid JSON';
      setError({ message });
      trackEvent('json_validate', { valid: false, error: message });
      return false;
    }
  }, [input, trackEvent]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    const success = await copyToClipboard(output);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent('json_copy', { success: true });
    }
  }, [output, trackEvent]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
    setStats(null);
    trackEvent('json_clear');
  }, [trackEvent]);

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
    trackEvent('json_download');
  }, [output, trackEvent]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
        trackEvent('json_upload', { fileName: file.name });
      };
      reader.readAsText(file);
    },
    [trackEvent, updateStats]
  );

  const addToHistory = useCallback((json: string) => {
    setHistory((prev) => {
      const newHistory = [json, ...prev.slice(0, 9)];
      return newHistory;
    });
  }, []);

  const isValid = isValidJSON(input);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileJson className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">JSON Formatter</h1>
            <p className="text-muted-foreground text-sm">
              Format, validate, and beautify your JSON data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            id="json-upload"
          />
          <label htmlFor="json-upload">
            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </span>
            </Button>
          </label>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4" />
                Input
              </span>
              {input && (
                <Badge variant={isValid ? 'default' : 'destructive'}>
                  {isValid ? 'Valid JSON' : 'Invalid'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your JSON here..."
              className="min-h-[400px] font-mono text-sm resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Output
              </span>
              <div className="flex items-center gap-2">
                {output && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-7 px-2"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="h-7 px-2"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {output ? (
              <div className="min-h-[400px] max-h-[400px] overflow-auto p-4 bg-muted/30">
                <SyntaxHighlightedJSON json={output} />
              </div>
            ) : (
              <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
                <span className="text-sm">Output will appear here</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <Button onClick={formatJSON} disabled={!input} className="gap-2">
          <AlignLeft className="w-4 h-4" />
          Format / Prettify
        </Button>
        <Button onClick={minifyJSON} disabled={!input} variant="secondary" className="gap-2">
          <Minimize2 className="w-4 h-4" />
          Minify
        </Button>
        <Button onClick={validateJSON} disabled={!input} variant="outline" className="gap-2">
          <Check className="w-4 h-4" />
          Validate
        </Button>
        <Button onClick={handleCopy} disabled={!output} variant="outline" className="gap-2">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          Copy Result
        </Button>
      </motion.div>

      {/* Statistics */}
      {stats && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-4">
                <StatItem label="Size" value={stats.size} />
                <StatItem label="Lines" value={stats.lines.toString()} />
                <StatItem label="Keys" value={stats.keys.toString()} />
                <StatItem label="Objects" value={stats.objects.toString()} />
                <StatItem label="Arrays" value={stats.arrays.toString()} />
                <StatItem label="Strings" value={stats.strings.toString()} />
                <StatItem label="Numbers" value={stats.numbers.toString()} />
                <StatItem label="Booleans" value={stats.booleans.toString()} />
                <StatItem label="Nulls" value={stats.nulls.toString()} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Tips */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Paste JSON into the input field to automatically format it</li>
              <li>Use the &quot;Minify&quot; button to compress JSON for transmission</li>
              <li>Upload a JSON file using the Upload button</li>
              <li>Download the formatted JSON using the download button</li>
              <li>All formatting happens locally - your data never leaves your browser</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// Stat Item Component
const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center p-3 rounded-lg bg-muted">
    <div className="text-lg font-semibold">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default Tool;
