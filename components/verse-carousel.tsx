"use client";

import { addTransitionType, createContext, startTransition, ViewTransition, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, List, BookOpen } from "lucide-react";

const subscribe = () => () => {};
export const ActiveVerseContext = createContext(false);

export function VerseCarousel({ children }: { children: ReactNode[] }) {
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);
  const [index, setIndex] = useState(0);
  const [list, setList] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState(1);
  const select = (item: number, travel: number) => {
    if (item === index) return;
    startTransition(() => {
      addTransitionType(travel > 0 ? "verse-next" : "verse-previous");
      setDirection(travel > 0 ? 1 : -1);
      setIndex(item);
    });
  };
  const move = (offset: number) => {
    if (children.length === 0) return;
    // Keep keyboard focus available when its current slide becomes hidden.
    if (region.current?.querySelector(".verse-list")?.contains(document.activeElement)) region.current.focus({ preventScroll: true });
    select((index + offset + children.length) % children.length, offset);
  };
  return <div ref={region} tabIndex={enhanced && !list ? 0 : undefined} className="verse-carousel" role="region" aria-label="Scripture passages. Use left and right arrows to move between verses." aria-roledescription={enhanced && !list ? "carousel" : undefined} onKeyDown={event => {
    if (list || event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof Element && event.target.closest("input, select, textarea, dialog"))) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
  }}>
    {enhanced && <div className="carousel-toolbar"><p role="status" aria-live="polite" aria-atomic="true">{list ? `${children.length} verses` : `Verse ${index + 1} of ${children.length}`}</p><button type="button" className="quiet-link" onClick={() => setList(value => !value)}>{list ? <BookOpen size={16} aria-hidden="true" /> : <List size={16} aria-hidden="true" />}{list ? "One verse at a time" : "View all verses"}</button></div>}
    <ViewTransition default="none" share={{ "verse-next": "verse-next", "verse-previous": "verse-previous", default: "none" }} update={{ "verse-next": "verse-next", "verse-previous": "verse-previous", default: "none" }}><ul data-direction={direction} className={`verse-list${enhanced && !list ? " carousel-single" : ""}`} onTouchStart={event => { const touch = event.touches[0]; start.current = { x: touch.clientX, y: touch.clientY }; }} onTouchEnd={event => {
      const touch = event.changedTouches[0];
      if (start.current && !list && !(event.target instanceof Element && event.target.closest("button, a, input, summary, dialog"))) {
        const dx = touch.clientX - start.current.x, dy = touch.clientY - start.current.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && !window.getSelection()?.toString()) move(dx > 0 ? -1 : 1);
      }
      start.current = null;
    }}>
      {children.map((child, item) => <li key={item} hidden={enhanced && !list && index !== item} aria-label={`Verse ${item + 1} of ${children.length}`}><ActiveVerseContext.Provider value={enhanced && (list || index === item)}>{child}</ActiveVerseContext.Provider></li>)}
    </ul></ViewTransition>
    {enhanced && !list && children.length > 1 && <div className="verse-pagination">
      <button type="button" className="icon-button verse-arrow" aria-label="Previous verse" data-tooltip="Previous verse" onClick={() => move(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
      <div className="verse-dots" aria-label="Choose a verse">{children.map((_, item) => <button key={item} type="button" aria-label={`Show verse ${item + 1}`} aria-current={index === item ? "true" : undefined} onClick={() => select(item, item - index)}><span /></button>)}</div>
      <button type="button" className="icon-button verse-arrow" aria-label="Next verse" data-tooltip="Next verse" onClick={() => move(1)}><ArrowRight size={20} aria-hidden="true" /></button>
    </div>}
  </div>;
}
