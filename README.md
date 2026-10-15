# Jayesh Jadhav — portfolio

React 19 + Vite 6, three.js via React Three Fiber, GSAP + Lenis for scroll.

## How the 3D works

One fixed WebGL canvas (`src/scene/SceneCanvas.jsx`) sits behind the whole page.

- `MorphCloud` — a single particle system (12k points desktop, 4.5k mobile) that
  morphs between per-section shapes as you scroll. Shapes live in
  `src/scene/formations.js`; each section opts in with `data-formation="…"`.
- `HeroRoom`, `ContactModel`, `StackIcons` — real models pinned to DOM elements
  (`#hero-stage`, `#contact-stage`, `[data-icon3d]`) so they scroll with the page.
- `StackGraph` — labels and hover targets over the Stack neural-net formation.

Reduced motion turns off smooth scroll and scroll-scrubbed morphs.

## Develop

```bash
npm install
npm run dev
```
