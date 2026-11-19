import { useMemo } from "react";
import * as THREE from "three";

// Warm, low-key studio light: an ivory desk lamp, champagne and bronze fills.
const HeroLights = () => {
  const areaLight = useMemo(() => new THREE.RectAreaLight("#c9a96e", 6, 3, 2), []);

  return (
    <>
      {/* desk lamp */}
      <spotLight
        position={[2, 5, 6]}
        angle={0.15}
        penumbra={0.2}
        intensity={100}
        color="#f4efe4"
      />
      {/* champagne overhead */}
      <spotLight
        position={[4, 5, 4]}
        angle={0.3}
        penumbra={0.5}
        intensity={70}
        color="#c9a96e"
      />
      {/* bronze side fill */}
      <spotLight
        position={[-3, 5, 5]}
        angle={0.4}
        penumbra={1}
        intensity={80}
        color="#8c6a3f"
      />
      <primitive
        object={areaLight}
        position={[1, 3, 4]}
        rotation={[-Math.PI / 4, Math.PI / 4, 0]}
        intensity={15}
      />
      <pointLight position={[0, 1, 0]} intensity={18} color="#c9a96e" />
      <pointLight position={[1, 2, -2]} intensity={10} color="#2a2d33" />
    </>
  );
};

export default HeroLights;
