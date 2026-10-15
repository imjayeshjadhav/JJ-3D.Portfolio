// Shared, mutable scroll/scene state. Written by scroll hooks and read inside
// useFrame, so nothing here triggers React re-renders.
const store = {
  velocity: 0, // smoothed scroll velocity from Lenis, px per frame
  stackProgress: 0, // 0..1 while the Stack section is pinned
  stackSpin: 0, // radians the Stack network is turned
  reducedMotion: false,
  // Rotation the visitor has dragged into each 3D model, in radians.
  drag: { hero: { x: 0, y: 0 }, contact: { x: 0, y: 0 } },
};

// Section order the cloud morphs through; matches data-formation attributes.
export const FORMATIONS = [
  "hero",
  "work-underwriteai",
  "work-timetable",
  "work-threatlens",
  "wins",
  "experience",
  "stack",
  "contact",
];

// The scene camera never moves, so DOM rects map to the z = 0 plane directly.
export const CAMERA = { z: 16, fov: 45 };

export const worldPerPixel = (viewportHeight) =>
  (2 * CAMERA.z * Math.tan(((CAMERA.fov / 2) * Math.PI) / 180)) / viewportHeight;

// Centre of a DOM rect, in world units on the z = 0 plane.
export const rectToWorld = (rect, width, height) => {
  const wpp = worldPerPixel(height);
  return {
    x: (rect.left + rect.width / 2 - width / 2) * wpp,
    y: -(rect.top + rect.height / 2 - height / 2) * wpp,
    wpp,
  };
};

export default store;
