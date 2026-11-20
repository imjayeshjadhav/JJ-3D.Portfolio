import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { addCrew, HIDES, sweepTime } from "../utils/buildEngine";
import { SECTION_ZONES, SECTION_TOOLS, TONES } from "../constants/buildCrew";

gsap.registerPlugin(ScrollTrigger);

// Leaf text blocks: everything a visitor reads below the hero.
const TEXT = "h2, h3, h4, p, li, dt, dd";
const SKIP = "[data-build-pending], .sr-only, svg, #activity-tooltip, #scene-overlay";
const SIDES = ["left", "right", "bottom"];

// Every text block that no hand-made zone builds is picked up here, grouped
// into small chunks (neighbours that fit in under half a screen), and built
// by a rotating crew from that section's tools: paragraphs are typed or
// highlighted line by line, short lists (tags, stages, skills) are
// shift-selected. Nothing below the hero just appears on its own.
// A link or button is built on its own unless it sits inside a text block
// (a link in a paragraph is typed with the paragraph).
const standalone = (el) => {
  const host = el.parentElement.closest(TEXT);
  return !host || Boolean(host.querySelector(TEXT));
};

const autoZones = () => {
  const vh = window.innerHeight;
  const sections = [...document.querySelectorAll("main > section:not(#top), footer")];
  const leaves = sections
    // Text blocks, plus links and buttons that stand on their own.
    .flatMap((s) => [...s.querySelectorAll(`${TEXT}, a, button`)])
    .filter(
      (el) =>
        (el.matches(TEXT) ? !el.querySelector(TEXT) : standalone(el)) &&
        el.textContent.trim() &&
        !el.closest(SKIP) &&
        el.getClientRects().length > 0
    );

  // Chunk neighbours that share a parent and sit close together.
  const chunks = [];
  leaves.forEach((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const bottom = top + el.offsetHeight;
    const last = chunks.at(-1);
    if (last && last.parent === el.parentElement && bottom - last.top < vh * 0.45) {
      last.els.push(el);
      return;
    }
    chunks.push({ parent: el.parentElement, top, els: [el] });
  });

  const counters = {};
  return chunks.map(({ els }) => {
    const host = els[0].closest("article[id], section[id], footer");
    const key = host?.tagName === "FOOTER" ? "footer" : host?.id ?? "footer";
    const tools = SECTION_TOOLS[key] ?? SECTION_TOOLS.footer;
    const n = (counters[key] = (counters[key] ?? -1) + 1);
    const tone = TONES[n % TONES.length];
    const from = SIDES[n % SIDES.length];
    const tool = tools[n % tools.length];

    const avg = els.reduce((sum, el) => sum + el.textContent.trim().length, 0) / els.length;
    let steps;
    if (els.length >= 3 && avg < 34) {
      steps = [{ do: "multi", target: els, at: 0.4, all: true }];
    } else {
      // Typed, or highlighted, one block after another by the same cursor.
      const kind = n % 3 === 1 ? "select" : "type";
      let at = 0.4;
      steps = els.map((el) => {
        const s = { do: kind, target: el, at, fast: true };
        at += sweepTime(kind, el, true) + 0.22;
        return s;
      });
    }
    return { zone: els[0], start: "top 86%", crew: [{ tool, tone, from, steps }], wide: true };
  });
};

// Each section below the hero is built by small crews of cursors the first
// time it scrolls into view. The cursors draw in one page-tall layer, so if
// you keep scrolling they move with the content they are building.
const useSectionBuilds = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (import.meta.env.DEV) window.__gsap = gsap; // lets screenshot scripts slow time down

    const layer = document.createElement("div");
    layer.className = "build-page-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    const setUp = (spec, zone) => {
      const resolve = (t) => (t instanceof Element ? t : t === ":zone" ? zone : zone.querySelector(t));
      const resolveAll = (t) => (Array.isArray(t) ? t : t === ":zone" ? [zone] : [...zone.querySelectorAll(t)]);
      // Only what the crew builds starts hidden; comments and hovers just visit.
      const targets = spec.crew
        .flatMap((m) =>
          m.steps.filter((s) => HIDES.has(s.do)).flatMap((s) => (s.all ? resolveAll(s.target) : [resolve(s.target)]))
        )
        .filter(Boolean);
      targets.forEach((el) => el.setAttribute("data-build-pending", ""));
      return { spec, zone, resolve, resolveAll, targets, tl: null };
    };

    // Hand-made zones first, so the automatic pass skips what they build.
    const zones = SECTION_ZONES.map((spec) => {
      const zone = document.querySelector(spec.zone);
      return zone ? setUp(spec, zone) : null;
    }).filter(Boolean);
    autoZones().forEach((spec) => zones.push(setUp(spec, spec.zone)));

    const reveal = (z) => {
      z.targets.forEach((el) => {
        el.removeAttribute("data-build-pending");
        gsap.set(el, { clearProps: "clipPath,opacity,transform" });
      });
    };

    const play = (z) => {
      const vh = window.innerHeight;
      const zr = z.zone.getBoundingClientRect();
      // Already scrolled past (a jump from the nav): no show, just the content.
      if (zr.bottom < 0) return reveal(z);
      layer.style.height = `${document.documentElement.scrollHeight}px`;
      const lr = layer.getBoundingClientRect();
      const before = new Set(layer.children);
      let mine = [];
      z.tl = gsap.timeline({
        onComplete: () => {
          reveal(z);
          mine.forEach((n) => n.remove());
        },
      });
      addCrew(z.tl, {
        crew: z.spec.crew,
        layer,
        origin: [lr.left, lr.top],
        resolve: z.resolve,
        resolveAll: z.resolveAll,
        // Below the fold is fine: the crew keeps working as you scroll to it.
        reach: (r) => r.width > 0 && r.height > 0 && r.top < vh * (z.spec.wide ? 1.6 : 1.25) && r.bottom > -vh * 0.25,
        scramble: false, // these sections run their own figure counters
      });
      // This zone's cursors and marks only; other crews may still be working.
      mine = [...layer.children].filter((n) => !before.has(n));
      z.tl.to({}, { duration: 0.2 });
    };

    const triggers = zones.map((z) =>
      // clamp(): blocks near the end of the page still start once you hit bottom.
      ScrollTrigger.create({
        trigger: z.zone,
        start: `clamp(${z.spec.start ?? "top 72%"})`,
        once: true,
        onEnter: () => play(z),
      })
    );

    return () => {
      triggers.forEach((t) => t.kill());
      zones.forEach((z) => {
        z.tl?.kill();
        reveal(z);
      });
      layer.remove();
    };
  }, []);
};

export default useSectionBuilds;
