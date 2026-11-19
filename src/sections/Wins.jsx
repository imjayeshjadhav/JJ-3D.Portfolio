import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { leadership, wins } from "../constants";
import scrambleCount from "../utils/scrambleCount";

const Wins = () => {
  const scope = useRef(null);

  // Ranks scramble through random digits, then settle on the real number.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray(".rank-figure").forEach((el, i) => scrambleCount(el, { delay: i * 0.12 }));
      });
      return () => mm.revert();
    },
    { scope }
  );

  return (
    <section id="wins" ref={scope} data-formation="wins" className="py-32 md:py-48">
      <div className="shell">
        <h2 className="section-title">Wins and leadership</h2>

        <ol className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {wins.map((win) => (
            <li key={win.title} className="border-t border-rule pt-6">
              <p
                className="font-display text-7xl font-medium lg:text-8xl leading-none tracking-tight text-gold-soft tabular-nums"
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                <span className="sr-only">{win.rank}</span>
                <span className="rank-figure" data-value={win.rank} aria-hidden="true">
                  {win.rank}
                </span>
              </p>
              <p className="mt-2 text-gold">{win.of}</p>
              <h3 className="mt-6 font-sans text-lg font-semibold tracking-normal text-fg">
                {win.title}
              </h3>
              <p className="mt-1 text-[0.95rem] text-muted">{win.note}</p>
            </li>
          ))}
        </ol>

        <ul className="mt-20 grid gap-x-8 gap-y-10 border-t border-rule pt-10 md:grid-cols-2">
          {leadership.map((role) => (
            <li key={role.title}>
              <h3 className="text-2xl md:text-3xl">{role.title}</h3>
              <p className="mt-2 text-sm text-gold">{role.org}</p>
              <p className="mt-3 max-w-[52ch] text-muted">{role.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Wins;
