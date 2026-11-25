"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { drawLantern } from "@/lib/lantern-draw";

/**
 * Sonsuz yıldız yolu: kamera yıldızların arasından yavaşça ileri süzülür.
 * Açılışta tek seferlik "varış" (hızlıdan yavaşa), sonrası kaydırmaya cevap verir.
 */

const DEPTH = 900;

const vert = /* glsl */ `
  uniform float uTravel;
  uniform float uTime;
  uniform float uPx;
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.z = mod(p.z + uTravel, ${DEPTH.toFixed(1)}) - ${DEPTH.toFixed(1)};
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float d = -mv.z;
    float far = smoothstep(${DEPTH.toFixed(1)}, ${(DEPTH * 0.55).toFixed(1)}, d);
    float near = smoothstep(2.0, 18.0, d);
    float tw = 0.78 + 0.22 * sin(uTime * (0.6 + aPhase) + aPhase * 40.0);
    vAlpha = far * near * tw;
    vColor = aColor;
    gl_PointSize = clamp(aSize * uPx * 260.0 / d, 0.0, 34.0 * uPx);
    gl_Position = projectionMatrix * mv;
  }
`;
const frag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c) * 2.0;
    float core = exp(-r * r * 18.0);
    float halo = exp(-r * 4.2) * 0.35;
    float a = (core + halo) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor * (core * 1.25 + halo), a);
  }
`;

// B–V benzeri yıldız renkleri (doygunluk düşük, gerçekçi)
const TINTS = [
  [0.78, 0.85, 1.0],
  [0.9, 0.93, 1.0],
  [1.0, 0.98, 0.95],
  [1.0, 0.94, 0.84],
  [1.0, 0.86, 0.7],
  [1.0, 0.78, 0.62],
];

function Stars({ count, reduced }: { count: number; reduced: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const travel = useRef(0);
  const speed = useRef(reduced ? 0 : 9);
  const lastY = useRef(0);
  const { gl } = useThree();

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // kameranın önünde boş bir koridor bırak
      const a = Math.random() * Math.PI * 2;
      const rr = 6 + Math.pow(Math.random(), 0.7) * 150;
      pos[i * 3] = Math.cos(a) * rr * 1.5;
      pos[i * 3 + 1] = Math.sin(a) * rr;
      pos[i * 3 + 2] = -Math.random() * DEPTH;
      const m = Math.pow(Math.random(), 5);
      size[i] = 0.6 + m * 4.2;
      phase[i] = Math.random();
      const t = TINTS[Math.floor(Math.pow(Math.random(), 0.8) * TINTS.length)];
      col.set(t, i * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);

  const uniforms = useMemo(() => ({ uTravel: { value: 0 }, uTime: { value: 0 }, uPx: { value: gl.getPixelRatio() } }), [gl]);

  useFrame((s, dt) => {
    const d = Math.min(dt, 0.05);
    const y = window.scrollY;
    const vy = Math.abs(y - lastY.current);
    lastY.current = y;
    // taban hız 1.6; kaydırma hızlandırır; açılış hızı yumuşakça söner
    const target = reduced ? 0 : 1.4 + Math.min(vy * 0.35, 12);
    speed.current += (target - speed.current) * (1 - Math.exp(-d * (speed.current > target ? 0.9 : 1.2)));
    travel.current += speed.current * d;
    uniforms.uTravel.value = travel.current;
    uniforms.uTime.value = s.clock.elapsedTime;
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function Moon() {
  const tex = useLoader(THREE.TextureLoader, "/moon/full-520.webp");
  const ref = useRef<THREE.Group>(null);
  const glow = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(128, 128, 30, 128, 128, 128);
    g.addColorStop(0, "rgba(240,232,215,0.22)");
    g.addColorStop(1, "rgba(240,232,215,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  tex.colorSpace = THREE.SRGBColorSpace;
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = window.scrollY / max;
    const halfH = Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2)) * 260;
    const halfW = halfH * (camera as THREE.PerspectiveCamera).aspect;
    // başta sağ üst köşede; kaydırdıkça karşı tarafa yavaşça süzülür
    ref.current.position.set(THREE.MathUtils.lerp(halfW * 0.72, -halfW * 0.7, p), THREE.MathUtils.lerp(halfH * 0.74, halfH * 0.35, p), -260);
  });
  return (
    <group ref={ref}>
      <sprite scale={[46, 46, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite scale={[14, 14, 1]}>
        <spriteMaterial map={tex} transparent depthWrite={false} color="#f1ece4" />
      </sprite>
    </group>
  );
}

/** Uzakta yükselen birkaç dilek feneri */
function Lanterns({ reduced }: { reduced: boolean }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    drawLantern(c.getContext("2d")!, 128, 128, 90);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const items = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: -110 + ((i * 53) % 220) + Math.random() * 10,
        z: -120 - ((i * 37) % 140),
        y0: -90 + Math.random() * 160,
        s: 0.5 + Math.random() * 0.6,
        sp: 1.4 + Math.random() * 1.4,
        ph: Math.random() * 6,
      })),
    [],
  );
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  useFrame((st) => {
    const t = reduced ? 0 : st.clock.elapsedTime;
    items.forEach((it, i) => {
      const sp = refs.current[i];
      if (!sp) return;
      const y = ((it.y0 + t * it.sp + 100) % 200) - 100;
      sp.position.set(it.x + Math.sin(t * 0.3 + it.ph) * 3, y, it.z);
      (sp.material as THREE.SpriteMaterial).opacity = Math.min(1, (y + 100) / 30) * Math.min(1, (100 - y) / 40) * 0.9;
    });
  });
  return (
    <>
      {items.map((it, i) => (
        <sprite key={i} ref={(r) => void (refs.current[i] = r)} scale={[10 * it.s, 10 * it.s, 1]}>
          <spriteMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </>
  );
}

function Rig({ reduced }: { reduced: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const f = (e: PointerEvent) => {
      pointer.current.x = e.clientX / innerWidth - 0.5;
      pointer.current.y = e.clientY / innerHeight - 0.5;
    };
    addEventListener("pointermove", f, { passive: true });
    return () => removeEventListener("pointermove", f);
  }, []);
  useFrame(({ camera }, dt) => {
    if (reduced) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = scrollY / max;
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 1.2);
    const ry = -pointer.current.x * 0.08 + Math.sin(p * Math.PI) * 0.12;
    const rx = -pointer.current.y * 0.05 - p * 0.06;
    camera.rotation.y += (ry - camera.rotation.y) * k;
    camera.rotation.x += (rx - camera.rotation.x) * k;
  });
  return null;
}

export default function StarRoad() {
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const small = innerWidth < 700 || (navigator.hardwareConcurrency ?? 8) <= 4;
    setCount(small ? 4200 : 9500);
    const vis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, []);
  if (!count) return null;
  return (
    <Canvas
      className="!fixed inset-0 -z-[5]"
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      frameloop={visible ? "always" : "never"}
      dpr={[1, 1.6]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 0], fov: 60, near: 0.5, far: 3000 }}
      onCreated={({ gl }) => gl.setClearColor("#020203")}
    >
      <Stars count={count} reduced={reduced} />
      <Moon />
      <Lanterns reduced={reduced} />
      <Rig reduced={reduced} />
    </Canvas>
  );
}
