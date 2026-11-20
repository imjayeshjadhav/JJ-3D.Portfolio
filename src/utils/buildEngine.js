import gsap from "gsap";

import scrambleCount from "./scrambleCount";

// The cursor crew: named design-tool cursors that build parts of the page
// in front of the visitor. Used by the landing-page intro (BuildIntro) and
// by every section as it scrolls into view (useSectionBuilds).
//
// A crew member is { tool, tone, from, steps: [{ do, target, at, all?, text? }] }.
// Each section leans on a different move, so the page never repeats itself:
//   type     I-beam sweeps a line; text appears behind the caret
//   select   a text highlight sweeps across, then clears
//   drag     marquee selection box dragged open from the top-left corner
//   stage    a drag whose box stays open (the hero's 3D frame)
//   click    one press; the element grows out from that point
//   resize   the element appears narrow; a ↔ handle pulls it to full width
//   pen      a pen tool draws the outline, corner by corner, then it fills
//   place    (all) items are carried up into their slots; snap guides flash
//   multi    (all) shift-click each item; selection outlines stay a moment
//   align    (all) items sit scattered, get marquee-selected, then snap straight
//   comment  drops a comment pin with `text` (does not hide its target)
//   hover    just arrives near the target and lingers (for a crowd moment)

// Steps that start their target hidden until the cursor builds it.
export const HIDES = new Set(["type", "select", "drag", "stage", "click", "resize", "pen", "place", "multi", "align"]);

const ICONS = {
  pointer: ["16 21", "M1.5 1.5 L1.5 17.5 L5.8 13.4 L8.7 19.8 L11.4 18.6 L8.5 12.3 L14.2 12.3 Z"],
  text: ["10 22", "M1 1.5h3l1 1 1-1h3M5 2.5v17M1 20.5h3l1-1 1 1h3"],
  pen: ["18 21", "M2 19.5 L4.6 11.6 L11.6 3.2 L16.4 8 L8 15 Z M2 19.5 L7.4 13.4"],
  resize: ["20 14", "M1 7 L5.5 2.5 V5.4 H14.5 V2.5 L19 7 L14.5 11.5 V8.6 H5.5 V11.5 Z"],
};
const HANDLES = '<i data-h="tl"></i><i data-h="tr"></i><i data-h="bl"></i><i data-h="br"></i>';
const clamp = gsap.utils.clamp;

const piece = (layer, className, tone, html = "") => {
  const el = document.createElement("div");
  el.className = className;
  el.style.setProperty("--tone", tone);
  el.innerHTML = html;
  layer.appendChild(el);
  return el;
};

const makeCursor = (layer, tool, tone) => {
  const icons = Object.entries(ICONS)
    .map(([mode, [box, d]]) => {
      const [w, h] = box.split(" ");
      return `<svg class="crew-icon" data-icon="${mode}" width="${w}" height="${h}" viewBox="0 0 ${box}"><path d="${d}"/></svg>`;
    })
    .join("");
  const el = piece(layer, "crew-cursor", tone, `${icons}<span class="crew-tag"></span>`);
  el.dataset.mode = "pointer";
  el.querySelector(".crew-tag").textContent = tool;
  return el;
};

// Viewport-space points where a cursor arrives from, and leaves to.
const entryPoint = (from, [x, y], i) => {
  const jitter = ((i * 37) % 9) * 14 - 56;
  if (from === "top") return [x + 140 + jitter, -40];
  if (from === "left") return [-40, y + 90 + jitter];
  if (from === "right") return [window.innerWidth + 40, y - 80 + jitter];
  return [x - 100 + jitter, window.innerHeight + 40];
};
export const exitPoint = ([x, y]) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const options = [
    [x + 60, -50, y],
    [-50, y, x],
    [vw + 50, y, vw - x],
    [x + 60, vh + 50, vh - y],
  ];
  return options.sort((a, b) => a[2] - b[2])[0].slice(0, 2);
};

// How long a type or select sweep takes. Headings are typed with some
// ceremony; body copy (fast) is typed briskly so reading is never held up.
export const sweepTime = (kind, el, fast) => {
  const chars = el.textContent.trim().length;
  if (fast) return clamp(0.25, 0.7, chars * (kind === "type" ? 0.005 : 0.004));
  return kind === "type" ? clamp(0.35, 1.1, chars * 0.014) : clamp(0.45, 1.1, chars * 0.009);
};

// A small, repeatable "random" so scattered items look the same every time.
const wobble = (i, k) => Math.sin(i * 12.9898 + k * 78.233) * 0.5 + Math.sin(i * 3.7 + k) * 0.5;

// The text lines inside an element, relative to its box, and a function
// that reveals them in reading order: p in 0..1 → { x, index, line }.
const sweeper = (el, r) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  const v = el.getBoundingClientRect();
  const lines = [];
  [...range.getClientRects()]
    .filter((q) => q.width > 1)
    .forEach((q) => {
      const line = lines.find((L) => Math.abs(L.top - (q.top - v.top)) < 6);
      if (line) {
        line.left = Math.min(line.left, q.left - v.left);
        line.right = Math.max(line.right, q.right - v.left);
        line.bottom = Math.max(line.bottom, q.bottom - v.top);
      } else {
        lines.push({ top: q.top - v.top, bottom: q.bottom - v.top, left: q.left - v.left, right: q.right - v.left });
      }
    });
  if (!lines.length) lines.push({ top: 0, bottom: r.height, left: 0, right: r.width });
  lines.sort((a, b) => a.top - b.top);
  const total = lines.reduce((sum, L) => sum + (L.right - L.left), 0);
  const W = r.width + 24;
  const H = r.height + 24;

  const at = (p) => {
    let s = p * total;
    let index = 0;
    while (index < lines.length - 1 && s > lines[index].right - lines[index].left) {
      s -= lines[index].right - lines[index].left;
      index += 1;
    }
    const line = lines[index];
    const x = line.left + Math.min(s, line.right - line.left);
    // Everything above the current line, plus the current line up to x.
    const top = index === 0 ? -24 : line.top;
    // Tight leading makes line boxes overlap: split the overlap so the next
    // line's ascenders don't peek through before it is typed.
    const next = lines[index + 1];
    const bottom = !next ? H : next.top < line.bottom ? (line.bottom + next.top) / 2 : line.bottom;
    el.style.clipPath =
      p >= 1
        ? "none"
        : `polygon(-24px -24px, ${W}px -24px, ${W}px ${top}px, ${x}px ${top}px, ${x}px ${bottom}px, -24px ${bottom}px)`;
    return { x, index, line };
  };
  at.lines = lines;
  return at;
};

/**
 * Adds a crew's work to a GSAP timeline.
 *
 * layer:      element the cursors and guides are drawn in, over the content.
 * origin:     the layer's top-left in viewport pixels when this is measured.
 * resolve:    target → element. resolveAll: target → array of elements.
 * reach:      whether a target can be built by hand; the rest just appear.
 * Returns { handled: Map(element → end time), stage: { cursor, box, end } }.
 */
export const addCrew = (
  tl,
  { crew, layer, origin = [0, 0], resolve, resolveAll, reach, scramble = true, scrambles = [] }
) => {
  const [ox, oy] = origin;
  const local = ([x, y]) => [x - ox, y - oy];
  const rectOf = (el) => {
    const v = el.getBoundingClientRect();
    return { left: v.left - ox, top: v.top - oy, width: v.width, height: v.height, view: v };
  };
  const handled = new Map();
  let stage = null;

  const moveTo = (cur, [x, y], at, duration) => {
    tl.to(cur, { x, duration, ease: "power2.inOut" }, at);
    tl.to(cur, { y, duration, ease: "sine.inOut" }, at);
  };
  const mode = (cur, m, at) => tl.set(cur, { attr: { "data-mode": m } }, at);
  const press = (cur, at, hold = 0.1) => {
    tl.to(cur, { "--press": 0.82, duration: 0.1, ease: "power2.out" }, at);
    tl.to(cur, { "--press": 1, duration: 0.18, ease: "back.out(3)" }, at + hold);
  };
  const scrambleAt = (el, at) => {
    if (scramble && el.dataset.value) tl.call(() => scrambles.push(scrambleCount(el)), null, at);
  };
  const guide = (tone, x, y, w, h, at) => {
    const g = piece(layer, "build-guide", tone);
    tl.fromTo(g, { x, y, width: w, height: h, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, at);
    tl.to(g, { autoAlpha: 0, duration: 0.35 }, at + 0.35);
  };
  const box = (tone, handles = true) =>
    piece(layer, "build-box", tone, `${handles ? HANDLES : ""}<span class="build-size"></span>`);

  // Each action returns { end, point } (point: where the cursor ends up).
  const ACTIONS = {
    drag({ cur, el, r, at, tone, keep = false }) {
      const b = box(tone);
      const size = b.querySelector(".build-size");
      const d = clamp(0.5, 0.95, (r.width + r.height) / 1500);
      const p = { v: 0 };
      tl.set(b, { x: r.left, y: r.top, width: 0, height: 0, autoAlpha: 1 }, at);
      press(cur, at, d);
      tl.to(
        p,
        {
          v: 1,
          duration: d,
          ease: "power2.inOut",
          onUpdate() {
            const w = r.width * p.v;
            const h = r.height * p.v;
            b.style.width = `${w}px`;
            b.style.height = `${h}px`;
            size.textContent = `${Math.round(w)} × ${Math.round(h)}`;
            el.style.clipPath = `inset(0 ${r.width - w}px ${r.height - h}px 0)`;
            gsap.set(cur, { x: r.left + w, y: r.top + h });
          },
        },
        at
      );
      if (!keep) tl.to(b, { autoAlpha: 0, duration: 0.35 }, at + d + 0.35);
      return { end: at + d, point: [r.left + r.width, r.top + r.height], box: b };
    },

    // Typing and highlighting follow the real text lines, so a paragraph
    // fills in line by line the way a text cursor would.
    type({ cur, el, r, at, tone, fast }) {
      const chars = el.textContent.trim().length;
      const d = sweepTime("type", el, fast);
      const caret = piece(layer, "build-caret", tone);
      const sweep = sweeper(el, r);
      const p = { v: 0 };
      mode(cur, "text", at - 0.05);
      tl.set(caret, { autoAlpha: 1 }, at);
      tl.to(
        p,
        {
          v: 1,
          duration: d,
          ease: `steps(${clamp(8, 60, Math.round(chars / 1.3))})`,
          onUpdate() {
            const { x, line } = sweep(p.v);
            caret.style.transform = `translate(${r.left + x}px, ${r.top + line.top}px)`;
            caret.style.height = `${line.bottom - line.top}px`;
            gsap.set(cur, { x: r.left + x + 8, y: r.top + line.bottom - 4 });
          },
        },
        at
      );
      tl.to(caret, { autoAlpha: 0, duration: 0.25 }, at + d + 0.15);
      mode(cur, "pointer", at + d + 0.1);
      const last = sweep.lines.at(-1);
      return { end: at + d, point: [r.left + last.right + 8, r.top + last.bottom - 4] };
    },

    select({ cur, el, r, at, tone, fast }) {
      const d = sweepTime("select", el, fast);
      const sweep = sweeper(el, r);
      const marks = sweep.lines.map((line) => {
        const m = piece(layer, "build-highlight", tone);
        gsap.set(m, { x: r.left + line.left - 2, y: r.top + line.top, height: line.bottom - line.top });
        return m;
      });
      const p = { v: 0 };
      mode(cur, "text", at - 0.05);
      tl.set(marks, { autoAlpha: 1, width: 0 }, at);
      tl.to(
        p,
        {
          v: 1,
          duration: d,
          ease: "power1.inOut",
          onUpdate() {
            const { x, index, line } = sweep(p.v);
            marks.forEach((m, k) => {
              const L = sweep.lines[k];
              const w = k < index ? L.right - L.left : k === index ? x - L.left : 0;
              m.style.width = w > 0 ? `${w + 4}px` : "0px";
            });
            gsap.set(cur, { x: r.left + x, y: r.top + line.bottom - 6 });
          },
        },
        at
      );
      tl.to(marks, { autoAlpha: 0, duration: 0.45, stagger: 0.04 }, at + d + 0.3);
      mode(cur, "pointer", at + d + 0.2);
      const last = sweep.lines.at(-1);
      return { end: at + d, point: [r.left + last.right, r.top + last.bottom - 6] };
    },

    click({ cur, el, r, at, tone }) {
      const px = Math.min(r.width * 0.3, 40);
      const py = r.height / 2;
      const pulse = piece(layer, "build-pulse", tone);
      const R = Math.hypot(Math.max(px, r.width - px), Math.max(py, r.height - py)) + 2;
      const p = { v: 0 };
      press(cur, at);
      tl.fromTo(
        pulse,
        { x: r.left + px, y: r.top + py, scale: 0.2, autoAlpha: 0.9 },
        { scale: 1.6, autoAlpha: 0, duration: 0.6, ease: "power2.out" },
        at + 0.05
      );
      tl.to(
        p,
        {
          v: 1,
          duration: 0.5,
          ease: "power3.out",
          onUpdate() {
            el.style.clipPath = `circle(${R * p.v}px at ${px}px ${py}px)`;
          },
        },
        at + 0.05
      );
      scrambleAt(el, at + 0.08);
      return { end: at + 0.3, point: [r.left + px, r.top + py] };
    },

    resize({ cur, el, r, at, tone }) {
      const w0 = Math.max(60, r.width * 0.3);
      const b = box(tone);
      b.insertAdjacentHTML("beforeend", '<i data-h="mr"></i>');
      const size = b.querySelector(".build-size");
      const my = r.top + Math.min(r.height / 2, 220);
      const p = { v: 0 };
      // The narrow version appears first, already selected.
      tl.set(el, { clipPath: `inset(0 ${r.width - w0}px 0 0)` }, at - 0.35);
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.25 }, at - 0.35);
      tl.set(b, { x: r.left, y: r.top, width: w0, height: r.height, autoAlpha: 1 }, at - 0.35);
      tl.call(() => (size.textContent = `${Math.round(w0)} × ${Math.round(r.height)}`), null, at - 0.35);
      mode(cur, "resize", at - 0.1);
      press(cur, at, 0.8);
      tl.to(
        p,
        {
          v: 1,
          duration: 0.8,
          ease: "power3.inOut",
          onUpdate() {
            const w = w0 + (r.width - w0) * p.v;
            b.style.width = `${w}px`;
            size.textContent = `${Math.round(w)} × ${Math.round(r.height)}`;
            el.style.clipPath = `inset(0 ${r.width - w}px 0 0)`;
            gsap.set(cur, { x: r.left + w, y: my });
          },
        },
        at
      );
      tl.to(b, { autoAlpha: 0, duration: 0.35 }, at + 1.1);
      mode(cur, "pointer", at + 0.9);
      return { end: at + 0.8, point: [r.left + r.width, my], start: [r.left + w0, my] };
    },

    pen({ cur, el, r, at, tone }) {
      const { width: w, height: h } = r;
      const per = 2 * (w + h);
      const outline = piece(
        layer,
        "build-pen",
        tone,
        `<svg width="${w + 2}" height="${h + 2}"><path d="M1 1 H${w + 1} V${h + 1} H1 Z" ` +
          `stroke-dasharray="${per}" stroke-dashoffset="${per}"/></svg>` +
          '<i style="left:0;top:0"></i><i style="left:100%;top:0"></i><i style="left:100%;top:100%"></i><i style="left:0;top:100%"></i>'
      );
      const path = outline.querySelector("path");
      const anchors = outline.querySelectorAll("i");
      const d = clamp(0.9, 1.5, per / 2600);
      mode(cur, "pen", at - 0.1);
      tl.set(outline, { x: r.left - 1, y: r.top - 1, autoAlpha: 1 }, at);
      tl.to(path, { attr: { "stroke-dashoffset": 0 }, duration: d, ease: "none" }, at);
      // The pen walks the corners in step with the line.
      const corners = [
        [r.left + w, r.top],
        [r.left + w, r.top + h],
        [r.left, r.top + h],
        [r.left, r.top],
      ];
      const sides = [w, h, w, h];
      let t = at;
      tl.to(anchors[0], { autoAlpha: 1, duration: 0.05 }, at);
      corners.forEach((c, k) => {
        const dur = (sides[k] / per) * d;
        tl.to(cur, { x: c[0], y: c[1], duration: dur, ease: "none" }, t);
        t += dur;
        if (k < 3) tl.to(anchors[k + 1], { autoAlpha: 1, duration: 0.05 }, t);
      });
      // Closing the path fills it.
      tl.fromTo(el, { clipPath: "none", opacity: 0 }, { opacity: 1, duration: 0.5 }, t);
      tl.to(outline, { autoAlpha: 0, duration: 0.4 }, t + 0.35);
      mode(cur, "pointer", t + 0.1);
      return { end: t, point: [r.left, r.top], start: [r.left, r.top] };
    },

    place({ cur, els, at, tone, from }) {
      const gap = 0.5;
      let point = null;
      els.forEach((el, i) => {
        const r = rectOf(el);
        const dy = from === "top" ? -70 : 70;
        const grab = [r.left + Math.min(r.width * 0.4, 70), r.top + r.height * 0.4 + dy];
        const t = at + i * gap;
        if (i > 0) moveTo(cur, grab, t - 0.3, 0.28);
        // A ghost waits off its slot; the cursor picks it up and drops it in.
        tl.fromTo(el, { clipPath: "none", y: dy, opacity: 0 }, { opacity: 0.55, duration: 0.2 }, t - 0.3);
        press(cur, t, 0.36);
        tl.to(el, { y: 0, opacity: 1, duration: 0.36, ease: "power3.inOut" }, t);
        tl.to(cur, { y: grab[1] - dy, duration: 0.36, ease: "power3.inOut" }, t);
        guide(tone, 0, r.top, layer.clientWidth, 1, t + 0.34);
        guide(tone, r.left, r.top - 60, 1, r.height + 120, t + 0.34);
        scrambleAt(el, t + 0.3);
        handled.set(el, t + 0.36);
        point = [grab[0], grab[1] - dy];
      });
      const first = rectOf(els[0]);
      const dy0 = from === "top" ? -70 : 70;
      return {
        end: at + (els.length - 1) * gap + 0.36,
        point,
        start: [first.left + Math.min(first.width * 0.4, 70), first.top + first.height * 0.4 + dy0],
      };
    },

    multi({ cur, els, at, tone }) {
      const step = 0.17;
      const outlines = [];
      let point = null;
      els.forEach((el, i) => {
        const r = rectOf(el);
        const pt = [r.left + Math.min(r.width * 0.5, 28), r.top + r.height / 2];
        const t = at + i * step;
        if (i > 0) moveTo(cur, pt, t - step + 0.02, step - 0.04);
        press(cur, t, 0.06);
        const o = piece(layer, "build-outline", tone);
        outlines.push(o);
        tl.fromTo(o, { x: r.left - 4, y: r.top - 3, width: r.width + 8, height: r.height + 6, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, t);
        tl.fromTo(el, { clipPath: "none", opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, t);
        handled.set(el, t + 0.3);
        point = pt;
      });
      const end = at + (els.length - 1) * step + 0.3;
      tl.to(outlines, { autoAlpha: 0, duration: 0.4, stagger: 0.03 }, end + 0.35);
      const first = rectOf(els[0]);
      return { end, point, start: [first.left + Math.min(first.width * 0.5, 28), first.top + first.height / 2] };
    },

    align({ cur, els, at, tone }) {
      const rs = els.map(rectOf);
      const left = Math.min(...rs.map((r) => r.left)) - 16;
      const top = Math.min(...rs.map((r) => r.top)) - 16;
      const right = Math.max(...rs.map((r) => r.left + r.width)) + 16;
      const bottom = Math.max(...rs.map((r) => r.top + r.height)) + 16;
      // Scattered first, so there is something to straighten. Gentler on
      // phones, where there is no room to the side.
      const spread = window.innerWidth < 768 ? 0.35 : 1;
      els.forEach((el, i) => {
        tl.fromTo(
          el,
          {
            clipPath: "none",
            opacity: 0,
            x: wobble(i, 1) * 26 * spread,
            y: wobble(i, 2) * 20 * spread,
            rotation: wobble(i, 3) * 4 * spread,
          },
          { opacity: 1, duration: 0.3 },
          at - 0.45 + i * 0.06
        );
      });
      const b = box(tone, false);
      const p = { v: 0 };
      tl.set(b, { x: left, y: top, width: 0, height: 0, autoAlpha: 1 }, at);
      press(cur, at, 0.55);
      tl.to(
        p,
        {
          v: 1,
          duration: 0.55,
          ease: "power2.inOut",
          onUpdate() {
            const w = (right - left) * p.v;
            const h = (bottom - top) * p.v;
            b.style.width = `${w}px`;
            b.style.height = `${h}px`;
            b.querySelector(".build-size").textContent = `${els.length} selected`;
            gsap.set(cur, { x: left + w, y: top + h });
          },
        },
        at
      );
      const snap = at + 0.7;
      tl.to(els, { x: 0, y: 0, rotation: 0, duration: 0.55, ease: "back.out(1.8)", stagger: 0.05 }, snap);
      rs.forEach((r) => guide(tone, r.left, top, 1, bottom - top, snap + 0.4));
      guide(tone, left, rs[0].top, right - left, 1, snap + 0.4);
      tl.to(b, { autoAlpha: 0, duration: 0.35 }, snap + 0.6);
      els.forEach((el) => handled.set(el, snap + 0.6));
      return { end: snap + 0.6, point: [right, bottom], start: [left, top] };
    },

    comment({ cur, r, at, tone, member, text }) {
      const x = r.left + Math.min(r.width, 300) + 18;
      const y = r.top + 6;
      const c = piece(layer, "build-comment", tone, `<b></b><span></span>`);
      c.querySelector("b").textContent = member.tool.slice(0, 1);
      c.querySelector("span").textContent = text;
      press(cur, at);
      tl.fromTo(c, { x, y, scale: 0, autoAlpha: 1 }, { scale: 1, duration: 0.45, ease: "back.out(2.2)" }, at + 0.08);
      tl.to(c, { autoAlpha: 0, duration: 0.4 }, at + 2.4);
      return { end: at + 0.4, point: [x, y], start: [x, y] };
    },

    hover({ r, at, index }) {
      const angle = index * 1.9;
      const pt = [r.left + r.width * 0.5 + Math.cos(angle) * 70, r.top + r.height * 0.5 + Math.sin(angle) * 46];
      return { end: at + 0.5, point: pt, start: pt };
    },
  };

  const startOf = (kind, r) => {
    if (kind === "type" || kind === "select") return [r.left - 4, r.top + r.height / 2 + 6];
    if (kind === "click") return [r.left + Math.min(r.width * 0.3, 40), r.top + r.height / 2];
    return [r.left, r.top];
  };

  crew.forEach((member, ci) => {
    let cur = null;
    let pos = null; // layer coordinates
    let last = 0;
    member.steps.forEach((step) => {
      const kind = step.do === "stage" ? "drag" : step.do;
      const list = step.all ? resolveAll(step.target) : [resolve(step.target)].filter(Boolean);
      if (!list.length) return;
      const el = list[0];
      const reachable = list.some((e) => reach(e.getBoundingClientRect()));
      if (!reachable) {
        if (HIDES.has(step.do)) {
          list.forEach((e) => {
            tl.fromTo(e, { clipPath: "none", opacity: 0 }, { opacity: 1, duration: 0.5 }, step.at);
            scrambleAt(e, step.at);
            handled.set(e, step.at + 0.3);
          });
        }
        return;
      }
      const r = rectOf(el);
      const args = {
        cur,
        el,
        els: list,
        r,
        at: step.at,
        tone: member.tone,
        member,
        text: step.text,
        fast: step.fast,
        from: member.from,
        index: ci,
      };

      // Where the cursor needs to be when the step starts. Some actions
      // know it only once laid out, so lay out first, then travel.
      let done;
      if (!cur) {
        cur = makeCursor(layer, member.tool, member.tone);
        args.cur = cur;
      }
      if (["type", "select", "drag", "click"].includes(kind)) {
        const start = startOf(kind, r);
        travel(start);
        done = ACTIONS[kind]({ ...args, keep: step.do === "stage" });
      } else {
        done = ACTIONS[kind](args);
        travel(done.start ?? done.point, kind === "resize" ? 0.45 : kind === "align" ? 0.1 : 0);
      }

      function travel(start, lead = 0) {
        const arrive = step.at - lead;
        if (!pos) {
          pos = local(entryPoint(member.from, [start[0] + ox, start[1] + oy], ci));
          gsap.set(cur, { x: pos[0], y: pos[1] });
          const begin = Math.max(0.05, arrive - 0.85);
          tl.to(cur, { autoAlpha: 1, duration: 0.2 }, begin);
          moveTo(cur, start, begin, Math.max(0.2, arrive - begin));
        } else {
          const from = Math.max(last + 0.05, arrive - 0.55);
          moveTo(cur, start, from, Math.max(0.15, arrive - from));
        }
      }

      list.forEach((e) => !handled.has(e) && HIDES.has(step.do) && handled.set(e, done.end));
      pos = done.point;
      last = done.end;
      if (step.do === "stage") {
        stage = { cursor: cur, box: done.box, end: done.end };
        const centre = [r.left + r.width * 0.5 + 34, r.top + r.height * 0.5 + 26];
        moveTo(cur, centre, done.end + 0.1, 0.5);
        last = done.end + 0.6;
      }
      if (kind === "hover") last = done.end + 0.4;
    });
    // Done: leave by the nearest edge (the stage cursor leaves later).
    if (cur && cur !== stage?.cursor) {
      const out = local(exitPoint([pos[0] + ox, pos[1] + oy]));
      tl.to(cur, { x: out[0], y: out[1], duration: 0.7, ease: "power2.in" }, last + 0.3);
      tl.to(cur, { autoAlpha: 0, duration: 0.2 }, last + 0.8);
    }
  });

  return { handled, stage };
};
