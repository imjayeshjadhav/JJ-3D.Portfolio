import { lazy, Suspense, useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import SceneBoundary from "./components/SceneBoundary";
import useSmoothScroll from "./hooks/useSmoothScroll";
import Hero from "./sections/Hero";
import Wins from "./sections/Wins";
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
  }, [webgl]);

  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-flame focus:px-4 focus:py-2 focus:text-night"
      >
        Skip to work
      </a>

      {webgl && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <SceneCanvas />
          </Suspense>
        </SceneBoundary>
      )}
      {/* 3D labels render here: above content, below the navbar. */}
      <div id="scene-overlay" className="pointer-events-none fixed inset-0 z-20 overflow-hidden" />

      <Navbar />
      <main className="relative z-10">
        <Hero webgl={webgl} />
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
