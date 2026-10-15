import { useMemo } from "react";
import * as THREE from "three";

// Lights are tinted from the magma ramp: a warm flame key, rose and plum fills.
const HeroLights = () => {
  const areaLight = useMemo(() => new THREE.RectAreaLight("#b5367a", 8, 3, 2), []);

  return (
    <>
      {/* desk lamp */}
      <spotLight
        position={[2, 5, 6]}
        angle={0.15}
        penumbra={0.2}
        intensity={100}
        color="#fcf3b0"
      />
      {/* ember overhead */}
      <spotLight
        position={[4, 5, 4]}
        angle={0.3}
        penumbra={0.5}
        intensity={45}
        color="#f7845b"
      />
      {/* rose side fill */}
      <spotLight
        position={[-3, 5, 5]}
        angle={0.4}
        penumbra={1}
        intensity={60}
        color="#b5367a"
      />
      <primitive
        object={areaLight}
        position={[1, 3, 4]}
        rotation={[-Math.PI / 4, Math.PI / 4, 0]}
        intensity={15}
      />
      <pointLight position={[0, 1, 0]} intensity={10} color="#721f81" />
      <pointLight position={[1, 2, -2]} intensity={10} color="#3a2257" />
    </>
  );
};

export default HeroLights;
