import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { skills, stackIcons } from "../constants";
import store from "../scene/store";
import projectsUsing from "../utils/skillProjects";

gsap.registerPlugin(ScrollTrigger);

const N = stackIcons.length;

// Where a tool shows up in the featured work, as links to those case studies.
const UsedIn = ({ skill }) => {
  const used = projectsUsing(skill);
  if (used.length === 0) return <>Part of my everyday toolkit.</>;
  return (
    <>
      Used in{" "}
      {used.map((p, i) => (
        <span key={p.id}>
          <a href={`#work-${p.id}`} className="text-link text-lilac">
            {p.shortName ?? p.name}
          </a>
          {i < used.length - 2 ? ", " : i === used.length - 2 ? " and " : ""}
        </span>
      ))}
      .
    </>
  );
};

const groupOf = (skill) => skills.find((g) => g.items.includes(skill))?.group;

const TechStack = () => {
  const scope = useRef(null);
  const [front, setFront] = useState(0);

  // The ring reports which tool is at the front.
  useEffect(() => {
    const onFront = (e) => setFront(e.detail);
    window.addEventListener("stack:front", onFront);
    return () => window.removeEventListener("stack:front", onFront);
  }, []);

  // Scrolling turns the ring through every tool once. On desktop the ring
  // holds in place while it turns; on phones it turns as it passes.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const turn = (self) => (store.ring.scroll = self.progress * (N - 1));
      mm.add("(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({ trigger: ".stack-pin", start: "top top", end: "+=160%", pin: true, onUpdate: turn });
      });
      mm.add("not ((min-width: 768px) and (pointer: fine)) and (prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({ trigger: ".stack-pin", start: "top 70%", end: "bottom 10%", onUpdate: turn });
      });
      return () => mm.revert();
    },
    { scope }
  );

  const nudge = (step) => (store.ring.offset += step);
  const tool = stackIcons[front];

  return (
    <section id="stack" ref={scope} data-formation="stack" className="section">
      <div className="stack-pin flex flex-col justify-center md:min-h-[100svh]">
        <div className="shell">
          <h2 className="section-title">Stack</h2>
          <p className="section-lede">
            The tools I reach for. Scroll to turn the ring: the one in front shows where I&apos;ve used it.
          </p>

          {/* The shared scene draws the 3D ring of tools here. */}
          <div id="stack-stage" aria-hidden="true" className="mt-6 h-[280px] w-full md:h-[360px]" />

          <div className="mt-2 flex items-center justify-center gap-4 sm:gap-8">
            <button
              type="button"
              onClick={() => nudge(-1)}
              aria-label="Previous tool"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-rule text-lilac transition-colors hover:border-ember hover:text-flame"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div aria-live="polite" className="min-h-[6.5rem] w-full max-w-md text-center">
              <p className="text-sm text-ember">{groupOf(tool.skill)}</p>
              <p
                className="mt-1 font-display text-4xl font-bold text-flame md:text-5xl"
                style={{ fontVariationSettings: '"wdth" 85' }}
              >
                {tool.label}
              </p>
              <p className="mt-2 text-sm text-dim">
                <UsedIn skill={tool.skill} />
              </p>
            </div>

            <button
              type="button"
              onClick={() => nudge(1)}
              aria-label="Next tool"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-rule text-lilac transition-colors hover:border-ember hover:text-flame"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Everything else, grouped by the kind of problem it solves. */}
      <div className="shell mt-16">
        <dl>
          {skills.map(({ group, items }) => (
            <div key={group} className="grid gap-3 border-t border-rule/60 py-6 md:grid-cols-12 md:gap-8">
              <dt className="font-medium text-flame md:col-span-3">{group}</dt>
              <dd className="md:col-span-9">
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-lilac">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default TechStack;
