"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Only presentation is deferred. The caller keeps its existing validation,
// confirmation, persistence and error handling.
export function RemovalButton({ children, disabled, onRemove, className = "quiet-link" }: {
  children: ReactNode; disabled: boolean; onRemove: () => void; className?: string;
}) {
  const effect = useRef<Animation | null>(null);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => () => { effect.current?.cancel(); }, []);
  return <button type="button" className={className} disabled={disabled || leaving} onClick={async event => {
    const surface = event.currentTarget.closest<HTMLElement>(".saved-card, .collection-editor, .verse-card");
    if (!surface?.animate || matchMedia("(prefers-reduced-motion: reduce)").matches) { onRemove(); return; }
    setLeaving(true);
    const style = getComputedStyle(surface);
    const animation = surface.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: .25, transform: "translateY(4px)" }], {
      duration: parseFloat(style.getPropertyValue("--motion-fast")) || 150, easing: "ease-out",
    });
    effect.current = animation;
    try { await animation.finished; onRemove(); }
    catch { /* An unmounted item must never complete a stale action. */ }
    finally { animation.cancel(); effect.current = null; setLeaving(false); }
  }}>{children}</button>;
}
