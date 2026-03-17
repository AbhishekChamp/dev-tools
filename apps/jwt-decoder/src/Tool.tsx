import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ToolContainer,
  Button,
  Textarea,
  Badge,
  CopyButton,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@dev-tools/ui';
import { fadeInUp, staggerContainer, staggerItem } from '@dev-tools/ui/animations';
import {
  Key,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  FileJson,
  Fingerprint,
  Trash2,
  RefreshCw,
} from 'lucide-react';

// JWT Part Types
interface JWTHeader {
  alg?: string;
  typ?: string;
  [key: string]: unknown;
}

interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

interface DecodedJWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  error?: string;
}

// Base64Url decoding function (JWT specific)
const base64UrlDecode = (base64Url: string): string => {
  // Replace Base64Url characters with Base64 characters
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if necessary
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }
  
  try {
    return atob(base64);
  } catch {
    throw new Error('Invalid Base64Url encoding');
  }
};

// Decode JWT token
const decodeJWT = (token: string): DecodedJWT => {
  const result: DecodedJWT = {
    header: {},
    payload: {},
    signature: '',
    isValid: false,
    isExpired: false,
  };

  if (!token.trim()) {
    result.error = 'Please enter a JWT token';
    return result;
  }

  const parts = token.split('.');
  
  if (parts.length !== 3) {
    result.error = 'Invalid JWT format. Expected 3 parts separated by dots.';
    return result;
  }

  try {
    // Decode header
    const headerJson = base64UrlDecode(parts[0]);
    result.header = JSON.parse(headerJson);
  } catch {
    result.error = 'Invalid JWT header';
    return result;
  }

  try {
    // Decode payload
    const payloadJson = base64UrlDecode(parts[1]);
    result.payload = JSON.parse(payloadJson);
  } catch {
    result.error = 'Invalid JWT payload';
    return result;
  }

  // Store signature (not decoded, just stored)
  result.signature = parts[2];
  result.isValid = true;

  // Check expiration
  if (result.payload.exp) {
    const expTimestamp = result.payload.exp * 1000; // Convert to milliseconds
    result.expiresAt = new Date(expTimestamp);
    result.isExpired = Date.now() > expTimestamp;
  }

  return result;
};

// Format date nicely
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(date);
};

// Format JSON with syntax highlighting classes
const formatJSON = (obj: unknown): string => {
  return JSON.stringify(obj, null, 2);
};

// Time remaining until expiration
const getTimeRemaining = (expiresAt: Date): string => {
  const now = Date.now();
  const exp = expiresAt.getTime();
  const diff = exp - now;
  
  if (diff <= 0) {
    return 'Expired';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
};

// Component for displaying a decoded section
interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  data: unknown;
  rawValue?: string;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  };
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, data, rawValue, badge }) => {
  const jsonString = typeof data === 'string' ? data : formatJSON(data);
  
  return (
    <motion.div variants={staggerItem}>
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-primary">{icon}</div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
              <CopyButton text={rawValue || jsonString} size="sm" variant="outline" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <pre className="bg-muted/50 p-4 overflow-x-auto text-sm font-mono leading-relaxed">
            <code className="text-foreground">{jsonString}</code>
          </pre>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Tool Component
function Tool(): JSX.Element {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [hasDecoded, setHasDecoded] = useState(false);

  const handleDecode = useCallback(() => {
    const result = decodeJWT(input);
    setDecoded(result);
    setHasDecoded(true);
  }, [input]);

  const handleClear = useCallback(() => {
    setInput('');
    setDecoded(null);
    setHasDecoded(false);
  }, []);

  const handleSampleJWT = useCallback(() => {
    // Create a sample JWT that expires in 1 hour
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: '1234567890',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    
    const encodedHeader = btoa(JSON.stringify(header))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const signature = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    
    const sampleToken = `${encodedHeader}.${encodedPayload}.${signature}`;
    setInput(sampleToken);
    setHasDecoded(false);
    setDecoded(null);
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="w-full max-w-6xl mx-auto"
    >
      <ToolContainer
        title="JWT Decoder"
        description="Decode and validate JSON Web Tokens to inspect their header, payload, and signature"
        headerAction={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSampleJWT}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sample
            </Button>
            {input && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              JWT Token
            </label>
            <Textarea
              placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (hasDecoded) setHasDecoded(false);
              }}
              className="min-h-[120px] font-mono text-sm resize-y"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Enter a JWT token with 3 parts separated by dots (header.payload.signature)
              </p>
              <Button
                onClick={handleDecode}
                disabled={!input.trim()}
                className="min-w-[100px]"
              >
                Decode
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {hasDecoded && decoded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Validation Status */}
                {decoded.error ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border border-destructive/50 bg-destructive/10 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">Invalid Token</p>
                        <p className="text-sm text-destructive/80">{decoded.error}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Status Bar */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap items-center gap-3"
                    >
                      <Badge
                        variant={decoded.isValid ? 'default' : 'destructive'}
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {decoded.isValid ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            Valid Format
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            Invalid
                          </>
                        )}
                      </Badge>
                      
                      {decoded.payload.exp !== undefined && (
                        <Badge
                          variant={decoded.isExpired ? 'destructive' : 'secondary'}
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {decoded.isExpired ? 'Expired' : 'Active'}
                        </Badge>
                      )}
                      
                      {decoded.header.alg && (
                        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                          <Shield className="h-3.5 w-3.5" />
                          {decoded.header.alg}
                        </Badge>
                      )}
                    </motion.div>

                    {/* Expiration Info */}
                    {decoded.expiresAt && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`rounded-lg border p-4 ${
                          decoded.isExpired
                            ? 'border-destructive/50 bg-destructive/10'
                            : 'border-primary/50 bg-primary/5'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Clock
                              className={`h-4 w-4 ${
                                decoded.isExpired ? 'text-destructive' : 'text-primary'
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {decoded.isExpired ? 'Expired on:' : 'Expires on:'}
                            </span>
                            <span className="text-sm font-mono">
                              {formatDate(decoded.expiresAt)}
                            </span>
                          </div>
                          <Badge
                            variant={decoded.isExpired ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {getTimeRemaining(decoded.expiresAt)}
                          </Badge>
                        </div>
                      </motion.div>
                    )}

                    {/* Decoded Sections */}
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="grid gap-4 lg:grid-cols-2"
                    >
                      {/* Header Section */}
                      <div className="lg:col-span-2">
                        <SectionCard
                          title="Header"
                          icon={<FileJson className="h-5 w-5" />}
                          data={decoded.header}
                          badge={decoded.header.alg ? {
                            text: decoded.header.alg,
                            variant: 'outline'
                          } : undefined}
                        />
                      </div>

                      {/* Payload Section */}
                      <div className="lg:col-span-2">
                        <SectionCard
                          title="Payload"
                          icon={<Shield className="h-5 w-5" />}
                          data={decoded.payload}
                        />
                      </div>

                      {/* Signature Section */}
                      <motion.div variants={staggerItem} className="lg:col-span-2">
                        <Card className="overflow-hidden">
                          <CardHeader className="border-b bg-muted/30 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Fingerprint className="h-5 w-5 text-primary" />
                                <CardTitle className="text-base font-semibold">Signature</CardTitle>
                              </div>
                              <CopyButton text={decoded.signature} size="sm" variant="outline" />
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <code className="text-sm font-mono text-muted-foreground break-all">
                              {decoded.signature}
                            </code>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>

                    {/* Claims Summary */}
                    {Object.keys(decoded.payload).length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-lg border bg-muted/30 p-4"
                      >
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Registered Claims
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {decoded.payload.iss && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Issuer (iss):</span>
                              <p className="font-mono text-foreground truncate">{String(decoded.payload.iss)}</p>
                            </div>
                          )}
                          {decoded.payload.sub && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Subject (sub):</span>
                              <p className="font-mono text-foreground truncate">{String(decoded.payload.sub)}</p>
                            </div>
                          )}
                          {decoded.payload.aud && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Audience (aud):</span>
                              <p className="font-mono text-foreground truncate">
                                {Array.isArray(decoded.payload.aud) 
                                  ? decoded.payload.aud.join(', ') 
                                  : String(decoded.payload.aud)}
                              </p>
                            </div>
                          )}
                          {decoded.payload.iat && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Issued At (iat):</span>
                              <p className="font-mono text-foreground">
                                {formatDate(new Date(decoded.payload.iat * 1000))}
                              </p>
                            </div>
                          )}
                          {decoded.payload.nbf && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Not Before (nbf):</span>
                              <p className="font-mono text-foreground">
                                {formatDate(new Date(decoded.payload.nbf * 1000))}
                              </p>
                            </div>
                          )}
                          {decoded.payload.jti && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">JWT ID (jti):</span>
                              <p className="font-mono text-foreground truncate">{String(decoded.payload.jti)}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ToolContainer>
    </motion.div>
  );
}

export default Tool;
