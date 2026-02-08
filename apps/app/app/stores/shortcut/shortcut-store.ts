import { create } from "zustand";
import type { ShortcutEventState } from "@/services/platform";
import { getDefaultShortcut } from "@repo/keyboard-shortcuts";

export interface ShortcutState {
  selectedShortcut: string;
  registeredShortcut: string | null;
  eventState: ShortcutEventState | null;
  isInitialized: boolean;
}

export interface ShortcutActions {
  initialize: () => Promise<void>;
  setShortcut: (shortcut: string) => Promise<void>;
}

export type ShortcutStore = ShortcutState & ShortcutActions;

export const initialShortcutState: ShortcutState = {
  selectedShortcut: getDefaultShortcut(),
  registeredShortcut: null,
  eventState: null,
  isInitialized: false,
};

export const useShortcutStore = create<ShortcutStore>()(() => ({
  ...initialShortcutState,
  initialize: async () => {
    throw new Error("Shortcut store not initialized. Call initializeShortcutStore first.");
  },
  setShortcut: async () => {
    throw new Error("Shortcut store not initialized. Call initializeShortcutStore first.");
  },
}));
