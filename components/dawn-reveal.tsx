"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { consumeDawn, wordDelay } from "@/lib/dawn";

export function DawnReveal({ path, children }: { path: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const stop = useRef<() => void>(() => {});

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      animations.forEach(animation => animation.cancel());
      animations = [];
      clearTimeout(timer);
      element.dataset.animating = "false";
    };
    stop.current = finish;
    // Defer consumption so Strict Mode's setup/cleanup rehearsal keeps the intent.
    const frame = requestAnimationFrame(() => {
      if (!consumeDawn(path) || motion.matches || document.hidden || !element.animate) return;
      const words = element.querySelectorAll<HTMLElement>("[data-dawn-word]");
      if (!words.length) return;
      element.dataset.animating = "true";
      const style = getComputedStyle(element);
      try {
        words.forEach((word, index) => {
          // Both colors remain readable. Animation adds emphasis without hiding text.
          animations.push(word.animate([
            { color: style.getPropertyValue("--muted-foreground"), textShadow: "none" },
            { color: style.getPropertyValue("--foreground"), textShadow: "0 0 12px rgb(213 189 139 / 30%)" },
            { color: style.getPropertyValue("--foreground"), textShadow: "none" },
          ], { delay: wordDelay(index), duration: 600, fill: "backwards", easing: "ease-out" }));
        });
        const light = element.querySelector<HTMLElement>(".dawn-light");
        if (light) animations.push(light.animate([
          { opacity: 0, transform: "scale(.08)" },
          { opacity: .9, offset: .35 },
          { opacity: .18, transform: "scale(1)" },
        ], { duration: 2400, easing: "ease-out" }));
        timer = setTimeout(finish, wordDelay(words.length - 1) + 600);
      } catch { finish(); } // Unsupported animation features keep instant reading.
    });
    const visibility = () => { if (document.hidden) finish(); };
    const preference = () => { if (motion.matches) finish(); };
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      finish();
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", preference);
    };
  }, [path]);

  return <div ref={root} className="dawn-reveal">
    <div className="dawn-controls">
      <p className="local-help">The whole passage is ready to read. Take your time.</p>
      <button type="button" className="compare-link dawn-skip" onClick={() => stop.current()}>Skip animation</button>
    </div>
    <div className="dawn-horizon" aria-hidden="true"><div className="dawn-light" /><div className="dawn-ring" /></div>
    {children}
  </div>;
}
