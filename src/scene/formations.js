import { experience, skills } from "../constants";

/*
  Every formation is exactly `count` points plus a hue per point (0..1 along
  the magma ramp). Shapes are built in unit space (roughly -1..1) and scaled by
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

export const HERO_CLUSTERS = {
  underwriteai: [-4.3, 2.6, 0.8],
  timetable: [4.6, 3.3, -1.2],
  threatlens: [4.2, -1.9, 2.2],
};

const HERO_VISIBLE = 4400;

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
    ...Object.values(HERO_CLUSTERS).map((c) => ({
      weight: 280,
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
      weight: leftSpan > 0 ? 2400 : 0,
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

/* ------------- UnderwriteAI: two trees feeding a meta-model --------------- */

const ensemble = (count, rand) => {
  const segments = [];
  const nodes = [];
  const leaves = [];
  const META = [0, -0.92, 0];
  const branch = (x, y, z, dx, depth) => {
    nodes.push([x, y, z]);
    if (depth === 0) {
      leaves.push([x, y, z]);
      return;
    }
    for (const dir of [-1, 1]) {
      const child = [x + dir * dx, y - 0.3, z];
      segments.push([[x, y, z], child]);
      branch(child[0], child[1], z, dx / 2, depth - 1);
    }
  };
  branch(-0.6, 0.95, -0.25, 0.3, 4);
  branch(0.6, 0.95, 0.25, 0.3, 4);
  const toMeta = leaves.map((l) => [l, META]);

  return fill(count, rand, [
    segmentPart(0.4, segments, (a, b, t) => lerp(0.35, 0.6, (0.95 - lerp(a[1], b[1], t)) / 1.2)),
    segmentPart(0.22, toMeta, (a, b, t) => lerp(0.55, 0.85, t), 0.008),
    blobPart(0.16, nodes, 0.03, 0.78),
    blobPart(0.1, [META], 0.07, 1),
    haze(),
  ]);
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
        o[3] = 0.95;
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

/* -------- Stack: a neural net, one layer per skill group ------------------ */

const SHORT = {
  "Hugging Face Transformers": "Hugging Face",
  "NLP and embeddings": "NLP + embeddings",
  "Data structures and algorithms": "DSA",
  "Operating systems": "OS",
  "Computer networks": "Networks",
};

export const stackGraph = (() => {
  const rand = mulberry32(42);
  const nodes = [];
  skills.forEach(({ group, items }, layer) => {
    const x = -1.25 + layer * (2.5 / (skills.length - 1));
    const spacing = Math.min(0.17, 1.9 / Math.max(items.length - 1, 1));
    items.forEach((item, j) => {
      nodes.push({
        label: SHORT[item] ?? item,
        group,
        layer,
        position: [x, ((items.length - 1) / 2 - j) * spacing, 0.22 * Math.sin(j * 1.3 + layer)],
      });
    });
  });
  const edges = [];
  for (let l = 0; l < skills.length - 1; l++) {
    const from = nodes.map((n, i) => [n, i]).filter(([n]) => n.layer === l);
    const to = nodes.map((n, i) => [n, i]).filter(([n]) => n.layer === l + 1);
    for (const [, a] of from) {
      const picks = new Set();
      while (picks.size < Math.min(3, to.length)) picks.add(to[Math.floor(rand() * to.length)][1]);
      for (const b of picks) edges.push([a, b]);
    }
  }
  return { nodes, edges };
})();

const network = (count, rand) => {
  const { nodes, edges } = stackGraph;
  const segments = edges.map(([a, b]) => [nodes[a].position, nodes[b].position]);
  return fill(count, rand, [
    segmentPart(0.5, segments, (a) => 0.28 + 0.13 * ((a[0] + 1.25) / 0.625), 0.006),
    blobPart(0.36, nodes.map((n) => n.position), 0.028, 0.95),
    haze(1.9),
  ]);
};

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

/* ------------------------------------------------------------------------ */

const transform = ({ positions, hues }, scale, offset = [0, 0, 0]) => {
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
  return {
    hero: transform(heroShape, heroScale, offsets.hero),
    "work-underwriteai": transform(ensemble(count, mulberry32(11)), radius, offsets["work-underwriteai"]),
    "work-timetable": transform(lattice(count, mulberry32(12)), radius, offsets["work-timetable"]),
    "work-threatlens": transform(shield(count, mulberry32(13)), radius, offsets["work-threatlens"]),
    wins: transform(podium(count, mulberry32(14)), radius, offsets.wins),
    experience: transform(helix(count, mulberry32(15)), radius * 0.8, offsets.experience),
    stack: transform(network(count, mulberry32(16)), radius, offsets.stack),
    contact: transform(halo(count, mulberry32(17)), radius, offsets.contact),
  };
};
