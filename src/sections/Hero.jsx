import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { profile } from "../constants";
import leetcode from "../data/leetcode.json";
import useMediaQuery from "../hooks/useMediaQuery";
import useDragRotate from "../hooks/useDragRotate";
import store from "../scene/store";

const HEADLINE = [
  "I build production AI systems:",
  "the scoring, the guardrails,",
  "and the tests that keep them honest.",
];

// Four facts a recruiter can check, straight from the résumé.
const PROOF = [
  { value: "1st", label: "of 481 teams, Smart India Hackathon 2025" },
  { value: "2nd", label: "worldwide, NeoBIM Global Hackathon 2026" },
  { value: "2,200+", label: "automated tests on the Capillary codebase I work in" },
  { value: String(leetcode.solved.all), label: "LeetCode problems solved" },
];

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
          .from(".line > span", { yPercent: 110, duration: 1.2, stagger: 0.1 })
          .from(".hero-copy", { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 }, "-=0.8");
        const play = () => intro.restart(true); // true: keep the delay
        window.addEventListener("scene:ready", play, { once: true });

        // Scrolling away, the headline lifts off and fades.
        gsap.to(".hero-headline", {
          yPercent: -25,
          opacity: 0.15,
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
      <div className="shell pointer-events-none relative z-10 flex flex-col pt-[calc(var(--nav-h)+2.5rem)] lg:min-h-[100svh] lg:pt-[var(--nav-h)]">
        <div className="pointer-events-auto lg:my-auto lg:w-[52%]">
          <p className="hero-copy max-w-[44ch] text-muted">
            <span className="text-fg">{profile.name}</span>, software development engineer intern at Capillary
            Technologies in Bengaluru.
          </p>

          <h1 className="hero-headline hero-name mt-6 text-[clamp(2.4rem,4.3vw,4.15rem)]">
            {HEADLINE.map((line) => (
              <span key={line} className="line">
                <span>{line}</span>
              </span>
            ))}
          </h1>

          <p className="hero-copy mt-7 max-w-[46ch] text-lg text-muted">
            Final-year computer science at MIT Academy of Engineering, and team lead of the Smart India
            Hackathon 2025 national winners.
          </p>

          <div className="hero-copy mt-9 flex flex-wrap gap-3">
            <a href="#capillary" data-magnetic className="btn btn-solid">See the Capillary work</a>
            <a href={profile.resume} download data-magnetic className="btn btn-quiet">Download résumé</a>
          </div>
        </div>

        {/* Proof strip: the claims above, made checkable. */}
        <dl className="hero-copy pointer-events-auto mt-14 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-rule pt-6 pb-8 lg:mt-0 lg:grid-cols-4">
          {PROOF.map(({ value, label }) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd>
                <span
                  className="block font-display text-3xl font-medium text-gold-soft md:text-4xl"
                  style={{ fontVariationSettings: '"opsz" 144' }}
                >
                  {value}
                </span>
                <span aria-hidden="true" className="mt-1 block max-w-[24ch] text-sm leading-snug text-muted">
                  {label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* The shared scene draws the room here; this box only reserves the space. */}
      <div
        id="hero-stage"
        ref={stage}
        {...(webgl && {
          "data-cursor": "drag",
          tabIndex: 0,
          role: "img",
          "aria-label": "3D desk room. Drag, or use the arrow keys, to turn it.",
        })}
        className="drag-stage relative h-[56svh] min-h-[380px] lg:absolute lg:top-0 lg:right-0 lg:bottom-[150px] lg:h-auto lg:w-[52%]"
      >
        {!webgl && (
          <img
            src="/images/hero-fallback.webp"
            alt="A desk setup inside a point cloud, with labelled clusters for each featured project."
            className="size-full object-cover"
          />
        )}
        {webgl && (
          <p className="hero-copy pointer-events-none absolute bottom-3 right-4 text-sm text-muted sm:right-8 lg:right-12">
            {isTouch ? "Swipe sideways to turn the room." : "Drag to turn the room. Select a label to jump to that work."}
          </p>
        )}
      </div>
    </section>
  );
};

export default Hero;
