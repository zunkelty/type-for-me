import { getPlatformServices, type ShortcutEventState } from "@/services/platform";
import {
  getDefaultShortcut,
  isStandaloneModifierShortcut,
} from "@repo/keyboard-shortcuts";
import { getPersistedStore, type PersistedStoreHandle } from "../create-persisted-store";
import { useShortcutStore } from "./shortcut-store";

const SETTINGS_STORE_PATH = "settings.json";

type ShortcutSettings = {
  "transcription.shortcut.selected": string;
  "transcription.shortcut.registered": string | null;
  [key: string]: unknown;
};

let settingsStorePromise: Promise<PersistedStoreHandle<ShortcutSettings>> | null = null;
let initializePromise: Promise<void> | null = null;

async function getSettingsStore(): Promise<PersistedStoreHandle<ShortcutSettings>> {
  if (!settingsStorePromise) {
    settingsStorePromise = getPersistedStore<ShortcutSettings>({
      path: SETTINGS_STORE_PATH,
      defaults: {
        "transcription.shortcut.selected": getDefaultShortcut(),
        "transcription.shortcut.registered": null,
      },
    });
  }
  return settingsStorePromise;
}

async function readPersistedShortcut(fallbackShortcut: string): Promise<{
  selectedShortcut: string;
  registeredShortcut: string | null;
}> {
  const store = await getSettingsStore();
  const selectedValue = await store.get("transcription.shortcut.selected");
  const registeredValue = await store.get("transcription.shortcut.registered");

  const selectedShortcut =
    typeof selectedValue === "string" && selectedValue.trim().length > 0
      ? selectedValue
      : fallbackShortcut;

  const registeredShortcut =
    typeof registeredValue === "string" && registeredValue.trim().length > 0
      ? registeredValue
      : null;

  return { selectedShortcut, registeredShortcut };
}

async function persistShortcut(
  selectedShortcut: string,
  registeredShortcut: string | null,
): Promise<void> {
  const store = await getSettingsStore();
  await store.set("transcription.shortcut.selected", selectedShortcut);
  await store.set("transcription.shortcut.registered", registeredShortcut);
  await store.save();
}

async function unregisterIfRegistered(shortcut: string | null): Promise<void> {
  if (!shortcut) {
    return;
  }

  const platform = getPlatformServices();
  if (await platform.shortcuts.isRegistered(shortcut)) {
    await platform.shortcuts.unregister(shortcut);
  }
}

async function registerIfMissing(shortcut: string): Promise<void> {
  const platform = getPlatformServices();

  if (await platform.shortcuts.isRegistered(shortcut)) {
    return;
  }

  try {
    await platform.shortcuts.register(shortcut, onGlobalShortcut);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    // Guard against duplicate initialization races (e.g. React StrictMode).
    if (message.includes("already") && message.includes("register")) {
      return;
    }

    throw error;
  }
}

function onGlobalShortcut(state: ShortcutEventState): void {
  useShortcutStore.setState({ eventState: state });
}

async function initializeAction(): Promise<void> {
  const state = useShortcutStore.getState();

  if (state.isInitialized) {
    return;
  }

  if (initializePromise) {
    await initializePromise;
    return;
  }

  const fallbackShortcut = getDefaultShortcut();

  initializePromise = (async () => {
    const persisted = await readPersistedShortcut(fallbackShortcut);
    const nextSelectedShortcut = persisted.selectedShortcut;
    let nextRegisteredShortcut: string | null = null;

    if (isStandaloneModifierShortcut(nextSelectedShortcut)) {
      await unregisterIfRegistered(persisted.registeredShortcut);
    } else {
      await registerIfMissing(nextSelectedShortcut);
      nextRegisteredShortcut = nextSelectedShortcut;

      if (
        persisted.registeredShortcut &&
        persisted.registeredShortcut !== nextSelectedShortcut
      ) {
        await unregisterIfRegistered(persisted.registeredShortcut);
      }
    }

    await persistShortcut(nextSelectedShortcut, nextRegisteredShortcut);

    useShortcutStore.setState({
      selectedShortcut: nextSelectedShortcut,
      registeredShortcut: nextRegisteredShortcut,
      eventState: null,
      isInitialized: true,
    });
  })();

  try {
    await initializePromise;
  } finally {
    initializePromise = null;
  }
}

async function setShortcutAction(shortcut: string): Promise<void> {
  const { selectedShortcut, registeredShortcut } = useShortcutStore.getState();
  const shouldRegisterShortcut = !isStandaloneModifierShortcut(shortcut);
  const nextRegisteredShortcut = shouldRegisterShortcut ? shortcut : null;

  if (
    shortcut === selectedShortcut &&
    registeredShortcut === nextRegisteredShortcut
  ) {
    return;
  }

  if (shouldRegisterShortcut) {
    await registerIfMissing(shortcut);
  }

  if (registeredShortcut && registeredShortcut !== nextRegisteredShortcut) {
    await unregisterIfRegistered(registeredShortcut);
  }

  await persistShortcut(shortcut, nextRegisteredShortcut);

  useShortcutStore.setState({
    selectedShortcut: shortcut,
    registeredShortcut: nextRegisteredShortcut,
    eventState: null,
  });
}

export function initializeShortcutStore(): void {
  useShortcutStore.setState({
    initialize: initializeAction,
    setShortcut: setShortcutAction,
  });
}
