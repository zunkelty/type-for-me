import { Store } from "@tauri-apps/plugin-store";
import type { StorageService, StorageServiceFactory } from "./types";

function createStorageService(store: Store): StorageService {
  return {
    async get<T>(key: string): Promise<T | undefined> {
      return store.get<T>(key);
    },

    async set<T>(key: string, value: T): Promise<void> {
      await store.set(key, value);
    },

    async save(): Promise<void> {
      await store.save();
    },
  };
}

export function createStorageServiceFactory(): StorageServiceFactory {
  return {
    async load(
      path: string,
      options?: { defaults?: Record<string, unknown> },
    ): Promise<StorageService> {
      const storeOptions = options?.defaults
        ? { defaults: options.defaults }
        : undefined;
      const store = await Store.load(path, storeOptions);
      return createStorageService(store);
    },
  };
}
