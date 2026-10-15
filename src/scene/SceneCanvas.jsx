import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";

import { CAMERA } from "./store";
import HeroRoom from "./HeroRoom";
import MorphCloud from "./MorphCloud";
import StackIcons from "./StackIcons";
import ContactModel from "./ContactModel";

// The page's only WebGL context: fixed behind all content. Pointer events
// come from #root, so the canvas never blocks clicks or scrolling.
const SceneCanvas = () => {
  const [dpr, setDpr] = useState(1.5);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        eventSource={document.getElementById("root")}
        eventPrefix="client"
        camera={{ position: [0, 0, CAMERA.z], fov: CAMERA.fov }}
        dpr={dpr}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#120a24"]} />
        <ambientLight intensity={0.35} color="#3a2257" />
        {/* Soft key for the 3D icons and the contact desk. */}
        <hemisphereLight args={["#fcf3b0", "#3a2257", 0.9]} />
        <directionalLight position={[4, 6, 8]} intensity={1.6} color="#fff4e6" />
        <PerformanceMonitor onIncline={() => setDpr(1.75)} onDecline={() => setDpr(1)} />
        <Suspense fallback={null}>
          <HeroRoom />
          <MorphCloud />
        </Suspense>
        <Suspense fallback={null}>
          <StackIcons />
        </Suspense>
        <Suspense fallback={null}>
          <ContactModel />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
