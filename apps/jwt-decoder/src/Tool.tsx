import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Copy,
  Check,
  AlertCircle,
  Trash2,
  Shield,
  Clock,
  Fingerprint,
  FileJson,
  Lock,
  Unlock,
  Calendar,
  Hash,
  User,
  Command,
  X,
  Home,
  Regex,
  ArrowLeftRight,
  FileJson as FileJsonIcon,
} from 'lucide-react';

// Tool definitions for Cmd+E switcher
const tools = [
  { id: 'json', name: 'JSON Formatter', route: 'http://localhost:3001', icon: FileJsonIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'regex', name: 'Regex Tester', route: 'http://localhost:3002', icon: Regex, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'jwt', name: 'JWT Decoder', route: 'http://localhost:3003', icon: KeyRound, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'base64', name: 'Base64 Tool', route: 'http://localhost:3004', icon: ArrowLeftRight, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'password', name: 'Password Generator', route: 'http://localhost:3005', icon: Lock, color: 'text-red-500', bg: 'bg-red-500/10' },
];

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

interface JWTPayload {
  exp?: number;
  iat?: number;
  nbf?: number;
  sub?: string;
  iss?: string;
  aud?: string;
  [key: string]: unknown;
}

// Cmd+E Switcher Component
function ToolSwitcher() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg"
          >
            <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Command className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Switch Application</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Tools</p>
                {tools.map((tool, index) => {
                  const Icon = tool.icon;
                  const isActive = tool.id === 'jwt';
                  return (
                    <motion.a
                      key={tool.id}
                      href={tool.route}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isActive ? 'bg-primary-foreground/20' : tool.bg}`}>
                        <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : tool.color}`} />
                      </div>
                      <span className="flex-1 font-medium">{tool.name}</span>
                      {isActive && <span className="text-xs opacity-80">Current</span>}
                    </motion.a>
                  );
                })}
              </div>
              <div className="border-t bg-muted/30 px-4 py-3">
                <a href="http://localhost:3000/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Home className="h-4 w-4" />
                  Back to DevTools Home
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
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
  icon,
  disabled = false
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
      className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none ${variants[variant]}`}
    >
      {icon}
      {children}
    </motion.button>
  );
}

export default function JWTDecoder() {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);

  const decodeJWT = useCallback((jwt: string): DecodedJWT | null => {
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format: Expected 3 parts');
      }

      const decodeBase64 = (str: string) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(base64);
        return JSON.parse(json);
      };

      const header = decodeBase64(parts[0]);
      const payload = decodeBase64(parts[1]);

      return { header, payload, signature: parts[2] };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JWT token');
      return null;
    }
  }, []);

  const decoded = token ? decodeJWT(token) : null;
  const payload = decoded?.payload as JWTPayload | undefined;

  const isExpired = (exp?: number): boolean => {
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  };

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(section);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const handleClear = () => {
    setToken('');
    setError('');
  };

  const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.VG-3QZb3K2gY3Z0X2Z0X2Z0X2Z0X2Z0X2Z0X2Z0';

  return (
    <div className="flex flex-col h-full bg-background">
      <ToolSwitcher />

      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="border-b bg-card shrink-0">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-white">
                <KeyRound className="h-5 w-5" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold">JWT Decoder</h1>
                <p className="hidden text-xs text-muted-foreground sm:block">Decode and inspect JWT tokens</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground md:block">Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">⌘E</kbd> to switch apps</span>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setToken(sampleJWT)} className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
                Load Sample
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto w-full max-w-[1920px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Left - Token Input */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden" style={{ minHeight: '400px' }}>
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">JWT Token</span>
                  {token && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${decoded ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {decoded ? 'Valid' : 'Invalid'}
                    </motion.span>
                  )}
                </div>
                {token && (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleClear} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted">
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
              <div className="flex-1 relative min-h-0">
                <textarea
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setError(''); }}
                  placeholder="Paste your JWT token here..."
                  className="absolute inset-0 w-full h-full resize-none border-0 bg-transparent p-4 font-mono text-sm focus:outline-none focus:ring-0"
                  spellCheck={false}
                />
              </div>
            </motion.div>

            {/* Right - Decoded Output */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="flex flex-col gap-4">
              {decoded ? (
                <>
                  {/* Header */}
                  <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-semibold">Header</span>
                      </div>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2), 'header')} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted">
                        {copied === 'header' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </motion.button>
                    </div>
                    <div className="p-4">
                      <pre className="rounded-xl bg-muted/50 p-4 font-mono text-sm overflow-x-auto">{JSON.stringify(decoded.header, null, 2)}</pre>
                    </div>
                  </div>

                  {/* Payload */}
                  <div className="flex-1 rounded-2xl border bg-card shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold">Payload</span>
                      </div>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2), 'payload')} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted">
                        {copied === 'payload' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </motion.button>
                    </div>
                    <div className="p-4 overflow-auto">
                      <pre className="rounded-xl bg-muted/50 p-4 font-mono text-sm overflow-x-auto">{JSON.stringify(decoded.payload, null, 2)}</pre>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border bg-card shadow-sm">
                  <span className="text-sm text-muted-foreground">Enter a valid JWT to see decoded content</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Statistics */}
          {decoded && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="mb-4 flex items-center gap-2">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Token Statistics</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard label="Algorithm" value={(decoded.header.alg as string) || 'Unknown'} icon={Shield} delay={0} />
                  <StatCard label="Type" value={(decoded.header.typ as string) || 'JWT'} icon={FileJson} delay={0.05} />
                  <StatCard label="Issued At" value={payload?.iat ? new Date(payload.iat * 1000).toLocaleDateString() : 'N/A'} icon={Calendar} delay={0.1} />
                  <StatCard label="Status" value={isExpired(payload?.exp) ? 'Expired' : 'Valid'} icon={isExpired(payload?.exp) ? Unlock : Lock} delay={0.15} />
                  <StatCard label="Subject" value={payload?.sub || 'N/A'} icon={User} delay={0.2} />
                  <StatCard label="Issuer" value={payload?.iss || 'N/A'} icon={Fingerprint} delay={0.25} />
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Empty State */}
          {!token && !error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center mt-8">
              <div className="rounded-full bg-primary/10 p-4">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Ready to decode</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">Paste a JWT token to decode its header, payload, and signature.</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
