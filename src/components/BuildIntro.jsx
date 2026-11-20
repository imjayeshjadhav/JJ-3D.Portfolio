import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import store from "../scene/store";
import { addCrew, exitPoint } from "../utils/buildEngine";
import scrambleCount from "../utils/scrambleCount";
import { CREW, CREW_MOBILE } from "../constants/buildCrew";

const ROOM_WAIT_MS = 6500; // from mount: the longest the intro waits for the 3D room

// Strictly inside the viewport: the hero layer is fixed, so anything a
// cursor cannot reach on screen just appears instead.
const onScreen = (r) =>
  r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight + 4 && r.left < window.innerWidth;

// On every load, a crew of cursors, each named for a tool from the résumé,
// flies in and builds the landing page while the 3D room loads.
// Reduced motion shows the page straight away. (useSectionBuilds does the
// same for each section further down as it scrolls into view.)
const BuildIntro = ({ webgl }) => {
  const [building] = useState(() => document.documentElement.classList.contains("building"));
  const [crew] = useState(() => (window.matchMedia("(max-width: 767px)").matches ? CREW_MOBILE : CREW));
  const [gone, setGone] = useState(!building);
  const root = useRef(null);
  const layer = useRef(null);
  const grid = useRef(null);
  const skipRef = useRef(() => {});

  useEffect(() => {
    const html = document.documentElement;
    const layerEl = layer.current;
    const mounted = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let cancelled = false;
    let finished = false;
    let frameDrawn = !building;
    let placed = false;
    let timelineDone = false;
    let roomUiDone = false;
    let tl = null;
    let stage = null;
    const scrambles = [];

    const roomReady = () => !webgl || store.sceneReady || performance.now() - mounted > ROOM_WAIT_MS;

    const finish = () => {
      if (finished) return;
      finished = true;
      html.classList.remove("building");
      document.querySelectorAll("[data-build]").forEach((el) => {
        el.style.clipPath = "";
        el.style.opacity = "";
      });
      scrambles.forEach((t) => t?.progress(1));
      if ("scrollRestoration" in history) history.scrollRestoration = "auto";
      html.style.overflow = "";
      store.lenis?.start();
      store.loaderDone = true;
      window.dispatchEvent(new Event("scene:ready"));
      window.dispatchEvent(new Event("intro:done"));
      if (root.current) gsap.to(root.current, { autoAlpha: 0, duration: 0.45, onComplete: () => setGone(true) });
      if (grid.current) gsap.to(grid.current, { opacity: 0, duration: 0.8 });
    };
    const maybeFinish = () => timelineDone && roomUiDone && finish();

    // The room grows into its frame once the frame is drawn and the scene
    // has loaded. Runs on its own clock, so skipping never strands it.
    const watchRoom = () => {
      if (cancelled) return;
      const label = stage?.box.querySelector(".build-room");
      if (label && !placed) label.textContent = `Room ${Math.round(webgl ? store.loadProgress : 100)}%`;
      if (frameDrawn && !placed && roomReady()) {
        placed = true;
        if (reduced) store.introProgress = 1;
        else gsap.to(store, { introProgress: 1, duration: 1.3, ease: "back.out(1.5)" });
        const out = gsap.timeline({ onComplete: () => ((roomUiDone = true), maybeFinish()) });
        out.to({}, { duration: 0.3 }, 0);
        if (label) out.to(label, { autoAlpha: 0, duration: 0.2 }, 0);
        if (stage) {
          out.to(stage.box, { autoAlpha: 0, duration: 0.5 }, 0.35);
          const [ex, ey] = exitPoint([gsap.getProperty(stage.cursor, "x"), gsap.getProperty(stage.cursor, "y")]);
          out.to(stage.cursor, { x: ex, y: ey, duration: 0.7, ease: "power2.in" }, 0.3);
        }
        if (finished) out.progress(1);
      }
      if (!placed) frame = requestAnimationFrame(watchRoom);
    };

    if (!building) {
      // Reduced motion: the page is already there.
      store.loaderDone = true;
      window.dispatchEvent(new Event("scene:ready"));
      window.dispatchEvent(new Event("intro:done"));
      frame = requestAnimationFrame(watchRoom);
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    html.style.overflow = "hidden";
    store.lenis?.stop();

    const skip = () => {
      if (finished || cancelled) return;
      frameDrawn = true;
      tl?.progress(1);
      timelineDone = true;
      roomUiDone = true;
      finish();
    };
    skipRef.current = skip;
    const onKey = (e) => {
      if (["Escape", " ", "Enter", "ArrowDown", "PageDown", "End"].includes(e.key)) skip();
    };
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", skip);

    const build = () => {
      if (cancelled) return;
      const targets = Object.fromEntries(
        [...document.querySelectorAll("[data-build]")].map((el) => [el.dataset.build, el])
      );
      tl = gsap.timeline({
        onComplete: () => {
          timelineDone = true;
          maybeFinish();
        },
      });
      tl.to(grid.current, { opacity: 1, duration: 0.6 }, 0);
      tl.from(".build-skip", { autoAlpha: 0, y: 8, duration: 0.5 }, 0.15);

      const result = addCrew(tl, {
        crew,
        layer: layerEl,
        resolve: (name) => targets[name],
        reach: onScreen,
        scrambles,
      });
      const { handled } = result;
      stage = result.stage;

      if (stage) {
        // The frame shows the room's load progress once it is open.
        stage.box.insertAdjacentHTML("beforeend", '<span class="build-room">Room 0%</span>');
        const room = stage.box.querySelector(".build-room");
        gsap.set(room, { autoAlpha: 0 });
        tl.to(room, { autoAlpha: 1, duration: 0.3 }, stage.end);
        tl.call(() => (frameDrawn = true), null, stage.end);
      } else if (targets.stage) {
        tl.call(() => (frameDrawn = true), null, handled.get(targets.stage) ?? 0.4);
      }

      // Anything the crew did not touch appears with whatever contains it.
      Object.values(targets).forEach((el) => {
        if (handled.has(el)) return;
        const parent = el.parentElement?.closest("[data-build]");
        const at = (parent && handled.get(parent)) ?? 0.4;
        tl.fromTo(el, { clipPath: "none", opacity: 0 }, { opacity: 1, duration: 0.45 }, at);
        if (el.dataset.value) tl.call(() => scrambles.push(scrambleCount(el)), null, at);
        if (el === targets.stage) tl.call(() => (frameDrawn = true), null, at);
      });
      tl.to(".build-skip", { autoAlpha: 0, duration: 0.4 }, ">-0.2");

      frame = requestAnimationFrame(watchRoom);
      if (import.meta.env.DEV) window.__buildTimeline = tl; // lets screenshot scripts seek
    };

    // Measure after the fonts settle, or the boxes will not match the text.
    Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 900))]).then(build);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      tl?.kill();
      layerEl?.replaceChildren();
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", skip);
    };
  }, [building, crew, webgl]);

  if (gone) return null;

  return (
    <>
      <div ref={grid} aria-hidden="true" className="build-grid" />
      <div ref={root} className="build-root">
        <div ref={layer} aria-hidden="true" className="build-layer" />
        <p role="status" className="sr-only">
          {crew.length} tools are building this page.
        </p>
        <button type="button" className="build-skip" onClick={() => skipRef.current()}>
          <span aria-hidden="true" className="build-dots">
            {crew.map(({ tool, tone }) => (
              <i key={tool} style={{ background: tone }} />
            ))}
          </span>
          Skip intro
        </button>
      </div>
    </>
  );
};

export default BuildIntro;
