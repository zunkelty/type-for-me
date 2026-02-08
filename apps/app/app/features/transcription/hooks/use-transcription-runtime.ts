import { useEffect } from "react";
import {
  hideListeningOverlayWindow,
  showListeningOverlayWindow,
} from "@/services/platform/overlay-window-service";
import { useShortcutStore } from "../store";

export function useTranscriptionRuntime(): void {
  const initializeShortcutStore = useShortcutStore((state) => state.initialize);
  const shortcutEventState = useShortcutStore((state) => state.eventState);

  useEffect(() => {
    void initializeShortcutStore().catch((error) => {
      console.error("Unable to initialize transcription shortcut.", error);
    });
  }, [initializeShortcutStore]);

  useEffect(() => {
    if (shortcutEventState === "Pressed") {
      void showListeningOverlayWindow().catch((error) => {
        console.error("Unable to show listening overlay window.", error);
      });
      return;
    }

    void hideListeningOverlayWindow().catch((error) => {
      console.error("Unable to hide listening overlay window.", error);
    });
  }, [shortcutEventState]);

  useEffect(() => {
    return () => {
      void hideListeningOverlayWindow().catch((error) => {
        console.error("Unable to hide listening overlay window.", error);
      });
    };
  }, []);
}
