import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Download,
  Type,
  FileCode,
  Hash,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useEmbedded } from '@dev-tools/tool-sdk';

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

// Action Button
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
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 ${variants[variant]}`}
    >
      {icon}
      {children}
    </motion.button>
  );
}

export default function Base64Tool() {
  const { isEmbedded } = useEmbedded();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [urlSafe, setUrlSafe] = useState(false);

  const toBase64 = useCallback((str: string, urlSafe: boolean): string => {
    try {
      let base64 = btoa(str);
      if (urlSafe) {
        base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      return base64;
    } catch {
      throw new Error('Invalid input for Base64 encoding');
    }
  }, []);

  const fromBase64 = useCallback((str: string, urlSafe: boolean): string => {
    try {
      let base64 = str;
      if (urlSafe) {
        base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
      }
      return atob(base64);
    } catch {
      throw new Error('Invalid Base64 string');
    }
  }, []);

  const handleConvert = useCallback(() => {
    if (!input) return;
    try {
      setError('');
      if (mode === 'encode') {
        setOutput(toBase64(input, urlSafe));
      } else {
        setOutput(fromBase64(input, urlSafe));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
    }
  }, [input, mode, urlSafe, toBase64, fromBase64]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError('');
  }, []);

  const handleSwap = useCallback(() => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
    setOutput(input);
    setError('');
  }, [mode, input, output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, mode]);

  const ratio =
    input.length && output.length ? ((output.length / input.length) * 100).toFixed(1) : '0';

  // Standalone Header
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
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold">Base64 Tool</h1>
              <p className="text-muted-foreground hidden text-xs sm:block">
                Encode and decode Base64 strings
              </p>
            </div>
          </div>
          <span className="text-muted-foreground hidden text-xs md:block">
            Press <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono">⌘E</kbd> to switch apps
          </span>
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
          {/* Mode Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex justify-center"
          >
            <div className="bg-card inline-flex items-center rounded-2xl border p-1.5 shadow-sm">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setMode('encode');
                  handleClear();
                }}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all ${mode === 'encode' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <ArrowRight className="h-4 w-4" />
                Encode
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSwap}
                className="text-muted-foreground hover:bg-muted mx-2 rounded-lg p-2 transition-colors"
                title="Swap direction"
              >
                <RefreshCw className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setMode('decode');
                  handleClear();
                }}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all ${mode === 'decode' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <ArrowLeft className="h-4 w-4" />
                Decode
              </motion.button>
            </div>
          </motion.div>

          {/* URL Safe Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 flex justify-center"
          >
            <label className="bg-card hover:bg-accent flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors">
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => setUrlSafe(e.target.checked)}
                className="border-primary text-primary focus:ring-primary h-4 w-4 rounded"
              />
              <span className="text-sm font-medium">URL-Safe Base64</span>
            </label>
          </motion.div>

          {/* Input/Output Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            {/* Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm"
              style={{ minHeight: '350px' }}
            >
              <div className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Type className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-semibold">
                    {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
                  </span>
                </div>
                {input && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClear}
                    className="text-muted-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
              <div className="relative min-h-0 flex-1">
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError('');
                  }}
                  placeholder={
                    mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'
                  }
                  className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm focus:outline-none focus:ring-0"
                />
              </div>
            </motion.div>

            {/* Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm"
              style={{ minHeight: '350px' }}
            >
              <div className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileCode className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-semibold">
                    {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
                  </span>
                </div>
                {output && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopy}
                    className="text-muted-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </motion.button>
                )}
              </div>
              <div className="bg-muted/20 relative min-h-0 flex-1">
                <textarea
                  value={output}
                  readOnly
                  placeholder="Result will appear here..."
                  className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm focus:outline-none"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 flex flex-wrap justify-center gap-3"
          >
            <ActionButton
              onClick={handleConvert}
              variant="primary"
              icon={
                mode === 'encode' ? (
                  <ArrowRight className="h-4 w-4" />
                ) : (
                  <ArrowLeft className="h-4 w-4" />
                )
              }
              disabled={!input}
            >
              {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
            </ActionButton>
            <ActionButton
              onClick={handleCopy}
              variant="outline"
              icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              disabled={!output}
            >
              {copied ? 'Copied!' : 'Copy Result'}
            </ActionButton>
            <ActionButton
              onClick={handleDownload}
              variant="outline"
              icon={<Download className="h-4 w-4" />}
              disabled={!output}
            >
              Download
            </ActionButton>
          </motion.div>

          {/* Statistics */}
          {(input || output) && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Hash className="text-muted-foreground h-5 w-5" />
                  <h2 className="text-lg font-semibold">Conversion Statistics</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <StatCard label="Input Chars" value={input.length} icon={Type} delay={0} />
                  <StatCard
                    label="Output Chars"
                    value={output.length}
                    icon={FileCode}
                    delay={0.05}
                  />
                  <StatCard label="Ratio" value={`${ratio}%`} icon={ArrowLeftRight} delay={0.1} />
                  <StatCard
                    label="Mode"
                    value={mode === 'encode' ? 'Encode' : 'Decode'}
                    icon={RefreshCw}
                    delay={0.15}
                  />
                  <StatCard
                    label="URL Safe"
                    value={urlSafe ? 'Yes' : 'No'}
                    icon={Hash}
                    delay={0.2}
                  />
                  <StatCard
                    label="Lines"
                    value={input.split('\n').length}
                    icon={Type}
                    delay={0.25}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Empty State */}
          {!input && !output && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center"
            >
              <div className="bg-primary/10 rounded-full p-4">
                <ArrowLeftRight className="text-primary h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Ready to convert</h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                Enter text to encode to Base64 or paste Base64 to decode.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
