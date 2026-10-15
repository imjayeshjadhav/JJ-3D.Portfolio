import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { skills, stackIcons } from "../constants";
import store from "../scene/store";

gsap.registerPlugin(ScrollTrigger);

const TechStack = () => {
  const scope = useRef(null);

  // On desktop the section holds still while the network turns with scroll.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: scope.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          onUpdate: (self) => (store.stackProgress = self.progress),
        });
      });
      return () => mm.revert();
    },
    { scope }
  );

  return (
    <section
      id="stack"
      ref={scope}
      data-formation="stack"
      className="section stack-section border-t border-rule/60 md:flex md:min-h-[100svh] md:items-center md:py-20"
    >
      <div className="shell grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5 lg:col-span-4">
          <h2 className="section-title">Stack</h2>
          <p className="section-lede">
            What I reach for, drawn as a network: each layer is a kind of problem, each node a tool.
          </p>
          <p className="stack-hint mt-4 text-sm text-dim">Point at a node to trace its connections.</p>

          {/* Each slot holds a spinning 3D logo from the shared scene. */}
          <ul className="mt-10 grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-7 md:grid-cols-4 lg:grid-cols-5">
            {stackIcons.map(({ id, label }) => (
              <li key={id} className="flex flex-col items-center gap-1.5">
                <div data-icon3d={id} className="aspect-square w-full max-w-[76px] rounded-xl" aria-hidden="true" />
                <span className="text-center text-xs text-dim">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The full list: shown on touch and small screens, read by screen readers everywhere. */}
        <dl className="stack-list md:col-span-12">
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
