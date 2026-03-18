import React, { useState, useCallback, useEffect } from 'react';
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
} from 'lucide-react';
import { 
  ToolLayout, 
  ActionButton, 
  SectionCard, 
  StatCard,
  InputArea,
  OutputArea 
} from '@dev-tools/tool-sdk';
import { isValidJSON } from '@dev-tools/utils';

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

export default function JSONFormatter() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<JSONStats | null>(null);

  // Load sample JSON on mount
  useEffect(() => {
    const sampleJSON = JSON.stringify({
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
      setError('');
      updateStats(minified);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid JSON';
      setError(message);
    }
  }, [input, updateStats]);

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

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, validate, and beautify your JSON data with syntax highlighting"
      icon={<FileJson className="h-8 w-8" />}
      color="text-blue-500"
      bgColor="bg-blue-500/10"
      actions={
        <div className="flex items-center gap-2">
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
      }
    >
      <div className="space-y-6">
        {/* Stats Bar */}
        <AnimatePresence>
          {stats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
            >
              <StatCard label="Size" value={stats.size} icon={<FileCode className="h-4 w-4" />} delay={0} />
              <StatCard label="Lines" value={stats.lines} icon={<AlignLeft className="h-4 w-4" />} delay={0.05} />
              <StatCard label="Keys" value={stats.keys} icon={<Hash className="h-4 w-4" />} delay={0.1} />
              <StatCard label="Objects" value={stats.objects} icon={<Braces className="h-4 w-4" />} delay={0.15} />
              <StatCard label="Arrays" value={stats.arrays} icon={<Layers className="h-4 w-4" />} delay={0.2} />
              <StatCard label="Strings" value={stats.strings} icon={<Type className="h-4 w-4" />} delay={0.25} />
              <StatCard label="Numbers" value={stats.numbers} icon={<Hash className="h-4 w-4" />} delay={0.3} />
              <StatCard label="Booleans" value={stats.booleans} icon={<Check className="h-4 w-4" />} delay={0.35} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input/Output Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <SectionCard 
            title="Input" 
            icon={<Code2 className="h-5 w-5" />}
            delay={0.1}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {input && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isValid 
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {isValid ? 'Valid JSON' : 'Invalid'}
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </motion.button>
              </div>
              <InputArea
                value={input}
                onChange={handleInputChange}
                placeholder="Paste your JSON here..."
                rows={15}
              />
            </div>
          </SectionCard>

          {/* Output Section */}
          <SectionCard 
            title="Formatted Output" 
            icon={<Wand2 className="h-5 w-5" />}
            delay={0.2}
          >
            <OutputArea 
              label="Result"
              copyValue={output}
              actions={
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  disabled={!output}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </motion.button>
              }
            >
              {output ? (
                <SyntaxHighlightedJSON json={output} />
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
                  <span className="text-sm">Output will appear here</span>
                </div>
              )}
            </OutputArea>
          </SectionCard>
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          <ActionButton 
            onClick={formatJSON} 
            variant="primary"
            icon={<AlignLeft className="h-4 w-4" />}
            disabled={!input}
          >
            Format / Prettify
          </ActionButton>
          <ActionButton 
            onClick={minifyJSON} 
            variant="secondary"
            icon={<Minimize2 className="h-4 w-4" />}
            disabled={!input}
          >
            Minify
          </ActionButton>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border bg-muted/30 p-6"
        >
          <h4 className="mb-3 font-semibold">Quick Tips</h4>
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Paste JSON to automatically validate and format
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Use "Minify" to compress JSON for transmission
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Upload JSON files directly from your computer
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Download formatted JSON for later use
            </li>
          </ul>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
