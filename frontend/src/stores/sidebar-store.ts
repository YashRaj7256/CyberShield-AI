'use client';

import { create } from 'zustand';

export const SIDEBAR_EXPANDED_WIDTH = 226;
export const SIDEBAR_COLLAPSED_WIDTH = 72;

interface SidebarState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  setCollapsed: (collapsed: boolean) => set({ collapsed }),
  toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
}));
