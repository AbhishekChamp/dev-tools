import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft,
  Copy,
  Trash2,
  AlertCircle,
  Check,
  FileCode,
  Type,
} from 'lucide-react';
import {
  ToolContainer,
  Button,
  Textarea,
  Switch,
  CopyButton,
  Card,
  CardContent,
} from '@dev-tools/ui';
import { fadeInUp, easeInOut } from '@dev-tools/ui/animations';

// Base64 encoding/decoding utilities
const toBase64 = (text: string, urlSafe: boolean): string => {
  try {
    const base64 = btoa(unescape(encodeURIComponent(text)));
    if (urlSafe) {
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    return base64;
  } catch {
    return '';
  }
};

const fromBase64 = (base64: string, urlSafe: boolean): string => {
  try {
    let normalized = base64;
    if (urlSafe) {
      normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      while (normalized.length % 4) {
        normalized += '=';
      }
    }
    return decodeURIComponent(escape(atob(normalized)));
  } catch {
    throw new Error('Invalid Base64 string');
  }
};

const isValidBase64 = (str: string, urlSafe: boolean): boolean => {
  try {
    if (urlSafe) {
      // URL-safe Base64 validation
      return /^[A-Za-z0-9_-]*$/.test(str);
    }
    // Standard Base64 validation
    return /^[A-Za-z0-9+/]*={0,2}$/.test(str) && str.length % 4 === 0;
  } catch {
    return false;
  }
};

type Mode = 'encode' | 'decode';

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Process input whenever it changes or mode/urlSafe changes
  React.useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    if (mode === 'encode') {
      try {
        const result = toBase64(input, urlSafe);
        setOutput(result);
        setError(null);
      } catch {
        setOutput('');
        setError('Failed to encode text');
      }
    } else {
      // decode mode
      if (!isValidBase64(input, urlSafe)) {
        setOutput('');
        setError('Invalid Base64 string');
        return;
      }
      try {
        const result = fromBase64(input, urlSafe);
        setOutput(result);
        setError(null);
      } catch (err) {
        setOutput('');
        setError('Failed to decode Base64');
      }
    }
  }, [input, mode, urlSafe]);

  const handleModeToggle = useCallback(() => {
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
    setInput(output);
    setOutput(input);
    setError(null);
  }, [input, output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copy failed
    }
  }, [output]);

  const inputLabel = mode === 'encode' ? 'Text Input' : 'Base64 Input';
  const outputLabel = mode === 'encode' ? 'Base64 Output' : 'Decoded Text';
  const inputIcon = mode === 'encode' ? Type : FileCode;
  const outputIcon = mode === 'encode' ? FileCode : Type;

  const inputPlaceholder =
    mode === 'encode'
      ? 'Enter text to encode...'
      : 'Enter Base64 to decode...';

  const charCount = input.length;
  const outputCharCount = output.length;
  const byteSize = new Blob([input]).size;

  return (
    <ToolContainer
      title="Base64 Encoder/Decoder"
      description="Convert text to Base64 and vice versa with URL-safe option"
      className="max-w-5xl mx-auto"
    >
      {/* Mode Toggle & Options */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
      >
        {/* Mode Switcher */}
        <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
          <Button
            variant={mode === 'encode' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('encode')}
            className="gap-2"
          >
            <Type className="h-4 w-4" />
            Encode
          </Button>
          <Button
            variant={mode === 'decode' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('decode')}
            className="gap-2"
          >
            <FileCode className="h-4 w-4" />
            Decode
          </Button>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleModeToggle}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Swap
          </button>
          <div className="flex items-center gap-2">
            <Switch
              id="url-safe"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
            />
            <label
              htmlFor="url-safe"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              URL-safe
            </label>
          </div>
        </div>
      </motion.div>

      {/* Input/Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={easeInOut}
        >
          <Card className="h-full">
            <CardContent className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <inputIcon className="h-4 w-4 text-primary" />
                  {inputLabel}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {charCount} chars
                    {mode === 'encode' && byteSize > 0 && ` (${byteSize} bytes)`}
                  </span>
                  {input && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClear}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Textarea */}
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={inputPlaceholder}
                className="min-h-[200px] font-mono text-sm resize-none"
              />

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Output Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ ...easeInOut, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardContent className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <outputIcon className="h-4 w-4 text-primary" />
                  {outputLabel}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {outputCharCount} chars
                  </span>
                  {output && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      className="h-8 w-8"
                      disabled={!output}
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Copy className="h-4 w-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  )}
                </div>
              </div>

              {/* Output Display */}
              <div className="relative min-h-[200px]">
                {output ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="min-h-[200px] p-3 rounded-md border border-input bg-muted/30 font-mono text-sm break-all whitespace-pre-wrap overflow-auto max-h-[300px]"
                  >
                    {mode === 'encode' ? (
                      // Syntax highlighting for Base64
                      <span>
                        {output.split('').map((char, i) => {
                          const isPadding = char === '=';
                          const isUrlSafe = urlSafe && (char === '-' || char === '_');
                          return (
                            <span
                              key={i}
                              className={
                                isPadding
                                  ? 'text-muted-foreground'
                                  : isUrlSafe
                                  ? 'text-blue-500 dark:text-blue-400'
                                  : 'text-foreground'
                              }
                            >
                              {char}
                            </span>
                          );
                        })}
                      </span>
                    ) : (
                      <span className="text-foreground">{output}</span>
                    )}
                  </motion.div>
                ) : (
                  <div className="min-h-[200px] flex items-center justify-center text-muted-foreground text-sm border border-dashed border-input rounded-md">
                    {mode === 'encode'
                      ? 'Encoded result will appear here'
                      : 'Decoded result will appear here'}
                  </div>
                )}
              </div>

              {/* Empty space to match error area */}
              <div className="h-6" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Info Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-xs text-muted-foreground space-y-1"
      >
        <p>
          <strong>Standard Base64:</strong> Uses A-Z, a-z, 0-9, +, / with = padding
        </p>
        <p>
          <strong>URL-safe Base64:</strong> Uses A-Z, a-z, 0-9, -, _ without padding
          (RFC 4648)
        </p>
      </motion.div>
    </ToolContainer>
  );
}
