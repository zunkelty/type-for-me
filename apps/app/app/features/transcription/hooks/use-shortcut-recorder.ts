import { useCallback, useEffect, useRef, useState } from "react";
import { useRecordHotkeys } from "react-hotkeys-hook";
import {
  buildTauriShortcut,
  getErrorMessage,
  isStandaloneModifierShortcut,
  MODIFIER_KEYS,
} from "@repo/keyboard-shortcuts";
import type { ShortcutEventState } from "@/services/platform";
import { useShortcutStore } from "../store";

export interface UseShortcutRecorderReturn {
  shortcut: string;
  draftShortcut: string | null;
  eventState: ShortcutEventState | null;
  isEditing: boolean;
  isRecording: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  helperText: string;
  beginEditing: () => void;
  cancelEditing: () => void;
  saveShortcut: () => Promise<void>;
}

export function useShortcutRecorder(): UseShortcutRecorderReturn {
  const shortcut = useShortcutStore((state) => state.selectedShortcut);
  const registeredShortcut = useShortcutStore((state) => state.registeredShortcut);
  const eventState = useShortcutStore((state) => state.eventState);
  const setPersistedShortcut = useShortcutStore((state) => state.setShortcut);
  const isShortcutStoreInitialized = useShortcutStore((state) => state.isInitialized);

  const [draftShortcut, setDraftShortcut] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordedKeys, { isRecording, resetKeys, start, stop }] =
    useRecordHotkeys();
  const pendingStandaloneModifierRef = useRef<string | null>(null);

  const cleanupRecording = useCallback(() => {
    pendingStandaloneModifierRef.current = null;
    stop();
    resetKeys();
  }, [resetKeys, stop]);

  const beginRecording = useCallback(() => {
    setErrorMessage(null);
    setDraftShortcut(null);
    pendingStandaloneModifierRef.current = null;
    resetKeys();
    start();
  }, [resetKeys, start]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setDraftShortcut(null);
    cleanupRecording();
  }, [cleanupRecording]);

  const commitShortcut = useCallback(
    async (nextShortcut: string) => {
      if (nextShortcut === shortcut) {
        return;
      }

      await setPersistedShortcut(nextShortcut);
    },
    [setPersistedShortcut, shortcut],
  );

  const beginEditing = useCallback(() => {
    setIsEditing(true);
    beginRecording();
  }, [beginRecording]);

  const saveShortcut = useCallback(async () => {
    if (!draftShortcut) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await commitShortcut(draftShortcut);
      cancelEditing();
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [draftShortcut, commitShortcut, cancelEditing]);

  // Track recorded keys and build draft shortcut
  useEffect(() => {
    if (!isEditing || !isRecording) {
      return;
    }

    const normalizedKeys = Array.from(recordedKeys).map((key) =>
      key.trim().toLowerCase(),
    );
    const hasRecordedKeys = normalizedKeys.length > 0;
    const hasOnlyModifierKeys =
      hasRecordedKeys && normalizedKeys.every((key) => MODIFIER_KEYS.has(key));

    if (hasOnlyModifierKeys) {
      const modifierShortcut = buildTauriShortcut(recordedKeys);

      if (modifierShortcut && isStandaloneModifierShortcut(modifierShortcut)) {
        pendingStandaloneModifierRef.current = modifierShortcut;
        setDraftShortcut(modifierShortcut);
      } else {
        pendingStandaloneModifierRef.current = null;
        setDraftShortcut(null);
      }

      return;
    }

    if (!hasRecordedKeys) {
      const pendingStandaloneModifier = pendingStandaloneModifierRef.current;

      if (!pendingStandaloneModifier) {
        return;
      }

      pendingStandaloneModifierRef.current = null;
      setDraftShortcut(pendingStandaloneModifier);
      stop();
      return;
    }

    const capturedShortcut = buildTauriShortcut(recordedKeys);

    if (!capturedShortcut) {
      return;
    }

    pendingStandaloneModifierRef.current = null;
    setDraftShortcut(capturedShortcut);
    stop();
  }, [isEditing, isRecording, recordedKeys, stop]);

  useEffect(() => {
    if (!isEditing || !isRecording) {
      return;
    }

    if (!registeredShortcut) {
      return;
    }

    if (eventState === "Pressed") {
      cancelEditing();
    }
  }, [cancelEditing, eventState, isEditing, isRecording, registeredShortcut]);

  const visibleShortcut = draftShortcut ?? shortcut;
  const isRecordingUiState =
    isEditing && (isRecording || draftShortcut === null);

  const getHelperText = () => {
    if (!isShortcutStoreInitialized) {
      return "Loading shortcut...";
    }

    if (isSaving) {
      return "Saving shortcut...";
    }

    if (isRecordingUiState) {
      return "Press the new shortcut now.";
    }

    if (isEditing && draftShortcut) {
      return "Shortcut captured. Save or record again.";
    }

    return "Hold this shortcut while talking. Release to start transcription.";
  };

  const helperText = getHelperText();

  return {
    shortcut: visibleShortcut,
    draftShortcut,
    eventState,
    isEditing,
    isRecording: isRecordingUiState,
    isSaving,
    errorMessage,
    helperText,
    beginEditing,
    cancelEditing,
    saveShortcut,
  };
}
