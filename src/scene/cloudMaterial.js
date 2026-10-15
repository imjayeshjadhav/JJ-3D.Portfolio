import * as THREE from "three";

// Points that morph between two formations. Each particle starts its move at
// a slightly different moment (aSeed) and arcs outward mid-flight, so a
// transition reads as the cloud dissolving and re-forming rather than sliding.
const vertexShader = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aHueFrom;
  attribute float aHueTo;
  attribute float aSeed;

  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uViewportHeight;
  uniform float uVelocity;
  uniform float uRepel;
  uniform vec3 uPointer;
  uniform vec3 uSpot;
  uniform float uSpotAmount;
  uniform float uSpin;
  uniform vec3 uSpinCenter;

  varying vec3 vColor;
  varying float vAlpha;

  vec3 ramp(float t) {
    vec3 c0 = vec3(0.227, 0.133, 0.341); // #3a2257
    vec3 c1 = vec3(0.447, 0.122, 0.506); // #721f81
    vec3 c2 = vec3(0.710, 0.212, 0.478); // #b5367a
    vec3 c3 = vec3(0.969, 0.518, 0.357); // #f7845b
    vec3 c4 = vec3(0.988, 0.953, 0.690); // #fcf3b0
    t = clamp(t, 0.0, 1.0) * 4.0;
    if (t < 1.0) return mix(c0, c1, t);
    if (t < 2.0) return mix(c1, c2, t - 1.0);
    if (t < 3.0) return mix(c2, c3, t - 2.0);
    return mix(c3, c4, t - 3.0);
  }

  void main() {
    float m = clamp(uMix * 1.6 - aSeed * 0.6, 0.0, 1.0);
    m = m * m * (3.0 - 2.0 * m);

    vec3 pos = mix(aFrom, aTo, m);

    // Mid-flight arc: each particle swings out along its own direction.
    vec3 dir = normalize(vec3(sin(aSeed * 91.0), cos(aSeed * 57.0), sin(aSeed * 23.0)));
    pos += dir * sin(m * 3.14159) * (0.9 + aSeed * 1.4);

    // The Stack network turns about its own centre while the section is pinned.
    vec3 sp = pos - uSpinCenter;
    float cs = cos(uSpin), sn = sin(uSpin);
    pos = uSpinCenter + vec3(cs * sp.x + sn * sp.z, sp.y, -sn * sp.x + cs * sp.z);

    // Idle drift, plus scatter that grows with scroll speed.
    float drift = 0.05 + min(abs(uVelocity), 60.0) * 0.004;
    pos += drift * vec3(
      sin(uTime * 0.7 + aSeed * 40.0),
      cos(uTime * 0.6 + aSeed * 31.0),
      sin(uTime * 0.5 + aSeed * 17.0)
    );

    vec4 world = modelMatrix * vec4(pos, 1.0);

    // Cursor pushes particles aside.
    vec2 d = world.xy - uPointer.xy;
    float force = uRepel * exp(-dot(d, d) * 0.9);
    world.xy += normalize(d + 1e-4) * force * 0.9;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;

    // Negative hue = hidden in that formation; fade across the morph.
    float visible = mix(step(0.0, aHueFrom), step(0.0, aHueTo), m);
    float hue = mix(max(aHueFrom, 0.0), max(aHueTo, 0.0), m);
    float spot = uSpotAmount * exp(-pow(distance(world.xyz, uSpot), 2.0) * 1.6);
    vColor = ramp(hue + spot * 0.5);
    vAlpha = (0.55 + 0.45 * hue + spot * 0.5) * visible;

    float size = uSize * (0.6 + aSeed * 0.8) * (1.0 + spot * 0.6);
    gl_PointSize = size * uPixelRatio * (uViewportHeight / 900.0) * (16.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    if (a * vAlpha < 0.01) discard;
    gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
  }
`;

export const createCloudMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uMix: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 4.2 },
      uPixelRatio: { value: 1 },
      uViewportHeight: { value: 900 },
      uVelocity: { value: 0 },
      uRepel: { value: 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 0) },
      uSpot: { value: new THREE.Vector3(999, 999, 0) },
      uSpotAmount: { value: 0 },
      uSpin: { value: 0 },
      uSpinCenter: { value: new THREE.Vector3() },
      uOpacity: { value: 1 },
    },
  });
