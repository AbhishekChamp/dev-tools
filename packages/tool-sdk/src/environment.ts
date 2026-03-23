import { useState, useEffect, useCallback } from 'react';

/**
 * Environment detection utilities for micro-frontend architecture
 */

export type Environment = 'standalone' | 'embedded';

export interface EmbeddedContext {
  isEmbedded: boolean;
  parentOrigin: string | null;
  toolId: string | null;
}

// Storage key for embedded context
const EMBEDDED_CONTEXT_KEY = '__dev_tools_embedded_context__';

/**
 * Detect if the tool is running inside the shell (embedded mode)
 * or as a standalone application
 */
export function isEmbedded(): boolean {
  // Check for embed query param
  const params = new URLSearchParams(window.location.search);
  if (params.get('embed') === 'true') return true;
  
  // Check if running in iframe
  try {
    if (window.self !== window.top) return true;
  } catch {
    // If we can't access window.top due to cross-origin, we're in an iframe
    return true;
  }
  
  // Check for parent window (different from self)
  if (window.parent !== window) return true;
  
  // Check for data attribute on body (set by shell)
  if (document.body.dataset.embedded === 'true') return true;
  
  // Check for stored embedded context (set by shell when loading tool)
  const stored = sessionStorage.getItem(EMBEDDED_CONTEXT_KEY);
  if (stored) {
    try {
      const context = JSON.parse(stored);
      return context.isEmbedded === true;
    } catch {
      // Ignore parse errors
    }
  }
  
  return false;
}

/**
 * Get the current environment type
 */
export function getEnvironment(): Environment {
  return isEmbedded() ? 'embedded' : 'standalone';
}

/**
 * Get the embedded context if available
 */
export function getEmbeddedContext(): EmbeddedContext {
  const stored = sessionStorage.getItem(EMBEDDED_CONTEXT_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to default
    }
  }
  
  return {
    isEmbedded: isEmbedded(),
    parentOrigin: typeof window !== 'undefined' ? window.location.origin : null,
    toolId: null,
  };
}

/**
 * Set embedded context (called by shell when loading a tool)
 */
export function setEmbeddedContext(context: Partial<EmbeddedContext>): void {
  if (typeof window === 'undefined') return;
  
  const current = getEmbeddedContext();
  const updated = { ...current, ...context, isEmbedded: true };
  sessionStorage.setItem(EMBEDDED_CONTEXT_KEY, JSON.stringify(updated));
}

/**
 * Clear embedded context
 */
export function clearEmbeddedContext(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(EMBEDDED_CONTEXT_KEY);
}

/**
 * Hook to reactively track environment changes
 */
export function useEnvironment(): Environment {
  const [environment, setEnvironment] = useState<Environment>(getEnvironment);
  
  useEffect(() => {
    // Listen for embedded context changes
    const handleStorage = () => {
      setEnvironment(getEnvironment());
    };
    
    window.addEventListener('storage', handleStorage);
    
    // Also check periodically for query param changes
    const interval = setInterval(() => {
      const current = getEnvironment();
      if (current !== environment) {
        setEnvironment(current);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [environment]);
  
  return environment;
}

/**
 * Hook to get and manage embedded context
 */
export function useEmbeddedContext(): EmbeddedContext & {
  setContext: (ctx: Partial<EmbeddedContext>) => void;
  clearContext: () => void;
} {
  const [context, setContextState] = useState<EmbeddedContext>(getEmbeddedContext);
  
  const setContext = useCallback((ctx: Partial<EmbeddedContext>) => {
    setEmbeddedContext(ctx);
    setContextState(getEmbeddedContext());
  }, []);
  
  const clearContext = useCallback(() => {
    clearEmbeddedContext();
    setContextState({
      isEmbedded: false,
      parentOrigin: null,
      toolId: null,
    });
  }, []);
  
  useEffect(() => {
    // Update context on mount
    setContextState(getEmbeddedContext());
  }, []);
  
  return { ...context, setContext, clearContext };
}

/**
 * Hook for tools to detect if they're running in embedded mode
 * Returns useful properties for conditional rendering
 */
export function useEmbedded(): {
  isEmbedded: boolean;
  isStandalone: boolean;
  context: EmbeddedContext;
} {
  const environment = useEnvironment();
  const context = useEmbeddedContext();
  
  return {
    isEmbedded: environment === 'embedded',
    isStandalone: environment === 'standalone',
    context: {
      isEmbedded: environment === 'embedded',
      parentOrigin: context.parentOrigin,
      toolId: context.toolId,
    },
  };
}

/**
 * Post message to parent window (shell)
 */
export function postToParent(message: unknown, targetOrigin = '*'): void {
  if (typeof window === 'undefined' || window.parent === window) return;
  
  try {
    window.parent.postMessage(message, targetOrigin);
  } catch {
    // Ignore postMessage errors
  }
}

/**
 * Hook to listen for messages from parent/shell
 */
export function useParentMessage<T = unknown>(
  handler: (message: T) => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      handler(event.data as T);
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, deps);
}
