import { useEffect } from "react";

import store from "../scene/store";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Lets a DOM "stage" turn the 3D model drawn behind it: drag with a mouse or
// a horizontal swipe (vertical swipes still scroll), or use the arrow keys.
// maxYaw limits how far it turns (radians); Infinity lets it spin freely.
const useDragRotate = (ref, key, maxYaw = Infinity) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const d = store.drag[key];
    let start = null;

    const onDown = (e) => {
      if (e.button !== 0) return;
      start = { x: e.clientX, y: e.clientY, ry: d.y, rx: d.x };
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
    };
    const onMove = (e) => {
      if (!start) return;
      d.y = clamp(start.ry + (e.clientX - start.x) * 0.006, -maxYaw, maxYaw);
      d.x = clamp(start.rx + (e.clientY - start.y) * 0.004, -0.35, 0.45);
    };
    const onUp = () => {
      start = null;
      el.classList.remove("is-dragging");
    };
    const onKey = (e) => {
      const step = { ArrowLeft: [0, -0.25], ArrowRight: [0, 0.25], ArrowUp: [-0.1, 0], ArrowDown: [0.1, 0] }[e.key];
      if (!step) return;
      e.preventDefault();
      d.x = clamp(d.x + step[0], -0.35, 0.45);
      d.y = clamp(d.y + step[1], -maxYaw, maxYaw);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("keydown", onKey);
    };
  }, [ref, key, maxYaw]);
};

export default useDragRotate;
