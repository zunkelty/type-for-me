import { createShortcutService } from "./shortcut-service";
import { createStorageServiceFactory } from "./storage-service";
import type { PlatformServices } from "./types";

export type {
  PlatformServices,
  ShortcutEventHandler,
  ShortcutEventState,
  ShortcutService,
  StorageService,
  StorageServiceFactory,
} from "./types";

let platformServices: PlatformServices | null = null;

function createPlatformServices(): PlatformServices {
  return {
    shortcuts: createShortcutService(),
    storage: createStorageServiceFactory(),
  };
}

export function getPlatformServices(): PlatformServices {
  if (!platformServices) {
    platformServices = createPlatformServices();
  }
  return platformServices;
}
