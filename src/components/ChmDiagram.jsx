import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import store from "../scene/store";
import useMediaQuery from "../hooks/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

// How Client Health Monitor fits together, from the résumé. The index of
// each node matches PIPELINE_ANCHORS.capillary, so pointing at a node also
// lights that part of the particle gauge behind the section.
const NODES = [
  { id: "sources", x: 18, y: 40, w: 150, h: 300, title: "Five sources", lines: ["New Relic", "Jira", "ServiceNow", "Databricks", "NPS"], detail: "New Relic, Jira, ServiceNow, Databricks and NPS: five systems that never used to share one view." },
  { id: "python", x: 222, y: 160, w: 120, h: 60, title: "Python jobs", detail: "Python jobs pull each source on a schedule and load it into BigQuery." },
  { id: "bigquery", x: 392, y: 160, w: 120, h: 60, title: "BigQuery", detail: "BigQuery holds the combined data every score is computed from." },
  { id: "score", x: 562, y: 150, w: 140, h: 80, title: "Health score", sub: "0–10 per client", detail: "One 0–10 health score for each of hundreds of enterprise clients." },
  { id: "alerts", x: 562, y: 300, w: 140, h: 60, title: "SLA alerts", sub: "11 Cloud Run jobs", detail: "11 Cloud Run jobs watch SLAs and raise alerts when a client slips." },
  { id: "triage", x: 372, y: 290, w: 160, h: 80, title: "Claude triage", sub: "3-step validation", detail: "Claude triages issues and writes client summaries as structured JSON. Every flagged issue passes a 3-step validation whose rules were set by backtesting, because a false alarm is costly." },
  { id: "ask", x: 562, y: 30, w: 140, h: 60, title: "Ask CHM", sub: "chat, streamed", detail: "Ask CHM: plain-English questions about client health, with multi-turn context and streamed answers." },
];

// Laid out wide: the diagram gets a full-width row of its own.
const SX = 1.42;
for (const n of NODES) n.x = Math.round(n.x * SX);
const byId = Object.fromEntries(NODES.map((n, i) => [n.id, { ...n, i }]));
const right = (n) => [n.x + n.w, n.y + n.h / 2];
const left = (n) => [n.x, n.y + n.h / 2];
const top = (n) => [n.x + n.w / 2, n.y];
const bottom = (n) => [n.x + n.w / 2, n.y + n.h];
const curve = ([x1, y1], [x2, y2]) => {
  const dx = (x2 - x1) * 0.5;
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
};
const vcurve = ([x1, y1], [x2, y2]) => {
  const dy = (y2 - y1) * 0.5;
  return `M${x1},${y1} C${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`;
};

const EDGES = [
  ...[0, 1, 2, 3, 4].map((k) => curve([byId.sources.x + byId.sources.w, 82 + k * 54], left(byId.python))),
  curve(right(byId.python), left(byId.bigquery)),
  curve(right(byId.bigquery), left(byId.score)),
  vcurve(bottom(byId.score), top(byId.alerts)),
  vcurve(bottom(byId.bigquery), top(byId.triage)),
  curve(right(byId.triage), [byId.score.x + 20, byId.score.y + byId.score.h]),
  vcurve(top(byId.score), bottom(byId.ask)),
];

// Phones: the same system as a readable list, in the order data flows.
const FLOW = ["sources", "python", "bigquery", "score", "alerts", "triage", "ask"];
const ChmList = () => (
  <ol className="space-y-5">
    {FLOW.map((id, i) => {
      const n = byId[id];
      return (
        <li key={id} className="relative border-l border-rule pl-5">
          <span aria-hidden="true" className="absolute -left-[5px] top-1.5 size-[9px] rounded-full bg-gold" />
          <p className="text-ivory">
            <span className="sr-only">Step {i + 1}: </span>
            {n.title}
            {n.sub && <span className="text-sm text-gold">, {n.sub}</span>}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{n.detail}</p>
        </li>
      );
    })}
  </ol>
);

const ChmDiagram = () => {
  const narrow = useMediaQuery("(max-width: 639px)");
  return narrow ? <ChmList /> : <ChmGraph />;
};

const ChmGraph = () => {
  const scope = useRef(null);
  const [active, setActive] = useState(null);

  // Connections draw in as the diagram scrolls through, source to output.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const paths = gsap.utils.toArray(".chm-edge");
        paths.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap
          .timeline({ scrollTrigger: { trigger: scope.current, start: "top 75%", end: "top 25%", scrub: 0.6 } })
          .to(paths, { strokeDashoffset: 0, stagger: 0.08, ease: "none" })
          .from(".chm-node", { opacity: 0.25, stagger: 0.1, ease: "none" }, 0);
      });
      return () => mm.revert();
    },
    { scope }
  );

  const point = (i) => () => {
    setActive(i);
    store.stageSpot = { key: "capillary", index: i };
  };
  const clear = () => {
    setActive(null);
    store.stageSpot = null;
  };

  return (
    <figure ref={scope}>
      <svg
        viewBox="0 0 1010 390"
        className="w-full overflow-visible"
        role="group"
        aria-label="Client Health Monitor architecture. Select a part to read what it does."
      >
        {EDGES.map((d, i) => (
          <path key={i} d={d} className="chm-edge" fill="none" stroke="var(--color-bronze)" strokeWidth="1.25" />
        ))}

        {NODES.map((n, i) => {
          const on = active === i;
          return (
            <g
              key={n.id}
              className="chm-node cursor-pointer outline-none"
              tabIndex={0}
              role="button"
              aria-label={`${n.title}: ${n.detail}`}
              onPointerEnter={point(i)}
              onPointerLeave={clear}
              onFocus={point(i)}
              onBlur={clear}
            >
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={n.h}
                rx="10"
                fill={on ? "var(--color-raised)" : "var(--color-surface)"}
                stroke={on ? "var(--color-gold)" : "var(--color-rule)"}
                strokeWidth={on ? 1.5 : 1}
                style={{ transition: "fill 200ms, stroke 200ms" }}
              />
              <text x={n.x + 16} y={n.y + 26} fill="var(--color-ivory)" fontSize="15" fontWeight="500">
                {n.title}
              </text>
              {n.sub && (
                <text x={n.x + 16} y={n.y + 46} fill="var(--color-gold)" fontSize="12.5">
                  {n.sub}
                </text>
              )}
              {n.lines?.map((line, k) => (
                <g key={line}>
                  <circle cx={n.x + 22} cy={82 + k * 54} r="3" fill="var(--color-gold)" />
                  <text x={n.x + 34} y={86 + k * 54} fill="var(--color-fg)" fontSize="13.5">
                    {line}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      <figcaption aria-live="polite" className="mt-4 min-h-[3.25rem] max-w-[62ch] text-sm leading-relaxed text-muted">
        {active === null ? "Point at any part of the system to see what it does." : NODES[active].detail}
      </figcaption>
    </figure>
  );
};

export default ChmDiagram;
