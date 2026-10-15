"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { defaultCharacter, isSlowWheel, waveCharacters, waveHeight } from "@/lib/wheel";

export default function WheelScene({ emotionId, inner, intensity, rotation, onUnavailable }: {
  emotionId: string; inner: boolean; intensity: string; rotation: number; onUnavailable: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const target = useRef({ emotionId, inner, intensity, rotation });
  useEffect(() => { target.current = { emotionId, inner, intensity, rotation }; }, [emotionId, inner, intensity, rotation]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" }); }
    catch { onUnavailable(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, .1, 10);
    camera.position.z = 5;
    const geometry = new THREE.BoxGeometry(.018, 1, .025);
    const material = new THREE.MeshBasicMaterial({ color: defaultCharacter.color });
    const bars = new THREE.InstancedMesh(geometry, material, 128);
    bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    bars.frustumCulled = false;
    scene.add(bars);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const current = { ...defaultCharacter };
    let radius = 1.44, rotationNow = 0, frame = 0, previous = 0, sampleStart = 0, samples = 0, sampled = false, time = 0;
    const resize = () => renderer.setSize(element.clientWidth, element.clientHeight);
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    const render = (now: number) => {
      const delta = previous ? Math.min((now - previous) / 1000, .05) : 0;
      previous = now; time += delta;
      if (!sampleStart) sampleStart = now;
      samples++;
      if (!sampled && now - sampleStart >= 2000) {
        sampled = true;
        if (isSlowWheel(samples, now - sampleStart)) { onUnavailable(); return; }
      }
      const next = waveCharacters[target.current.emotionId] ?? defaultCharacter;
      const blend = 1 - Math.exp(-delta * 6);
      current.speed += (next.speed - current.speed) * blend;
      const strength = target.current.inner ? (target.current.intensity === "low" ? .6 : target.current.intensity === "high" ? 1.4 : 1) : 1;
      current.amplitude += (next.amplitude * strength - current.amplitude) * blend;
      current.smoothness += (next.smoothness - current.smoothness) * blend;
      material.color.lerp(color.set(next.color), blend);
      radius += ((target.current.inner ? 1.06 : 1.44) - radius) * blend;
      rotationNow += (target.current.rotation - rotationNow) * blend;
      for (let i = 0; i < 128; i++) {
        const angle = i / 128 * Math.PI * 2;
        const position = angle + rotationNow;
        dummy.position.set(Math.sin(position) * radius, Math.cos(position) * radius, 0);
        dummy.rotation.z = -position;
        dummy.scale.set(1, waveHeight(angle, time, current), 1);
        dummy.updateMatrix(); bars.setMatrixAt(i, dummy.matrix);
      }
      bars.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    const visibility = () => {
      cancelAnimationFrame(frame); previous = 0;
      if (!sampled) { sampleStart = 0; samples = 0; }
      if (!document.hidden) frame = requestAnimationFrame(render);
    };
    const lost = (event: Event) => { event.preventDefault(); onUnavailable(); };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", visibility); visibility();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      bars.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [onUnavailable]);
  return <div className="wheel-canvas" ref={host} aria-hidden="true" />;
}
