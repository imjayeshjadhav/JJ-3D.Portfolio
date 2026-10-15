import { useEffect, useRef, useState } from "react";

import store from "../scene/store";

const MAX_WAIT_MS = 6000;

// Covers the page while the 3D scene loads, then lifts away and hands over
// to the intro, where the particles converge on the room.
const Loader = () => {
  const [phase, setPhase] = useState("loading"); // loading | leaving | done
  const number = useRef(null);
  const bar = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    const root = document.documentElement;
    root.style.overflow = "hidden";
    store.lenis?.stop();
    let shown = 0;
    let frame;

    const finish = () => {
      root.style.overflow = "";
      store.lenis?.start();
      store.loaderDone = true;
      window.dispatchEvent(new Event("scene:ready"));
      setPhase("done");
    };

    const tick = () => {
      const ready = store.sceneReady || performance.now() - started > MAX_WAIT_MS;
      const target = ready ? 100 : Math.min(store.loadProgress, 96);
      shown += (target - shown) * (reduced ? 1 : 0.12);
      if (number.current) number.current.textContent = String(Math.round(shown));
      if (bar.current) bar.current.style.transform = `scaleX(${shown / 100})`;
      if (ready && shown > 99.5) {
        if (reduced) return finish();
        setPhase("leaving");
        setTimeout(finish, 450);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      root.style.overflow = "";
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[80] flex flex-col items-center justify-center bg-night transition-opacity duration-[450ms] ${
        phase === "leaving" ? "opacity-0" : "opacity-100"
      }`}
    >
      <p className="sr-only">Loading the 3D scene</p>
      <p
        aria-hidden="true"
        className="font-display text-7xl font-bold tabular-nums text-flame"
        style={{ fontVariationSettings: '"wdth" 75' }}
      >
        <span ref={number}>0</span>
        <span className="text-3xl text-ember">%</span>
      </p>
      <div aria-hidden="true" className="mt-6 h-[2px] w-48 overflow-hidden rounded-full bg-rule">
        <div ref={bar} className="size-full origin-left" style={{ background: "var(--ramp)", transform: "scaleX(0)" }} />
      </div>
      <p aria-hidden="true" className="mt-4 text-sm text-dim">
        Loading the scene
      </p>
    </div>
  );
};

export default Loader;
