// src/store/ui.ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  currentGoalId: string | null;
  // API original (¡la mantenemos!)
  setGoalId: (id: string | null) => void;

  // Alias opcional (puedes usar cualquiera de los dos en el código)
  setCurrentGoal: (id: string | null) => void;
  clearGoal: () => void;

  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  toggleNav: () => void;
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      currentGoalId: null,

      setGoalId: (id) => set({ currentGoalId: id }),
      setCurrentGoal: (id) => set({ currentGoalId: id }),
      clearGoal: () => set({ currentGoalId: null }),

      navOpen: false,
      openNav: () => set({ navOpen: true }),
      closeNav: () => set({ navOpen: false }),
      toggleNav: () => set((s) => ({ navOpen: !s.navOpen })),
    }),
    { name: "ui-store" }
  )
);
