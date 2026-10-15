import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

import { stackIcons } from "../constants";
import store, { rectToWorld } from "./store";
import { buildExtrudedIcon, ICON_MODELS, normalize } from "./iconModels";

const GlbIcon = ({ url, rotation }) => {
  const { scene } = useGLTF(url);
  const object = useMemo(() => {
    const clone = scene.clone(true);
    if (rotation) clone.rotation.set(...rotation);
    return normalize(clone);
  }, [scene, rotation]);
  return <primitive object={object} />;
};

const SvgIcon = ({ icon }) => {
  const object = useMemo(() => normalize(buildExtrudedIcon(icon)), [icon]);
  return <primitive object={object} />;
};

// One icon, pinned to its slot in the Stack section so it scrolls with the
// page. It spins faster with scroll speed and when the slot is hovered.
const AnchoredIcon = ({ id, index }) => {
  const anchor = useRef();
  const spin = useRef();
  const slot = useRef(null);
  const angle = useRef(index * 0.7);
  const model = ICON_MODELS[id];

  useFrame((state, delta) => {
    slot.current ??= document.querySelector(`[data-icon3d="${id}"]`);
    const el = slot.current;
    const g = anchor.current;
    if (!el || !g) return;
    const r = el.getBoundingClientRect();
    const { width, height } = state.size;
    g.visible = r.width > 0 && r.bottom > 0 && r.top < height;
    if (!g.visible) return;

    const reduced = store.reducedMotion;
    const hovered = el.matches(":hover");
    const w = rectToWorld(r, width, height);
    const t = state.clock.elapsedTime;
    const size = Math.min(r.width, r.height) * w.wpp * 0.7;
    const bob = reduced ? 0 : Math.sin(t * 1.3 + index) * size * 0.06;
    g.position.set(w.x, w.y + bob, 0);
    g.scale.setScalar(size * (hovered ? 1.15 : 1));

    if (!reduced) {
      angle.current += delta * (0.5 + Math.min(Math.abs(store.velocity), 40) * 0.08 + (hovered ? 3 : 0));
    }
    // Flat logos swing ±60° so they never sit edge-on; hover spins fully.
    spin.current.rotation.y = reduced ? 0.3 : hovered ? angle.current : Math.sin(angle.current * 0.8) * 1.05;
    spin.current.rotation.x = reduced ? 0 : Math.sin(t * 0.8 + index) * 0.15;
  });

  return (
    <group ref={anchor} name={`stack-icon-${id}`} visible={false}>
      <group ref={spin}>
        <Suspense fallback={null}>
          {model.glb ? <GlbIcon url={model.glb} rotation={model.rotation} /> : <SvgIcon icon={model.svg} />}
        </Suspense>
      </group>
    </group>
  );
};

const StackIcons = () => (
  <group name="stack-icons">
    {stackIcons.map((icon, i) => (
      <AnchoredIcon key={icon.id} id={icon.id} index={i} />
    ))}
  </group>
);

export default StackIcons;
