"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { FeelingLink } from "@/components/feeling-link";
import type { Emotion } from "@/lib/emotions";
import { needsSimplePicker, wrapIndex } from "@/lib/wheel";

const Scene = dynamic(() => import("@/components/wheel-scene"), { ssr: false, loading: () => <span className="wheel-loading skeleton">Opening the light...</span> });

class SceneRecovery extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function WheelPicker({ emotions, children }: { emotions: readonly Emotion[]; children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [simple, setSimple] = useState(false);
  const [turn, setTurn] = useState(0);
  const [broad, setBroad] = useState<number | null>(null);
  const [intensity, setIntensity] = useState("medium");
  const drag = useRef<number | null>(null);
  const wheelDelta = useRef(0);
  const wheelTime = useRef(0);
  const dial = useRef<HTMLDivElement>(null);
  const unavailable = useCallback(() => setSimple(true), []);
  const rotate = useCallback((steps: number) => {
    setTurn(value => value + steps);
    try { navigator.vibrate?.(8); } catch { /* Haptics are optional. */ }
  }, []);
  useEffect(() => {
    if (broad !== null) dial.current?.querySelector("a")?.focus();
    else dial.current?.querySelector<HTMLButtonElement>(".wheel-lock")?.focus();
  }, [broad]);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(!needsSimplePicker(query.matches, navigator.hardwareConcurrency));
    sync(); query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const element = dial.current;
    if (!element) return;
    const scroll = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      wheelDelta.current += event.deltaY;
      if (Math.abs(wheelDelta.current) >= 40 && event.timeStamp - wheelTime.current > 160) {
        rotate(Math.sign(wheelDelta.current)); wheelDelta.current = 0; wheelTime.current = event.timeStamp;
      }
    };
    element.addEventListener("wheel", scroll, { passive: false });
    return () => element.removeEventListener("wheel", scroll);
  }, [enabled, simple, rotate]);
  const emotion = emotions[broad ?? wrapIndex(turn, emotions.length)];
  if (!emotion || !enabled || simple) return <>{enabled && simple && <p className="local-help" role="status">The simple picker is ready for you.</p>}{children}</>;
  const options = broad === null ? emotions : emotion.specifics;
  const selected = wrapIndex(turn, options.length);
  const choice = options[selected];
  const lock = () => { if (broad === null) { setBroad(selected); setTurn(0); } };
  return <div className="wheel-picker" data-emotion={emotion.id}>
    <div className="wheel-topline"><p className="eyebrow">{broad === null ? "01 / A broad feeling" : `02 / Within ${emotion.name.toLowerCase()}`}</p><button type="button" className="quiet-link" onClick={() => setSimple(true)}>Use simple picker</button></div>
    <p id="wheel-help" className="wheel-help">Drag across the dial, scroll, or use arrow keys. {broad === null ? "Press the center to choose." : "Choose the feeling that fits."}</p>
    <div ref={dial} className={`wheel-dial${broad !== null ? " wheel-inner" : ""}`} onPointerDown={event => {
      if (event.target instanceof Element && event.target.closest("button, a")) return;
      drag.current = event.clientX; event.currentTarget.dataset.dragging = "true"; event.currentTarget.setPointerCapture(event.pointerId);
    }} onPointerMove={event => {
      if (drag.current === null) return;
      const steps = Math.trunc((event.clientX - drag.current) / 36);
      if (steps) { rotate(steps); drag.current += steps * 36; }
    }} onPointerUp={event => { drag.current = null; event.currentTarget.dataset.dragging = "false"; }} onPointerCancel={event => { drag.current = null; event.currentTarget.dataset.dragging = "false"; }}>
      <SceneRecovery onUnavailable={unavailable}><Scene emotionId={emotion.id} inner={broad !== null} intensity={intensity} rotation={-turn * Math.PI * 2 / options.length} onUnavailable={unavailable} /></SceneRecovery>
      <div className="wheel-orbit" aria-hidden="true" />
      {broad === null && <div className="wheel-ring-labels" aria-hidden="true">{emotions.map((item, index) => {
        const angle = (index - selected) / emotions.length * Math.PI * 2;
        return <span key={item.id} style={{ left: "50%", top: "50%", transform: `translate(-50%, -50%) translate(${Math.sin(angle) * 42}cqw, ${-Math.cos(angle) * 42}cqw)` }} data-selected={selected === index}>{item.name}</span>;
      })}</div>}
      <div className="wheel-center" onKeyDown={event => {
        if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)) {
          event.preventDefault(); rotate(event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1);
        }
      }}>
        <p className="eyebrow">{broad === null ? "Turn toward a feeling" : emotion.name}</p>
        {broad === null ? <button type="button" className="wheel-lock" aria-describedby="wheel-help" onClick={lock}>{choice.name}<span>Press to choose</span></button> : <FeelingLink dawn emotionId={emotion.id} specificId={choice.id} name={choice.name} />}
      </div>
    </div>
    <p className="wheel-current" role="status" aria-live="polite">{selected + 1} of {options.length}: {choice.name}</p>
    <div className="wheel-navigation"><button type="button" className="compare-link" data-tooltip="Previous feeling" aria-label="Previous feeling" onClick={() => rotate(-1)}>←</button><span>Take your time.</span><button type="button" className="compare-link" data-tooltip="Next feeling" aria-label="Next feeling" onClick={() => rotate(1)}>→</button></div>
    <ul className="wheel-options" aria-label={broad === null ? "Broad emotions" : `Feelings within ${emotion.name}`}>
      {options.map((option, index) => <li key={option.id}><button type="button" aria-pressed={selected === index} onClick={() => { rotate(index - selected); }}>{option.name}</button></li>)}
    </ul>
    {broad !== null && <>
      <fieldset className="wheel-intensity"><legend>How strong does it feel?</legend>{["low", "medium", "high"].map(value => <label key={value}><input type="radio" name="intensity" value={value} checked={intensity === value} onChange={() => setIntensity(value)} />{value}</label>)}</fieldset>
      <p className="local-help">Intensity is just for this moment and is not saved in your journal.</p>
      <button type="button" className="compare-link" onClick={() => { setBroad(null); setTurn(broad); }}>Back to broad feelings</button>
    </>}
  </div>;
}
