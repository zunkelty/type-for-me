import { getWindowType, type WindowType } from "@/lib/window-context";
import { ListeningOverlay } from "@/overlays/listening-overlay";

const OVERLAY_COMPONENTS: Record<Exclude<WindowType, "main">, React.ComponentType> = {
  "listening-overlay": ListeningOverlay,
};

export function OverlayWindow() {
  const windowType = getWindowType();

  if (windowType === "main") {
    return null;
  }

  const OverlayComponent = OVERLAY_COMPONENTS[windowType];
  return <OverlayComponent />;
}
