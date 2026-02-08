// Re-export store from centralized location
export {
  initializeShortcutStore,
  initialShortcutState,
  useShortcutStore,
  type ShortcutActions,
  type ShortcutState,
  type ShortcutStore,
} from "@/stores/shortcut";

import { initializeShortcutStore } from "@/stores/shortcut";

// Initialize the store actions on module load
initializeShortcutStore();
