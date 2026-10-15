"use client";

import { useContext, useEffect, useRef, type ReactNode } from "react";
import { createDawnRun, wordDelay } from "@/lib/dawn";
import { ActiveVerseContext } from "@/components/verse-carousel";

export function DawnReveal({ path, children }: { path: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const stop = useRef<() => void>(() => {});
  const active = useContext(ActiveVerseContext);

  useEffect(() => {
    const element = root.current;
    if (!element || !active) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const run = createDawnRun();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      run.cancel();
      clearTimeout(timer);
      element.dataset.animating = "false";
    };
    stop.current = finish;
    // Each active passage owns its effects, including Strict Mode rehearsals.
    const frame = requestAnimationFrame(() => {
      if (!run.running || motion.matches || document.hidden || !element.animate) return;
      const words = element.querySelectorAll<HTMLElement>("[data-dawn-word]");
      if (!words.length) return;
      element.dataset.animating = "true";
      const style = getComputedStyle(element);
      try {
        words.forEach((word, index) => {
          // Both colors remain readable. Animation adds emphasis without hiding text.
          run.add(word.animate([
            { color: style.getPropertyValue("--muted-foreground"), textShadow: "none" },
            { color: style.getPropertyValue("--foreground"), textShadow: style.getPropertyValue("--scene-word-glow") },
            { color: style.getPropertyValue("--foreground"), textShadow: "none" },
          ], { delay: wordDelay(index), duration: 600, fill: "backwards", easing: "ease-out" }));
        });
        const light = element.querySelector<HTMLElement>(".dawn-light");
        if (light) run.add(light.animate([
          { opacity: 0, transform: "scale(.08)" },
          { opacity: .9, offset: .35 },
          { opacity: .18, transform: "scale(1)" },
        ], { duration: 2400, easing: "ease-out" }));
        timer = setTimeout(finish, Math.max(2400, wordDelay(words.length - 1) + 600));
      } catch { finish(); } // Unsupported animation features keep instant reading.
    });
    const visibility = () => { if (document.hidden) finish(); };
    const preference = () => { if (motion.matches) finish(); };
    // Captured animation colors must never survive a theme switch.
    const theme = new MutationObserver(finish);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      finish();
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", preference);
      theme.disconnect();
    };
  }, [path, active]);

  return <div ref={root} className="dawn-reveal">
    <div className="dawn-controls">
      <p className="local-help">The whole passage is ready to read. Take your time.</p>
      <button type="button" className="compare-link dawn-skip" onClick={() => stop.current()}>Skip animation</button>
    </div>
    <div className="dawn-horizon" aria-hidden="true"><div className="dawn-light" /><div className="dawn-ring" /></div>
    {children}
  </div>;
}
