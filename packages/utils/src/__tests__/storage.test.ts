import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localStorageWrapper, sessionStorageWrapper } from '../storage';

describe('localStorageWrapper', () => {
  beforeEach(() => {
    localStorage.clear = vi.fn();
    localStorage.getItem = vi.fn();
    localStorage.setItem = vi.fn();
    localStorage.removeItem = vi.fn();
  });

  it('should get item from localStorage', () => {
    localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify({ test: 'value' }));
    
    const result = localStorageWrapper.getItem('key');
    
    expect(localStorage.getItem).toHaveBeenCalledWith('key');
    expect(result).toEqual({ test: 'value' });
  });

  it('should return null when item not found', () => {
    localStorage.getItem = vi.fn().mockReturnValue(null);
    
    const result = localStorageWrapper.getItem('key');
    
    expect(result).toBeNull();
  });

  it('should set item in localStorage', () => {
    localStorageWrapper.setItem('key', { test: 'value' });
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'key',
      JSON.stringify({ test: 'value' })
    );
  });

  it('should remove item from localStorage', () => {
    localStorageWrapper.removeItem('key');
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('key');
  });

  it('should handle JSON parse errors gracefully', () => {
    localStorage.getItem = vi.fn().mockReturnValue('invalid json');
    
    const result = localStorageWrapper.getItem('key');
    
    expect(result).toBeNull();
  });
});

describe('sessionStorageWrapper', () => {
  beforeEach(() => {
    sessionStorage.clear = vi.fn();
    sessionStorage.getItem = vi.fn();
    sessionStorage.setItem = vi.fn();
    sessionStorage.removeItem = vi.fn();
  });

  it('should get item from sessionStorage', () => {
    sessionStorage.getItem = vi.fn().mockReturnValue(JSON.stringify({ test: 'value' }));
    
    const result = sessionStorageWrapper.getItem('key');
    
    expect(sessionStorage.getItem).toHaveBeenCalledWith('key');
    expect(result).toEqual({ test: 'value' });
  });

  it('should set item in sessionStorage', () => {
    sessionStorageWrapper.setItem('key', { test: 'value' });
    
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'key',
      JSON.stringify({ test: 'value' })
    );
  });

  it('should remove item from sessionStorage', () => {
    sessionStorageWrapper.removeItem('key');
    
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('key');
  });
});
