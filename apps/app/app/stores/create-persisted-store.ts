import { getPlatformServices, type StorageService } from "@/services/platform";

export interface PersistedStoreConfig<T> {
  path: string;
  defaults: T;
}

export interface PersistedStoreHandle<T> {
  get<K extends keyof T>(key: K): Promise<T[K]>;
  set<K extends keyof T>(key: K, value: T[K]): Promise<void>;
  save(): Promise<void>;
}

const storePromises = new Map<string, Promise<StorageService>>();

export async function getPersistedStore<T extends Record<string, unknown>>(
  config: PersistedStoreConfig<T>,
): Promise<PersistedStoreHandle<T>> {
  let storePromise = storePromises.get(config.path);

  if (!storePromise) {
    const platform = getPlatformServices();
    storePromise = platform.storage.load(config.path, {
      defaults: config.defaults as Record<string, unknown>,
    });
    storePromises.set(config.path, storePromise);
  }

  const store = await storePromise;

  return {
    async get<K extends keyof T>(key: K): Promise<T[K]> {
      const value = await store.get<T[K]>(key as string);
      return value ?? config.defaults[key];
    },

    async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
      await store.set(key as string, value);
    },

    async save(): Promise<void> {
      await store.save();
    },
  };
}
