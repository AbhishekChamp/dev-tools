import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Copy,
  Check,
  AlertCircle,
  Trash2,
  Shield,

  Fingerprint,
  FileJson,
  Lock,
  Unlock,
  Calendar,
  Hash,
  User,
} from 'lucide-react';
import { useEmbedded } from '@dev-tools/tool-sdk';

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

export default function JWTDecoder() {
  const { isEmbedded } = useEmbedded();
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

  // Standalone Header
  const StandaloneHeader = () => (
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
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {!isEmbedded && <StandaloneHeader />}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto w-full max-w-[1920px]">
          {/* Load Sample Button for Embedded */}
          {isEmbedded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex justify-end">
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                onClick={() => setToken(sampleJWT)} 
                className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                Load Sample JWT
              </motion.button>
            </motion.div>
          )}

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
