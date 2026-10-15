import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { Room } from "../components/Models/HeroModels/Room";
import HeroLights from "../components/Models/HeroModels/HeroLights";
import store, { rectToWorld } from "./store";

const ROOM_HEIGHT_UNITS = 13.26;

// The room is pinned to #hero-stage, so it scrolls away with the hero like
// page content while the particle cloud stays behind and changes shape.
const HeroRoom = () => {
  const anchor = useRef();
  const tilt = useRef();
  const stage = useRef(null);

  useFrame((state, delta) => {
    stage.current ??= document.getElementById("hero-stage");
    const el = stage.current;
    const g = anchor.current;
    if (!el || !g) return;

    const r = el.getBoundingClientRect();
    const { width, height } = state.size;
    g.visible = r.bottom > -40 && r.top < height;
    if (!g.visible) return;

    const w = rectToWorld(r, width, height);
    // 0 at rest, 1 once the stage has scrolled fully out of view.
    const out = THREE.MathUtils.clamp(-r.top / r.height, 0, 1);
    // On load the room grows in and turns to rest while the cloud converges.
    const settle = store.introProgress;
    const scale = ((r.height * w.wpp) / ROOM_HEIGHT_UNITS) * (1 - out * 0.3) * (0.85 + 0.15 * settle);
    g.position.set(w.x, w.y, 0);
    g.scale.setScalar(scale);

    // Dragged rotation, light pointer parallax, and a tip back as the hero scrolls out.
    const reduced = store.reducedMotion;
    const drag = store.drag.hero;
    const t = tilt.current;
    const parallaxY = reduced ? 0 : state.pointer.x * 0.12;
    const parallaxX = reduced ? 0 : -state.pointer.y * 0.05;
    t.rotation.y = THREE.MathUtils.damp(t.rotation.y, drag.y + parallaxY - (1 - settle) * 0.5, 6, delta);
    t.rotation.x = THREE.MathUtils.damp(t.rotation.x, drag.x + parallaxX + out * 0.5, 6, delta);
  });

  return (
    <group ref={anchor} name="hero-room">
      <group ref={tilt}>
        <HeroLights />
        <group position={[0, -3.5, 0]} rotation={[0, -Math.PI / 4, 0]}>
          <Room />
        </group>
      </group>
    </group>
  );
};

export default HeroRoom;
