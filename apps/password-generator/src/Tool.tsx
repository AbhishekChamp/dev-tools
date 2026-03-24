import React, { useState, useCallback, useEffect } from 'react';
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
}

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: '0O1lI',
};

// Animated Stat Card
function StatCard({ label, value, icon: Icon, delay = 0 }: { label: string; value: string | number; icon: React.ElementType; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }} whileHover={{ scale: 1.05, y: -2 }} className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
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
function ActionButton({ children, onClick, variant = 'primary', icon, disabled = false }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; icon?: React.ReactNode; disabled?: boolean }) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <motion.button whileHover={disabled ? {} : { scale: 1.02 }} whileTap={disabled ? {} : { scale: 0.98 }} onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none ${variants[variant]}`}>
      {icon}{children}
    </motion.button>
  );
}

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

function getStrengthInfo(strength: number): { label: string; color: string; icon: React.ElementType } {
  switch (strength) {
    case 0:
    case 1: return { label: 'Very Weak', color: 'text-red-500', icon: ShieldAlert };
    case 2: return { label: 'Weak', color: 'text-orange-500', icon: ShieldAlert };
    case 3: return { label: 'Fair', color: 'text-yellow-500', icon: Shield };
    case 4: return { label: 'Strong', color: 'text-green-500', icon: ShieldCheck };
    case 5: return { label: 'Very Strong', color: 'text-emerald-500', icon: ShieldCheck };
    default: return { label: 'Unknown', color: 'text-gray-500', icon: Shield };
  }
}

export default function PasswordGenerator() {
  const { isEmbedded } = useEmbedded();
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<PasswordHistory[]>([]);
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
    setHistory(prev => [{ password: newPassword, timestamp: Date.now(), strength }, ...prev.slice(0, 9)]);
  }, [options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleCopy = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
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

  const charsetSize = (options.uppercase ? 26 : 0) + (options.lowercase ? 26 : 0) + (options.numbers ? 10 : 0) + (options.symbols ? 20 : 0);
  const entropy = Math.floor(options.length * Math.log2(charsetSize || 1));

  // Standalone Header
  const StandaloneHeader = () => (
    <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="border-b bg-card shrink-0">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-white">
              <Lock className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold">Password Generator</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">Generate secure, random passwords</p>
            </div>
          </div>
          <span className="hidden text-xs text-muted-foreground md:block">Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">⌘E</kbd> to switch apps</span>
        </div>
      </div>
    </motion.header>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {!isEmbedded && <StandaloneHeader />}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto w-full max-w-3xl">
          {/* Password Display */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <motion.div key={password} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-2xl sm:text-3xl break-all tracking-wider">
                    {showPassword ? password : '•'.repeat(password.length)}
                  </motion.div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowPassword(!showPassword)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleCopy} className="rounded-lg bg-primary p-2 text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </motion.button>
                </div>
              </div>

              {/* Strength Bar */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={strengthInfo.color}>
                      <strengthInfo.icon className="h-5 w-5" />
                    </span>
                    <span className={`text-sm font-medium ${strengthInfo.color}`}>{strengthInfo.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{password.length} characters</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${strengthPercent}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} className={`h-full rounded-full ${strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-orange-500' : strength === 3 ? 'bg-yellow-500' : strength === 4 ? 'bg-green-500' : 'bg-emerald-500'}`} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Generate Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-center mb-6">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generatePassword} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
              <RefreshCw className="h-5 w-5" />Generate New Password
            </motion.button>
          </motion.div>

          {/* Options */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border bg-card p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Options</h2>
            </div>

            {/* Length Slider */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password Length</label>
                <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{options.length}</span>
              </div>
              <input type="range" min="4" max="64" value={options.length} onChange={(e) => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))} className="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>4</span><span>32</span><span>64</span></div>
            </div>

            {/* Character Options */}
            <div className="grid gap-3 sm:grid-cols-2 mb-4">
              {[
                { key: 'uppercase', label: 'Uppercase (A-Z)', icon: 'A' },
                { key: 'lowercase', label: 'Lowercase (a-z)', icon: 'a' },
                { key: 'numbers', label: 'Numbers (0-9)', icon: '1' },
                { key: 'symbols', label: 'Symbols (!@#$)', icon: '@' },
              ].map(({ key, label, icon }) => (
                <motion.button key={key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => toggleOption(key as keyof PasswordOptions)} className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${options[key as keyof PasswordOptions] ? 'border-primary bg-primary/5' : 'border-muted bg-card hover:bg-accent'}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-mono text-lg font-bold ${options[key as keyof PasswordOptions] ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{icon}</div>
                  <div className="flex-1 text-left"><span className="font-medium">{label}</span></div>
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${options[key as keyof PasswordOptions] ? 'border-primary bg-primary' : 'border-muted'}`}>
                    {options[key as keyof PasswordOptions] && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Exclude Ambiguous */}
            <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-accent transition-colors">
              <input type="checkbox" checked={options.excludeAmbiguous} onChange={() => toggleOption('excludeAmbiguous')} className="h-5 w-5 rounded border-primary text-primary focus:ring-primary" />
              <div className="flex-1">
                <p className="font-medium">Exclude Ambiguous Characters</p>
                <p className="text-sm text-muted-foreground">Avoid characters like 0, O, 1, l, I</p>
              </div>
            </label>
          </motion.div>

          {/* Statistics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Statistics</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard label="Entropy" value={`${entropy} bits`} icon={Zap} delay={0} />
              <StatCard label="Charset" value={`${charsetSize} chars`} icon={Hash} delay={0.1} />
              <StatCard label="Generated" value={history.length} icon={Clock} delay={0.2} />
              <StatCard label="Strength" value={strengthInfo.label} icon={strengthInfo.icon} delay={0.3} />
            </div>
          </motion.div>

          {/* History */}
          {history.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border bg-card p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Recent Passwords</h2>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={clearHistory} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted">
                  <Trash2 className="h-4 w-4" />Clear
                </motion.button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {history.map((item, index) => {
                  const itemStrength = getStrengthInfo(item.strength);
                  return (
                    <motion.div key={`${item.timestamp}-${index}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                      <button onClick={() => setPassword(item.password)} className="flex-1 font-mono text-sm truncate text-left hover:text-primary transition-colors">{item.password}</button>
                      <span className={`text-xs ${itemStrength.color}`}>{itemStrength.label}</span>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigator.clipboard.writeText(item.password)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                        <Copy className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Security Note */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-green-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-400">Privacy First</h4>
                <p className="mt-1 text-sm text-green-600/80 dark:text-green-400/80">Passwords are generated locally in your browser using cryptographically secure random number generation. No data is ever sent to any server.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
