"use client";
import { create } from "zustand";

type UIState = {
  currentGoalId?: string;
  setGoalId: (id?: string) => void;
  clearGoal: () => void;
};

export const useUI = create<UIState>((set) => ({
  currentGoalId: undefined,
  setGoalId: (id) => set({ currentGoalId: id }),
  clearGoal: () => set({ currentGoalId: undefined }),
}));