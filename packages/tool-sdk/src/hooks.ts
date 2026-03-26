import { useState, useCallback, useEffect } from 'react';

// Re-export for convenience
export { useState, useCallback, useEffect };

// Re-export environment hooks
export { useEnvironment, useEmbeddedContext, useEmbedded, useParentMessage } from './environment';

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

export function useAsyncTool<T>(asyncFunction: () => Promise<T>, immediate = false) {
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
  const trackEvent = useCallback((_event: string, _data?: Record<string, unknown>) => {
    // Placeholder for analytics tracking
    // console.log('[Analytics]', event, data);
  }, []);

  return { trackEvent };
}

// Hook for recent tools tracking
export function useRecentTools(maxItems = 5): {
  recentTools: string[];
  addRecentTool: (toolId: string) => void;
  clearRecentTools: () => void;
} {
  const [recentTools, setRecentTools] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('dev-tools-recent');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addRecentTool = useCallback(
    (toolId: string) => {
      setRecentTools((prev) => {
        const filtered = prev.filter((id) => id !== toolId);
        const updated = [toolId, ...filtered].slice(0, maxItems);

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('dev-tools-recent', JSON.stringify(updated));
          } catch {
            // Ignore storage errors
          }
        }

        return updated;
      });
    },
    [maxItems]
  );

  const clearRecentTools = useCallback(() => {
    setRecentTools([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('dev-tools-recent');
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  return { recentTools, addRecentTool, clearRecentTools };
}

// Hook for tool settings persistence
export function useToolSettings<T extends Record<string, unknown>>(
  toolId: string,
  defaults: T
): [T, (settings: Partial<T>) => void, () => void] {
  const storageKey = `tool-settings:${toolId}`;

  const [settings, setSettingsState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaults;
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  const setSettings = useCallback(
    (newSettings: Partial<T>) => {
      setSettingsState((prev) => {
        const updated = { ...prev, ...newSettings };

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch {
            // Ignore storage errors
          }
        }

        return updated;
      });
    },
    [storageKey]
  );

  const resetSettings = useCallback(() => {
    setSettingsState(defaults);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Ignore storage errors
      }
    }
  }, [defaults, storageKey]);

  return [settings, setSettings, resetSettings];
}
