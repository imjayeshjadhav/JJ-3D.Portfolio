import { experience } from "../constants";

/*
  Every formation is exactly `count` points plus a hue per point (0..1 along
  the champagne ramp). Shapes are built in unit space (roughly -1..1) and scaled by
  the layout radius, except the hero, which is built in room units around the
  room. Each shape encodes the section it sits behind.

  A hue below 0 marks a point as hidden: the shader fades it out. Formations
  that should feel light (the hero, contact) only use part of the budget.
*/

const HIDDEN = -1;

// Seeded RNG so every visit sees the same shapes.
export const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const gaussian = (rand) => {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const lerp = (a, b, t) => a + (b - a) * t;

// Fill `count` points by picking a part per point in proportion to its weight.
const fill = (count, rand, parts) => {
  const positions = new Float32Array(count * 3);
  const hues = new Float32Array(count);
  const total = parts.reduce((s, p) => s + p.weight, 0);
  const out = [0, 0, 0, 0];
  for (let i = 0; i < count; i++) {
    let r = rand() * total;
    let part = parts[0];
    for (const p of parts) {
      if ((r -= p.weight) <= 0) {
        part = p;
        break;
      }
    }
    part.gen(rand, out);
    positions[i * 3] = out[0];
    positions[i * 3 + 1] = out[1];
    positions[i * 3 + 2] = out[2];
    hues[i] = out[3];
  }
  return { positions, hues };
};

// Grow a shape to `count` points; the extras sit in a loose shell, hidden.
const padHidden = ({ positions, hues }, count, rand, radius) => {
  const n = hues.length;
  if (n >= count) return { positions, hues };
  const p = new Float32Array(count * 3);
  const h = new Float32Array(count).fill(HIDDEN);
  p.set(positions);
  h.set(hues);
  for (let i = n; i < count; i++) {
    const r = radius * (0.6 + rand() * 0.6);
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    p[i * 3] = r * Math.sin(ph) * Math.cos(th);
    p[i * 3 + 1] = r * Math.cos(ph) * 0.7;
    p[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  return { positions: p, hues: h };
};

// Faint background points so no formation ever looks like an empty stage.
const haze = (radius = 1.7) => ({
  weight: 0.12,
  gen: (rand, o) => {
    const r = radius * Math.cbrt(rand());
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    o[0] = r * Math.sin(ph) * Math.cos(th);
    o[1] = r * Math.cos(ph) * 0.8;
    o[2] = r * Math.sin(ph) * Math.sin(th);
    o[3] = rand() * 0.25;
  },
});

// Point along a random segment, chosen in proportion to segment length.
const segmentPart = (weight, segments, hueFn, jitter = 0.012) => {
  const lengths = segments.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  const cumulative = [];
  lengths.reduce((s, l, i) => (cumulative[i] = s + l), 0);
  const total = cumulative[cumulative.length - 1];
  return {
    weight,
    gen: (rand, o) => {
      const r = rand() * total;
      let i = cumulative.findIndex((c) => c >= r);
      if (i < 0) i = segments.length - 1;
      const [a, b] = segments[i];
      const t = rand();
      o[0] = lerp(a[0], b[0], t) + gaussian(rand) * jitter;
      o[1] = lerp(a[1], b[1], t) + gaussian(rand) * jitter;
      o[2] = lerp(a[2], b[2], t) + gaussian(rand) * jitter;
      o[3] = hueFn(a, b, t, i);
    },
  };
};

const blobPart = (weight, centers, sigma, hue) => ({
  weight,
  gen: (rand, o) => {
    const c = centers[Math.floor(rand() * centers.length)];
    o[0] = c[0] + gaussian(rand) * sigma;
    o[1] = c[1] + gaussian(rand) * sigma;
    o[2] = c[2] + gaussian(rand) * sigma;
    o[3] = typeof hue === "function" ? hue(rand) : hue;
  },
});

// Wireframe box edges as segments.
const boxEdges = (cx, cy, cz, w, h, d) => {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy, y1 = cy + h, z0 = cz - d / 2, z1 = cz + d / 2;
  const v = [
    [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
    [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
  ];
  const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return e.map(([a, b]) => [v[a], v[b]]);
};

/* ---------------- hero: shell plus one cluster per project ---------------- */

// One cluster per featured piece of work; the labels link to its section.
export const HERO_CLUSTERS = [
  { target: "capillary", label: "Client Health Monitor", position: [-4.3, 2.6, 0.8] },
  { target: "work-university", label: "University platform", position: [4.6, 3.3, -1.2] },
  { target: "work-campuscompass", label: "CampusCompass", position: [-4.6, -1.7, 1.4] },
  { target: "work-threatlens", label: "ThreatLens AI", position: [4.2, -1.9, 2.2] },
];

const HERO_VISIBLE = 3000;

// leftSpan: how far the light sprinkle reaches left of the room, in room units.
const hero = (count, rand, leftSpan, halfHeight) => {
  const visible = Math.min(count, HERO_VISIBLE);
  const shape = fill(visible, rand, [
    {
      weight: 1100,
      gen: (rand, o) => {
        const r = 4.5 + rand() * 5;
        const th = rand() * Math.PI * 2;
        const ph = Math.acos(2 * rand() - 1);
        o[0] = r * Math.sin(ph) * Math.cos(th);
        o[1] = r * Math.cos(ph) * 0.7;
        o[2] = r * Math.sin(ph) * Math.sin(th);
        o[3] = rand() * 0.45;
      },
    },
    ...HERO_CLUSTERS.map(({ position: c }) => ({
      weight: 220,
      gen: (rand, o) => {
        const s = 0.75;
        const dx = gaussian(rand) * s, dy = gaussian(rand) * s, dz = gaussian(rand) * s;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) / (s * 2.4);
        o[0] = c[0] + dx;
        o[1] = c[1] + dy;
        o[2] = c[2] + dz;
        o[3] = 1 - d * 0.6;
      },
    })),
    {
      // A field across the whole landing page, from the left edge past the
      // room, set back in depth so it never hides the room itself.
      weight: leftSpan > 0 ? 1200 : 0,
      gen: (rand, o) => {
        o[0] = -leftSpan * 1.05 + rand() * (leftSpan * 1.05 + 7);
        o[1] = (rand() * 2 - 1) * halfHeight * 1.05;
        o[2] = -7 + rand() * 6;
        o[3] = rand() * 0.55;
      },
    },
  ]);
  return padHidden(shape, count, rand, 7);
};

/* ------- Capillary: five data streams feeding one 0–10 health gauge ------- */

const GAUGE = { cx: 0.35, cy: -0.05, r: 0.62, from: (210 * Math.PI) / 180, to: (-30 * Math.PI) / 180 };
const gaugePoint = (t, r = GAUGE.r) => {
  const a = GAUGE.from + (GAUGE.to - GAUGE.from) * t;
  return [GAUGE.cx + Math.cos(a) * r, GAUGE.cy + Math.sin(a) * r];
};
const SOURCES = [0.85, 0.45, 0.05, -0.35, -0.75].map((y) => [-1.3, y]);

const chm = (count, rand) =>
  padHidden(
    fill(Math.min(count, 5200), rand, [
      {
        // New Relic, Jira, ServiceNow, Databricks and NPS, curving into the gauge
        weight: 0.42,
        gen: (rand, o) => {
          const [sx, sy] = SOURCES[Math.floor(rand() * SOURCES.length)];
          const t = rand();
          const cx = -0.45;
          const cy = sy * 0.25;
          const u = 1 - t;
          o[0] = u * u * sx + 2 * u * t * cx + t * t * GAUGE.cx + gaussian(rand) * 0.008;
          o[1] = u * u * sy + 2 * u * t * cy + t * t * GAUGE.cy + gaussian(rand) * 0.008;
          o[2] = gaussian(rand) * 0.03;
          o[3] = 0.3 + 0.5 * t;
        },
      },
      {
        // the gauge arc, warming from 0 to 10
        weight: 0.28,
        gen: (rand, o) => {
          const t = rand();
          const [x, y] = gaugePoint(t, GAUGE.r + gaussian(rand) * 0.012);
          o[0] = x;
          o[1] = y;
          o[2] = gaussian(rand) * 0.02;
          o[3] = 0.45 + 0.5 * t;
        },
      },
      // eleven ticks, 0 through 10
      blobPart(0.1, Array.from({ length: 11 }, (_, i) => [...gaugePoint(i / 10, GAUGE.r + 0.1), 0]), 0.012, 0.9),
      {
        // the needle, resting near 8
        weight: 0.08,
        gen: (rand, o) => {
          const t = rand();
          const [x, y] = gaugePoint(0.8, GAUGE.r * 0.85 * t);
          o[0] = x + gaussian(rand) * 0.006;
          o[1] = y + gaussian(rand) * 0.006;
          o[2] = 0.02;
          o[3] = 0.82;
        },
      },
      blobPart(0.03, [[GAUGE.cx, GAUGE.cy, 0]], 0.04, 0.9),
      { ...haze(1.7), weight: 0.06 },
    ]),
    count,
    rand,
    1.9
  );

/* -------- CampusCompass: a campus skyline with a walking path ------------- */

const BUILDINGS = [
  [-0.85, -0.3, 0.32, 0.55], [-0.4, -0.45, 0.28, 0.9], [0.05, -0.25, 0.36, 0.42],
  [0.5, -0.45, 0.3, 0.75], [0.88, -0.2, 0.26, 0.5], [-0.6, 0.3, 0.3, 0.38],
  [-0.05, 0.35, 0.32, 0.6], [0.45, 0.32, 0.28, 0.32], [0.9, 0.35, 0.22, 0.48],
];
// Walking route from the first building to the last, along the paths.
const ROUTE = [[-0.85, -0.05], [-0.62, -0.05], [-0.62, 0.05], [-0.2, 0.05], [-0.2, 0.08], [0.25, 0.08], [0.25, 0.1], [0.7, 0.1], [0.9, 0.12]];

// Tilt a flat site plan toward the viewer so it reads as 3D.
const tiltPlan = ({ positions, hues }) => {
  const ax = 0.55;
  const ay = -0.35;
  for (let i = 0; i < positions.length; i += 3) {
    let x = positions[i];
    let y = positions[i + 1];
    let z = positions[i + 2];
    const x1 = x * Math.cos(ay) + z * Math.sin(ay);
    const z1 = -x * Math.sin(ay) + z * Math.cos(ay);
    x = x1;
    z = z1;
    const y2 = y * Math.cos(ax) - z * Math.sin(ax);
    const z2 = y * Math.sin(ax) + z * Math.cos(ax);
    positions[i] = x * 1.05;
    positions[i + 1] = y2 - 0.1;
    positions[i + 2] = z2;
  }
  return { positions, hues };
};

const campus = (count, rand) => {
  // Plan coordinates: x across, z = depth on the site, y = height.
  const segments = [];
  const hueOf = [];
  for (const [x, z, s, h] of BUILDINGS) {
    for (const seg of boxEdges(x, -0.35, z, s, h, s)) {
      // boxEdges takes (cx, cy, cz, w, h, d) with y as height
      segments.push(seg);
      hueOf.push(0.6 + h * 0.35);
    }
  }
  const route = ROUTE.slice(1).map((p, i) => [[ROUTE[i][0], -0.34, ROUTE[i][1]], [p[0], -0.34, p[1]]]);
  return padHidden(
    tiltPlan(
      fill(Math.min(count, 5200), rand, [
        segmentPart(0.62, segments, (a, b, t, i) => hueOf[i], 0.006),
        {
          // the ground: a faint grid of paths
          weight: 0.18,
          gen: (rand, o) => {
            const along = rand() < 0.5;
            const line = Math.round((rand() * 2 - 1) * 4) / 4;
            const t = rand() * 2 - 1;
            o[0] = (along ? t : line) * 1.1;
            o[1] = -0.35;
            o[2] = (along ? line : t) * 0.75;
            o[3] = 0.2;
          },
        },
        segmentPart(0.1, route, () => 0.84, 0.006),
        blobPart(0.05, [[ROUTE[0][0], -0.3, ROUTE[0][1]], [ROUTE[ROUTE.length - 1][0], -0.3, ROUTE[ROUTE.length - 1][1]]], 0.03, 1),
        { ...haze(1.6), weight: 0.05 },
      ])
    ),
    count,
    rand,
    1.9
  );
};

/* -------- Timetable: 6 × 6 lattice of slots, three candidate options ------- */

const lattice = (count, rand) => {
  const cellRand = mulberry32(481);
  const segments = [];
  const layerOf = [];
  const step = 0.36;
  const size = 0.26;
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (cellRand() > 0.62) continue;
        const cx = (i - 2.5) * step;
        const cy = (j - 2.5) * step - size / 2;
        const cz = (k - 1) * 0.62;
        for (const s of boxEdges(cx, cy, cz, size, size, size * 0.4)) {
          segments.push(s);
          layerOf.push(k);
        }
      }
    }
  }
  const hueByLayer = [0.42, 0.7, 0.96];
  return fill(count, rand, [
    segmentPart(0.88, segments, (a, b, t, i) => hueByLayer[layerOf[i]], 0.006),
    haze(),
  ]);
};

/* ---------------- ThreatLens: a shield with scan rings -------------------- */

const shieldHalfWidth = (y) => (y >= 0.15 ? 0.82 : 0.82 * Math.sqrt(Math.max(0, (y + 1.05) / 1.2)));
const shieldTop = (x) => 0.92 - 0.14 * x * x;

const shield = (count, rand) =>
  fill(count, rand, [
    {
      // outline
      weight: 0.38,
      gen: (rand, o) => {
        if (rand() < 0.3) {
          const x = (rand() * 2 - 1) * 0.82;
          o[0] = x;
          o[1] = shieldTop(x);
        } else {
          const y = -1.05 + rand() * (shieldTop(0.82) + 1.05);
          o[0] = (rand() < 0.5 ? -1 : 1) * shieldHalfWidth(y);
          o[1] = y;
        }
        o[0] += gaussian(rand) * 0.01;
        o[1] += gaussian(rand) * 0.01;
        o[2] = 0.28 * (1 - o[0] * o[0]);
        o[3] = 0.8; // bright, but below the hot-core glow so it never flares over text
      },
    },
    {
      // curved face, brighter toward the top
      weight: 0.3,
      gen: (rand, o) => {
        let x, y;
        do {
          x = (rand() * 2 - 1) * 0.82;
          y = -1.05 + rand() * 2;
        } while (Math.abs(x) > shieldHalfWidth(y) || y > shieldTop(x));
        o[0] = x;
        o[1] = y;
        o[2] = 0.28 * (1 - x * x) - 0.02;
        o[3] = 0.25 + 0.4 * ((y + 1.05) / 2);
      },
    },
    {
      // scan rings around the shield
      weight: 0.2,
      gen: (rand, o) => {
        const ring = Math.floor(rand() * 3);
        const r = 1.15 + ring * 0.18;
        const a = rand() * Math.PI * 2;
        o[0] = Math.cos(a) * r;
        o[1] = -0.6 + ring * 0.55 + Math.sin(a) * 0.08;
        o[2] = Math.sin(a) * r * 0.45;
        o[3] = 0.55 + ring * 0.12;
      },
    },
    haze(),
  ]);

/* ------------------------- Wins: a podium -------------------------------- */

const PODIUM = [
  { x: -0.68, h: 0.72, hue: 0.72 }, // 2nd
  { x: 0, h: 1.1, hue: 1 }, // 1st
  { x: 0.68, h: 0.48, hue: 0.55 }, // 3rd
];

const podium = (count, rand) => {
  const segments = [];
  const hueOf = [];
  for (const step of PODIUM) {
    for (const s of boxEdges(step.x, -0.95, 0, 0.62, step.h, 0.62)) {
      segments.push(s);
      hueOf.push(step.hue);
    }
  }
  return fill(count, rand, [
    segmentPart(0.5, segments, (a, b, t, i) => hueOf[i], 0.008),
    {
      // front faces, sparse
      weight: 0.22,
      gen: (rand, o) => {
        const step = PODIUM[Math.floor(rand() * 3)];
        o[0] = step.x + (rand() - 0.5) * 0.62;
        o[1] = -0.95 + rand() * step.h;
        o[2] = 0.31;
        o[3] = step.hue * 0.6;
      },
    },
    blobPart(0.16, [[0, 0.55, 0]], 0.22, (rand) => 0.85 + rand() * 0.15),
    haze(),
  ]);
};

/* -------- Experience: a rising double helix, one node per role ------------ */

export const helixNodes = experience.map((_, i) => [0, 0.75 - i * 0.75, 0]);

const helix = (count, rand) => {
  const turns = 2.6;
  const r = 0.5;
  const point = (t, phase) => {
    const a = t * turns * Math.PI * 2 + phase;
    return [Math.cos(a) * r, -1.1 + 2.2 * t, Math.sin(a) * r];
  };
  const rungs = [];
  for (let k = 0; k < 20; k++) {
    const t = (k + 0.5) / 20;
    rungs.push([point(t, 0), point(t, Math.PI)]);
  }
  return fill(count, rand, [
    {
      weight: 0.55,
      gen: (rand, o) => {
        const t = rand();
        const p = point(t, rand() < 0.5 ? 0 : Math.PI);
        o[0] = p[0] + gaussian(rand) * 0.02;
        o[1] = p[1] + gaussian(rand) * 0.02;
        o[2] = p[2] + gaussian(rand) * 0.02;
        o[3] = 0.3 + 0.5 * t;
      },
    },
    segmentPart(0.18, rungs, () => 0.22, 0.006),
    blobPart(0.07, helixNodes, 0.06, 0.92),
    haze(),
  ]);
};

/* -------- Stack: an orbit ring under the 3D icon carousel -------------- */

// Built in world units: ring.radius matches the icon ring StackRing draws.
const orbit = (count, rand, ringRadius) =>
  padHidden(
    fill(Math.min(count, 3200), rand, [
      {
        // the track the icons travel along: a flattened ellipse, seen from above
        weight: 0.7,
        gen: (rand, o) => {
          const a = rand() * Math.PI * 2;
          const r = ringRadius * (1 + gaussian(rand) * 0.025);
          o[0] = Math.sin(a) * r;
          o[1] = -ringRadius * 0.34 + (1 - Math.cos(a)) * ringRadius * 0.1 + gaussian(rand) * 0.03;
          o[2] = (Math.cos(a) - 1) * r * 0.6;
          // brighter toward the front, where the featured tool stands
          o[3] = 0.35 + 0.55 * ((Math.cos(a) + 1) / 2);
        },
      },
      { ...haze(ringRadius * 1.1), weight: 0.3 },
    ]),
    count,
    rand,
    ringRadius * 1.3
  );

/* -------- Contact: orbit rings around the real computer model ----------- */

const halo = (count, rand) =>
  padHidden(
    fill(Math.min(count, 2600), rand, [
      {
        weight: 0.7,
        gen: (rand, o) => {
          const ring = Math.floor(rand() * 3);
          const r = 1.25 + ring * 0.16 + gaussian(rand) * 0.02;
          const a = rand() * Math.PI * 2;
          const tilt = [0.35, -0.2, 0.1][ring];
          o[0] = Math.cos(a) * r;
          o[1] = Math.sin(a) * r * 0.32 + Math.cos(a) * tilt;
          o[2] = Math.sin(a) * r * 0.5;
          o[3] = 0.45 + ring * 0.2 + rand() * 0.1;
        },
      },
      haze(1.6),
    ]),
    count,
    rand,
    1.8
  );

/* -------- About: a constellation, literally connecting the dots ---------- */

export const CONSTELLATION = {
  ai: { text: "Artificial Intelligence", position: [-0.6, 0.55, 0.1] },
  fundamentals: { text: "Computer Fundamentals", position: [0.55, 0.35, -0.25] },
  design: { text: "System Design", position: [-0.1, -0.65, 0.25] },
};

// Points spaced like beads along a line, so links read as dotted.
const beadPart = (weight, links, hue, beads = 22) => ({
  weight,
  gen: (rand, o) => {
    const [a, b] = links[Math.floor(rand() * links.length)];
    const t = (Math.floor(rand() * beads) + 0.5) / beads;
    o[0] = lerp(a[0], b[0], t) + gaussian(rand) * 0.006;
    o[1] = lerp(a[1], b[1], t) + gaussian(rand) * 0.006;
    o[2] = lerp(a[2], b[2], t) + gaussian(rand) * 0.006;
    o[3] = hue;
  },
});

const constellation = (count, rand) => {
  const hubs = Object.values(CONSTELLATION).map((c) => c.position);
  const sRand = mulberry32(99);
  const satellites = Array.from({ length: 14 }, () => [
    (sRand() * 2 - 1) * 1.15,
    (sRand() * 2 - 1) * 1.05,
    (sRand() * 2 - 1) * 0.4,
  ]);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const nearest = (s) => hubs.reduce((best, h) => (dist(s, h) < dist(s, best) ? h : best));
  return padHidden(
    fill(Math.min(count, 5200), rand, [
      blobPart(0.3, hubs, 0.13, (rand) => 0.85 + rand() * 0.15),
      beadPart(0.24, [[hubs[0], hubs[1]], [hubs[1], hubs[2]], [hubs[2], hubs[0]]], 0.6, 26),
      beadPart(0.14, satellites.map((s) => [s, nearest(s)]), 0.42, 12),
      blobPart(0.12, satellites, 0.03, 0.78),
      haze(1.6),
    ]),
    count,
    rand,
    1.8
  );
};

/* -------- Pipeline stages → points in each project's formation ----------- */

// Hovering stage i of a case study's pipeline lights this spot in the cloud.
export const PIPELINE_ANCHORS = {
  // Capillary diagram nodes: sources, Python jobs, BigQuery, score, SLA alerts, Claude triage, Ask CHM.
  capillary: [[-1.3, 0.05, 0], [-0.6, 0.02, 0], [-0.05, -0.02, 0], [0.35, -0.05, 0], [0.35, 0.6, 0], [0.8, -0.4, 0], [0.75, 0.35, 0]],
  "work-university": [[-0.9, 0.9, -0.62], [0, 0, -0.62], [0, 0, 0], [0, 0, 0.62], [0.9, -0.9, 0.62]],
  "work-campuscompass": [[-0.85, -0.2, 0], [-0.4, 0.2, 0], [0.05, -0.1, 0], [0.5, 0.2, 0], [0.9, -0.25, 0]],
  "work-threatlens": [[0, -0.6, 0.3], [0, -0.3, 0.25], [0, 0.15, 0.28], [0, 0.6, 0.25], [0, 0.92, 0.2]],
};

/* ------------------------------------------------------------------------ */

const transform =({ positions, hues }, scale, offset = [0, 0, 0]) => {
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = positions[i] * scale + offset[0];
    positions[i + 1] = positions[i + 1] * scale + offset[1];
    positions[i + 2] = positions[i + 2] * scale + offset[2];
  }
  return { positions, hues };
};

/**
 * Builds every formation for a given point count and layout.
 * layout: { center, radius, heroCenter, heroScale } in world units.
 */
export const buildFormations = (count, layout) => {
  const { radius, heroScale, heroSquash = 1, offsets, leftSpan, halfHeight } = layout;
  const heroShape = hero(count, mulberry32(2025), leftSpan / heroScale, halfHeight / heroScale);
  for (let i = 0; i < heroShape.positions.length; i += 3) heroShape.positions[i] *= heroSquash;
  const heroPoints = transform(heroShape, heroScale, offsets.hero);

  // Load-in start: the hero points flung out on a wide shell, same colours.
  const introRand = mulberry32(7);
  const introPositions = new Float32Array(heroPoints.positions.length);
  for (let i = 0; i < introPositions.length; i += 3) {
    const r = 16 + introRand() * 6;
    const th = introRand() * Math.PI * 2;
    const ph = Math.acos(2 * introRand() - 1);
    introPositions[i] = r * Math.sin(ph) * Math.cos(th);
    introPositions[i + 1] = r * Math.cos(ph);
    introPositions[i + 2] = r * Math.sin(ph) * Math.sin(th) - 6;
  }

  return {
    intro: { positions: introPositions, hues: heroPoints.hues },
    hero: heroPoints,
    about: transform(constellation(count, mulberry32(10)), radius, offsets.about),
    // Behind the GitHub bars: the constellation scatters into faint dust.
    activity: transform(padHidden(fill(Math.min(count, 1800), mulberry32(19), [haze(2.4)]), count, mulberry32(20), 2.4), radius, offsets.activity),
    capillary: transform(chm(count, mulberry32(11)), radius, offsets.capillary),
    // Behind the Capillary diagram: the gauge loosens into faint dust.
    "capillary-detail": transform(padHidden(fill(Math.min(count, 1600), mulberry32(23), [haze(2.4)]), count, mulberry32(24), 2.4), radius, [0, 0, -2]),
    "work-university": transform(lattice(count, mulberry32(12)), radius, offsets["work-university"]),
    "work-campuscompass": transform(campus(count, mulberry32(22)), radius, offsets["work-campuscompass"]),
    "work-threatlens": transform(shield(count, mulberry32(13)), radius, offsets["work-threatlens"]),
    wins: transform(podium(count, mulberry32(14)), layout.mobile ? radius : radius * 0.55, offsets.wins),
    experience: transform(helix(count, mulberry32(15)), radius * 0.8, offsets.experience),
    // Phones do not pin the Stack ring, so the orbit could not line up with it.
    stack: layout.mobile
      ? transform(padHidden(fill(Math.min(count, 1500), mulberry32(16), [haze(2)]), count, mulberry32(21), 2), radius, offsets.stack)
      : transform(orbit(count, mulberry32(16), layout.ringRadius), 1, offsets.stack),
    contact: transform(halo(count, mulberry32(17)), radius, offsets.contact),
  };
};
