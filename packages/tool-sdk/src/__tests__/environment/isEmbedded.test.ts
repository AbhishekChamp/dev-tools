import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  isEmbedded, 
  getEnvironment, 
  getEmbeddedContext,
  setEmbeddedContext,
  clearEmbeddedContext
} from '../../environment';

describe('isEmbedded', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear = vi.fn();
    localStorage.clear = vi.fn();
  });

  describe('URL param detection', () => {
    it('should return true when embed=true in URL', () => {
      const originalLocation = window.location;
      // @ts-expect-error - deleting for test mocking
      delete window.location;
      window.location = { search: '?embed=true' } as Location;
      
      expect(isEmbedded()).toBe(true);
      
      window.location = originalLocation;
    });

    it('should return false when embed is not true', () => {
      const originalLocation = window.location;
      // @ts-expect-error - deleting for test mocking
      delete window.location;
      window.location = { search: '?embed=false' } as Location;
      
      expect(isEmbedded()).toBe(false);
      
      window.location = originalLocation;
    });
  });

  describe('session storage detection', () => {
    it('should return true when embedded context in sessionStorage', () => {
      const mockContext = JSON.stringify({ isEmbedded: true });
      sessionStorage.getItem = vi.fn().mockReturnValue(mockContext);
      
      expect(isEmbedded()).toBe(true);
    });

    it('should return false when no context in sessionStorage', () => {
      sessionStorage.getItem = vi.fn().mockReturnValue(null);
      
      expect(isEmbedded()).toBe(false);
    });
  });
});

describe('getEnvironment', () => {
  it('should return embedded when isEmbedded is true', () => {
    const originalLocation = window.location;
    // @ts-expect-error - deleting for test mocking
    delete window.location;
    window.location = { search: '?embed=true' } as Location;
    
    expect(getEnvironment()).toBe('embedded');
    
    window.location = originalLocation;
  });

  it('should return standalone when isEmbedded is false', () => {
    const originalLocation = window.location;
    // @ts-expect-error - deleting for test mocking
    delete window.location;
    window.location = { search: '' } as Location;
    
    expect(getEnvironment()).toBe('standalone');
    
    window.location = originalLocation;
  });
});

describe('getEmbeddedContext', () => {
  it('should return parsed context from sessionStorage', () => {
    const mockContext = { isEmbedded: true, toolId: 'json-formatter', parentOrigin: 'http://localhost:3000' };
    sessionStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(mockContext));
    
    const context = getEmbeddedContext();
    
    expect(context.isEmbedded).toBe(true);
    expect(context.toolId).toBe('json-formatter');
    expect(context.parentOrigin).toBe('http://localhost:3000');
  });

  it('should return default context when nothing in storage', () => {
    sessionStorage.getItem = vi.fn().mockReturnValue(null);
    
    const context = getEmbeddedContext();
    
    expect(context.isEmbedded).toBe(false);
    expect(context.toolId).toBeNull();
  });
});

describe('setEmbeddedContext', () => {
  it('should set context in sessionStorage', () => {
    setEmbeddedContext({ toolId: 'json-formatter' });
    
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      '__dev_tools_embedded_context__',
      expect.stringContaining('json-formatter')
    );
  });

  it('should always set isEmbedded to true', () => {
    setEmbeddedContext({});
    
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      '__dev_tools_embedded_context__',
      expect.stringContaining('"isEmbedded":true')
    );
  });
});

describe('clearEmbeddedContext', () => {
  it('should remove context from sessionStorage', () => {
    clearEmbeddedContext();
    
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('__dev_tools_embedded_context__');
  });
});
