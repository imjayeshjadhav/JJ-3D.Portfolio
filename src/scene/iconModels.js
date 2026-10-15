import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import {
  siDocker,
  siFastapi,
  siHuggingface,
  siLangchain,
  siMongodb,
  siNextdotjs,
  siPytorch,
  siTensorflow,
} from "simple-icons";

// Palette metals, one per skill group, so the shelf reads as one set.
// Hovering an icon warms it to its brand colour.
const FINISH = {
  ai: "#c4467f", // rose
  language: "#fcf3b0", // flame
  web: "#f7845b", // ember
  tools: "#d9cde8", // lilac
};

// Six logos are real models from the original portfolio; the rest are
// extruded from Simple Icons paths so every tool on the shelf is 3D.
export const ICON_MODELS = {
  pytorch: { svg: siPytorch, finish: "ai" },
  tensorflow: { svg: siTensorflow, finish: "ai" },
  huggingface: { svg: siHuggingface, finish: "ai" },
  langchain: { svg: siLangchain, finish: "ai", brand: "#7fc8a9" },
  python: { glb: "/models/python-transformed.glb", finish: "language", brand: "#3776ab" },
  java: { glb: "/models/java.glb", finish: "language", brand: "#e76f00" },
  cpp: { glb: "/models/c.glb", finish: "language", brand: "#00599c" },
  fastapi: { svg: siFastapi, finish: "web" },
  react: { glb: "/models/react_logo-transformed.glb", finish: "web", brand: "#61dafb" },
  nextjs: { svg: siNextdotjs, finish: "web", brand: "#ffffff" },
  node: { glb: "/models/node-transformed.glb", finish: "web", brand: "#5fa04e", rotation: [0, -Math.PI / 2, 0] },
  mongodb: { svg: siMongodb, finish: "tools" },
  docker: { svg: siDocker, finish: "tools" },
  git: { glb: "/models/git-svg-transformed.glb", finish: "tools", brand: "#f05032", rotation: [0, -Math.PI / 4, 0] },
};

export const finishColor = (model) => new THREE.Color(FINISH[model.finish]);
export const brandColor = (model) => new THREE.Color(model.brand ?? `#${model.svg.hex}`);

export const createIconMaterial = (model, envMap) =>
  new THREE.MeshStandardMaterial({
    color: finishColor(model),
    // Satin metal plus a soft self-glow, so icons stay bright on the dark
    // page without scene lights (which would also wash out the hero room).
    emissive: finishColor(model).multiplyScalar(0.28),
    metalness: 0.45,
    roughness: 0.35,
    envMap,
    envMapIntensity: 1.5,
    transparent: true, // dims when the Stack filter excludes it
  });

// A 24×24 Simple Icons path, extruded and centred in a unit box.
export const buildExtrudedIcon = (icon, material) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${icon.path}"/></svg>`;
  const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 4,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.3,
    bevelSegments: 3,
    curveSegments: 10,
  });
  geometry.center();
  geometry.rotateX(Math.PI); // SVG y points down
  geometry.scale(1 / 24, 1 / 24, 1 / 24);
  return new THREE.Mesh(geometry, material);
};

// Give every mesh in a loaded model the same palette material.
export const paintModel = (object, material) => {
  object.traverse((o) => {
    if (o.isMesh) o.material = material;
  });
  return object;
};

// Centre any object and scale it so its largest side is 1.
export const normalize = (object) => {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const wrapper = new THREE.Group();
  object.position.sub(center);
  wrapper.add(object);
  wrapper.scale.setScalar(1 / Math.max(size.x, size.y, size.z));
  return wrapper;
};
