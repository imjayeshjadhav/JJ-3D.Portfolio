import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { projects } from "../constants";
import store from "../scene/store";
import PipelineDiagram from "../components/PipelineDiagram";
import TimetableVisual from "../components/TimetableVisual";
import CampusVisual from "../components/CampusVisual";

// Drawn stand-ins for projects without a public screenshot.
const VISUALS = { university: TimetableVisual, campuscompass: CampusVisual };
const ProjectVisual = ({ id }) => {
  const Visual = VISUALS[id] ?? TimetableVisual;
  return <Visual />;
};
import scrambleCount from "../utils/scrambleCount";

gsap.registerPlugin(ScrollTrigger);

const CaseStudy = ({ project, flip }) => (
  <article
    id={`work-${project.id}`}
   
    aria-labelledby={`work-${project.id}-title`}
    className="case-study grid items-start gap-10 border-t border-rule/60 py-16 md:py-24 lg:grid-cols-12 lg:gap-14"
  >
    {/* Sticky on desktop: the visual stays beside the longer text column. */}
    <figure
      className={`order-2 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:col-span-7 ${flip ? "lg:order-2" : "lg:order-1"}`}
    >
      <div className="case-frame [perspective:1400px]">
        <div className="case-shot relative overflow-hidden rounded-xl border border-rule bg-ink will-change-transform">
          {project.image ? (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              data-cursor="open"
              aria-label={`Open the ${project.name} live site`}
              className="block"
            >
              <img
                src={project.image}
                alt={project.imageAlt}
                width="1440"
                height="900"
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
              {/* Same image through the champagne gradient map; fades out to reveal colour. */}
              <img src={project.image} alt="" aria-hidden="true" loading="lazy" className="duotone absolute inset-0 size-full" />
            </a>
          ) : (
            <ProjectVisual id={project.id} />
          )}
        </div>
      </div>
      <figcaption className="mt-6">
        <p className="mb-3 text-sm text-muted">How it works.</p>
        <PipelineDiagram
          stages={project.pipeline}
          label={`${project.name} pipeline`}
        />
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tech stack">
          {project.stack.map((tech) => (
            <li key={tech} className="rounded-md border border-rule px-2.5 py-1 text-sm text-muted">
              {tech}
            </li>
          ))}
        </ul>

        {(project.live || project.source) && (
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {project.live && (
              <a href={project.live} target="_blank" rel="noreferrer" className="text-link">
                Open live site
              </a>
            )}
            {project.source && (
              <a href={project.source} target="_blank" rel="noreferrer" className="text-link">
                Read the source
              </a>
            )}
          </div>
        )}
        {!project.live && !project.source && (
          <p className="mt-8 text-sm text-muted">
            {project.privateNote ?? "The code is private to the team."} I&apos;m happy to walk through it on a call.
          </p>
        )}
      </figcaption>
    </figure>

    <div className={`order-1 lg:col-span-5 ${flip ? "lg:order-1" : "lg:order-2"}`}>
      <p className="text-sm text-muted">{project.period}</p>
      {project.award && <p className="mt-1 text-sm font-medium text-gold-soft">{project.award}</p>}
      <h3
        id={`work-${project.id}-title`}
        className="mt-3 text-4xl md:text-5xl"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {project.name}
      </h3>
      <p className="mt-5 text-lg text-fg">{project.summary}</p>

      <div className="case-metric mt-8 flex items-end gap-4 border-l-2 border-gold/70 pl-4">
        <p
          className="font-display text-7xl font-medium leading-[0.85] tracking-tight text-gold-soft"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          <span className="sr-only">{project.metric.value}</span>
          <span className="metric-figure" data-value={project.metric.value} aria-hidden="true">
            {project.metric.value}
          </span>
        </p>
        <p className="max-w-[22ch] pb-1 text-sm leading-snug text-gold">{project.metric.label}</p>
      </div>
      <p className="mt-4 text-fg">{project.result}</p>

      <h4 className="mt-8 font-medium text-gold">The problem</h4>
      <p className="mt-2 text-muted">{project.problem}</p>

      <h4 className="mt-6 font-medium text-gold">What I built</h4>
      <ul className="mt-2 space-y-2 text-muted">
        {project.built.map((line) => (
          <li key={line} className="relative pl-5">
            <span aria-hidden="true" className="absolute left-0 top-[0.7em] size-1.5 rounded-full bg-bronze" />
            {line}
          </li>
        ))}
      </ul>

    </div>
  </article>
);

const Work = () => {
  const scope = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Screenshots lean with scroll speed and settle when scrolling stops.
        const skews = gsap.utils.toArray(".case-shot").map((el) =>
          gsap.quickTo(el, "skewY", { duration: 0.5, ease: "power3" })
        );
        const lean = () => {
          const v = gsap.utils.clamp(-3, 3, store.velocity * 0.12);
          skews.forEach((to) => to(v));
        };
        gsap.ticker.add(lean);

        gsap.utils.toArray(".case-study").forEach((study) => {
          // Screenshot tips up out of the page as it arrives.
          gsap.fromTo(
            study.querySelector(".case-shot"),
            { rotateX: 22, scale: 0.9, y: 60, transformOrigin: "50% 100%" },
            {
              rotateX: 0,
              scale: 1,
              y: 0,
              ease: "none",
              scrollTrigger: { trigger: study, start: "top 95%", end: "top 35%", scrub: 0.6 },
            }
          );
          // Colour arrives once the shot has settled near the top of the view.
          gsap.fromTo(
            study.querySelector(".case-shot"),
            { "--color": 0 },
            {
              "--color": 1,
              ease: "none",
              scrollTrigger: { trigger: study.querySelector(".case-shot"), start: "top 55%", end: "top 20%", scrub: 0.6 },
            }
          );
          study.querySelectorAll(".metric-figure").forEach((el) => scrambleCount(el));
          // Pipeline stages light up in order, like data moving through.
          gsap.from(study.querySelectorAll(".pipeline-stage"), {
            borderColor: "#2a2d33",
            boxShadow: "inset 0 0px 0 #2a2d33",
            opacity: 0.35,
            stagger: 0.5,
            ease: "none",
            scrollTrigger: { trigger: study.querySelector("figcaption"), start: "top 85%", end: "top 45%", scrub: 0.6 },
          });
        });
        return () => gsap.ticker.remove(lean);
      });
      return () => mm.revert();
    },
    { scope }
  );

  return (
    <section id="work" ref={scope} className="section">
      <div className="shell">
        <div className="work-head">
          <h2 className="section-title">Selected work</h2>
          <p className="section-lede">
            Beyond Capillary: three systems where the model is only half the job. The other half is
            making its output something a coordinator, a student or a security analyst can trust.
          </p>
        </div>
        <div className="mt-16">
          {projects.map((project, i) => (
            <CaseStudy key={project.id} project={project} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
