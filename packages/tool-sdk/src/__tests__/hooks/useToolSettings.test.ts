import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToolSettings } from '../../hooks';

describe('useToolSettings', () => {
  beforeEach(() => {
    localStorage.clear = vi.fn();
    localStorage.getItem = vi.fn().mockReturnValue(null);
    localStorage.setItem = vi.fn();
    localStorage.removeItem = vi.fn();
  });

  it('should initialize with default values', () => {
    const defaults = { theme: 'light', fontSize: 14 };
    const { result } = renderHook(() => useToolSettings('test-tool', defaults));
    
    expect(result.current[0]).toEqual(defaults);
  });

  it('should load settings from localStorage', () => {
    const stored = { theme: 'dark', fontSize: 16 };
    localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(stored));
    
    const defaults = { theme: 'light', fontSize: 14 };
    const { result } = renderHook(() => useToolSettings('test-tool', defaults));
    
    expect(result.current[0]).toEqual(stored);
  });

  it('should merge defaults with stored settings', () => {
    const stored = { theme: 'dark' };
    localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(stored));
    
    const defaults = { theme: 'light', fontSize: 14 };
    const { result } = renderHook(() => useToolSettings('test-tool', defaults));
    
    expect(result.current[0]).toEqual({ theme: 'dark', fontSize: 14 });
  });

  it('should update settings and persist to localStorage', () => {
    const defaults = { theme: 'light', fontSize: 14 };
    const { result } = renderHook(() => useToolSettings('test-tool', defaults));
    
    act(() => {
      result.current[1]({ theme: 'dark' });
    });
    
    expect(result.current[0].theme).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'tool-settings:test-tool',
      expect.stringContaining('dark')
    );
  });

  it('should reset settings to defaults', () => {
    const defaults = { theme: 'light', fontSize: 14 };
    const { result } = renderHook(() => useToolSettings('test-tool', defaults));
    
    act(() => {
      result.current[1]({ theme: 'dark' });
    });
    
    act(() => {
      result.current[2]();
    });
    
    expect(result.current[0]).toEqual(defaults);
    expect(localStorage.removeItem).toHaveBeenCalledWith('tool-settings:test-tool');
  });
});
