import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// One shared reflection map for the icons and the contact desk. It is set on
// those materials only (never scene.environment), so the hero room keeps its
// moody spot lighting.
// Keyed by renderer: a texture from an old WebGL context (after a hot
// reload or a lost context) would render black.
const cache = new WeakMap();

export const useEnvMap = () => {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    if (!cache.has(gl)) {
      const pmrem = new THREE.PMREMGenerator(gl);
      cache.set(gl, pmrem.fromScene(new RoomEnvironment(), 0.04).texture);
      pmrem.dispose();
    }
    return cache.get(gl);
  }, [gl]);
};

// Swap any material on `object` for a lit-by-environment standard material,
// keeping its colour and texture.
export const applyEnvMap = (object, envMap, intensity = 1) => {
  object.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const next = mats.map((m) => {
      const std = m.isMeshStandardMaterial
        ? m.clone()
        : new THREE.MeshStandardMaterial({ color: m.color ?? 0xffffff, map: m.map ?? null, roughness: 0.6 });
      std.envMap = envMap;
      std.envMapIntensity = intensity;
      return std;
    });
    o.material = Array.isArray(o.material) ? next : next[0];
  });
  return object;
};
