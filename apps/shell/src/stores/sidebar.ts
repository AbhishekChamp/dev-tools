import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SidebarState } from '@/types';

export const useSidebar = create<SidebarState>()(
  persist(
    (set, get) => ({
      isOpen: true,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: 'dev-tools-sidebar',
    }
  )
);
