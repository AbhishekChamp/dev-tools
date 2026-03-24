import { describe, it, expect, beforeEach } from 'vitest';
import { useFavorites } from '@/stores/favorites';

describe('useFavorites store', () => {
  beforeEach(() => {
    useFavorites.setState({ favorites: [] });
  });

  describe('addFavorite', () => {
    it('should add a tool to favorites', () => {
      const { addFavorite } = useFavorites.getState();
      addFavorite('json-formatter');
      
      expect(useFavorites.getState().favorites).toContain('json-formatter');
    });

    it('should not add duplicate favorites', () => {
      const { addFavorite } = useFavorites.getState();
      addFavorite('json-formatter');
      addFavorite('json-formatter');
      
      expect(useFavorites.getState().favorites).toHaveLength(1);
    });

    it('should add multiple different tools', () => {
      const { addFavorite } = useFavorites.getState();
      addFavorite('json-formatter');
      addFavorite('regex-tester');
      addFavorite('jwt-decoder');
      
      expect(useFavorites.getState().favorites).toHaveLength(3);
      expect(useFavorites.getState().favorites).toContain('json-formatter');
      expect(useFavorites.getState().favorites).toContain('regex-tester');
      expect(useFavorites.getState().favorites).toContain('jwt-decoder');
    });
  });

  describe('removeFavorite', () => {
    it('should remove a tool from favorites', () => {
      const { addFavorite, removeFavorite } = useFavorites.getState();
      addFavorite('json-formatter');
      removeFavorite('json-formatter');
      
      expect(useFavorites.getState().favorites).not.toContain('json-formatter');
    });

    it('should handle removing non-existent favorite gracefully', () => {
      const { removeFavorite } = useFavorites.getState();
      removeFavorite('non-existent');
      
      expect(useFavorites.getState().favorites).toHaveLength(0);
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorited tool', () => {
      const { addFavorite, isFavorite } = useFavorites.getState();
      addFavorite('json-formatter');
      
      expect(isFavorite('json-formatter')).toBe(true);
    });

    it('should return false for non-favorited tool', () => {
      const { isFavorite } = useFavorites.getState();
      
      expect(isFavorite('json-formatter')).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('should add tool when not favorited', () => {
      const { toggleFavorite } = useFavorites.getState();
      toggleFavorite('json-formatter');
      
      expect(useFavorites.getState().favorites).toContain('json-formatter');
    });

    it('should remove tool when already favorited', () => {
      const { addFavorite, toggleFavorite } = useFavorites.getState();
      addFavorite('json-formatter');
      toggleFavorite('json-formatter');
      
      expect(useFavorites.getState().favorites).not.toContain('json-formatter');
    });
  });

  describe('persistence', () => {
    it('should persist favorites to localStorage', () => {
      const { addFavorite } = useFavorites.getState();
      addFavorite('json-formatter');
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dev-tools-favorites',
        expect.stringContaining('json-formatter')
      );
    });
  });
});
