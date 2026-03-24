import { describe, it, expect, beforeEach } from 'vitest';
import { useRecentTools } from '@/stores/recent';

describe('useRecentTools store', () => {
  beforeEach(() => {
    useRecentTools.setState({ recentTools: [] });
  });

  describe('addRecentTool', () => {
    it('should add a tool to recent list', () => {
      const { addRecentTool } = useRecentTools.getState();
      addRecentTool('json-formatter');
      
      expect(useRecentTools.getState().recentTools).toContain('json-formatter');
    });

    it('should move existing tool to front of list', () => {
      const { addRecentTool } = useRecentTools.getState();
      addRecentTool('regex-tester');
      addRecentTool('jwt-decoder');
      addRecentTool('regex-tester');
      
      const recent = useRecentTools.getState().recentTools;
      expect(recent[0]).toBe('regex-tester');
      expect(recent).toHaveLength(2);
    });

    it('should limit to 5 items maximum', () => {
      const { addRecentTool } = useRecentTools.getState();
      addRecentTool('tool-1');
      addRecentTool('tool-2');
      addRecentTool('tool-3');
      addRecentTool('tool-4');
      addRecentTool('tool-5');
      addRecentTool('tool-6');
      
      expect(useRecentTools.getState().recentTools).toHaveLength(5);
      expect(useRecentTools.getState().recentTools[0]).toBe('tool-6');
    });

    it('should maintain most recent order', () => {
      const { addRecentTool } = useRecentTools.getState();
      addRecentTool('json-formatter');
      addRecentTool('regex-tester');
      addRecentTool('jwt-decoder');
      
      const recent = useRecentTools.getState().recentTools;
      expect(recent[0]).toBe('jwt-decoder');
      expect(recent[1]).toBe('regex-tester');
      expect(recent[2]).toBe('json-formatter');
    });
  });

  describe('clearRecentTools', () => {
    it('should clear all recent tools', () => {
      const { addRecentTool, clearRecentTools } = useRecentTools.getState();
      addRecentTool('json-formatter');
      addRecentTool('regex-tester');
      clearRecentTools();
      
      expect(useRecentTools.getState().recentTools).toHaveLength(0);
    });
  });

  describe('persistence', () => {
    it('should persist recent tools to localStorage', () => {
      const { addRecentTool } = useRecentTools.getState();
      addRecentTool('json-formatter');
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dev-tools-recent',
        expect.any(String)
      );
    });
  });
});
