import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { experience } from "../constants";

gsap.registerPlugin(ScrollTrigger);

const LogoTile = ({ item }) => (
  <div className="[perspective:800px]">
    <div className="logo-tile flex h-16 min-w-24 items-center justify-center rounded-xl border border-rule bg-plum px-4 shadow-[0_10px_40px_-12px_rgba(181,54,122,0.45)]">
      {item.logo ? (
        <img
          src={item.logo.src}
          alt={item.logo.alt}
          className={item.logo.wide ? "h-5 w-auto" : "size-10 object-contain"}
          loading="lazy"
        />
      ) : (
        <span
          className="font-display text-2xl font-bold text-flame"
          style={{ fontVariationSettings: '"wdth" 75' }}
          aria-label={`${item.org} monogram`}
        >
          {item.monogram}
        </span>
      )}
    </div>
  </div>
);

const ExperienceSection = () => {
  const scope = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The progress line fills as you read down the timeline.
        gsap.fromTo(
          ".timeline-progress",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: ".timeline-list", start: "top 70%", end: "bottom 60%", scrub: 0.4 },
          }
        );
        // Each logo flips over like a card being turned face up.
        gsap.utils.toArray(".exp-item").forEach((item) => {
          gsap.fromTo(
            item.querySelector(".logo-tile"),
            { rotateY: -110, opacity: 0 },
            {
              rotateY: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: item, start: "top 90%", end: "top 55%", scrub: 0.5 },
            }
          );
          gsap.fromTo(
            item.querySelector(".exp-body"),
            { x: 40, opacity: 0.2 },
            {
              x: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: item, start: "top 88%", end: "top 55%", scrub: 0.5 },
            }
          );
        });
      });
      return () => mm.revert();
    },
    { scope }
  );

  return (
    <section
      id="experience"
      ref={scope}
      data-formation="experience"
      className="section border-t border-rule/60"
    >
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
            <h2 className="section-title">Experience</h2>
            <p className="section-lede">
              The helix behind this list is the same timeline: each bright node is one of these roles.
            </p>
          </div>
        </div>

        <div className="relative lg:col-span-8">
          <div aria-hidden="true" className="absolute bottom-2 left-[5px] top-2 w-px bg-rule">
            <div
              className="timeline-progress size-full origin-top"
              style={{ background: "linear-gradient(180deg, var(--color-flame), var(--color-ember), var(--color-rose))" }}
            />
          </div>

          <ol className="timeline-list space-y-20">
            {experience.map((item, i) => (
              <li key={item.org} data-exp-index={i} className="exp-item relative pl-10">
                <span aria-hidden="true" className="absolute left-0 top-6 size-[11px] rounded-full border-2 border-night bg-ember" />
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="shrink-0">
                    <LogoTile item={item} />
                  </div>
                  <div className="exp-body">
                    <p className="text-sm text-dim">
                      {item.period}
                      <span className="mx-2 text-rule" aria-hidden="true">/</span>
                      {item.place}
                    </p>
                    <h3 className="mt-2 text-3xl md:text-4xl">{item.org}</h3>
                    <p className="mt-1 font-medium text-ember">{item.role}</p>
                    <p className="mt-4 max-w-[62ch] text-dim">{item.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
