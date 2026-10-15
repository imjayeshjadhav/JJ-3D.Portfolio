import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";

import store from "./store";
import { stackGraph } from "./formations";

// Labels and hover targets laid over the "stack" formation. The particles
// already draw the network; this adds names and lets you trace connections.
const StackGraph = ({ radius, center }) => {
  const [hovered, setHovered] = useState(null);
  const spin = useRef();
  // Turn with the particle network (same angle the shader uses).
  useFrame(() => {
    if (spin.current) spin.current.rotation.y = store.stackSpin ?? 0;
  });
  const overlay = useMemo(() => ({ current: document.getElementById("scene-overlay") }), []);

  const nodes = useMemo(
    () => stackGraph.nodes.map((n) => ({ ...n, p: n.position.map((v) => v * radius) })),
    [radius]
  );

  const linked = useMemo(() => {
    if (hovered === null) return { set: new Set(), edges: [] };
    const edges = stackGraph.edges.filter(([a, b]) => a === hovered || b === hovered);
    return { set: new Set(edges.flat()), edges };
  }, [hovered]);

  return (
    <group name="stack-graph" position={center}>
      <group ref={spin}>
      {nodes.map((node, i) => (
        <group key={node.label} position={node.p}>
          <mesh
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(i);
            }}
            onPointerOut={() => setHovered((h) => (h === i ? null : h))}
          >
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <Html portal={overlay} zIndexRange={[19, 0]} style={{ pointerEvents: "none" }}>
            <span
              aria-hidden="true"
              className={`stack-label ${hovered === i ? "is-hovered" : ""} ${
                hovered !== null && hovered !== i && !linked.set.has(i) ? "is-dimmed" : ""
              } ${linked.set.has(i) && hovered !== i ? "is-linked" : ""}`}
            >
              {node.label}
            </span>
          </Html>
        </group>
      ))}

      {linked.edges.map(([a, b]) => (
        <Line
          key={`${a}-${b}`}
          points={[nodes[a].p, nodes[b].p]}
          color="#f7845b"
          lineWidth={1.6}
          transparent
          opacity={0.9}
        />
      ))}
      </group>
    </group>
  );
};

export default StackGraph;
