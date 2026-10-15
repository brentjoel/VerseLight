"use client";

import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";
import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { resolveTheme } from "@/lib/theme";

export function ThemeToggle() {
  const storage = usePersonalStorage();
  useEffect(() => {
    const system = matchMedia("(prefers-color-scheme: light)");
    const sync = () => {
      if (document.documentElement.dataset.themeSource !== "system") return;
      const theme = resolveTheme(null, system.matches);
      document.documentElement.dataset.theme = theme;
      void getPersonalStore().setPreferences({ theme });
    };
    system.addEventListener("change", sync);
    return () => system.removeEventListener("change", sync);
  }, []);
  function toggleTheme() {
    const theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.themeSource = "stored";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("verselight-theme", theme); } catch { /* Theme still works when storage is unavailable. */ }
    if (storage.ready) void getPersonalStore().setPreferences({ theme });
  }

  return (
    <button type="button" onClick={toggleTheme} className="theme-toggle" aria-label="Switch between light and dark theme" title="Switch color theme">
      <Sun className="theme-sun" size={18} aria-hidden="true" />
      <Moon className="theme-moon" size={18} aria-hidden="true" />
    </button>
  );
}
