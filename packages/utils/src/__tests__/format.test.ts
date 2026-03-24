import { describe, it, expect } from 'vitest';
import { formatBytes } from '../format';

describe('formatBytes', () => {
  it('should format 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should format bytes less than 1KB', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('should format bytes to KB', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('should format bytes to MB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
  });

  it('should format with decimal precision', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('should handle large file sizes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });
});
