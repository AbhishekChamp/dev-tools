import type { ComponentType, LazyExoticComponent } from 'react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  category: ToolCategory;
  tags: string[];
  remote?: string;
  component?: LazyExoticComponent<ComponentType>;
}

export type ToolCategory =
  | 'all'
  | 'formatter'
  | 'encoder'
  | 'generator'
  | 'tester'
  | 'converter';

export interface ToolRegistryEntry {
  name: string;
  route: string;
  remote: string;
  entry: string;
  icon: string;
  description: string;
  category: ToolCategory;
  tags: string[];
}

export interface FavoritesStore {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

export interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}
