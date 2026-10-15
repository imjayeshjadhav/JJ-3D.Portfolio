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

// Six logos are real models from the original portfolio; the rest are
// extruded from Simple Icons paths so every tool on the shelf is 3D.
export const ICON_MODELS = {
  react: { glb: "/models/react_logo-transformed.glb" },
  node: { glb: "/models/node-transformed.glb", rotation: [0, -Math.PI / 2, 0] },
  python: { glb: "/models/python-transformed.glb" },
  java: { glb: "/models/java.glb" },
  cpp: { glb: "/models/c.glb" },
  git: { glb: "/models/git-svg-transformed.glb", rotation: [0, -Math.PI / 4, 0] },
  pytorch: { svg: siPytorch },
  tensorflow: { svg: siTensorflow },
  huggingface: { svg: siHuggingface },
  langchain: { svg: siLangchain },
  fastapi: { svg: siFastapi },
  mongodb: { svg: siMongodb },
  docker: { svg: siDocker },
  nextjs: { svg: siNextdotjs },
};

const FLAME = new THREE.Color("#fcf3b0");

// Brand colour, unless it would vanish on the dark page (Next.js, LangChain).
const iconColor = (hex) => {
  const c = new THREE.Color(`#${hex}`);
  const { r, g, b } = c;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.12 ? FLAME.clone() : c;
};

// A 24×24 Simple Icons path, extruded and centred in a unit box.
export const buildExtrudedIcon = (icon) => {
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
  const material = new THREE.MeshStandardMaterial({
    color: iconColor(icon.hex),
    metalness: 0.35,
    roughness: 0.32,
  });
  return new THREE.Mesh(geometry, material);
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
