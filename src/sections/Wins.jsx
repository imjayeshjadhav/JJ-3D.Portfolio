import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { wins } from "../constants";

gsap.registerPlugin(ScrollTrigger);

const Wins = () => {
  const scope = useRef(null);

  // Ranks scramble through random digits, then settle on the real number.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray(".rank-figure").forEach((el, i) => {
          const final = el.dataset.rank;
          const [, num = "", suffix = final] = final.match(/^(\d+)(.*)$/) ?? [];
          const target = Number(num);
          const state = { v: 0 };
          gsap.to(state, {
            v: target,
            duration: 1.6,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onStart: () => el.classList.add("is-counting"),
            onUpdate() {
              const p = this.progress();
              const digits =
                p < 0.55
                  ? Array.from(num, () => Math.floor(Math.random() * 10)).join("")
                  : String(Math.round(state.v));
              el.textContent = digits + suffix;
            },
            onComplete: () => {
              el.textContent = final;
              el.classList.remove("is-counting");
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope }
  );

  return (
    <section id="wins" ref={scope} data-formation="wins" className="section border-t border-rule/60">
      <div className="shell">
        <h2 className="section-title">Competitions and rankings</h2>

        <ol className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {wins.map((win) => (
            <li key={win.title} className="border-t border-rule pt-6">
              <p
                className="font-display text-7xl font-bold leading-none tracking-tight text-flame tabular-nums"
                style={{ fontVariationSettings: '"wdth" 75' }}
              >
                <span className="sr-only">{win.rank}</span>
                <span className="rank-figure" data-rank={win.rank} aria-hidden="true">
                  {win.rank}
                </span>
              </p>
              <p className="mt-2 text-ember">{win.of}</p>
              <h3 className="mt-6 font-sans text-lg font-semibold tracking-normal text-lilac">
                {win.title}
              </h3>
              <p className="mt-1 text-[0.95rem] text-dim">{win.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Wins;
