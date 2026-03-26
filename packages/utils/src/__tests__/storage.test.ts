import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localStorageWrapper, sessionStorageWrapper } from '../storage';

describe('localStorageWrapper', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should get item from localStorage', () => {
    const spy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockReturnValue(JSON.stringify({ test: 'value' }));

    const result = localStorageWrapper.getItem('key');

    expect(spy).toHaveBeenCalledWith('key');
    expect(result).toEqual({ test: 'value' });
    spy.mockRestore();
  });

  it('should return null when item not found', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    const result = localStorageWrapper.getItem('key');

    expect(result).toBeNull();
  });

  it('should set item in localStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});

    localStorageWrapper.setItem('key', { test: 'value' });

    expect(spy).toHaveBeenCalledWith('key', JSON.stringify({ test: 'value' }));
    spy.mockRestore();
  });

  it('should remove item from localStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});

    localStorageWrapper.removeItem('key');

    expect(spy).toHaveBeenCalledWith('key');
    spy.mockRestore();
  });

  it('should handle JSON parse errors gracefully', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid json');

    const result = localStorageWrapper.getItem('key');

    expect(result).toBeNull();
  });
});

describe('sessionStorageWrapper', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should get item from sessionStorage', () => {
    const spy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockReturnValue(JSON.stringify({ test: 'value' }));

    const result = sessionStorageWrapper.getItem('key');

    expect(spy).toHaveBeenCalledWith('key');
    expect(result).toEqual({ test: 'value' });
    spy.mockRestore();
  });

  it('should set item in sessionStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});

    sessionStorageWrapper.setItem('key', { test: 'value' });

    expect(spy).toHaveBeenCalledWith('key', JSON.stringify({ test: 'value' }));
    spy.mockRestore();
  });

  it('should remove item from sessionStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});

    sessionStorageWrapper.removeItem('key');

    expect(spy).toHaveBeenCalledWith('key');
    spy.mockRestore();
  });
});
