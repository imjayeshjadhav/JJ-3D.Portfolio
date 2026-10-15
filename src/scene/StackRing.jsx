import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { stackIcons } from "../constants";
import store, { ringFromRect } from "./store";
import { useEnvMap } from "./envMap";
import {
  brandColor,
  buildExtrudedIcon,
  createIconMaterial,
  finishColor,
  ICON_MODELS,
  normalize,
  paintModel,
} from "./iconModels";

const N = stackIcons.length;
const TAU = Math.PI * 2;

const GlbIcon = ({ url, rotation, material }) => {
  const { scene } = useGLTF(url);
  const object = useMemo(() => {
    const clone = paintModel(scene.clone(true), material);
    if (rotation) clone.rotation.set(...rotation);
    return normalize(clone);
  }, [scene, rotation, material]);
  return <primitive object={object} />;
};

const SvgIcon = ({ icon, material }) => {
  const object = useMemo(() => normalize(buildExtrudedIcon(icon, material)), [icon, material]);
  return <primitive object={object} />;
};

// Shortest signed distance from a to b around a ring of n.
const wrap = (d) => ((((d + N / 2) % N) + N) % N) - N / 2;

// One icon on the ring. Its place comes from the ring's current angle;
// the one at the front grows, warms to its brand colour and spins.
const RingIcon = ({ id, index, ring }) => {
  const group = useRef();
  const spin = useRef();
  const model = ICON_MODELS[id];
  const envMap = useEnvMap();
  const material = useMemo(() => createIconMaterial(model, envMap), [model, envMap]);
  const colors = useMemo(() => ({ rest: finishColor(model), front: brandColor(model) }), [model]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const r = ring.current;
    if (!r) return;
    const d = wrap(index - r.angle); // 0 = front
    const theta = (d / N) * TAU;
    const depth = (Math.cos(theta) + 1) / 2; // 1 front, 0 back
    const front = Math.max(0, 1 - Math.abs(d)); // 1 exactly at the front

    group.current.position.set(
      Math.sin(theta) * r.radius,
      (1 - Math.cos(theta)) * r.radius * 0.1,
      (Math.cos(theta) - 1) * r.radius * 0.6
    );
    group.current.scale.setScalar(r.iconSize * (0.55 + 0.45 * depth * depth + 0.55 * front));

    material.opacity = 0.3 + 0.7 * depth;
    material.color.lerp(front > 0.5 ? colors.front : colors.rest, 1 - Math.exp(-6 * delta));
    material.emissive.copy(material.color).multiplyScalar(0.22 + 0.25 * front);

    const t = state.clock.elapsedTime;
    if (store.reducedMotion) spin.current.rotation.y = 0;
    else if (front > 0.5) spin.current.rotation.y += delta * 1.2;
    else spin.current.rotation.y = Math.sin(t * 0.7 + index) * 0.5 - theta * 0.6;
  });

  return (
    <group ref={group}>
      <group ref={spin}>
        {/* Click a tool to bring it to the front. */}
        <group
          onClick={(e) => {
            e.stopPropagation();
            store.ring.offset += wrap(index - ring.current.angle);
          }}
        >
          <Suspense fallback={null}>
            {model.glb ? (
              <GlbIcon url={model.glb} rotation={model.rotation} material={material} />
            ) : (
              <SvgIcon icon={model.svg} material={material} />
            )}
          </Suspense>
        </group>
      </group>
    </group>
  );
};

// The Stack carousel: every tool on one slowly turning ring, pinned to
// #stack-stage. Scrolling turns it (StackSection writes store.ring.scroll);
// the buttons and clicks nudge it (store.ring.offset).
const StackRing = () => {
  const anchor = useRef();
  const stage = useRef(null);
  const ring = useRef({ angle: 0, radius: 3, iconSize: 1 });

  useFrame((state, delta) => {
    stage.current ??= document.getElementById("stack-stage");
    const el = stage.current;
    const g = anchor.current;
    if (!el || !g) return;
    const rect = el.getBoundingClientRect();
    const { width, height } = state.size;
    g.visible = rect.width > 0 && rect.bottom > 0 && rect.top < height;
    if (!g.visible) return;

    const geo = ringFromRect(rect, width, height);
    g.position.set(geo.x, geo.y - geo.radius * 0.1, 0);

    // Ease toward the scroll + nudge target, so turns glide.
    const target = store.ring.scroll + store.ring.offset;
    const r = ring.current;
    r.angle = store.reducedMotion ? target : THREE.MathUtils.damp(r.angle, target, 5, delta);
    r.radius = geo.radius;
    r.iconSize = geo.iconSize;

    const front = ((Math.round(r.angle) % N) + N) % N;
    if (front !== store.ring.front) {
      store.ring.front = front;
      window.dispatchEvent(new CustomEvent("stack:front", { detail: front }));
    }
  });

  return (
    <group ref={anchor} name="stack-ring" visible={false}>
      {stackIcons.map((icon, i) => (
        <RingIcon key={icon.id} id={icon.id} index={i} ring={ring} />
      ))}
    </group>
  );
};

export default StackRing;
