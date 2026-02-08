import {
  isRegistered,
  register,
  unregister,
  type ShortcutEvent,
} from "@tauri-apps/plugin-global-shortcut";
import type { ShortcutEventHandler, ShortcutService } from "./types";

export function createShortcutService(): ShortcutService {
  return {
    async isRegistered(shortcut: string): Promise<boolean> {
      return isRegistered(shortcut);
    },

    async register(shortcut: string, handler: ShortcutEventHandler): Promise<void> {
      const tauriHandler = (event: ShortcutEvent) => {
        handler(event.state === "Pressed" ? "Pressed" : "Released");
      };
      await register(shortcut, tauriHandler);
    },

    async unregister(shortcut: string): Promise<void> {
      await unregister(shortcut);
    },
  };
}
