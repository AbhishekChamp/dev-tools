import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToolState } from '../../hooks';

describe('useToolState', () => {
  beforeEach(() => {
    sessionStorage.clear = vi.fn();
    sessionStorage.getItem = vi.fn().mockReturnValue(null);
    sessionStorage.setItem = vi.fn();
  });

  it('should initialize with initial value when no stored value', () => {
    const { result } = renderHook(() => useToolState('test-key', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should load value from sessionStorage if available', () => {
    sessionStorage.getItem = vi.fn().mockReturnValue(JSON.stringify('stored-value'));

    const { result } = renderHook(() => useToolState('test-key', 'initial'));

    expect(result.current[0]).toBe('stored-value');
  });

  it('should update value and persist to sessionStorage', () => {
    const { result } = renderHook(() => useToolState('test-key', 'initial'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'tool:test-key',
      JSON.stringify('new-value')
    );
  });

  it('should support function updates', () => {
    const { result } = renderHook(() => useToolState('test-key', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('should handle complex objects', () => {
    const initialValue = { count: 0, name: 'test' };
    const { result } = renderHook(() => useToolState('complex-key', initialValue));

    act(() => {
      result.current[1]({ count: 1, name: 'updated' });
    });

    expect(result.current[0]).toEqual({ count: 1, name: 'updated' });
  });
});
