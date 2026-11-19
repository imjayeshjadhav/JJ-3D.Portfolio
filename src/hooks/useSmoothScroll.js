import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import store from "../scene/store";

gsap.registerPlugin(ScrollTrigger);

// Lenis smooth scroll driving GSAP's ticker, plus the page-wide scroll
// effects that aren't owned by a single section.
const useSmoothScroll = () => {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    store.reducedMotion = mql.matches;
    const onChange = (e) => (store.reducedMotion = e.matches);
    mql.addEventListener("change", onChange);
    if (mql.matches) return () => mql.removeEventListener("change", onChange);

    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } });
    store.lenis = lenis;
    if (!store.loaderDone && document.documentElement.style.overflow === "hidden") lenis.stop();
    lenis.on("scroll", (l) => {
      store.velocity = l.velocity;
      ScrollTrigger.update();
    });
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Section titles tighten and settle into place as they arrive.
    const titles = gsap.utils.toArray(".section-title").map((el) =>
      gsap.fromTo(
        el,
        { letterSpacing: "0.02em", opacity: 0.35 },
        {
          letterSpacing: "-0.025em",
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 95%", end: "top 45%", scrub: 0.5 },
        }
      )
    );

    return () => {
      titles.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      gsap.ticker.remove(raf);
      lenis.destroy();
      store.lenis = null;
      mql.removeEventListener("change", onChange);
    };
  }, []);
};

export default useSmoothScroll;
