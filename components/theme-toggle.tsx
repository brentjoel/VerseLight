"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("verselight-theme", theme); } catch { /* Theme still works when storage is unavailable. */ }
  }

  return (
    <button type="button" onClick={toggleTheme} className="theme-toggle" aria-label="Switch between light and dark theme" title="Switch color theme">
      <Sun className="theme-sun" size={18} aria-hidden="true" />
      <Moon className="theme-moon" size={18} aria-hidden="true" />
    </button>
  );
}
