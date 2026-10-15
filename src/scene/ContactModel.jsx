import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import store, { rectToWorld } from "./store";
import { normalize } from "./iconModels";

const URL = "/models/computer-optimized-transformed.glb";

// The desk, computer and chair, pinned to #contact-stage beside the form.
// The particle cloud forms orbit rings around it.
const ContactModel = () => {
  const anchor = useRef();
  const turn = useRef();
  const stage = useRef(null);
  const { scene } = useGLTF(URL);
  const model = useMemo(() => normalize(scene.clone(true)), [scene]);

  useFrame((state, delta) => {
    stage.current ??= document.getElementById("contact-stage");
    const el = stage.current;
    const g = anchor.current;
    if (!el || !g) return;
    const r = el.getBoundingClientRect();
    const { width, height } = state.size;
    g.visible = r.width > 0 && r.bottom > 0 && r.top < height;
    if (!g.visible) return;

    const w = rectToWorld(r, width, height);
    g.position.set(w.x, w.y, 0);
    g.scale.setScalar(Math.min(r.width, r.height * 1.3) * w.wpp * 0.78);

    // Dragged rotation, a little pointer parallax, and a swing in on arrival.
    const reduced = store.reducedMotion;
    const drag = store.drag.contact;
    const enter = THREE.MathUtils.clamp((height - r.top) / height, 0, 1);
    const swing = reduced ? 0 : state.pointer.x * 0.15 + (1 - enter) * 0.9;
    turn.current.rotation.y = THREE.MathUtils.damp(turn.current.rotation.y, -0.5 + drag.y + swing, 6, delta);
    turn.current.rotation.x = THREE.MathUtils.damp(turn.current.rotation.x, 0.12 + drag.x - (reduced ? 0 : state.pointer.y * 0.05), 6, delta);
  });

  return (
    <group ref={anchor} name="contact-model" visible={false}>
      <group ref={turn}>
        <primitive object={model} />
      </group>
    </group>
  );
};

useGLTF.preload(URL);

export default ContactModel;
