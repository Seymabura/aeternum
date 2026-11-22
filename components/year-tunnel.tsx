"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * 3D Yıllar tüneli: kaydırdıkça ışık halkalarından oluşan bir tünelde ilerlenir.
 * Aylar ve sitenin araçları duvarlardan akar; sonunda 2027 kapısı açılır.
 * Kaydırma ilerlemesi: sayfanın başından #kapi bölümüne kadar (0 → 1).
 */

const SPACING = 16;
const RINGS = 64;
const LEN = SPACING * (RINGS - 4);
const RADIUS = 9;
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const TOOLS = ["İki Ay", "Gökyüzümüz", "Dilek feneri", "2027'ye mektup", "Vision board", "Kar küresi"];
const SERIF = '"Bodoni Moda Variable", "Bodoni Moda", Didot, Georgia, serif';
const SANS = '"Geist Variable", Geist, system-ui, sans-serif';

/** sayfa kaydırmasından tünel ilerlemesi (0..1) ve kapıdan sonraki solma (0..1) */
function useScrollProgress() {
  const p = useRef({ t: 0, after: 0, raw: 0 });
  useEffect(() => {
    let gate = 0;
    const measure = () => {
      const el = document.getElementById("kapi");
      gate = el ? el.getBoundingClientRect().top + scrollY : innerHeight * 3;
    };
    const update = () => {
      const end = Math.max(1, gate - innerHeight * 0.15);
      p.current.raw = scrollY / end;
      p.current.t = Math.min(1, Math.max(0, p.current.raw));
      p.current.after = Math.min(1, Math.max(0, (scrollY - end) / (innerHeight * 0.9)));
    };
    measure();
    update();
    const ro = new ResizeObserver(() => (measure(), update()));
    ro.observe(document.body);
    addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      removeEventListener("scroll", update);
    };
  }, []);
  return p;
}

function textTexture(lines: { text: string; font: string; color: string; y: number }[], w: number, h: number, frame?: { stroke: string; fill: string }) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  if (frame) {
    const r = 28;
    x.beginPath();
    x.moveTo(r, 2);
    x.arcTo(w - 2, 2, w - 2, h - 2, r);
    x.arcTo(w - 2, h - 2, 2, h - 2, r);
    x.arcTo(2, h - 2, 2, 2, r);
    x.arcTo(2, 2, w - 2, 2, r);
    x.closePath();
    x.fillStyle = frame.fill;
    x.fill();
    x.lineWidth = 2.5;
    x.strokeStyle = frame.stroke;
    x.stroke();
  }
  x.textAlign = "center";
  x.textBaseline = "middle";
  for (const l of lines) {
    x.font = l.font;
    x.fillStyle = l.color;
    x.fillText(l.text, w / 2, l.y);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ------------------------------------------------------------ halkalar
function Rings({ prog, count }: { prog: React.RefObject<{ t: number; after: number }>; count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const geo = useMemo(() => new THREE.TorusGeometry(RADIUS, 0.035, 6, 160), []);
  useEffect(() => {
    const m = mesh.current!;
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      o.position.set(0, 0, -i * SPACING);
      o.rotation.set(0, 0, i * 0.21);
      // her yıl dönümü gibi: 5 halkada bir nar, diğerleri şampanya
      const nar = i % 5 === 0;
      const k = nar ? 2.6 : 1.6;
      col.set(nar ? "#ff4d6a" : "#f2d9a6").multiplyScalar(k);
      o.scale.setScalar(1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, col);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count]);
  useFrame(() => {
    if (mat.current) mat.current.opacity = 1 - prog.current.after;
  });
  return (
    <instancedMesh ref={mesh} args={[geo, undefined, count]} frustumCulled={false}>
      <meshBasicMaterial ref={mat} toneMapped={false} transparent />
    </instancedMesh>
  );
}

/** halkaların arasında ince boylamsal ışık çizgileri: tünel duvarı hissi */
function Rails({ prog }: { prog: React.RefObject<{ t: number; after: number }> }) {
  const mat = useRef<THREE.LineBasicMaterial>(null);
  const geo = useMemo(() => {
    const pts: number[] = [];
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.cos(a) * RADIUS;
      const y = Math.sin(a) * RADIUS;
      pts.push(x, y, 20, x, y, -LEN - 60);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  useFrame(() => {
    if (mat.current) mat.current.opacity = 0.16 * (1 - prog.current.after);
  });
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial ref={mat} color="#dcc7a1" transparent opacity={0.16} />
    </lineSegments>
  );
}

// ------------------------------------------------------------ aylar ve araç kartları
function Labels({ prog }: { prog: React.RefObject<{ t: number; after: number }> }) {
  const { camera } = useThree();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void document.fonts.ready.then(() => setReady(true));
  }, []);
  const items = useMemo(() => {
    if (!ready) return [];
    const out: { tex: THREE.Texture; pos: [number, number, number]; size: [number, number]; ry: number }[] = [];
    const step = LEN / 13;
    MONTHS.forEach((m, i) => {
      const z = -(i + 1) * step;
      const side = i % 2 ? 1 : -1;
      out.push({
        tex: textTexture(
          [
            { text: m, font: `italic 400 120px ${SERIF}`, color: "#f6ead2", y: 92 },
            { text: "2026", font: `400 30px ${SANS}`, color: "rgba(255,200,205,0.85)", y: 170 },
          ],
          640,
          210,
        ),
        pos: [side * 3.9, side > 0 ? 1.9 : -2.1, z],
        size: [4.4, 1.44],
        ry: -side * 0.3,
      });
    });
    TOOLS.forEach((t, i) => {
      const z = -(i * 2 + 1.5) * step;
      const side = i % 2 ? -1 : 1;
      out.push({
        tex: textTexture(
          [
            { text: "✦", font: `400 40px ${SANS}`, color: "#ff8fa0", y: 62 },
            { text: t, font: `italic 400 64px ${SERIF}`, color: "#fff6e6", y: 140 },
          ],
          560,
          220,
          { stroke: "rgba(233,205,150,0.85)", fill: "rgba(30,6,12,0.55)" },
        ),
        pos: [side * 4.2, side > 0 ? -2.3 : 2.3, z],
        size: [3.2, 1.26],
        ry: -side * 0.34,
      });
    });
    return out;
  }, [ready]);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    items.forEach((it, i) => {
      const m = refs.current[i];
      if (!m) return;
      const d = it.pos[2] - camera.position.z; // negatif: önde
      const near = THREE.MathUtils.smoothstep(-d, 3, 26); // kameraya çok yaklaşınca söner
      const far = 1 - THREE.MathUtils.smoothstep(-d, 120, 220);
      (m.material as THREE.MeshBasicMaterial).opacity = near * far * (1 - prog.current.after);
    });
  });
  return (
    <>
      {items.map((it, i) => (
        <mesh key={i} ref={(r) => void (refs.current[i] = r)} position={it.pos} rotation={[0, it.ry, 0]}>
          <planeGeometry args={it.size} />
          <meshBasicMaterial map={it.tex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

// ------------------------------------------------------------ 2027 kapısı
function Gate({ prog }: { prog: React.RefObject<{ t: number; after: number }> }) {
  const group = useRef<THREE.Group>(null);
  const disc = useRef<THREE.MeshBasicMaterial>(null);
  const label = useRef<THREE.MeshBasicMaterial>(null);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    void document.fonts.ready.then(() =>
      setTex(textTexture([{ text: "2027", font: `italic 400 300px ${SERIF}`, color: "#fff4e2", y: 200 }], 900, 400)),
    );
  }, []);
  const glow = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(256, 256, 0, 256, 256, 256);
    g.addColorStop(0, "rgba(255,246,232,1)");
    g.addColorStop(0.25, "rgba(255,214,200,0.75)");
    g.addColorStop(0.6, "rgba(210,70,92,0.25)");
    g.addColorStop(1, "rgba(158,27,50,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
  }, []);
  useFrame((st) => {
    const t = prog.current.t;
    const open = THREE.MathUtils.smoothstep(t, 0.72, 1);
    if (group.current) group.current.rotation.z = st.clock.elapsedTime * 0.05;
    if (disc.current) disc.current.opacity = (0.15 + open * 0.85) * (1 - prog.current.after * 0.85);
    // başlık belirmeden önce görünür, başlık gelince kapının ışığına karışır
    if (label.current) label.current.opacity = THREE.MathUtils.smoothstep(t, 0.45, 0.7) * (1 - THREE.MathUtils.smoothstep(t, 0.84, 0.96));
  });
  const z = -LEN - 30;
  return (
    <group position={[0, 0, z]}>
      <group ref={group}>
        <mesh>
          <torusGeometry args={[RADIUS * 0.82, 0.14, 12, 200]} />
          <meshBasicMaterial color={new THREE.Color("#ff4d6a").multiplyScalar(3.2)} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[RADIUS * 0.9, 0.05, 8, 200]} />
          <meshBasicMaterial color={new THREE.Color("#f6dba4").multiplyScalar(2.6)} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[RADIUS * 2.4, RADIUS * 2.4]} />
        <meshBasicMaterial ref={disc} map={glow} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} opacity={0.2} />
      </mesh>
      {tex && (
        <mesh position={[0, 0, 0.5]}>
          <planeGeometry args={[9, 4]} />
          <meshBasicMaterial ref={label} map={tex} transparent depthWrite={false} toneMapped={false} opacity={0} />
        </mesh>
      )}
    </group>
  );
}

// ------------------------------------------------------------ yıldızlar (tünelin dışında ve kapıdan sonra)
function Dust({ count }: { count: number }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = RADIUS * 1.6 + Math.pow(Math.random(), 0.6) * 160;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = 40 - Math.random() * (LEN + 400);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geo}>
      <pointsMaterial size={1.4} sizeAttenuation={false} color="#f5ecdc" transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

/** tünel içinde süzülen ince ışık tozu */
function Motes({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * RADIUS * 0.92;
      pos.set([Math.cos(a) * r, Math.sin(a) * r, 10 - Math.random() * (LEN + 40)], i * 3);
      c.set(Math.random() < 0.25 ? "#ff7d92" : "#ffe9c2").multiplyScalar(1.4);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);
  useFrame((st) => {
    if (ref.current) ref.current.rotation.z = st.clock.elapsedTime * 0.015;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.09} vertexColors transparent opacity={0.9} depthWrite={false} toneMapped={false} />
    </points>
  );
}

function Rig({ prog, reduced }: { prog: React.RefObject<{ t: number; after: number }>; reduced: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });
  const z = useRef(14);
  useEffect(() => {
    const f = (e: PointerEvent) => {
      pointer.current.x = e.clientX / innerWidth - 0.5;
      pointer.current.y = e.clientY / innerHeight - 0.5;
    };
    addEventListener("pointermove", f, { passive: true });
    return () => removeEventListener("pointermove", f);
  }, []);
  useFrame(({ camera }, dt) => {
    const d = Math.min(dt, 0.05);
    const target = 14 - prog.current.t * (LEN + 14) - prog.current.after * 40;
    // yumuşak takip: kaydırma durunca kamera da yavaşça durur
    z.current += (target - z.current) * (reduced ? 1 : 1 - Math.exp(-d * 4));
    camera.position.z = z.current;
    if (reduced) return;
    const k = 1 - Math.exp(-d * 2);
    camera.position.x += (pointer.current.x * 1.6 - camera.position.x) * k;
    camera.position.y += (-pointer.current.y * 1.1 - camera.position.y) * k;
    camera.rotation.z += (Math.sin(prog.current.t * Math.PI * 2) * 0.06 - camera.rotation.z) * k;
  });
  return null;
}

export default function YearTunnel() {
  const prog = useScrollProgress();
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tier, setTier] = useState<"low" | "high" | null>(null);
  useEffect(() => {
    setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches);
    const small = innerWidth < 760 || (navigator.hardwareConcurrency ?? 8) <= 4;
    setTier(small ? "low" : "high");
    const v = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", v);
    return () => document.removeEventListener("visibilitychange", v);
  }, []);
  if (!tier) return null;
  const low = tier === "low";
  return (
    <Canvas
      style={{ position: "fixed", inset: 0, zIndex: -5, pointerEvents: "none" }}
      frameloop={visible ? "always" : "never"}
      dpr={low ? [1, 1.3] : [1, 1.6]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false }}
      camera={{ position: [0, 0, 14], fov: 62, near: 0.1, far: 900 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#020203");
        scene.fog = new THREE.Fog("#020203", 60, 240);
      }}
    >
      <Dust count={low ? 1400 : 3200} />
      <Rails prog={prog} />
      <Rings prog={prog} count={RINGS} />
      <Motes count={low ? 500 : 1400} />
      <Labels prog={prog} />
      <Gate prog={prog} />
      <Rig prog={prog} reduced={reduced} />
      {low ? (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.2} mipmapBlur radius={0.7} resolutionScale={0.5} />
          <Vignette eskil={false} offset={0.22} darkness={0.78} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={1.25} luminanceThreshold={0.55} luminanceSmoothing={0.2} mipmapBlur radius={0.7} />
          <Vignette eskil={false} offset={0.22} darkness={0.78} />
          <Noise opacity={0.035} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
