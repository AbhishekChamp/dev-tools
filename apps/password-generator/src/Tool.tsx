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
  Settings2,
  Dice5,
  Gauge,
  X,
  Clock,
  ArrowUpDown,
  Filter,
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

type SortOrder = 'newest' | 'oldest' | 'strongest' | 'weakest';

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: '0O1lI',
};

const generateId = () => Math.random().toString(36).substr(2, 9);

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

function getStrengthInfo(strength: number): {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  passwordColor: string;
  icon: React.ElementType;
} {
  const levels = [
    {
      label: 'Very Weak',
      color: 'bg-red-500',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-500',
      passwordColor: 'text-red-500',
      icon: ShieldAlert,
    },
    {
      label: 'Weak',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
      passwordColor: 'text-orange-500',
      icon: ShieldAlert,
    },
    {
      label: 'Fair',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-600',
      passwordColor: 'text-yellow-600',
      icon: Shield,
    },
    {
      label: 'Strong',
      color: 'bg-green-500',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600',
      passwordColor: 'text-green-600',
      icon: ShieldCheck,
    },
    {
      label: 'Very Strong',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-600',
      passwordColor: 'text-emerald-600',
      icon: ShieldCheck,
    },
    {
      label: 'Excellent',
      color: 'bg-emerald-600',
      bgColor: 'bg-emerald-600/10',
      textColor: 'text-emerald-700',
      passwordColor: 'text-emerald-700',
      icon: ShieldCheck,
    },
  ];
  return levels[strength] || levels[0];
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatFullTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export default function PasswordGenerator() {
  const { isEmbedded } = useEmbedded();
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<PasswordHistory[]>([]);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filterStrength, setFilterStrength] = useState<number | null>(null);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });

  const generatePassword = useCallback(() => {
    let charset = '';
    if (options.uppercase) charset += CHAR_SETS.uppercase;
    if (options.lowercase) charset += CHAR_SETS.lowercase;
    if (options.numbers) charset += CHAR_SETS.numbers;
    if (options.symbols) charset += CHAR_SETS.symbols;

    if (options.excludeAmbiguous) {
      charset = charset
        .split('')
        .filter((c) => !CHAR_SETS.ambiguous.includes(c))
        .join('');
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
    setHistory((prev) =>
      [
        {
          id: generateId(),
          password: newPassword,
          timestamp: Date.now(),
          strength,
        },
        ...prev,
      ].slice(0, 50)
    );
  }, [options]);

  useEffect(() => {
    generatePassword();
  }, []);

  const handleCopy = useCallback(
    async (text: string = password) => {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    },
    [password]
  );

  const clearHistory = useCallback(() => setHistory([]), []);

  const strength = calculateStrength(password);
  const strengthInfo = getStrengthInfo(strength);
  const strengthPercent = (strength / 5) * 100;

  const toggleOption = (key: keyof PasswordOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const charsetSize = useMemo(() => {
    let size = 0;
    if (options.uppercase) size += 26;
    if (options.lowercase) size += 26;
    if (options.numbers) size += 10;
    if (options.symbols) size += 20;
    return size;
  }, [options]);

  const entropy = Math.floor(options.length * Math.log2(charsetSize || 1));

  const charTypes = useMemo(
    () => ({
      upper: password.replace(/[^A-Z]/g, '').length,
      lower: password.replace(/[^a-z]/g, '').length,
      nums: password.replace(/[^0-9]/g, '').length,
      sym: password.replace(/[a-zA-Z0-9]/g, '').length,
    }),
    [password]
  );

  // Sorted and filtered history
  const sortedHistory = useMemo(() => {
    let result = [...history];

    // Apply filter
    if (filterStrength !== null) {
      result = result.filter((h) => h.strength === filterStrength);
    }

    // Apply sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'strongest':
          return b.strength - a.strength;
        case 'weakest':
          return a.strength - b.strength;
        default:
          return 0;
      }
    });

    return result;
  }, [history, sortOrder, filterStrength]);

  // Stats for filter pills
  const strengthCounts = useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    history.forEach((h) => {
      counts[h.strength] = (counts[h.strength] || 0) + 1;
    });
    return counts;
  }, [history]);

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Compact Header */}
      {!isEmbedded && (
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card shrink-0 border-b"
        >
          <div className="mx-auto w-full px-3">
            <div className="flex h-12 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-base font-bold">Password Generator</h1>
                  <p className="text-muted-foreground hidden text-[10px] sm:block">
                    Generate secure, random passwords
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {/* Main Content - Three Column Layout */}
      <main className="flex-1 overflow-hidden p-2">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-2">
          {/* Three Column Row */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-3">
            {/* Column 1: Password Display with Regenerate */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm"
            >
              <div className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-3 py-2">
                <div className="flex items-center gap-2">
                  <Zap className="text-primary h-4 w-4" />
                  <span className="text-sm font-semibold">Generated Password</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${strengthInfo.bgColor} ${strengthInfo.textColor}`}
                >
                  {strengthInfo.label}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-center gap-4 p-4">
                {/* Password with strength color */}
                <motion.div
                  key={password}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`break-all text-center font-mono text-2xl sm:text-3xl ${strengthInfo.passwordColor}`}
                >
                  {showPassword ? password : '•'.repeat(password.length)}
                </motion.div>

                {/* Strength Bar */}
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strengthPercent}%` }}
                      className={`h-full ${strengthInfo.color}`}
                    />
                  </div>
                  <span className="text-muted-foreground whitespace-nowrap text-xs font-medium">
                    {entropy} bits
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-3 border-t">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:bg-muted flex items-center justify-center gap-1 border-r px-3 py-2.5 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="text-xs">{showPassword ? 'Hide' : 'Show'}</span>
                </button>
                <button
                  onClick={generatePassword}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1 border-r px-3 py-2.5 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-xs font-medium">Regenerate</span>
                </button>
                <button
                  onClick={() => handleCopy()}
                  className={`flex items-center justify-center gap-1 px-3 py-2.5 transition-colors ${
                    copied ? 'bg-green-500 text-white' : 'hover:bg-muted'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="text-xs font-medium">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </motion.div>

            {/* Column 2: Character Stats & Recent */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm"
            >
              <div className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-3 py-2">
                <div className="flex items-center gap-2">
                  <Gauge className="text-primary h-4 w-4" />
                  <span className="text-sm font-semibold">Character Analysis</span>
                </div>
              </div>

              <div className="space-y-2 p-3">
                {/* Character Bars */}
                <div className="space-y-2">
                  {[
                    { label: 'Uppercase', count: charTypes.upper, color: 'bg-blue-500' },
                    { label: 'Lowercase', count: charTypes.lower, color: 'bg-green-500' },
                    { label: 'Numbers', count: charTypes.nums, color: 'bg-purple-500' },
                    { label: 'Symbols', count: charTypes.sym, color: 'bg-orange-500' },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-muted-foreground w-16 text-xs">{label}</span>
                      <div className="bg-muted h-4 flex-1 overflow-hidden rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: password ? `${(count / password.length) * 100}%` : 0 }}
                          className={`h-full ${color}`}
                        />
                      </div>
                      <span className="w-4 text-right text-xs font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Recent History */}
              <div className="flex min-h-0 flex-1 flex-col border-t">
                <div className="bg-muted/30 flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <History className="text-primary h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">Recent</span>
                    {history.length > 0 && (
                      <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px]">
                        {history.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowHistoryPopup(true)}
                    className="text-primary text-[10px] hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="flex-1 space-y-0.5 overflow-y-auto p-1">
                  {history.slice(0, 5).map((item) => {
                    const itemStrength = getStrengthInfo(item.strength);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-muted/50 group flex items-center gap-1.5 rounded p-1.5"
                      >
                        <button
                          onClick={() => setPassword(item.password)}
                          className={`flex-1 truncate text-left font-mono text-xs ${itemStrength.passwordColor}`}
                        >
                          {item.password}
                        </button>
                        <span className="text-muted-foreground whitespace-nowrap text-[10px]">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                        <button
                          onClick={() => handleCopy(item.password)}
                          className="hover:bg-muted rounded p-1 opacity-0 group-hover:opacity-100"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Column 3: Settings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm"
            >
              <div className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-3 py-2">
                <div className="flex items-center gap-2">
                  <Settings2 className="text-primary h-4 w-4" />
                  <span className="text-sm font-semibold">Settings</span>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto p-3">
                {/* Length Slider */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">
                      Password Length
                    </span>
                    <span className="text-sm font-bold">{options.length}</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="64"
                    value={options.length}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, length: parseInt(e.target.value) }))
                    }
                    className="bg-muted accent-primary h-2 w-full cursor-pointer appearance-none rounded-full"
                  />
                  <div className="text-muted-foreground mt-0.5 flex justify-between text-[10px]">
                    <span>4</span>
                    <span>32</span>
                    <span>64</span>
                  </div>
                </div>

                {/* Character Types */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'uppercase', label: 'ABC', desc: 'Uppercase' },
                    { key: 'lowercase', label: 'abc', desc: 'Lowercase' },
                    { key: 'numbers', label: '123', desc: 'Numbers' },
                    { key: 'symbols', label: '@#$', desc: 'Symbols' },
                  ].map(({ key, label, desc }) => (
                    <button
                      key={key}
                      onClick={() => toggleOption(key as keyof PasswordOptions)}
                      className={`flex flex-col items-center gap-0.5 rounded-lg border p-2 transition-all ${
                        options[key as keyof PasswordOptions]
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-card hover:bg-accent'
                      }`}
                    >
                      <span
                        className={`text-sm font-bold ${options[key as keyof PasswordOptions] ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        {label}
                      </span>
                      <span className="text-muted-foreground text-[9px]">{desc}</span>
                    </button>
                  ))}
                </div>

                {/* Exclude Ambiguous */}
                <label className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={() => toggleOption('excludeAmbiguous')}
                    className="border-primary accent-primary h-4 w-4 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium">Exclude Ambiguous</p>
                    <p className="text-muted-foreground text-[9px]">Skip 0, O, 1, l, I</p>
                  </div>
                  <Dice5 className="text-muted-foreground h-4 w-4" />
                </label>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* History Popup Modal with Sort/Filter */}
      <AnimatePresence>
        {showHistoryPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowHistoryPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <History className="text-primary h-4 w-4" />
                  <span className="font-semibold">Password History</span>
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                    {sortedHistory.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="hover:bg-muted text-destructive flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistoryPopup(false)}
                    className="hover:bg-muted rounded p-1.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Sort & Filter Bar */}
              <div className="bg-muted/20 flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-2">
                {/* Sort */}
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="text-muted-foreground h-3.5 w-3.5" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="bg-card focus:ring-primary rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="strongest">Strongest First</option>
                    <option value="weakest">Weakest First</option>
                  </select>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-1 items-center gap-1.5">
                  <Filter className="text-muted-foreground h-3.5 w-3.5" />
                  <button
                    onClick={() => setFilterStrength(null)}
                    className={`rounded-full px-2 py-1 text-[10px] transition-colors ${
                      filterStrength === null
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    All ({history.length})
                  </button>
                  {[5, 4, 3, 2, 1, 0].map((level) => {
                    const count = strengthCounts[level];
                    if (count === 0) return null;
                    const info = getStrengthInfo(level);
                    return (
                      <button
                        key={level}
                        onClick={() => setFilterStrength(filterStrength === level ? null : level)}
                        className={`rounded-full px-2 py-1 text-[10px] transition-colors ${
                          filterStrength === level
                            ? info.bgColor + ' ' + info.textColor + ' ring-1 ring-current'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {info.label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto p-2">
                {sortedHistory.length === 0 ? (
                  <div className="text-muted-foreground p-8 text-center">
                    <History className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p className="text-sm">
                      {filterStrength !== null
                        ? 'No passwords match this filter'
                        : 'No passwords generated yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sortedHistory.map((item) => {
                      const itemStrength = getStrengthInfo(item.strength);
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-muted/50 group flex items-center gap-3 rounded-lg p-2.5"
                        >
                          <button
                            onClick={() => {
                              setPassword(item.password);
                              setShowHistoryPopup(false);
                            }}
                            className={`flex-1 truncate text-left font-mono text-sm ${itemStrength.passwordColor}`}
                          >
                            {item.password}
                          </button>
                          <div className="flex items-center gap-1.5">
                            <Clock className="text-muted-foreground h-3 w-3" />
                            <span
                              className="text-muted-foreground text-xs"
                              title={formatFullTime(item.timestamp)}
                            >
                              {formatTimeAgo(item.timestamp)}
                            </span>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] ${itemStrength.bgColor} ${itemStrength.textColor}`}
                          >
                            {itemStrength.label}
                          </span>
                          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => handleCopy(item.password)}
                              className="hover:bg-muted rounded p-1.5"
                              title="Copy"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setPassword(item.password)}
                              className="hover:bg-muted rounded p-1.5"
                              title="Use"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
