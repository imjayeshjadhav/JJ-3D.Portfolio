import { useEffect, useRef } from "react";
import gsap from "gsap";

const LABELS = { drag: "Drag", open: "Open", copy: "Copy" };
const INTERACTIVE = "[data-cursor], a, button, [role='button'], summary";

// A ring that trails the pointer and says what a click or drag will do.
// Fine pointers only; off under reduced motion, where the native cursor stays.
const Cursor = () => {
  const ring = useRef(null);
  const dot = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    const ok =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");
    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.35, ease: "power3" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.35, ease: "power3" });

    const onMove = (e) => {
      dot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      ringX(e.clientX);
      ringY(e.clientY);
      root.dataset.cursorVisible = "true";
    };
    const onOver = (e) => {
      const el = e.target.closest?.(INTERACTIVE);
      const typing = e.target.closest?.("input, textarea, select");
      const kind = el?.dataset.cursor;
      ring.current.dataset.state = typing ? "hidden" : kind ? "label" : el ? "link" : "idle";
      label.current.textContent = kind ? LABELS[kind] ?? "" : "";
    };
    const onLeave = () => (root.dataset.cursorVisible = "false");
    const onDown = () => ring.current.classList.add("is-pressed");
    const onUp = () => ring.current.classList.remove("is-pressed");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div aria-hidden="true" className="cursor-layer">
      <div ref={ring} className="cursor-ring" data-state="idle">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
};

export default Cursor;
