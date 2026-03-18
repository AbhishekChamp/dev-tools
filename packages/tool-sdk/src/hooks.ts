import { useState, useCallback, useEffect } from 'react';

// Re-export for convenience
export { useState, useCallback, useEffect };

export function useToolState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const stored = sessionStorage.getItem(`tool:${key}`);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(`tool:${key}`, JSON.stringify(newValue));
          } catch {
            // Ignore storage errors
          }
        }
        
        return newValue;
      });
    },
    [key]
  );

  return [state, setValue];
}

export function useAsyncTool<T>(
  asyncFunction: () => Promise<T>,
  immediate = false
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, reset: () => setData(null) };
}

export function useDebouncedTool<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Tool configuration hook
export function useToolConfig<T extends Record<string, unknown>>(config: T): T {
  const [toolConfig] = useState<T>(config);
  return toolConfig;
}

// Tool analytics hook (placeholder - can be connected to analytics service)
export function useToolAnalytics() {
  const trackEvent = useCallback((event: string, data?: Record<string, unknown>) => {
    // Placeholder for analytics tracking
    // console.log('[Analytics]', event, data);
  }, []);

  return { trackEvent };
}
