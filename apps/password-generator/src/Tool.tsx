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
  Clock,
  Hash,
  Sparkles,
  Settings2,
  ChevronDown,
  ChevronUp,
  Dice5,
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

// Strength calculation
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
  description: string;
} {
  const levels = [
    { label: 'Very Weak', color: 'text-red-500', bgColor: 'bg-red-500', icon: ShieldAlert, description: 'Easily crackable' },
    { label: 'Weak', color: 'text-orange-500', bgColor: 'bg-orange-500', icon: ShieldAlert, description: 'Vulnerable to attacks' },
    { label: 'Fair', color: 'text-yellow-500', bgColor: 'bg-yellow-500', icon: Shield, description: 'Moderate protection' },
    { label: 'Strong', color: 'text-green-500', bgColor: 'bg-green-500', icon: ShieldCheck, description: 'Good protection' },
    { label: 'Very Strong', color: 'text-emerald-500', bgColor: 'bg-emerald-500', icon: ShieldCheck, description: 'Excellent protection' },
    { label: 'Excellent', color: 'text-emerald-600', bgColor: 'bg-emerald-600', icon: ShieldCheck, description: 'Maximum security' },
  ];
  return levels[strength] || levels[0];
}

// Get strength emoji
function getStrengthEmoji(strength: number): string {
  const emojis = ['💀', '😰', '😐', '😊', '😎', '🛡️'];
  return emojis[strength] || emojis[0];
}

// Character type badge
function CharTypeBadge({ active, icon, label }: { active: boolean; icon: string; label: string }) {
  return (
    <motion.div
      initial={false}
      animate={{ scale: active ? 1 : 0.95, opacity: active ? 1 : 0.5 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
        active 
          ? 'bg-primary/15 text-primary border border-primary/30' 
          : 'bg-muted text-muted-foreground border border-transparent'
      }`}
    >
      <span className="font-bold">{icon}</span>
      {label}
    </motion.div>
  );
}

// Animated counter
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="tabular-nums"
    >
      {value}{suffix}
    </motion.span>
  );
}

export default function PasswordGenerator() {
  const { isEmbedded } = useEmbedded();
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<PasswordHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [justGenerated, setJustGenerated] = useState(false);
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
      password: newPassword, 
      timestamp: Date.now(), 
      strength,
      id: generateId()
    }, ...prev.slice(0, 9)]);
    
    setJustGenerated(true);
    setTimeout(() => setJustGenerated(false), 500);
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
    if (options.excludeAmbiguous) size -= 5;
    return size;
  }, [options]);

  const entropy = Math.floor(options.length * Math.log2(charsetSize || 1));
  const crackTime = useMemo(() => {
    if (entropy < 40) return 'Instant';
    if (entropy < 60) return 'Seconds';
    if (entropy < 80) return 'Minutes';
    if (entropy < 100) return 'Hours';
    if (entropy < 120) return 'Days';
    if (entropy < 140) return 'Years';
    return 'Centuries';
  }, [entropy]);

  // Character type counts
  const charTypes = useMemo(() => ({
    uppercase: /[A-Z]/.test(password) ? password.match(/[A-Z]/g)?.length || 0 : 0,
    lowercase: /[a-z]/.test(password) ? password.match(/[a-z]/g)?.length || 0 : 0,
    numbers: /[0-9]/.test(password) ? password.match(/[0-9]/g)?.length || 0 : 0,
    symbols: /[^a-zA-Z0-9]/.test(password) ? password.match(/[^a-zA-Z0-9]/g)?.length || 0 : 0,
  }), [password]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      {!isEmbedded && (
        <motion.header 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="border-b bg-gradient-to-r from-primary/5 via-background to-background"
        >
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, rotate: -10 }} 
                  animate={{ scale: 1, opacity: 1, rotate: 0 }} 
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/25"
                >
                  <Lock className="h-5 w-5" />
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Password Generator
                  </h1>
                  <p className="text-xs text-muted-foreground">Create secure, random passwords instantly</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    showHistory ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                  {history.length > 0 && (
                    <span className="ml-1 rounded-full bg-background/20 px-1.5 py-0.5 text-xs">
                      {history.length}
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
          
          {/* Password Display Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <div className="relative overflow-hidden rounded-2xl border bg-card shadow-xl shadow-primary/5">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              
              <div className="relative p-6 sm:p-8">
                {/* Password display */}
                <div className="mb-6">
                  <motion.div 
                    key={password}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`font-mono text-2xl sm:text-3xl md:text-4xl break-all text-center tracking-wider py-4 px-2 rounded-xl bg-muted/50 border-2 border-dashed transition-all ${
                      justGenerated ? 'border-primary/50 bg-primary/5' : 'border-muted'
                    }`}
                  >
                    {showPassword ? (
                      <span className="text-foreground">{password}</span>
                    ) : (
                      <span className="text-muted-foreground tracking-[0.3em]">
                        {'•'.repeat(Math.min(password.length, 24))}
                        {password.length > 24 && '...'}
                      </span>
                    )}
                  </motion.div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showPassword ? 'Hide' : 'Show'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy()}
                    className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all shadow-lg ${
                      copied 
                        ? 'bg-green-500 text-white shadow-green-500/25' 
                        : 'bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90'
                    }`}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy Password'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generatePassword}
                    className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-2.5 text-sm font-medium text-secondary-foreground shadow-lg shadow-secondary/25 hover:bg-secondary/80 transition-all"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Generate
                  </motion.button>
                </div>

                {/* Character type badges */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <CharTypeBadge active={charTypes.uppercase > 0} icon="ABC" label={`${charTypes.uppercase} upper`} />
                  <CharTypeBadge active={charTypes.lowercase > 0} icon="abc" label={`${charTypes.lowercase} lower`} />
                  <CharTypeBadge active={charTypes.numbers > 0} icon="123" label={`${charTypes.numbers} numbers`} />
                  <CharTypeBadge active={charTypes.symbols > 0} icon="@#$" label={`${charTypes.symbols} symbols`} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Strength Meter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6"
          >
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={false}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                    key={strength}
                    className={`text-2xl ${strengthInfo.color}`}
                  >
                    {getStrengthEmoji(strength)}
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${strengthInfo.color}`}>{strengthInfo.label}</span>
                      <span className="text-xs text-muted-foreground">({strength}/5)</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{strengthInfo.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold tabular-nums">{entropy}</div>
                  <div className="text-xs text-muted-foreground">bits of entropy</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strengthPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${strengthInfo.bgColor} relative`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.div>
              </div>

              {/* Crack time estimate */}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated crack time:</span>
                <span className="font-medium">{crackTime}</span>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Settings Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex w-full items-center justify-between mb-4"
                >
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Settings</h2>
                  </div>
                  {showSettings ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-5"
                    >
                      {/* Length Slider */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            Password Length
                          </label>
                          <motion.span 
                            key={options.length}
                            initial={{ scale: 1.5, color: '#hsl(var(--primary))' }}
                            animate={{ scale: 1, color: 'inherit' }}
                            className="rounded-lg bg-primary/10 px-3 py-1 text-lg font-bold text-primary"
                          >
                            {options.length}
                          </motion.span>
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
                      <div className="grid gap-2">
                        {[
                          { key: 'uppercase', label: 'Uppercase Letters', desc: 'A-Z', icon: 'AA' },
                          { key: 'lowercase', label: 'Lowercase Letters', desc: 'a-z', icon: 'aa' },
                          { key: 'numbers', label: 'Numbers', desc: '0-9', icon: '12' },
                          { key: 'symbols', label: 'Special Symbols', desc: '!@#$', icon: '@#' },
                        ].map(({ key, label, desc, icon }) => (
                          <motion.button
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleOption(key as keyof PasswordOptions)}
                            className={`flex items-center gap-3 rounded-xl border p-3 transition-all text-left ${
                              options[key as keyof PasswordOptions]
                                ? 'border-primary bg-primary/5'
                                : 'border-muted bg-card hover:bg-accent'
                            }`}
                          >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-mono text-sm font-bold transition-colors ${
                              options[key as keyof PasswordOptions]
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{label}</div>
                              <div className="text-xs text-muted-foreground">{desc}</div>
                            </div>
                            <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                              options[key as keyof PasswordOptions]
                                ? 'border-primary bg-primary'
                                : 'border-muted'
                            }`}>
                              {options[key as keyof PasswordOptions] && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Exclude Ambiguous */}
                      <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-accent transition-colors">
                        <input
                          type="checkbox"
                          checked={options.excludeAmbiguous}
                          onChange={() => toggleOption('excludeAmbiguous')}
                          className="h-5 w-5 rounded border-primary text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="font-medium flex items-center gap-2">
                            <Dice5 className="h-4 w-4" />
                            Exclude Ambiguous
                          </p>
                          <p className="text-sm text-muted-foreground">Skip 0, O, 1, l, I to avoid confusion</p>
                        </div>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* History Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-all ${
                showHistory ? 'ring-2 ring-primary/20' : ''
              }`}>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex w-full items-center justify-between p-5"
                >
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Recent Passwords</h2>
                    {history.length > 0 && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {history.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {history.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearHistory();
                        }}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Clear
                      </motion.button>
                    )}
                    {showHistory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </button>

                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="border-t"
                    >
                      {history.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                          <p>No passwords generated yet</p>
                          <p className="text-sm">Click Generate to create your first password</p>
                        </div>
                      ) : (
                        <div className="max-h-[300px] overflow-y-auto">
                          {history.map((item, index) => {
                            const itemStrength = getStrengthInfo(item.strength);
                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                              >
                                <button
                                  onClick={() => setPassword(item.password)}
                                  className="flex-1 font-mono text-sm truncate text-left hover:text-primary transition-colors"
                                >
                                  {item.password.slice(0, 20)}{item.password.length > 20 ? '...' : ''}
                                </button>
                                <span className={`text-xs px-2 py-1 rounded-full ${itemStrength.bgColor}/10 ${itemStrength.color}`}>
                                  {item.strength}/5
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleCopy(item.password)}
                                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                                >
                                  <Copy className="h-4 w-4" />
                                </motion.button>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Security Note */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 shrink-0">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">Privacy First</h4>
                    <p className="mt-1 text-sm text-green-600/80 dark:text-green-400/80 leading-relaxed">
                      All passwords are generated locally in your browser using cryptographically 
                      secure random number generation. No data is ever sent to any server.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground hidden lg:block">
        Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Space</kbd> to generate
      </div>
    </div>
  );
}
