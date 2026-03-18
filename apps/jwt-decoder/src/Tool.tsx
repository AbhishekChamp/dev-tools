import React, { useState, useCallback } from 'react';
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
} from 'lucide-react';
import {
  ToolLayout,
  ActionButton,
  SectionCard,
  StatCard,
} from '@dev-tools/tool-sdk';

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

      return {
        header,
        payload,
        signature: parts[2],
      };
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
    } catch {
      // Ignore copy errors
    }
  };

  const handleClear = () => {
    setToken('');
    setError('');
  };

  const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.VG-3QZb3K2gY3Z0X2Z0X2Z0X2Z0X2Z0X2Z0X2Z0';

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode and inspect JWT tokens with payload analysis and validation"
      icon={<KeyRound className="h-8 w-8" />}
      color="text-green-500"
      bgColor="bg-green-500/10"
      actions={
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setToken(sampleJWT)}
          className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          Load Sample
        </motion.button>
      }
    >
      <div className="space-y-6">
        {/* Token Input */}
        <SectionCard title="JWT Token" icon={<Lock className="h-5 w-5" />} delay={0}>
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError('');
                }}
                placeholder="Paste your JWT token here..."
                rows={4}
                className="w-full rounded-xl border bg-background px-4 py-3 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
                spellCheck={false}
              />
              {token && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SectionCard>

        {/* Decoded Token */}
        {decoded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Token Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard 
                label="Algorithm" 
                value={(decoded.header.alg as string) || 'Unknown'} 
                icon={<Shield className="h-4 w-4" />}
                delay={0}
              />
              <StatCard 
                label="Type" 
                value={(decoded.header.typ as string) || 'JWT'} 
                icon={<FileJson className="h-4 w-4" />}
                delay={0.1}
              />
              <StatCard 
                label="Issued At" 
                value={payload?.iat ? new Date(payload.iat * 1000).toLocaleDateString() : 'N/A'} 
                icon={<Calendar className="h-4 w-4" />}
                delay={0.2}
              />
              <StatCard 
                label="Status" 
                value={isExpired(payload?.exp) ? 'Expired' : 'Valid'} 
                icon={isExpired(payload?.exp) ? <Unlock className="h-4 w-4 text-red-500" /> : <Lock className="h-4 w-4 text-green-500" />}
                delay={0.3}
              />
            </div>

            {/* Expiration Warning */}
            {payload?.exp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl border p-4 ${
                  isExpired(payload.exp)
                    ? 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                    : 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      {isExpired(payload.exp) ? 'Token Expired' : 'Token Valid'}
                    </p>
                    <p className="text-sm opacity-80">
                      Expires: {formatDate(payload.exp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Header Section */}
            <SectionCard 
              title="Header" 
              icon={<FileJson className="h-5 w-5 text-blue-500" />}
              delay={0.1}
            >
              <div className="relative">
                <pre className="rounded-xl bg-muted/50 p-4 font-mono text-sm overflow-x-auto">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2), 'header')}
                  className="absolute right-3 top-3 rounded-lg bg-card p-2 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                >
                  {copied === 'header' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
            </SectionCard>

            {/* Payload Section */}
            <SectionCard 
              title="Payload" 
              icon={<User className="h-5 w-5 text-green-500" />}
              delay={0.2}
            >
              <div className="relative">
                <pre className="rounded-xl bg-muted/50 p-4 font-mono text-sm overflow-x-auto">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2), 'payload')}
                  className="absolute right-3 top-3 rounded-lg bg-card p-2 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                >
                  {copied === 'payload' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </motion.button>
              </div>

              {/* Payload Claims */}
              {payload && Object.keys(payload).length > 0 && (
                <div className="mt-4 rounded-xl border bg-muted/30 p-4">
                  <h4 className="mb-3 text-sm font-medium">Token Claims</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(payload).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between rounded-lg bg-card p-2">
                        <span className="text-sm text-muted-foreground">{key}</span>
                        <span className="font-mono text-sm">
                          {typeof value === 'string' || typeof value === 'number'
                            ? String(value).slice(0, 30)
                            : JSON.stringify(value).slice(0, 30)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Signature Section */}
            <SectionCard 
              title="Signature" 
              icon={<Fingerprint className="h-5 w-5 text-purple-500" />}
              delay={0.3}
            >
              <div className="relative">
                <div className="rounded-xl bg-muted/50 p-4 font-mono text-sm break-all text-muted-foreground">
                  {decoded.signature}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(decoded.signature, 'signature')}
                  className="absolute right-3 top-3 rounded-lg bg-card p-2 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                >
                  {copied === 'signature' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                The signature is used to verify the token&apos;s integrity. It requires the secret key to validate.
              </p>
            </SectionCard>
          </motion.div>
        )}

        {/* Empty State */}
        {!token && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center"
          >
            <div className="rounded-full bg-primary/10 p-4">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Ready to decode</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Paste a JWT token to decode its header, payload, and signature.
              The token is validated locally in your browser.
            </p>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
