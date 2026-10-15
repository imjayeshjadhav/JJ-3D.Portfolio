// Shared, mutable scroll/scene state. Written by scroll hooks and read inside
// useFrame, so nothing here triggers React re-renders.
const store = {
  velocity: 0, // smoothed scroll velocity from Lenis, px per frame
  reducedMotion: false,
  // Load sequence: the cloud converges on the room; 0..1, then done.
  introProgress: 0,
  introDone: false,
  // Rotation the visitor has dragged into each 3D model, in radians.
  drag: { hero: { x: 0, y: 0 }, contact: { x: 0, y: 0 } },
  // Stack carousel: scroll position (in icons), manual nudges, and the
  // icon currently at the front.
  ring: { scroll: 0, offset: 0, front: 0 },
  // A hovered pipeline stage: { key: formation, index: stage } or null.
  stageSpot: null,
  // Loader hand-off.
  loadProgress: 0,
  sceneReady: false,
  loaderDone: false,
};

// The Stack carousel ring, sized from its DOM stage (world units).
export const ringFromRect = (rect, width, height) => {
  const w = rectToWorld(rect, width, height);
  const narrow = rect.width < 600;
  const radius = Math.min(rect.width * (narrow ? 0.46 : 0.36), rect.height * 1.05) * w.wpp;
  // Narrow screens: smaller icons so neighbours on the ring do not overlap.
  const iconSize = Math.min(rect.height * 0.3, rect.width * (narrow ? 0.13 : 0.17)) * w.wpp;
  return { x: w.x, y: w.y, radius, iconSize, wpp: w.wpp };
};

// Section order the cloud morphs through; matches data-formation attributes.
export const FORMATIONS = [
  "hero",
  "about",
  "activity",
  "work-underwriteai",
  "work-timetable",
  "work-threatlens",
  "wins",
  "experience",
  "stack",
  "contact",
];

export const INTRO_SECONDS = 2.4;

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
