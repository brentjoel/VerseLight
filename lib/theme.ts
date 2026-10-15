export function resolveTheme(preference: string | null | undefined, systemLight: boolean): "light" | "dark" {
  return preference === "light" || preference === "dark" ? preference : systemLight ? "light" : "dark";
}

// Shared pre-paint resolution; explicit choices win over the system preference.
export const themeScript = `var t;try{t=localStorage.getItem('verselight-theme')}catch{};document.documentElement.dataset.theme=(${resolveTheme.toString()})(t,matchMedia('(prefers-color-scheme: light)').matches);document.documentElement.dataset.themeSource=t==='light'||t==='dark'?'stored':'system';`;
