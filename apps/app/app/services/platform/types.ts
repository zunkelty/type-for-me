export type ShortcutEventState = "Pressed" | "Released";

export type ShortcutEventHandler = (state: ShortcutEventState) => void;

export interface ShortcutService {
  isRegistered(shortcut: string): Promise<boolean>;
  register(shortcut: string, handler: ShortcutEventHandler): Promise<void>;
  unregister(shortcut: string): Promise<void>;
}

export interface StorageService {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  save(): Promise<void>;
}

export interface StorageServiceFactory {
  load(
    path: string,
    options?: { defaults?: Record<string, unknown> },
  ): Promise<StorageService>;
}

export interface PlatformServices {
  shortcuts: ShortcutService;
  storage: StorageServiceFactory;
}
