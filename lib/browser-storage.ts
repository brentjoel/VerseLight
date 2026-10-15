"use client";

import { useSyncExternalStore } from "react";
import { PersonalStore, serverStorageSnapshot } from "./storage";
import { STORAGE_KEY, type Preferences } from "./storage-schema";
import { resolveTranslation } from "./translations";

let store: PersonalStore | undefined;
let connected = false;
export function readBrowserPreferences(): Partial<Preferences> {
  const preferences: Partial<Preferences> = {};
  try {
    const cookie = document.cookie.split("; ").find(value => value.startsWith("translation="))?.slice(12);
    preferences.preferredTranslation = resolveTranslation(cookie);
  } catch { /* Preferences still work in memory when cookies are unavailable. */ }
  preferences.theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  return preferences;
}
export function applyBrowserPreferences(preferences: Preferences) {
  const previous = readBrowserPreferences();
  if (previous.theme !== preferences.theme) document.documentElement.dataset.themeSource = "stored";
  document.documentElement.dataset.theme = preferences.theme;
  try {
    if (document.documentElement.dataset.themeSource !== "system") localStorage.setItem("verselight-theme", preferences.theme);
  } catch { /* The in-memory theme still works. */ }
  if (previous.preferredTranslation !== preferences.preferredTranslation) {
    try { document.cookie = `translation=${preferences.preferredTranslation}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; } catch { /* Cookie access can be blocked by browser privacy settings. */ }
    window.dispatchEvent(new Event("translation-change"));
  }
}
export function getPersonalStore() {
  if (!store) store = new PersonalStore({
    read: () => localStorage.getItem(STORAGE_KEY),
    write: value => localStorage.setItem(STORAGE_KEY, value),
    exclusive: async work => navigator.locks ? navigator.locks.request(STORAGE_KEY, work) : work(),
  }, applyBrowserPreferences);
  return store;
}
function connect() {
  const current = getPersonalStore();
  if (connected) return;
  connected = true;
  current.initialize(readBrowserPreferences());
  current.refreshProgress();
  window.setInterval(() => current.refreshProgress(), 60000);
  if (current.getSnapshot().mode !== "blocked") applyBrowserPreferences(current.getSnapshot().envelope.data.preferences);
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY || event.key === null) current.checkExternal();
  });
  window.addEventListener("focus", () => {
    current.checkExternal();
    current.refreshProgress();
    const snapshot = current.getSnapshot();
    const preferences = readBrowserPreferences();
    if (snapshot.mode === "persistent" && preferences.preferredTranslation !== snapshot.envelope.data.preferences.preferredTranslation) void current.setPreferences(preferences);
  });
}
function subscribe(listener: () => void) {
  const unsubscribe = getPersonalStore().subscribe(listener);
  connect();
  return unsubscribe;
}
export function usePersonalStorage() {
  return useSyncExternalStore(subscribe, () => getPersonalStore().getSnapshot(), () => serverStorageSnapshot);
}
export function reloadPersonalStorage() {
  const current = getPersonalStore();
  current.reload(readBrowserPreferences());
  if (current.getSnapshot().mode !== "blocked") applyBrowserPreferences(current.getSnapshot().envelope.data.preferences);
}
