import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor, useProgress } from "@react-three/drei";

import store, { CAMERA } from "./store";
import HeroRoom from "./HeroRoom";
import MorphCloud from "./MorphCloud";
import StackRing from "./StackRing";
import ContactModel from "./ContactModel";
import ActivityBars from "./ActivityBars";

// Feeds the DOM loader without pulling drei into the main bundle.
const LoadProgress = () => {
  const { progress } = useProgress();
  useEffect(() => {
    store.loadProgress = progress;
  }, [progress]);
  return null;
};

// Mounts only after the room and cloud have finished suspending.
const Ready = () => {
  useEffect(() => {
    store.sceneReady = true;
  }, []);
  return null;
};

// The page's only WebGL context: fixed behind all content. Pointer events
// come from #root, so the canvas never blocks clicks or scrolling.
const SceneCanvas = () => {
  const [dpr, setDpr] = useState(1.5);

  // h-lvh: sized for the browser bar hidden, so showing or hiding it on
  // phones never resizes the canvas (which would make the scene jump).
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-lvh" aria-hidden="true">
      <Canvas
        eventSource={document.getElementById("root")}
        eventPrefix="client"
        camera={{ position: [0, 0, CAMERA.z], fov: CAMERA.fov }}
        dpr={dpr}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#120a24"]} />
        <ambientLight intensity={0.35} color="#3a2257" />
        <LoadProgress />
        <PerformanceMonitor onIncline={() => setDpr(1.75)} onDecline={() => setDpr(1)} />
        <Suspense fallback={null}>
          <HeroRoom />
          <MorphCloud />
          <Ready />
        </Suspense>
        <Suspense fallback={null}>
          <StackRing />
        </Suspense>
        <Suspense fallback={null}>
          <ContactModel />
        </Suspense>
        <ActivityBars />
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
