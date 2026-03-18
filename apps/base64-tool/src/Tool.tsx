import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Upload,
  Download,
  Type,
  FileCode,
  Hash,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  ToolLayout,
  ActionButton,
  SectionCard,
  StatCard,
} from '@dev-tools/tool-sdk';

type EncodeMode = 'text' | 'file';

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [inputMode, setInputMode] = useState<EncodeMode>('text');
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
        while (base64.length % 4) {
          base64 += '=';
        }
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
        const result = toBase64(input, urlSafe);
        setOutput(result);
      } else {
        const result = fromBase64(input, urlSafe);
        setOutput(result);
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
    } catch {
      // Ignore copy errors
    }
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

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (mode === 'encode') {
        const base64 = btoa(content);
        setOutput(urlSafe 
          ? base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
          : base64
        );
      }
    };
    reader.readAsBinaryString(file);
  }, [mode, urlSafe]);

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

  const inputStats = {
    chars: input.length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    lines: input.split('\n').length,
  };

  const outputStats = {
    chars: output.length,
    bytes: new Blob([output]).size,
  };

  return (
    <ToolLayout
      title="Base64 Tool"
      description="Encode and decode Base64 strings with URL-safe option and file support"
      icon={<ArrowLeftRight className="h-8 w-8" />}
      color="text-orange-500"
      bgColor="bg-orange-500/10"
    >
      <div className="space-y-6">
        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center rounded-2xl border bg-card p-1.5 shadow-sm">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setMode('encode'); handleClear(); }}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all ${
                mode === 'encode'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowRight className="h-4 w-4" />
              Encode
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSwap}
              className="mx-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
              title="Swap direction"
            >
              <RefreshCw className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setMode('decode'); handleClear(); }}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all ${
                mode === 'decode'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Decode
            </motion.button>
          </div>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <label className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 cursor-pointer hover:bg-accent transition-colors">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">URL-Safe Base64</span>
          </label>
        </motion.div>

        {/* Input/Output Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <SectionCard 
            title={mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'} 
            icon={<Type className="h-5 w-5" />}
            delay={0.1}
          >
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError('');
                  }}
                  placeholder={mode === 'encode' 
                    ? 'Enter text to encode...' 
                    : 'Enter Base64 to decode...'}
                  rows={10}
                  className="w-full rounded-xl border bg-background px-4 py-3 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {input && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClear}
                    className="absolute right-3 top-3 rounded-lg bg-muted p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                )}
              </div>

              {/* Input Stats */}
              {input && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <div className="text-lg font-semibold">{inputStats.chars}</div>
                    <div className="text-xs text-muted-foreground">Characters</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <div className="text-lg font-semibold">{inputStats.words}</div>
                    <div className="text-xs text-muted-foreground">Words</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <div className="text-lg font-semibold">{inputStats.lines}</div>
                    <div className="text-xs text-muted-foreground">Lines</div>
                  </div>
                </motion.div>
              )}
            </div>
          </SectionCard>

          {/* Output Section */}
          <SectionCard 
            title={mode === 'encode' ? 'Base64 Output' : 'Decoded Text'} 
            icon={<FileCode className="h-5 w-5" />}
            delay={0.2}
          >
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={output}
                  readOnly
                  placeholder="Result will appear here..."
                  rows={10}
                  className="w-full rounded-xl border bg-muted/30 px-4 py-3 font-mono text-sm resize-y focus:outline-none"
                />
                {output && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="absolute right-3 top-3 rounded-lg bg-card p-2 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </motion.button>
                )}
              </div>

              {/* Output Stats */}
              {output && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <div className="text-lg font-semibold">{outputStats.chars}</div>
                    <div className="text-xs text-muted-foreground">Characters</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <div className="text-lg font-semibold">{outputStats.bytes}</div>
                    <div className="text-xs text-muted-foreground">Bytes</div>
                  </div>
                </motion.div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
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
          className="flex flex-wrap justify-center gap-3"
        >
          <ActionButton
            onClick={handleConvert}
            variant="primary"
            icon={mode === 'encode' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            disabled={!input}
          >
            {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
          </ActionButton>
          
          <ActionButton
            onClick={handleCopy}
            variant="secondary"
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

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border bg-muted/30 p-6"
        >
          <h4 className="mb-3 font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            About Base64
          </h4>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              <strong>Base64</strong> is a binary-to-text encoding scheme that represents binary data in ASCII string format.
            </p>
            <p>
              <strong>URL-Safe Base64</strong> replaces + with - and / with _ and removes padding = for use in URLs.
            </p>
          </div>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
