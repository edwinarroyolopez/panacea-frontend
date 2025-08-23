"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  currentGoalId?: string;
  setGoalId: (id?: string) => void;

  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  toggleNav: () => void;
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      currentGoalId: undefined,
      setGoalId: (id) => set({ currentGoalId: id }),

      navOpen: false,
      openNav: () => set({ navOpen: true }),
      closeNav: () => set({ navOpen: false }),
      toggleNav: () => set((s) => ({ navOpen: !s.navOpen })),
    }),
    { name: "ui-store" }
  )
);