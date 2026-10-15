import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { profile } from "../constants";
import useMediaQuery from "../hooks/useMediaQuery";
import useDragRotate from "../hooks/useDragRotate";
import store from "../scene/store";

const Hero = ({ webgl }) => {
  const scope = useRef(null);
  const isTouch = useMediaQuery("(pointer: coarse)");
  const stage = useRef(null);
  // The room is open on two sides; keep those facing the visitor.
  useDragRotate(stage, "hero", 1.15);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Waits for the loader to lift, then rises as the cloud lands on the room.
        const intro = gsap
          .timeline({ paused: !store.loaderDone, delay: 0.5, defaults: { ease: "power4.out" } })
          .from(".line > span", { yPercent: 110, duration: 1.2, stagger: 0.12 })
          .from(".hero-copy", { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 }, "-=0.7");
        const play = () => intro.restart(true); // true: keep the delay
        window.addEventListener("scene:ready", play, { once: true });

        // Scrolling away, the name stretches wide and lifts off.
        gsap.to(".hero-name", {
          yPercent: -30,
          opacity: 0.15,
          fontVariationSettings: '"wdth" 100, "opsz" 96',
          ease: "none",
          scrollTrigger: { trigger: scope.current, start: "top top", end: "bottom top", scrub: 0.4 },
        });
        return () => window.removeEventListener("scene:ready", play);
      });
      return () => mm.revert();
    },
    { scope }
  );

  return (
    <section id="top" ref={scope} data-formation="hero" className="relative lg:min-h-[100svh]">
      <div className="shell pointer-events-none relative z-10 grid pt-[calc(var(--nav-h)+3rem)] lg:min-h-[100svh] lg:grid-cols-12 lg:items-center lg:pt-[var(--nav-h)]">
        <div className="pointer-events-auto lg:col-span-6 xl:col-span-5">
          <h1 className="hero-name text-[clamp(4.25rem,15vw,9.5rem)]">
            <span className="line"><span>Jayesh</span></span>
            <span className="line"><span>Jadhav</span></span>
          </h1>

          <p className="hero-copy mt-8 max-w-[30ch] font-display text-2xl leading-snug text-lilac md:text-[1.75rem]">
            I build AI systems people can audit, and the full-stack apps around them.
          </p>

          <p className="hero-copy mt-5 max-w-[46ch] text-dim">
            Software development engineer intern at Capillary Technologies, Bengaluru. Final-year
            computer science at MIT Academy of Engineering.
          </p>

          <div className="hero-copy mt-9 flex flex-wrap gap-3">
            <a href="#work" data-magnetic className="btn btn-solid">View work</a>
            <a href={profile.resume} download data-magnetic className="btn btn-quiet">Download résumé</a>
          </div>
        </div>
      </div>

      {/* The shared scene draws the room here; this box only reserves the space. */}
      <div
        id="hero-stage"
        ref={stage}
        {...(webgl && { "data-cursor": "drag" })}
        {...(webgl && {
          tabIndex: 0,
          role: "img",
          "aria-label": "3D desk room. Drag, or use the arrow keys, to turn it.",
        })}
        className="drag-stage relative h-[62svh] min-h-[420px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[60%]"
      >
        {!webgl && (
          <img
            src="/images/hero-fallback.webp"
            alt="A desk setup inside a point cloud with three labelled clusters: UnderwriteAI, Timetable and ThreatLens."
            className="size-full object-cover"
          />
        )}
        {webgl && (
          <p className="hero-copy pointer-events-none absolute bottom-6 right-4 text-sm text-dim sm:right-8 lg:right-12">
            {isTouch
              ? "Swipe sideways to turn the room. Tap a cluster to jump to that project."
              : "Drag to turn the room. Select a cluster to jump to that project."}
          </p>
        )}
      </div>
    </section>
  );
};

export default Hero;
