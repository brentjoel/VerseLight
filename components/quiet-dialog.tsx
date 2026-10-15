"use client";

import { useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function QuietDialog({ label, title, icon, className = "compare-link", children }: {
  label: string; title: string; icon?: ReactNode; className?: string; children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  return <>
    <button type="button" className={className} data-tooltip={label} aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>{icon}{label}</button>
    <dialog ref={dialog} className="quiet-dialog" aria-labelledby={heading} onClick={event => {
      if (event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
      }
    }}>
      <div className="dialog-heading"><h2 id={heading}>{title}</h2><button type="button" className="icon-button" aria-label="Close dialog" data-tooltip="Close" onClick={() => dialog.current?.close()}><X size={20} aria-hidden="true" /></button></div>
      {children}
    </dialog>
  </>;
}
