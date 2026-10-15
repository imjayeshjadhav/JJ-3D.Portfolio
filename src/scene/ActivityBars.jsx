import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import leetcode from "../data/leetcode.json";
import store, { rectToWorld } from "./store";
import { useEnvMap } from "./envMap";

const LEVEL_COLORS = ["#22143f", "#721f81", "#b5367a", "#f7845b", "#fcf3b0"].map((c) => new THREE.Color(c));
const RISE_SECONDS = 0.7;

const formatDay = ({ date, count }) => {
  const when = new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  if (count === 0) return `No submissions on ${when}`;
  return `${count} submission${count === 1 ? "" : "s"} on ${when}`;
};

// The last year of LeetCode submissions as a field of bars, pinned to
// #activity-stage. Height and colour follow the day's activity level.
const ActivityBars = () => {
  const { size } = useThree();
  const anchor = useRef();
  const mesh = useRef();
  const stage = useRef(null);
  const tooltip = useRef(null);
  const riseStart = useRef(null);
  const light = useRef();
  const settled = useRef(false);
  const envMap = useEnvMap();

  // Lay days out as week columns × weekday rows; phones show 26 weeks.
  const grid = useMemo(() => {
    const offset = new Date(`${leetcode.days[0].date}T00:00:00`).getDay();
    let cells = leetcode.days.map((day, i) => ({ ...day, col: Math.floor((i + offset) / 7), row: (i + offset) % 7 }));
    const totalCols = cells[cells.length - 1].col + 1;
    const cols = size.width < 768 ? 26 : totalCols;
    const firstCol = totalCols - cols;
    cells = cells.filter((c) => c.col >= firstCol).map((c) => ({ ...c, col: c.col - firstCol }));
    return { cells, cols };
  }, [size.width]);

  const geometry = useMemo(() => new THREE.BoxGeometry(0.78, 1, 0.78).translate(0, 0.5, 0), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ metalness: 0.35, roughness: 0.4, envMap, envMapIntensity: 1 }),
    [envMap]
  );
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Scrolling moves the bars out from under the pointer: drop the tooltip.
  useEffect(() => {
    const hide = () => tooltip.current && (tooltip.current.dataset.show = "false");
    window.addEventListener("scroll", hide, { passive: true });
    return () => window.removeEventListener("scroll", hide);
  }, []);

  // Colours once per layout; heights start flat and rise on first view.
  useEffect(() => {
    const m = mesh.current;
    grid.cells.forEach((c, i) => {
      m.setColorAt(i, LEVEL_COLORS[c.level]);
      dummy.position.set(c.col - grid.cols / 2 + 0.5, 0, c.row - 3);
      dummy.scale.set(1, 0.08, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceColor.needsUpdate = true;
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
    settled.current = false;
  }, [grid, dummy]);

  useFrame((state) => {
    stage.current ??= document.getElementById("activity-stage");
    tooltip.current ??= document.getElementById("activity-tooltip");
    const el = stage.current;
    const g = anchor.current;
    if (!el || !g) return;
    const r = el.getBoundingClientRect();
    const { width, height } = state.size;
    g.visible = r.width > 0 && r.bottom > 0 && r.top < height;
    // Lights are global in three.js, so this one is on only while the bars show.
    if (light.current) light.current.visible = g.visible;
    if (!g.visible) {
      if (tooltip.current) tooltip.current.dataset.show = "false";
      return;
    }

    const w = rectToWorld(r, width, height);
    const cell = (r.width * w.wpp * 0.94) / grid.cols;
    g.position.set(w.x, w.y - r.height * w.wpp * 0.18, 0);
    g.scale.setScalar(cell);

    if (settled.current) return;
    if (riseStart.current === null && r.top < height * 0.85) riseStart.current = state.clock.elapsedTime;
    if (riseStart.current === null) return;

    // Columns rise left to right, like the year playing back.
    const t = state.clock.elapsedTime - riseStart.current;
    let done = true;
    grid.cells.forEach((c, i) => {
      const p = store.reducedMotion ? 1 : THREE.MathUtils.clamp((t - c.col * 0.025) / RISE_SECONDS, 0, 1);
      if (p < 1) done = false;
      const eased = 1 - Math.pow(1 - p, 3);
      dummy.position.set(c.col - grid.cols / 2 + 0.5, 0, c.row - 3);
      dummy.scale.set(1, 0.08 + (0.25 + c.level * 0.85) * eased * (c.level > 0 ? 1 : 0), 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    // Bars changed height: recompute hit-test bounds so hover keeps working.
    mesh.current.computeBoundingSphere();
    settled.current = done;
  });

  const showTooltip = (e) => {
    const tip = tooltip.current;
    const cell = grid.cells[e.instanceId];
    if (!tip || !cell) return;
    e.stopPropagation();
    tip.textContent = formatDay(cell);
    tip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY - 34}px)`;
    tip.dataset.show = "true";
  };
  const hideTooltip = () => {
    if (tooltip.current) tooltip.current.dataset.show = "false";
  };

  return (
    <>
      <hemisphereLight ref={light} args={["#fcf3b0", "#3a2257", 1.1]} visible={false} />
      <group ref={anchor} name="activity-bars" visible={false}>
        <group rotation={[0.62, 0, 0]}>
          <instancedMesh
            ref={mesh}
            args={[geometry, material, grid.cells.length]}
            onPointerMove={showTooltip}
            onPointerOut={hideTooltip}
          />
        </group>
      </group>
    </>
  );
};

export default ActivityBars;
