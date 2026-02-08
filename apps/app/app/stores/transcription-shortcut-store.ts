// Re-export from new store location for backwards compatibility
import { initializeShortcutStore, useShortcutStore } from "./shortcut";

// Initialize the store actions on module load
initializeShortcutStore();

// Re-export with the old name
export const useTranscriptionShortcutStore = useShortcutStore;
