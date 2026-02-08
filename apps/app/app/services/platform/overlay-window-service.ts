import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
  PhysicalPosition,
  PhysicalSize,
  cursorPosition,
  monitorFromPoint,
  primaryMonitor,
  type Monitor,
} from "@tauri-apps/api/window";
import { LISTENING_OVERLAY_WINDOW_LABEL } from "@/lib/window-context";

const OVERLAY_WIDTH_LOGICAL = 200;
const OVERLAY_HEIGHT_LOGICAL = 100;

let overlayWindowCreationPromise: Promise<WebviewWindow> | null = null;

function toPhysicalPixels(value: number, scaleFactor: number): number {
  return Math.round(value * scaleFactor);
}

function resolveOverlayBounds(monitor: Monitor) {
  const scaleFactor = monitor.scaleFactor || 1;
  const width = toPhysicalPixels(OVERLAY_WIDTH_LOGICAL, scaleFactor);
  const height = toPhysicalPixels(OVERLAY_HEIGHT_LOGICAL, scaleFactor);

  const x = monitor.position.x + Math.round((monitor.size.width - width) / 2);
  const y = monitor.position.y + monitor.size.height - height;

  return { x, y, width, height };
}

async function waitForWindowCreation(
  window: WebviewWindow,
): Promise<WebviewWindow> {
  await new Promise<void>((resolve, reject) => {
    void window.once("tauri://created", () => {
      resolve();
    });

    void window.once("tauri://error", (event) => {
      const errorMessage =
        typeof event.payload === "string"
          ? event.payload
          : "Unable to create listening overlay window.";
      reject(new Error(errorMessage));
    });
  });

  return window;
}

async function getOrCreateOverlayWindow(): Promise<WebviewWindow> {
  const existingWindow = await WebviewWindow.getByLabel(
    LISTENING_OVERLAY_WINDOW_LABEL,
  );

  if (existingWindow) {
    return existingWindow;
  }

  if (overlayWindowCreationPromise) {
    return overlayWindowCreationPromise;
  }

  const window = new WebviewWindow(LISTENING_OVERLAY_WINDOW_LABEL, {
    title: "Listening",
    width: OVERLAY_WIDTH_LOGICAL,
    height: OVERLAY_HEIGHT_LOGICAL,
    transparent: true,
    backgroundColor: [0, 0, 0, 0],
    visible: false,
    resizable: false,
    decorations: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focus: false,
    focusable: false,
    maximizable: false,
    minimizable: false,
    shadow: false,
    visibleOnAllWorkspaces: true,
  });

  overlayWindowCreationPromise = waitForWindowCreation(window).finally(() => {
    overlayWindowCreationPromise = null;
  });

  return overlayWindowCreationPromise;
}

async function getMonitorForCurrentCursor(): Promise<Monitor | null> {
  const cursor = await cursorPosition();
  const cursorMonitor = await monitorFromPoint(cursor.x, cursor.y);

  if (cursorMonitor) {
    return cursorMonitor;
  }

  return primaryMonitor();
}

export async function showListeningOverlayWindow(): Promise<void> {
  const [window, monitor] = await Promise.all([
    getOrCreateOverlayWindow(),
    getMonitorForCurrentCursor(),
  ]);

  if (!monitor) {
    await window.show();
    return;
  }

  const { x, y, width, height } = resolveOverlayBounds(monitor);

  await window.setSize(new PhysicalSize(width, height));
  await window.setPosition(new PhysicalPosition(x, y));
  await window.show();
}

export async function hideListeningOverlayWindow(): Promise<void> {
  const window = await WebviewWindow.getByLabel(LISTENING_OVERLAY_WINDOW_LABEL);

  if (!window) {
    return;
  }

  await window.hide();
}
