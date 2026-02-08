import { DISPLAY_MAP } from "./types.js";

export function formatShortcutToken(token: string): string {
  if (DISPLAY_MAP[token]) {
    return DISPLAY_MAP[token];
  }

  if (token.length === 1) {
    return token.toUpperCase();
  }

  return token;
}

function isMacOS(): boolean {
  if (typeof navigator !== "undefined") {
    return navigator.platform.toUpperCase().includes("MAC");
  }
  return false;
}

export function getDefaultShortcut(): string {
  return isMacOS() ? "Command+Shift+Space" : "Control+Shift+Space";
}
