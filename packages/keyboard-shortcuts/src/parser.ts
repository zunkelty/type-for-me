import { KEY_MAP, MODIFIER_KEYS, STANDALONE_MODIFIERS } from "./types.js";

export function toTauriPrimaryKey(key: string): string | null {
  const normalizedKey = key.trim().toLowerCase();

  if (normalizedKey.length === 1) {
    if (/^[a-z]$/.test(normalizedKey)) {
      return normalizedKey.toUpperCase();
    }

    if (/^[0-9]$/.test(normalizedKey)) {
      return normalizedKey;
    }
  }

  if (/^f\d{1,2}$/.test(normalizedKey)) {
    return normalizedKey.toUpperCase();
  }

  return KEY_MAP[normalizedKey] ?? null;
}

export function buildTauriShortcut(keys: Set<string>): string | null {
  const normalized = Array.from(keys).map((key) => key.trim().toLowerCase());

  const modifiers: string[] = [];

  if (normalized.includes("ctrl") || normalized.includes("control")) {
    modifiers.push("Control");
  }

  if (normalized.includes("alt")) {
    modifiers.push("Alt");
  }

  if (normalized.includes("shift")) {
    modifiers.push("Shift");
  }

  if (normalized.includes("meta")) {
    modifiers.push("Command");
  }

  const primaryKey = normalized.find((key) => !MODIFIER_KEYS.has(key));

  if (!primaryKey) {
    const firstModifier = modifiers.at(0);
    return modifiers.length === 1 ? firstModifier ?? null : null;
  }

  const tauriPrimaryKey = toTauriPrimaryKey(primaryKey);

  if (!tauriPrimaryKey) {
    return null;
  }

  return [...modifiers, tauriPrimaryKey].join("+");
}

export function tokenizeShortcut(shortcut: string): string[] {
  return shortcut
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function isStandaloneModifierShortcut(shortcut: string): boolean {
  const tokens = tokenizeShortcut(shortcut);
  const firstToken = tokens.at(0);
  return tokens.length === 1 && !!firstToken && STANDALONE_MODIFIERS.has(firstToken);
}
