import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RecentToolsStore } from '@/types';

const MAX_RECENT_TOOLS = 5;

export const useRecentTools = create<RecentToolsStore>()(
  persist(
    (set) => ({
      recentTools: [],
      addRecentTool: (id: string) =>
        set((state) => {
          const filtered = state.recentTools.filter((toolId) => toolId !== id);
          const updated = [id, ...filtered].slice(0, MAX_RECENT_TOOLS);
          return { recentTools: updated };
        }),
      clearRecentTools: () => set({ recentTools: [] }),
    }),
    {
      name: 'dev-tools-recent',
    }
  )
);
