'use client';

import { create } from 'zustand';

export const SIDEBAR_EXPANDED_WIDTH = 226;
export const SIDEBAR_COLLAPSED_WIDTH = 72;

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (mobileOpen: boolean) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  setCollapsed: (collapsed: boolean) => set({ collapsed }),
  setMobileOpen: (mobileOpen: boolean) => set({ mobileOpen }),
  toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
  toggleMobileSidebar: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
}));
