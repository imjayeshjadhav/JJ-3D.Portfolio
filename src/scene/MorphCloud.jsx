import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import { projects } from "../constants";
import store, { FORMATIONS, rectToWorld, worldPerPixel } from "./store";
import { buildFormations, HERO_CLUSTERS, helixNodes } from "./formations";
import { createCloudMaterial } from "./cloudMaterial";
import StackGraph from "./StackGraph";

const ROOM_HEIGHT_UNITS = 13.26; // stage height that maps to room scale 1

// How bright each formation rests. Shapes that sit behind body copy settle
// dim so the text stays readable; every morph flares to full on the way.
const RESTING_INTENSITY = {
  hero: 1,
  "work-underwriteai": 0.38,
  "work-timetable": 0.38,
  "work-threatlens": 0.38,
  wins: 0.45,
  experience: 0.75,
  stack: 1,
  contact: 0.8,
};

// Formations zig-zag across the page as you scroll: -1 left, 1 right.
const SIDE = {
  "work-underwriteai": -1,
  "work-timetable": 1,
  "work-threatlens": -1,
  wins: 1,
};

// An element's centre in world units, measured as if scrolled to the top.
const centerOf = (id, width, height) => {
  const el = document.getElementById(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const rect = { left: r.left, top: r.top + window.scrollY, width: r.width, height: r.height };
  return { rect: r, world: rectToWorld(rect, width, height) };
};

// Where each formation sits, derived from the viewport and page layout.
const computeLayout = (width, height) => {
  const wpp = worldPerPixel(height);
  const halfW = (width / 2) * wpp;
  const halfHeight = (height / 2) * wpp;
  const mobile = width < 768;
  const side = mobile ? 0 : halfW * 0.5;
  const center = [0, -0.2, 0];

  const hero = centerOf("hero-stage", width, height);
  const heroCenter = hero ? [hero.world.x, hero.world.y, 0] : [side * 0.8, 0, 0];
  const heroScale = hero ? (hero.rect.height * wpp) / ROOM_HEIGHT_UNITS : 1;
  const contact = centerOf("contact-stage", width, height);

  const offsets = {
    hero: heroCenter.map((v, i) => v - center[i]),
    experience: mobile ? [0, 0, 0] : [-halfW * 0.56, -1.9, 0],
    // Leaves room on the right for the last layer's labels.
    stack: mobile ? [0, 0, 0] : [side - 1.4, 0, 0],
    contact: contact && !mobile ? [contact.world.x, 0.2, 0] : [0, 0, 0],
  };
  for (const [key, dir] of Object.entries(SIDE)) offsets[key] = [dir * side, 0, 0];

  return {
    mobile,
    finePointer: window.matchMedia("(pointer: fine)").matches,
    center,
    radius: mobile ? Math.min(2.3, halfW * 0.78) : Math.min(3.4, halfW * 0.3),
    heroCenter,
    heroScale,
    // Phones are narrow: pull the hero clusters in so labels stay on screen.
    heroSquash: mobile ? 0.62 : 1,
    // The hero's light sprinkle reaches across to the left edge.
    leftSpan: mobile ? 0 : heroCenter[0] + halfW,
    halfHeight,
    offsets,
  };
};

const pointCount = () => {
  if (window.matchMedia("(max-width: 767px)").matches) return 4500;
  if ((navigator.hardwareConcurrency ?? 8) <= 4) return 7000;
  return 12000;
};

const MorphCloud = () => {
  const { size, gl } = useThree();
  const group = useRef();
  const labelRefs = useRef([]);
  const pair = useRef({ from: -1, to: -1 });
  const shownMix = useRef(0);
  const anchors = useRef([]);
  const stage = useRef(null);
  const frame = useRef(0);
  const [stackActive, setStackActive] = useState(false);

  const count = useMemo(pointCount, []);
  const layout = useMemo(() => computeLayout(size.width, size.height), [size.width, size.height]);
  const formations = useMemo(() => buildFormations(count, layout), [count, layout]);

  const material = useMemo(createCloudMaterial, []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(count).map(Math.random);
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aFrom", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aTo", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aHueFrom", new THREE.BufferAttribute(new Float32Array(count), 1));
    g.setAttribute("aHueTo", new THREE.BufferAttribute(new Float32Array(count), 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [count]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  // New layout means new arrays: force the next frame to re-upload.
  useEffect(() => {
    pair.current = { from: -1, to: -1 };
  }, [formations]);

  const { offsets } = layout;
  const spot = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const { width, height } = state.size;
    const u = material.uniforms;
    const reduced = store.reducedMotion;

    // Which section are we in, and how far into the next one?
    if (frame.current++ % 60 === 0 || anchors.current.length === 0) {
      anchors.current = [...document.querySelectorAll("[data-formation]")];
    }
    const els = anchors.current;
    const line = height * 0.55;
    const tops = els.map((el) => el.getBoundingClientRect().top);
    let i = 0;
    tops.forEach((top, k) => {
      if (top <= line) i = k;
    });
    const zone = height * 0.45;
    const t = i + 1 < els.length ? THREE.MathUtils.clamp((line + zone - tops[i + 1]) / zone, 0, 1) : 0;
    const fromKey = els[i]?.dataset.formation ?? "hero";
    const toKey = els[i + 1]?.dataset.formation ?? fromKey;
    const from = FORMATIONS.indexOf(fromKey);
    const to = FORMATIONS.indexOf(toKey);

    if (from !== pair.current.from || to !== pair.current.to) {
      const a = formations[fromKey];
      const b = formations[toKey];
      geometry.attributes.aFrom.array.set(a.positions);
      geometry.attributes.aTo.array.set(b.positions);
      geometry.attributes.aHueFrom.array.set(a.hues);
      geometry.attributes.aHueTo.array.set(b.hues);
      for (const name of ["aFrom", "aTo", "aHueFrom", "aHueTo"]) geometry.attributes[name].needsUpdate = true;
      // Moving forward the new pair starts at 0; moving back it starts at 1.
      shownMix.current = pair.current.from === -1 ? t : from > pair.current.from ? 0 : 1;
      pair.current = { from, to };
    }

    // Reduced motion: no scroll-scrubbed morph, just a quick settle.
    const target = reduced ? (t > 0.5 ? 1 : 0) : t;
    shownMix.current = THREE.MathUtils.damp(shownMix.current, target, reduced ? 6 : 10, delta);
    const mix = shownMix.current;
    const weight = (key) => (fromKey === key ? 1 - mix : 0) + (toKey === key ? mix : 0);

    u.uMix.value = mix;
    u.uTime.value = reduced ? 0 : state.clock.elapsedTime;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uViewportHeight.value = height;
    u.uVelocity.value = reduced ? 0 : THREE.MathUtils.damp(u.uVelocity.value, store.velocity, 4, delta);
    const rest = THREE.MathUtils.lerp(RESTING_INTENSITY[fromKey], RESTING_INTENSITY[toKey], mix);
    const flare = Math.sin(mix * Math.PI) * 0.5;
    u.uOpacity.value = Math.min(1, rest + flare) * (layout.mobile ? 0.55 : 1);

    // Cursor repel on desktop pointers; gentler over the Stack so nodes hold.
    const wpp = worldPerPixel(height);
    u.uPointer.value.set((state.pointer.x * width * wpp) / 2, (state.pointer.y * height * wpp) / 2, 0);
    const finePointer = layout.finePointer && !layout.mobile && !reduced;
    const repel = finePointer ? 1 - weight("stack") * 0.75 : 0;
    u.uRepel.value = THREE.MathUtils.damp(u.uRepel.value, repel, 4, delta);

    // While the hero shows, the cloud rides along with the room (so it
    // scrolls like content), then lets go as it morphs away.
    const g = group.current;
    stage.current ??= document.getElementById("hero-stage");
    let ride = 0;
    if (stage.current) {
      const now = rectToWorld(stage.current.getBoundingClientRect(), width, height);
      ride = (now.y - layout.heroCenter[1]) * weight("hero");
    }
    g.position.y = layout.center[1] + ride;
    g.rotation.y = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.12) * 0.05;

    // The Stack network turns about its own centre while its section is pinned.
    store.stackSpin = reduced ? 0 : weight("stack") * (store.stackProgress - 0.5) * 1.1;
    u.uSpin.value = store.stackSpin;
    u.uSpinCenter.value.fromArray(offsets.stack);

    // Experience: light the helix node for the role nearest the centre.
    const expWeight = weight("experience");
    if (expWeight > 0.01) {
      let best = 0;
      let bestD = Infinity;
      document.querySelectorAll("[data-exp-index]").forEach((el, k) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - height / 2);
        if (d < bestD) {
          bestD = d;
          best = k;
        }
      });
      const node = helixNodes[best] ?? helixNodes[0];
      const k = layout.radius * 0.8;
      const o = offsets.experience;
      spot.set(node[0] * k + o[0], node[1] * k + o[1], node[2] * k + o[2]);
      g.localToWorld(spot);
      u.uSpot.value.lerp(spot, 1 - Math.exp(-6 * delta));
    }
    u.uSpotAmount.value = THREE.MathUtils.damp(u.uSpotAmount.value, expWeight, 5, delta);

    // Hero cluster labels fade out as soon as the cloud starts to move.
    const heroWeight = THREE.MathUtils.clamp((weight("hero") - 0.6) / 0.4, 0, 1);
    labelRefs.current.forEach((el) => {
      if (!el) return;
      el.style.opacity = heroWeight;
      el.style.pointerEvents = heroWeight > 0.5 ? "auto" : "none";
      el.tabIndex = heroWeight > 0.5 ? 0 : -1;
    });

    const showStack = layout.finePointer && !layout.mobile && weight("stack") > 0.6;
    if (showStack !== stackActive) setStackActive(showStack);
  });

  const goTo = (id) => {
    document
      .getElementById(`work-${id}`)
      ?.scrollIntoView({ behavior: store.reducedMotion ? "auto" : "smooth" });
  };

  const h = offsets.hero;
  return (
    <group ref={group} position={layout.center} name="morph-cloud">
      <points geometry={geometry} material={material} frustumCulled={false} name="cloud-points" />

      {projects.map((project, k) => {
        const c = HERO_CLUSTERS[project.id];
        return (
          <Html
            key={project.id}
            position={[
              h[0] + c[0] * layout.heroScale * layout.heroSquash,
              h[1] + (c[1] + 1.6) * layout.heroScale,
              h[2] + c[2] * layout.heroScale,
            ]}
            center
            portal={{ current: document.getElementById("scene-overlay") }}
            zIndexRange={[20, 0]}
          >
            <button
              ref={(el) => (labelRefs.current[k] = el)}
              type="button"
              className="cluster-label"
              onClick={() => goTo(project.id)}
            >
              <span className="dot bg-flame" aria-hidden="true" />
              {project.shortName ?? project.name}
            </button>
          </Html>
        );
      })}

      {stackActive && <StackGraph radius={layout.radius} center={offsets.stack} />}
    </group>
  );
};

export default MorphCloud;
