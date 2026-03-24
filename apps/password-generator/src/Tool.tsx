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
    { label: 'Very Weak', color: 'bg-red-500', bgColor: 'bg-red-500/10', textColor: 'text-red-500', passwordColor: 'text-red-500', icon: ShieldAlert },
    { label: 'Weak', color: 'bg-orange-500', bgColor: 'bg-orange-500/10', textColor: 'text-orange-500', passwordColor: 'text-orange-500', icon: ShieldAlert },
    { label: 'Fair', color: 'bg-yellow-500', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-600', passwordColor: 'text-yellow-600', icon: Shield },
    { label: 'Strong', color: 'bg-green-500', bgColor: 'bg-green-500/10', textColor: 'text-green-600', passwordColor: 'text-green-600', icon: ShieldCheck },
    { label: 'Very Strong', color: 'bg-emerald-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-600', passwordColor: 'text-emerald-600', icon: ShieldCheck },
    { label: 'Excellent', color: 'bg-emerald-600', bgColor: 'bg-emerald-600/10', textColor: 'text-emerald-700', passwordColor: 'text-emerald-700', icon: ShieldCheck },
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
    }, ...prev].slice(0, 50));
  }, [options]);

  useEffect(() => {
    generatePassword();
  }, []);

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

  const charsetSize = useMemo(() => {
    let size = 0;
    if (options.uppercase) size += 26;
    if (options.lowercase) size += 26;
    if (options.numbers) size += 10;
    if (options.symbols) size += 20;
    return size;
  }, [options]);

  const entropy = Math.floor(options.length * Math.log2(charsetSize || 1));

  const charTypes = useMemo(() => ({
    upper: password.replace(/[^A-Z]/g, '').length,
    lower: password.replace(/[^a-z]/g, '').length,
    nums: password.replace(/[^0-9]/g, '').length,
    sym: password.replace(/[a-zA-Z0-9]/g, '').length,
  }), [password]);

  // Sorted and filtered history
  const sortedHistory = useMemo(() => {
    let result = [...history];
    
    // Apply filter
    if (filterStrength !== null) {
      result = result.filter(h => h.strength === filterStrength);
    }
    
    // Apply sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'newest': return b.timestamp - a.timestamp;
        case 'oldest': return a.timestamp - b.timestamp;
        case 'strongest': return b.strength - a.strength;
        case 'weakest': return a.strength - b.strength;
        default: return 0;
      }
    });
    
    return result;
  }, [history, sortOrder, filterStrength]);

  // Stats for filter pills
  const strengthCounts = useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    history.forEach(h => {
      counts[h.strength] = (counts[h.strength] || 0) + 1;
    });
    return counts;
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Compact Header */}
      {!isEmbedded && (
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b bg-card shrink-0"
        >
          <div className="mx-auto w-full px-3">
            <div className="flex h-12 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-base font-bold">Password Generator</h1>
                  <p className="hidden sm:block text-[10px] text-muted-foreground">Generate secure, random passwords</p>
                </div>
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {/* Main Content - Three Column Layout */}
      <main className="flex-1 p-2 overflow-hidden">
        <div className="mx-auto w-full max-w-7xl h-full flex flex-col gap-2">
          
          {/* Three Column Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
            
            {/* Column 1: Password Display with Regenerate */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 shrink-0">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Generated Password</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${strengthInfo.bgColor} ${strengthInfo.textColor}`}>
                  {strengthInfo.label}
                </span>
              </div>
              
              <div className="flex-1 p-4 flex flex-col justify-center gap-4">
                {/* Password with strength color */}
                <motion.div
                  key={password}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`font-mono text-2xl sm:text-3xl break-all text-center ${strengthInfo.passwordColor}`}
                >
                  {showPassword ? password : '•'.repeat(password.length)}
                </motion.div>
                
                {/* Strength Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strengthPercent}%` }}
                      className={`h-full ${strengthInfo.color}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">{entropy} bits</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-3 border-t">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center justify-center gap-1 px-3 py-2.5 hover:bg-muted transition-colors border-r"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="text-xs">{showPassword ? 'Hide' : 'Show'}</span>
                </button>
                <button
                  onClick={generatePassword}
                  className="flex items-center justify-center gap-1 px-3 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors border-r"
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
              className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 shrink-0">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Character Analysis</span>
                </div>
              </div>
              
              <div className="p-3 space-y-2">
                {/* Character Bars */}
                <div className="space-y-2">
                  {[
                    { label: 'Uppercase', count: charTypes.upper, color: 'bg-blue-500' },
                    { label: 'Lowercase', count: charTypes.lower, color: 'bg-green-500' },
                    { label: 'Numbers', count: charTypes.nums, color: 'bg-purple-500' },
                    { label: 'Symbols', count: charTypes.sym, color: 'bg-orange-500' },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16">{label}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: password ? `${(count / password.length) * 100}%` : 0 }}
                          className={`h-full ${color}`}
                        />
                      </div>
                      <span className="text-xs font-bold w-4 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Recent History */}
              <div className="flex-1 border-t flex flex-col min-h-0">
                <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold">Recent</span>
                    {history.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {history.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowHistoryPopup(true)}
                    className="text-[10px] text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
                  {history.slice(0, 5).map((item) => {
                    const itemStrength = getStrengthInfo(item.strength);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5 p-1.5 rounded hover:bg-muted/50 group"
                      >
                        <button
                          onClick={() => setPassword(item.password)}
                          className={`flex-1 font-mono text-xs truncate text-left ${itemStrength.passwordColor}`}
                        >
                          {item.password}
                        </button>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                        <button
                          onClick={() => handleCopy(item.password)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted"
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
              className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 shrink-0">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Settings</span>
                </div>
              </div>
              
              <div className="p-3 space-y-3 overflow-y-auto">
                {/* Length Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Password Length</span>
                    <span className="text-sm font-bold">{options.length}</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="64"
                    value={options.length}
                    onChange={(e) => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
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
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-lg border transition-all ${
                        options[key as keyof PasswordOptions]
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-card hover:bg-accent'
                      }`}
                    >
                      <span className={`text-sm font-bold ${options[key as keyof PasswordOptions] ? 'text-primary' : 'text-muted-foreground'}`}>
                        {label}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{desc}</span>
                    </button>
                  ))}
                </div>

                {/* Exclude Ambiguous */}
                <label className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={() => toggleOption('excludeAmbiguous')}
                    className="h-4 w-4 rounded border-primary accent-primary"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium">Exclude Ambiguous</p>
                    <p className="text-[9px] text-muted-foreground">Skip 0, O, 1, l, I</p>
                  </div>
                  <Dice5 className="h-4 w-4 text-muted-foreground" />
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
              className="w-full max-w-2xl rounded-xl border bg-card shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 shrink-0">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Password History</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {sortedHistory.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-muted transition-colors text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistoryPopup(false)}
                    className="p-1.5 rounded hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Sort & Filter Bar */}
              <div className="flex items-center gap-3 px-4 py-2 border-b bg-muted/20 shrink-0 flex-wrap">
                {/* Sort */}
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="text-xs px-2 py-1 rounded border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="strongest">Strongest First</option>
                    <option value="weakest">Weakest First</option>
                  </select>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-1">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <button
                    onClick={() => setFilterStrength(null)}
                    className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
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
                        className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
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
                  <div className="p-8 text-center text-muted-foreground">
                    <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
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
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 group"
                        >
                          <button
                            onClick={() => {
                              setPassword(item.password);
                              setShowHistoryPopup(false);
                            }}
                            className={`flex-1 font-mono text-sm truncate text-left ${itemStrength.passwordColor}`}
                          >
                            {item.password}
                          </button>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground" title={formatFullTime(item.timestamp)}>
                              {formatTimeAgo(item.timestamp)}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${itemStrength.bgColor} ${itemStrength.textColor}`}>
                            {itemStrength.label}
                          </span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopy(item.password)}
                              className="p-1.5 rounded hover:bg-muted"
                              title="Copy"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setPassword(item.password)}
                              className="p-1.5 rounded hover:bg-muted"
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
