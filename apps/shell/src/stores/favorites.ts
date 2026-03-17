import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FavoritesStore } from '@/types';

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (id: string) =>
        set((state) => ({
          favorites: [...new Set([...state.favorites, id])],
        })),
      removeFavorite: (id: string) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f !== id),
        })),
      isFavorite: (id: string) => get().favorites.includes(id),
      toggleFavorite: (id: string) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(id)) {
          removeFavorite(id);
        } else {
          addFavorite(id);
        }
      },
    }),
    {
      name: 'dev-tools-favorites',
    }
  )
);
