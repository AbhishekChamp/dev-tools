import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  RefreshCw,
  Copy,
  Check,
  History,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Zap,
  Hash,
  Settings2,
  ChevronDown,
  ChevronUp,
  Dice5,
  KeyRound,
  Clock,
  Gauge,
} from 'lucide-react';
import { useEmbedded } from '@dev-tools/tool-sdk';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

interface PasswordHistory {
  password: string;
  timestamp: number;
  strength: number;
  id: string;
}

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: '0O1lI',
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Calculate password strength
function calculateStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  return Math.min(score, 5);
}

// Get strength info
function getStrengthInfo(strength: number): { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: React.ElementType;
} {
  const levels = [
    { label: 'Very Weak', color: 'text-red-500', bgColor: 'bg-red-500', icon: ShieldAlert },
    { label: 'Weak', color: 'text-orange-500', bgColor: 'bg-orange-500', icon: ShieldAlert },
    { label: 'Fair', color: 'text-yellow-500', bgColor: 'bg-yellow-500', icon: Shield },
    { label: 'Strong', color: 'text-green-500', bgColor: 'bg-green-500', icon: ShieldCheck },
    { label: 'Very Strong', color: 'text-emerald-500', bgColor: 'bg-emerald-500', icon: ShieldCheck },
    { label: 'Excellent', color: 'text-emerald-600', bgColor: 'bg-emerald-600', icon: ShieldCheck },
  ];
  return levels[strength] || levels[0];
}

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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
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

export default function PasswordGenerator() {
  const { isEmbedded } = useEmbedded();
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<PasswordHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });

  // Generate password
  const generatePassword = useCallback(() => {
    let charset = '';
    if (options.uppercase) charset += CHAR_SETS.uppercase;
    if (options.lowercase) charset += CHAR_SETS.lowercase;
    if (options.numbers) charset += CHAR_SETS.numbers;
    if (options.symbols) charset += CHAR_SETS.symbols;

    if (options.excludeAmbiguous) {
      charset = charset.split('').filter(c => !CHAR_SETS.ambiguous.includes(c)).join('');
    }

    if (charset === '') {
      setPassword('');
      return;
    }

    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);

    let newPassword = '';
    for (let i = 0; i < options.length; i++) {
      newPassword += charset[array[i] % charset.length];
    }

    setPassword(newPassword);
    const strength = calculateStrength(newPassword);
    setHistory(prev => [{ 
      id: generateId(),
      password: newPassword, 
      timestamp: Date.now(), 
      strength,
    }, ...prev.slice(0, 9)]);
  }, [options]);

  // Initial generation
  useEffect(() => {
    generatePassword();
  }, []);

  // Copy to clipboard
  const handleCopy = useCallback(async (text: string = password) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [password]);

  const clearHistory = useCallback(() => setHistory([]), []);

  const strength = calculateStrength(password);
  const strengthInfo = getStrengthInfo(strength);
  const strengthPercent = (strength / 5) * 100;

  const toggleOption = (key: keyof PasswordOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate stats
  const charsetSize = useMemo(() => {
    let size = 0;
    if (options.uppercase) size += 26;
    if (options.lowercase) size += 26;
    if (options.numbers) size += 10;
    if (options.symbols) size += 20;
    return size;
  }, [options]);

  const entropy = Math.floor(options.length * Math.log2(charsetSize || 1));

  // Standalone Header
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
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-white"
            >
              <Lock className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold">Password Generator</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Generate secure, random passwords
              </p>
            </div>
          </div>
          <span className="hidden text-xs text-muted-foreground md:block">
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">⌘E</kbd> to switch apps
          </span>
        </div>
      </div>
    </motion.header>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {!isEmbedded && <StandaloneHeader />}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto w-full max-w-[1920px]">
          
          {/* Password Display - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <div className="flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Generated Password</span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${strengthInfo.color} bg-opacity-10`}
                    style={{ backgroundColor: `currentColor`, opacity: 0.1 }}
                  >
                    {strengthInfo.label}
                  </motion.span>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                    title={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCopy()}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                    title="Copy"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </motion.button>
                </div>
              </div>

              {/* Password Display */}
              <div className="p-6 bg-muted/20">
                <motion.div
                  key={password}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-2xl sm:text-3xl break-all text-center tracking-wider"
                >
                  {showPassword ? password : '•'.repeat(password.length)}
                </motion.div>

                {/* Strength Bar */}
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strengthPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${strengthInfo.bgColor}`}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Strength: {strengthInfo.label}</span>
                    <span>{entropy} bits of entropy</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Settings & History Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4"
          >
            {/* Settings Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Settings</span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Length Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Password Length</label>
                    <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-sm font-bold text-primary">
                      {options.length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="64"
                    value={options.length}
                    onChange={(e) => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>4</span>
                    <span>32</span>
                    <span>64</span>
                  </div>
                </div>

                {/* Character Options */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'uppercase', label: 'Uppercase', desc: 'A-Z' },
                    { key: 'lowercase', label: 'Lowercase', desc: 'a-z' },
                    { key: 'numbers', label: 'Numbers', desc: '0-9' },
                    { key: 'symbols', label: 'Symbols', desc: '!@#$' },
                  ].map(({ key, label, desc }) => (
                    <button
                      key={key}
                      onClick={() => toggleOption(key as keyof PasswordOptions)}
                      className={`flex items-center gap-2 rounded-xl border p-3 transition-all text-left ${
                        options[key as keyof PasswordOptions]
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-card hover:bg-accent'
                      }`}
                    >
                      <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                        options[key as keyof PasswordOptions]
                          ? 'border-primary bg-primary'
                          : 'border-muted'
                      }`}>
                        {options[key as keyof PasswordOptions] && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Exclude Ambiguous */}
                <label className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:bg-accent transition-colors">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={() => toggleOption('excludeAmbiguous')}
                    className="h-4 w-4 rounded border-primary text-primary"
                  />
                  <div>
                    <p className="text-sm font-medium">Exclude Ambiguous</p>
                    <p className="text-xs text-muted-foreground">Skip 0, O, 1, l, I</p>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* History Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">History</span>
                  {history.length > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {history.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {history.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={clearHistory}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                      title="Clear History"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowHistory(!showHistory)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                  >
                    {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-[250px] overflow-y-auto p-2">
                      {history.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          No history yet
                        </div>
                      ) : (
                        history.map((item) => {
                          const itemStrength = getStrengthInfo(item.strength);
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50"
                            >
                              <button
                                onClick={() => setPassword(item.password)}
                                className="flex-1 font-mono text-sm truncate text-left"
                              >
                                {item.password.slice(0, 25)}{item.password.length > 25 ? '...' : ''}
                              </button>
                              <span className={`text-xs ${itemStrength.color}`}>
                                {item.strength}/5
                              </span>
                              <button
                                onClick={() => handleCopy(item.password)}
                                className="p-1 rounded hover:bg-muted"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showHistory && history.length > 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Click to expand history ({history.length} passwords)
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-4"
          >
            <ActionButton
              onClick={generatePassword}
              variant="primary"
              icon={RefreshCw}
            >
              Generate New
            </ActionButton>
            <ActionButton
              onClick={() => handleCopy()}
              variant={copied ? 'primary' : 'outline'}
              icon={copied ? Check : Copy}
            >
              {copied ? 'Copied!' : 'Copy Password'}
            </ActionButton>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Password Statistics</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Length" value={password.length} icon={Hash} delay={0} />
              <StatCard label="Charset" value={`${charsetSize} chars`} icon={Gauge} delay={0.05} />
              <StatCard label="Entropy" value={`${entropy} bits`} icon={Zap} delay={0.1} />
              <StatCard label="Strength" value={strengthInfo.label} icon={strengthInfo.icon} delay={0.15} />
              <StatCard label="Generated" value={history.length} icon={History} delay={0.2} />
              <StatCard label="Uppercase" value={password.replace(/[^A-Z]/g, '').length} icon={Lock} delay={0.25} />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
