import { useCallback, useEffect, useRef, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import {
  register,
  type ShortcutEvent,
  unregister,
} from "@tauri-apps/plugin-global-shortcut";
import { Check, Pencil, X } from "lucide-react";
import { useRecordHotkeys } from "react-hotkeys-hook";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { SettingsSection } from "./settings-section";

const DEFAULT_SHORTCUT = "Command+Shift+Space";
const MODIFIER_KEYS = new Set(["meta", "ctrl", "control", "alt", "shift"]);
const STANDALONE_MODIFIERS = new Set([
  "Command",
  "Control",
  "Alt",
  "Shift",
]);
const KEY_MAP: Record<string, string> = {
  escape: "Escape",
  enter: "Enter",
  tab: "Tab",
  space: "Space",
  backspace: "Backspace",
  delete: "Delete",
  home: "Home",
  end: "End",
  pageup: "PageUp",
  pagedown: "PageDown",
  insert: "Insert",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight",
  comma: "Comma",
  period: "Period",
  slash: "Slash",
  semicolon: "Semicolon",
  quote: "Quote",
  minus: "Minus",
  equal: "Equal",
  bracketleft: "BracketLeft",
  bracketright: "BracketRight",
  backslash: "Backslash",
  backquote: "Backquote",
};

const DISPLAY_MAP: Record<string, string> = {
  Command: "⌘",
  CommandOrControl: "⌘/⌃",
  CommandOrCtrl: "⌘/⌃",
  CmdOrCtrl: "⌘/⌃",
  Control: "⌃",
  Ctrl: "⌃",
  Alt: "⌥",
  Shift: "⇧",
  Super: "Super",
  Meta: "Meta",
  Space: "Space",
  Escape: "⎋",
  Enter: "↩",
  Backspace: "⌫",
  Delete: "⌦",
  Tab: "⇥",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  PageUp: "⇞",
  PageDown: "⇟",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to update shortcut.";
}

function toTauriPrimaryKey(key: string): string | null {
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

function buildTauriShortcut(keys: Set<string>): string | null {
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

function isStandaloneModifierShortcut(shortcut: string): boolean {
  const tokens = tokenizeShortcut(shortcut);
  const firstToken = tokens.at(0);
  return tokens.length === 1 && !!firstToken && STANDALONE_MODIFIERS.has(firstToken);
}

function tokenizeShortcut(shortcut: string): string[] {
  return shortcut
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatShortcutToken(token: string): string {
  if (DISPLAY_MAP[token]) {
    return DISPLAY_MAP[token];
  }

  if (token.length === 1) {
    return token.toUpperCase();
  }

  return token;
}

function ShortcutPills({ shortcut }: { shortcut: string }) {
  return (
    <KbdGroup>
      {tokenizeShortcut(shortcut).map((token, index) => (
        <Kbd key={`${token}-${index}`}>{formatShortcutToken(token)}</Kbd>
      ))}
    </KbdGroup>
  );
}

export function TranscriptionShortcutSection() {
  const [shortcut, setShortcut] = useState(DEFAULT_SHORTCUT);
  const [draftShortcut, setDraftShortcut] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [eventState, setEventState] = useState<ShortcutEvent["state"] | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordedKeys, { isRecording, resetKeys, start, stop }] =
    useRecordHotkeys();
  const registeredShortcutRef = useRef<string | null>(null);

  const onGlobalShortcut = useCallback((event: ShortcutEvent) => {
    if (event.state === "Pressed") {
      setEventState("Pressed");
      return;
    }

    setEventState("Released");
  }, []);

  const cleanupRecording = useCallback(() => {
    stop();
    resetKeys();
  }, [resetKeys, stop]);

  const beginRecording = useCallback(() => {
    setErrorMessage(null);
    setDraftShortcut(null);
    resetKeys();
    start();
  }, [resetKeys, start]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setDraftShortcut(null);
    cleanupRecording();
  }, [cleanupRecording]);

  const saveShortcut = useCallback(
    async (nextShortcut: string) => {
      const previousShortcut = registeredShortcutRef.current;
      const isStandaloneModifier = isStandaloneModifierShortcut(nextShortcut);

      if (nextShortcut === shortcut && previousShortcut === shortcut) {
        return;
      }

      if (isTauri()) {
        if (isStandaloneModifier) {
          if (previousShortcut) {
            await unregister(previousShortcut);
          }

          registeredShortcutRef.current = null;
        } else {
          await register(nextShortcut, onGlobalShortcut);

          if (previousShortcut && previousShortcut !== nextShortcut) {
            await unregister(previousShortcut);
          }

          registeredShortcutRef.current = nextShortcut;
        }
      }

      if (isStandaloneModifier) {
        setEventState(null);
      }

      setShortcut(nextShortcut);
    },
    [onGlobalShortcut, shortcut],
  );

  useEffect(() => {
    if (!isEditing || !isRecording) {
      return;
    }

    const capturedShortcut = buildTauriShortcut(recordedKeys);

    if (!capturedShortcut) {
      return;
    }

    setDraftShortcut(capturedShortcut);
    stop();
  }, [isEditing, isRecording, recordedKeys, stop]);

  useEffect(() => {
    if (!isTauri()) {
      return;
    }

    let isCancelled = false;

    const registerInitialShortcut = async () => {
      try {
        await register(DEFAULT_SHORTCUT, onGlobalShortcut);

        if (!isCancelled) {
          registeredShortcutRef.current = DEFAULT_SHORTCUT;
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(getErrorMessage(error));
        }
      }
    };

    void registerInitialShortcut();

    return () => {
      isCancelled = true;

      const registeredShortcut = registeredShortcutRef.current;

      if (!registeredShortcut) {
        return;
      }

      void unregister(registeredShortcut).catch(() => {
        // Best-effort cleanup.
      });
    };
  }, [onGlobalShortcut]);

  const visibleShortcut = draftShortcut ?? shortcut;
  const isRecordingUiState =
    isEditing && (isRecording || draftShortcut === null);

  const helperText = isSaving
    ? "Saving shortcut..."
    : isRecordingUiState
      ? "Press the new shortcut now."
      : isEditing && draftShortcut
        ? "Shortcut captured. Save or record again."
        : eventState === "Pressed"
          ? "Shortcut is currently held down."
          : eventState === "Released"
            ? "Shortcut released. Transcription can start now."
            : "Hold this shortcut while talking. Release to start transcription.";

  return (
    <SettingsSection
      title="Shortcut"
      subtitle="Configure the hold-to-record shortcut for transcription."
    >
      <div className="space-y-3">
        <InputGroup
          className={cn(
            "max-w-xl",
            isEditing && "border-ring ring-ring/30 ring-2",
          )}
        >
          <InputGroupInput
            readOnly
            value=""
            aria-label="Transcription shortcut"
            className="text-transparent caret-transparent select-none"
          />

          <InputGroupAddon align="inline-start" className="pointer-events-none">
            <ShortcutPills shortcut={visibleShortcut} />
          </InputGroupAddon>

          <InputGroupAddon align="inline-end">
            {!isEditing ? (
              <InputGroupButton
                size="icon-xs"
                aria-label="Edit shortcut"
                onClick={() => {
                  setIsEditing(true);
                  beginRecording();
                }}
              >
                <Pencil />
              </InputGroupButton>
            ) : isRecordingUiState ? (
              <InputGroupButton
                size="icon-xs"
                aria-label="Cancel editing"
                onClick={cancelEditing}
              >
                <X />
              </InputGroupButton>
            ) : (
              <>
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Save shortcut"
                  onClick={async () => {
                    if (!draftShortcut) {
                      return;
                    }

                    setIsSaving(true);
                    setErrorMessage(null);

                    try {
                      await saveShortcut(draftShortcut);
                      cancelEditing();
                    } catch (error) {
                      setErrorMessage(getErrorMessage(error));
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={!draftShortcut || isSaving}
                >
                  <Check />
                </InputGroupButton>
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Cancel editing"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  <X />
                </InputGroupButton>
              </>
            )}
          </InputGroupAddon>
        </InputGroup>

        <p className="text-sm text-muted-foreground">{helperText}</p>

        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </div>
    </SettingsSection>
  );
}
