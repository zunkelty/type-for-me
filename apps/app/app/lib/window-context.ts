import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export const LISTENING_OVERLAY_WINDOW_LABEL = "transcription-listening-overlay";

export type WindowType = "main" | "listening-overlay";

export function getWindowType(): WindowType {
  if (typeof window === "undefined") {
    return "main";
  }

  const windowLabel = getCurrentWebviewWindow().label;

  if (windowLabel === LISTENING_OVERLAY_WINDOW_LABEL) {
    return "listening-overlay";
  }

  return "main";
}

export function isListeningOverlayWindow(): boolean {
  return getWindowType() === "listening-overlay";
}

export function isMainWindow(): boolean {
  return getWindowType() === "main";
}
