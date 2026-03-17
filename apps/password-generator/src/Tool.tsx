import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  RefreshCw,
  Check,
  History,
  Shield,
  Zap,
  Trash2,
  Lock,
  Unlock,
  Hash,
  Type,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@dev-tools/ui/components/Card';
import { Button } from '@dev-tools/ui/components/Button';
import { Badge } from '@dev-tools/ui/components/Badge';
import { Switch } from '@dev-tools/ui/components/Switch';
import { Label } from '@dev-tools/ui/components/Label';
import { ToolContainer } from '@dev-tools/ui/components/ToolContainer';
import { useLocalStorage } from '@dev-tools/ui/hooks/useLocalStorage';
import { cn } from '@dev-tools/ui/utils/cn';

// Character sets
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*',
};

// Password history item type
interface PasswordHistoryItem {
  password: string;
  timestamp: number;
  strength: PasswordStrength;
}

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

// Calculate password entropy
function calculateEntropy(password: string, charSetSize: number): number {
  if (!password || charSetSize === 0) return 0;
  return Math.log2(Math.pow(charSetSize, password.length));
}

// Calculate crack time
function calculateCrackTime(entropy: number): string {
  // Assume 100 billion guesses per second (high-end GPU cluster)
  const guessesPerSecond = 100_000_000_000;
  const seconds = Math.pow(2, entropy) / guessesPerSecond;

  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 315360000000) return `${Math.round(seconds / 3153600000)} centuries`;
  return 'Millennia+';
}

// Determine password strength
function getPasswordStrength(entropy: number): PasswordStrength {
  if (entropy < 40) return 'weak';
  if (entropy < 60) return 'fair';
  if (entropy < 80) return 'good';
  return 'strong';
}

// Get strength color
function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'fair':
      return 'bg-yellow-500';
    case 'good':
      return 'bg-blue-500';
    case 'strong':
      return 'bg-green-500';
  }
}

// Get strength text color
function getStrengthTextColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'text-red-500';
    case 'fair':
      return 'text-yellow-500';
    case 'good':
      return 'text-blue-500';
    case 'strong':
      return 'text-green-500';
  }
}

// Get strength label
function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'fair':
      return 'Fair';
    case 'good':
      return 'Good';
    case 'strong':
      return 'Strong';
  }
}

// Generate cryptographically secure random password
function generatePassword(
  length: number,
  includeUppercase: boolean,
  includeLowercase: boolean,
  includeNumbers: boolean,
  includeSymbols: boolean
): string {
  let charSet = '';
  if (includeUppercase) charSet += CHAR_SETS.uppercase;
  if (includeLowercase) charSet += CHAR_SETS.lowercase;
  if (includeNumbers) charSet += CHAR_SETS.numbers;
  if (includeSymbols) charSet += CHAR_SETS.symbols;

  if (charSet === '') return '';

  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charSet[array[i] % charSet.length];
  }

  return password;
}

export default function Tool(): React.ReactElement {
  // Password state
  const [password, setPassword] = useState('');
  const [length, setLength] = useLocalStorage('password-generator-length', 16);
  const [includeUppercase, setIncludeUppercase] = useLocalStorage(
    'password-generator-uppercase',
    true
  );
  const [includeLowercase, setIncludeLowercase] = useLocalStorage(
    'password-generator-lowercase',
    true
  );
  const [includeNumbers, setIncludeNumbers] = useLocalStorage(
    'password-generator-numbers',
    true
  );
  const [includeSymbols, setIncludeSymbols] = useLocalStorage(
    'password-generator-symbols',
    true
  );
  const [history, setHistory] = useLocalStorage<PasswordHistoryItem[]>(
    'password-generator-history',
    []
  );
  const [copied, setCopied] = useState(false);

  // Calculate character set size
  const charSetSize =
    (includeUppercase ? CHAR_SETS.uppercase.length : 0) +
    (includeLowercase ? CHAR_SETS.lowercase.length : 0) +
    (includeNumbers ? CHAR_SETS.numbers.length : 0) +
    (includeSymbols ? CHAR_SETS.symbols.length : 0);

  // Calculate entropy and strength
  const entropy = calculateEntropy(password, charSetSize);
  const strength = getPasswordStrength(entropy);
  const crackTime = calculateCrackTime(entropy);

  // Generate password
  const handleGenerate = useCallback(() => {
    // Ensure at least one character type is selected
    if (
      !includeUppercase &&
      !includeLowercase &&
      !includeNumbers &&
      !includeSymbols
    ) {
      return;
    }

    const newPassword = generatePassword(
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols
    );

    setPassword(newPassword);

    // Add to history
    const newItem: PasswordHistoryItem = {
      password: newPassword,
      timestamp: Date.now(),
      strength: getPasswordStrength(
        calculateEntropy(
          newPassword,
          (includeUppercase ? CHAR_SETS.uppercase.length : 0) +
            (includeLowercase ? CHAR_SETS.lowercase.length : 0) +
            (includeNumbers ? CHAR_SETS.numbers.length : 0) +
            (includeSymbols ? CHAR_SETS.symbols.length : 0)
        )
      ),
    };

    setHistory((prev) => {
      const newHistory = [newItem, ...prev].slice(0, 5);
      return newHistory;
    });
  }, [
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    setHistory,
  ]);

  // Generate password on initial load and when settings change
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  // Copy password to clipboard
  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
  };

  // Use password from history
  const handleUseFromHistory = (item: PasswordHistoryItem) => {
    setPassword(item.password);
  };

  // Copy from history
  const handleCopyFromHistory = async (item: PasswordHistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.password);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  return (
    <ToolContainer>
      <div className="space-y-6">
        {/* Password Display */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  key={password}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex-1 font-mono text-2xl sm:text-3xl md:text-4xl break-all p-4 rounded-lg bg-muted',
                    'tracking-wider select-all'
                  )}
                >
                  {password || 'Generate a password...'}
                </motion.div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    disabled={!password}
                    className="h-12 w-12"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check className="h-5 w-5 text-green-500" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Copy className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleGenerate}
                    disabled={charSetSize === 0}
                    className="h-12 w-12"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Strength:
                      </span>
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          getStrengthTextColor(strength)
                        )}
                      >
                        {getStrengthLabel(strength)}
                      </span>
                    </div>
                    <Badge variant="secondary">{Math.round(entropy)} bits</Badge>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn('h-full rounded-full', getStrengthColor(strength))}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((entropy / 100) * 100, 100)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    <span>Estimated crack time: {crackTime}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5" />
                Password Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Length Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="length" className="text-base">
                    Password Length
                  </Label>
                  <Badge variant="outline" className="font-mono text-lg">
                    {length}
                  </Badge>
                </div>
                <input
                  id="length"
                  type="range"
                  min={8}
                  max={128}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>8</span>
                  <span>32</span>
                  <span>64</span>
                  <span>96</span>
                  <span>128</span>
                </div>
              </div>

              {/* Character Type Toggles */}
              <div className="space-y-3">
                <Label className="text-base">Character Types</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Uppercase (A-Z)</span>
                    </div>
                    <Switch
                      checked={includeUppercase}
                      onCheckedChange={setIncludeUppercase}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Lowercase (a-z)</span>
                    </div>
                    <Switch
                      checked={includeLowercase}
                      onCheckedChange={setIncludeLowercase}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Numbers (0-9)</span>
                    </div>
                    <Switch
                      checked={includeNumbers}
                      onCheckedChange={setIncludeNumbers}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Unlock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Symbols (!@#$%^&*)</span>
                    </div>
                    <Switch
                      checked={includeSymbols}
                      onCheckedChange={setIncludeSymbols}
                    />
                  </div>
                </div>
              </div>

              {/* Warning if no character types selected */}
              <AnimatePresence>
                {charSetSize === 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    Please select at least one character type to generate a password.
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5" />
                Password History
              </CardTitle>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="popLayout">
                {history.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No passwords generated yet</p>
                    <p className="text-xs mt-1">Last 5 passwords will appear here</p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item, index) => (
                      <motion.div
                        key={`${item.timestamp}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full flex-shrink-0',
                            getStrengthColor(item.strength)
                          )}
                        />
                        <code className="flex-1 font-mono text-sm truncate">
                          {item.password}
                        </code>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleCopyFromHistory(item)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUseFromHistory(item)}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setLength(12);
              setIncludeUppercase(true);
              setIncludeLowercase(true);
              setIncludeNumbers(true);
              setIncludeSymbols(false);
            }}
            className="gap-2"
          >
            Simple (12 chars)
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setLength(16);
              setIncludeUppercase(true);
              setIncludeLowercase(true);
              setIncludeNumbers(true);
              setIncludeSymbols(true);
            }}
            className="gap-2"
          >
            Strong (16 chars)
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setLength(32);
              setIncludeUppercase(true);
              setIncludeLowercase(true);
              setIncludeNumbers(true);
              setIncludeSymbols(true);
            }}
            className="gap-2"
          >
            Maximum (32 chars)
          </Button>
        </div>
      </div>
    </ToolContainer>
  );
}
