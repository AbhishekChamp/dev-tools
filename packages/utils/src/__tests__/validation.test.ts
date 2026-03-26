import { describe, it, expect } from 'vitest';
import { isValidJSON } from '../validation';

describe('isValidJSON', () => {
  it('should return true for valid JSON object', () => {
    expect(isValidJSON('{"key": "value"}')).toBe(true);
  });

  it('should return true for valid JSON array', () => {
    expect(isValidJSON('[1, 2, 3]')).toBe(true);
  });

  it('should return true for valid JSON string', () => {
    expect(isValidJSON('"hello"')).toBe(true);
  });

  it('should return true for valid JSON number', () => {
    expect(isValidJSON('42')).toBe(true);
  });

  it('should return true for valid JSON boolean', () => {
    expect(isValidJSON('true')).toBe(true);
  });

  it('should return true for valid JSON null', () => {
    expect(isValidJSON('null')).toBe(true);
  });

  it('should return false for invalid JSON', () => {
    expect(isValidJSON('{"key": value}')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidJSON('')).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidJSON('undefined')).toBe(false);
  });

  it('should return true for nested JSON objects', () => {
    const nested = JSON.stringify({
      level1: {
        level2: {
          level3: 'value',
        },
      },
    });
    expect(isValidJSON(nested)).toBe(true);
  });
});
