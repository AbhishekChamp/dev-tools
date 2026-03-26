import { describe, it, expect } from 'vitest';
import {
  getToolByRoute,
  getToolById,
  filterTools,
  getIconComponent,
  builtInTools,
} from '@/utils/tools';

describe('tools utilities', () => {
  describe('getToolByRoute', () => {
    it('should find tool by exact route match', () => {
      const tool = getToolByRoute('/json');
      expect(tool).toBeDefined();
      expect(tool?.id).toBe('json-formatter');
    });

    it('should return undefined for non-existent route', () => {
      const tool = getToolByRoute('/non-existent');
      expect(tool).toBeUndefined();
    });

    it('should find all tools by their routes', () => {
      expect(getToolByRoute('/json')?.id).toBe('json-formatter');
      expect(getToolByRoute('/regex')?.id).toBe('regex-tester');
      expect(getToolByRoute('/jwt')?.id).toBe('jwt-decoder');
      expect(getToolByRoute('/base64')?.id).toBe('base64-tool');
      expect(getToolByRoute('/password')?.id).toBe('password-generator');
    });
  });

  describe('getToolById', () => {
    it('should find tool by id', () => {
      const tool = getToolById('json-formatter');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('JSON Formatter');
    });

    it('should return undefined for non-existent id', () => {
      const tool = getToolById('non-existent');
      expect(tool).toBeUndefined();
    });
  });

  describe('filterTools', () => {
    it('should return all tools when no query or category', () => {
      const results = filterTools(builtInTools, '', 'all');
      expect(results).toHaveLength(builtInTools.length);
    });

    it('should filter by search query (name)', () => {
      const results = filterTools(builtInTools, 'json', 'all');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toContain('json');
    });

    it('should filter by search query (description)', () => {
      const results = filterTools(builtInTools, 'format', 'all');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by search query (tags)', () => {
      const results = filterTools(builtInTools, 'validate', 'all');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by category', () => {
      const results = filterTools(builtInTools, '', 'encoder');
      expect(results.every((t) => t.category === 'encoder')).toBe(true);
    });

    it('should combine query and category filters', () => {
      const results = filterTools(builtInTools, 'decode', 'encoder');
      expect(results.every((t) => t.category === 'encoder')).toBe(true);
    });

    it('should be case insensitive', () => {
      const lowerCase = filterTools(builtInTools, 'json', 'all');
      const upperCase = filterTools(builtInTools, 'JSON', 'all');
      expect(lowerCase).toEqual(upperCase);
    });
  });

  describe('getIconComponent', () => {
    it('should return icon component for valid icon name', () => {
      const Icon = getIconComponent('FileJson');
      expect(Icon).toBeDefined();
      // Component can be function or object (forwardRef)
      expect(typeof Icon === 'function' || typeof Icon === 'object').toBe(true);
    });

    it('should return default icon for invalid icon name', () => {
      const Icon = getIconComponent('InvalidIcon');
      expect(Icon).toBeDefined();
    });
  });
});
