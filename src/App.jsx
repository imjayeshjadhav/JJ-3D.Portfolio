import { lazy, Suspense, useEffect, useState } from "react";
import gsap from "gsap";

import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import Cursor from "./components/Cursor";
import Toast from "./components/Toast";
import CommandPalette from "./components/CommandPalette";
import store from "./scene/store";
import SceneBoundary from "./components/SceneBoundary";
import useSmoothScroll from "./hooks/useSmoothScroll";
import Hero from "./sections/Hero";
import Wins from "./sections/Wins";
import About from "./sections/About";
import Work from "./sections/Work";
import ExperienceSection from "./sections/ExperienceSection";
import TechStack from "./sections/TechStack";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";

// three.js ships in its own chunk so the text paints first.
const SceneCanvas = lazy(() => import("./scene/SceneCanvas"));

const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

const App = () => {
  const [webgl] = useState(hasWebGL);
  useSmoothScroll();

  useEffect(() => {
    document.documentElement.classList.toggle("no-webgl", !webgl);
    // Without a 3D scene there is nothing to load: start the hero right away.
    if (!webgl) {
      store.loaderDone = true;
      window.dispatchEvent(new Event("scene:ready"));
    }
  }, [webgl]);

  // Magnetic buttons: [data-magnetic] elements lean a few pixels toward the pointer.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups = [...document.querySelectorAll("[data-magnetic]")].map((el) => {
      const toX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const toY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      const move = (e) => {
        const r = el.getBoundingClientRect();
        toX(gsap.utils.clamp(-6, 6, (e.clientX - (r.left + r.width / 2)) * 0.2));
        toY(gsap.utils.clamp(-6, 6, (e.clientY - (r.top + r.height / 2)) * 0.3));
      };
      const leave = () => {
        toX(0);
        toY(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-flame focus:px-4 focus:py-2 focus:text-night"
      >
        Skip to work
      </a>

      {webgl && <Loader />}
      <Cursor />
      <Toast />
      <CommandPalette />

      {webgl && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <SceneCanvas />
          </Suspense>
        </SceneBoundary>
      )}
      {/* Gradient map used to tint project screenshots into the magma palette. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id="magma-duotone" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.07 0.71 0.97 0.99" />
            <feFuncG type="table" tableValues="0.04 0.21 0.52 0.95" />
            <feFuncB type="table" tableValues="0.14 0.48 0.36 0.69" />
          </feComponentTransfer>
        </filter>
      </svg>

      {/* 3D labels render here: above content, below the navbar. */}
      <div id="scene-overlay" className="pointer-events-none fixed inset-0 z-20 overflow-hidden" />

      <Navbar />
      <main className="relative z-10">
        <Hero webgl={webgl} />
        <About />
        <Work />
        <Wins />
        <ExperienceSection />
        <TechStack />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default App;
