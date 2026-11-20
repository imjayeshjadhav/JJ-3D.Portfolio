import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { capillary } from "../constants";
import ChmDiagram from "../components/ChmDiagram";
import AskChmVignette from "../components/AskChmVignette";
import scrambleCount from "../utils/scrambleCount";

// The internship, told as a case study: what Client Health Monitor is, how
// it fits together, and the numbers. Everything here is on the résumé.
const Capillary = () => {
  const scope = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray(".cap-figure").forEach((el, i) => scrambleCount(el, { delay: i * 0.1 }));
      });
      return () => mm.revert();
    },
    { scope }
  );

  return (
    <section id="capillary" ref={scope} className="section border-t border-rule/60">
      <div className="shell">
        <div className="cap-head">
        <div className="flex items-center gap-4">
          <img src="/images/experience/capillary.png" alt="" className="size-10 rounded-lg bg-surface p-1.5" />
          <p className="text-muted">
            <span className="text-fg">Now at {capillary.org}</span>, {capillary.role.toLowerCase()}, {capillary.period},{" "}
            {capillary.place}
          </p>
        </div>

        <h2 className="section-title mt-8 max-w-[14ch]">{capillary.project}</h2>
        <p className="mt-6 max-w-[34ch] font-display text-2xl leading-snug text-fg md:text-3xl">{capillary.lead}</p>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-rule py-8 lg:grid-cols-4">
          {capillary.metrics.map(({ value, label }) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd>
                <span
                  className="block font-display text-5xl font-medium text-gold-soft md:text-6xl"
                  style={{ fontVariationSettings: '"opsz" 144' }}
                >
                  <span className="sr-only">{value}</span>
                  <span className="cap-figure" data-value={value} aria-hidden="true">
                    {value}
                  </span>
                </span>
                <span aria-hidden="true" className="mt-2 block max-w-[24ch] text-sm text-muted">
                  {label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-16">
          <div className="cap-panel rounded-3xl border border-rule bg-surface/70 p-5 sm:p-8 lg:p-12">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
              <h3 className="text-3xl md:text-4xl">How it fits together</h3>
              <p className="text-sm text-muted">Five sources in, one score out, with Claude and Ask CHM on top.</p>
            </div>
            <div className="mt-8">
              <ChmDiagram />
            </div>
          </div>

          <div className="cap-built mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <h3 className="font-sans text-lg font-semibold tracking-normal text-ivory">What I built</h3>
              <ul className="mt-4 space-y-4 text-muted">
                {capillary.points.map((line) => (
                  <li key={line} className="relative pl-5 leading-relaxed">
                    <span aria-hidden="true" className="absolute left-0 top-[0.7em] size-1.5 rounded-full bg-gold" />
                    {line}
                  </li>
                ))}
              </ul>
              <ul className="mt-8 flex flex-wrap gap-2" aria-label="Built with">
                {capillary.stack.map((tech) => (
                  <li key={tech} className="rounded-md border border-rule px-2.5 py-1 text-sm text-muted">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            <AskChmVignette />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Capillary;
