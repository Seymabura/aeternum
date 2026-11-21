"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const R = 1.15; // küre yarıçapı

export type GlobeProps = {
  className?: string;
  /** tamamlanan günler (1-31): her biri bir süs ekler */
  days?: number[];
  /** küçük ışık sayısı (peri ışıkları) */
  lights?: number;
  /** ana sayfa vitrini: bütün süsler */
  full?: boolean;
  /** yeni eklenen süs (öne çıkar) */
  fresh?: number | null;
  autoRotate?: boolean;
  /** ortak kürede ikinizin de tamamladığı günler: süsün altında altın hale */
  pairDays?: number[];
};

/** İçinde kendi köyün büyüyen, sallanınca karı uçuşan 3D kar küresi. */
export default function SnowGlobe({ className, days = [], lights = 0, full = false, fresh = null, autoRotate = true, pairDays = [] }: GlobeProps) {
  const [shake, setShake] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const set = useMemo(() => new Set(full ? Array.from({ length: 31 }, (_, i) => i + 1) : days), [days, full]);
  const nLights = full ? 14 : Math.min(17, lights);
  return (
    <div ref={host} className={className}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 5.6], fov: 33 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onPointerDown={() => setShake((s) => s + 1)}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 4, 3]} intensity={1.25} color="#fff1dc" />
        <directionalLight position={[-4, 1, -2]} intensity={0.9} color="#9fb8ff" />
        <pointLight position={[0, -0.2, 0.2]} intensity={1.1} distance={2.2} color="#ffcf8a" />

        <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.3}>
          <group position={[0, 0.12, 0]}>
            <Scene has={(d) => set.has(d)} pair={(d) => pairDays.includes(d)} lights={nLights} fresh={fresh} />
            <Snow shake={shake} />
            <Glass />
            <Base />
          </group>
        </Float>

        <ContactShadows position={[0, -1.3, 0]} opacity={0.55} scale={6} blur={2.6} far={2} color="#000" />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.55}
          minPolarAngle={Math.PI / 2.8}
          maxPolarAngle={Math.PI / 1.9}
        />

        <Environment resolution={256}>
          <group rotation={[-Math.PI / 3, 0, 1]}>
            <Lightformer form="circle" intensity={3} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} color="#fff4e2" />
            <Lightformer form="circle" intensity={1.5} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} color="#b9cdf2" />
            <Lightformer form="rect" intensity={1.2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[10, 1, 1]} color="#dcc7a1" />
            <Lightformer form="rect" intensity={2.2} position={[-2, 3, 5]} rotation={[0, -0.4, 0]} scale={[1.2, 4, 1]} color="#ffffff" />
            <Lightformer form="rect" intensity={1.4} position={[3, -1, 4]} scale={[3, 0.6, 1]} color="#dcc7a1" />
          </group>
        </Environment>
      </Canvas>
    </div>
  );
}

// ------------------------------------------------------------------ cam & kaide

function Glass() {
  return (
    <>
      <mesh position={[0, 0.05, 0]} scale={1.002}>
        <sphereGeometry args={[R, 64, 64]} />
        <meshBasicMaterial color="#b9cdf2" transparent opacity={0.07} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[R, 96, 96]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.06}
          roughness={0.02}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={3.2}
          reflectivity={1}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

const GOLD = { color: "#e6d2ad", roughness: 0.22, metalness: 1, envMapIntensity: 2.2 } as const;

function Base() {
  return (
    <group position={[0, -R * 0.82, 0]}>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.98, 1.1, 0.38, 96]} />
        <meshStandardMaterial color="#2b1c17" roughness={0.32} metalness={0.2} envMapIntensity={1.5} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.99, 0.99, 0.06, 96]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[1.11, 1.11, 0.045, 96]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <RoundedBox args={[0.62, 0.17, 0.04]} radius={0.03} position={[0, -0.2, 1.03]} rotation={[-0.12, 0, 0]}>
        <meshStandardMaterial {...GOLD} roughness={0.18} />
      </RoundedBox>
    </group>
  );
}

// ------------------------------------------------------------------ süsler

const M = {
  snow: <meshStandardMaterial color="#f4f6ff" roughness={0.95} />,
  pine: <meshStandardMaterial color="#1f4a3e" roughness={0.8} />,
  wood: <meshStandardMaterial color="#5b3d2e" roughness={0.8} />,
  wall: <meshStandardMaterial color="#e9dcc8" roughness={0.7} />,
  glow: <meshStandardMaterial color="#ffd38a" emissive="#ffb04a" emissiveIntensity={2.4} />,
  gold: <meshStandardMaterial {...GOLD} />,
  red: <meshStandardMaterial color="#a8323f" roughness={0.5} />,
};

/** Yeni süs: küçükten büyüyerek belirir */
function Pop({ children, delay = 0, highlight = false, ...props }: { children: React.ReactNode; delay?: number; highlight?: boolean } & React.ComponentProps<"group">) {
  const ref = useRef<THREE.Group>(null);
  const t0 = useRef<number | null>(null);
  useFrame((st) => {
    const g = ref.current;
    if (!g) return;
    if (t0.current === null) t0.current = st.clock.elapsedTime + delay;
    const t = Math.max(0, st.clock.elapsedTime - t0.current);
    // yaylı büyüme
    const k = t <= 0 ? 0 : 1 - Math.exp(-6 * t) * Math.cos(9 * t);
    const s = highlight ? k * (1 + 0.06 * Math.sin(st.clock.elapsedTime * 3) * Math.exp(-0.3 * t)) : k;
    g.scale.setScalar(Math.max(0.0001, s));
  });
  return (
    <group ref={ref} scale={0.0001} {...props}>
      {children}
    </group>
  );
}

function Pine({ s = 1, ornaments = false }: { s?: number; ornaments?: boolean }) {
  const cols = ["#a8323f", "#e6d2ad", "#7f97c9", "#e6d2ad", "#a8323f"];
  return (
    <group scale={s}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.12, 8]} />
        {M.wood}
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.2 + i * 0.13, 0]}>
          <mesh>
            <coneGeometry args={[0.2 - i * 0.05, 0.24, 18]} />
            {M.pine}
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <coneGeometry args={[0.12 - i * 0.03, 0.12, 18]} />
            {M.snow}
          </mesh>
        </group>
      ))}
      {ornaments &&
        cols.map((c, i) => {
          const a = i * 1.3;
          const y = 0.17 + (i % 3) * 0.12;
          const r = 0.17 - (i % 3) * 0.045;
          return (
            <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]}>
              <sphereGeometry args={[0.022, 12, 12]} />
              <meshStandardMaterial color={c} metalness={0.6} roughness={0.25} emissive={c} emissiveIntensity={0.3} />
            </mesh>
          );
        })}
    </group>
  );
}

function House({ s = 1, smoke = false }: { s?: number; smoke?: boolean }) {
  return (
    <group scale={s}>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.32, 0.24, 0.26]} />
        {M.wall}
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.24, 0.24, 0.3]} />
        {M.snow}
      </mesh>
      <mesh position={[0, 0.11, 0.131]}>
        <planeGeometry args={[0.08, 0.09]} />
        {M.glow}
      </mesh>
      <mesh position={[0.165, 0.13, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.07, 0.07]} />
        {M.glow}
      </mesh>
      <mesh position={[0.08, 0.42, -0.04]}>
        <boxGeometry args={[0.05, 0.12, 0.05]} />
        <meshStandardMaterial color="#6b4a3a" />
      </mesh>
      {smoke && <Smoke position={[0.08, 0.5, -0.04]} />}
    </group>
  );
}

function Smoke(props: React.ComponentProps<"group">) {
  const ref = useRef<THREE.Group>(null);
  useFrame((st) => {
    ref.current?.children.forEach((c, i) => {
      const t = (st.clock.elapsedTime * 0.25 + i / 4) % 1;
      c.position.set(Math.sin(t * 6 + i) * 0.03, t * 0.4, 0);
      c.scale.setScalar(0.4 + t * 1.2);
      ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.5 * (1 - t);
    });
  });
  return (
    <group ref={ref} {...props}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#e8ecf8" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Snowman() {
  return (
    <group>
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.09, 20, 20]} />
        {M.snow}
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.065, 20, 20]} />
        {M.snow}
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.045, 20, 20]} />
        {M.snow}
      </mesh>
      <mesh position={[0, 0.3, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.01, 0.05, 8]} />
        <meshStandardMaterial color="#e2863b" />
      </mesh>
      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.05, 0.012, 8, 20]} />
        {M.red}
      </mesh>
      <mesh position={[0, 0.355, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
        <meshStandardMaterial color="#1a1a22" />
      </mesh>
    </group>
  );
}

function Lamp({ ground = false }: { ground?: boolean }) {
  return ground ? (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.07, 0.1, 0.07]} />
        <meshStandardMaterial color="#ffd38a" emissive="#ffb04a" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.115, 0]}>
        <coneGeometry args={[0.055, 0.04, 4]} />
        {M.gold}
      </mesh>
    </group>
  ) : (
    <group>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.008, 0.01, 0.32, 6]} />
        {M.gold}
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#ffe1a8" emissive="#ffc46b" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

function Sled({ gifts = false }: { gifts?: boolean }) {
  return (
    <group rotation={[0, 0.6, 0]}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.22, 0.025, 0.1]} />
        {M.red}
      </mesh>
      {[-0.045, 0.045].map((z) => (
        <mesh key={z} position={[0, 0.015, z]}>
          <boxGeometry args={[0.26, 0.012, 0.012]} />
          {M.gold}
        </mesh>
      ))}
      {gifts && (
        <>
          <Gift position={[-0.04, 0.065, 0]} s={0.55} color="#7f97c9" />
          <Gift position={[0.05, 0.065, 0]} s={0.45} color="#e6d2ad" />
        </>
      )}
    </group>
  );
}

function Gift({ s = 1, color = "#a8323f", ...props }: { s?: number; color?: string } & React.ComponentProps<"group">) {
  return (
    <group scale={s} {...props}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.125, 0.125, 0.03]} />
        {M.gold}
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.03, 0.125, 0.125]} />
        {M.gold}
      </mesh>
    </group>
  );
}

function Bench() {
  return (
    <group rotation={[0, 0.8, 0]}>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.22, 0.02, 0.07]} />
        {M.wood}
      </mesh>
      <mesh position={[0, 0.12, -0.03]}>
        <boxGeometry args={[0.22, 0.07, 0.015]} />
        {M.wood}
      </mesh>
      {[-0.09, 0.09].map((x) => (
        <mesh key={x} position={[x, 0.035, 0]}>
          <boxGeometry args={[0.015, 0.07, 0.06]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
      <mesh position={[0, 0.085, 0]}>
        <boxGeometry args={[0.2, 0.012, 0.06]} />
        {M.snow}
      </mesh>
    </group>
  );
}

function Moon() {
  return (
    <group rotation={[0, 0, 0.5]}>
      <mesh>
        <torusGeometry args={[0.09, 0.035, 16, 32, Math.PI * 1.25]} />
        <meshStandardMaterial color="#fff3cf" emissive="#ffe6a8" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

function Fence() {
  return (
    <group>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[i * 0.08 - 0.24, 0.06, 0]}>
          <boxGeometry args={[0.02, 0.12, 0.02]} />
          {M.wood}
        </mesh>
      ))}
      {[0.04, 0.09].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[0.52, 0.015, 0.012]} />
          {M.wood}
        </mesh>
      ))}
    </group>
  );
}

function Deer() {
  const fur = <meshStandardMaterial color="#9a6b4a" roughness={0.8} />;
  return (
    <group rotation={[0, -1.2, 0]}>
      <mesh position={[0, 0.13, 0]} scale={[1.6, 0.8, 0.8]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        {fur}
      </mesh>
      {[
        [-0.05, 0.03],
        [0.05, 0.03],
        [-0.05, -0.03],
        [0.05, -0.03],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.05, z]}>
          <cylinderGeometry args={[0.008, 0.008, 0.1, 6]} />
          {fur}
        </mesh>
      ))}
      <mesh position={[0.08, 0.2, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.015, 0.02, 0.08, 8]} />
        {fur}
      </mesh>
      <mesh position={[0.11, 0.24, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        {fur}
      </mesh>
      {[-0.015, 0.015].map((z) => (
        <mesh key={z} position={[0.1, 0.29, z]} rotation={[z * 20, 0, 0.3]}>
          <cylinderGeometry args={[0.004, 0.004, 0.07, 5]} />
          {M.gold}
        </mesh>
      ))}
      <mesh position={[0.14, 0.24, 0]}>
        <sphereGeometry args={[0.009, 8, 8]} />
        {M.red}
      </mesh>
    </group>
  );
}

function Birds({ red = false }: { red?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (ref.current && !red) ref.current.rotation.y = st.clock.elapsedTime * 0.4;
  });
  if (red)
    return (
      <group>
        <mesh position={[0, 0.03, 0]} scale={[1.3, 1, 1]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          {M.red}
        </mesh>
        <mesh position={[0.035, 0.05, 0]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          {M.red}
        </mesh>
      </group>
    );
  return (
    <group ref={ref}>
      {[0, 2.1, 4.2].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.2, Math.sin(a * 2) * 0.03, Math.sin(a) * 0.2]} rotation={[0, -a, 0]}>
          <coneGeometry args={[0.02, 0.06, 3]} />
          <meshStandardMaterial color="#2a2f45" />
        </mesh>
      ))}
    </group>
  );
}

function Balloon() {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} scale={[1, 1.15, 1]}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial color="#c25a5f" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.12, 0]} scale={[1.01, 1.16, 0.3]}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial color="#e6d2ad" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.05, 0.04, 0.05]} />
        {M.wood}
      </mesh>
    </group>
  );
}

function Tower() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.4, 16]} />
        {M.wall}
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <coneGeometry args={[0.085, 0.16, 16]} />
        <meshStandardMaterial color="#2f4b6e" />
      </mesh>
      <mesh position={[0, 0.27, 0.061]}>
        <planeGeometry args={[0.03, 0.05]} />
        {M.glow}
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        {M.gold}
      </mesh>
    </group>
  );
}

function StringLights() {
  const pts = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      out.push([-0.05 + t * 0.15, 0.62 - Math.sin(t * Math.PI) * 0.12 - t * 0.25, -0.45 + t * 0.45]);
    }
    return out;
  }, []);
  return (
    <group>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.016, 10, 10]} />
          <meshStandardMaterial color={i % 2 ? "#ffe1a8" : "#b9cdf2"} emissive={i % 2 ? "#ffc46b" : "#9fb8ff"} emissiveIntensity={3} />
        </mesh>
      ))}
    </group>
  );
}

function Train() {
  return (
    <group rotation={[0, 0.25, 0]}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.12, 0.07, 0.07]} />
        {M.red}
      </mesh>
      <mesh position={[0.03, 0.1, 0]}>
        <boxGeometry args={[0.06, 0.06, 0.07]} />
        {M.red}
      </mesh>
      <mesh position={[-0.04, 0.1, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.05, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.14, 0.045, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.07]} />
        <meshStandardMaterial color="#2f5a4f" />
      </mesh>
      {[-0.04, 0.04, 0.11, 0.17].map((x) => (
        <mesh key={x} position={[x, 0.015, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.01, 12]} />
          {M.gold}
        </mesh>
      ))}
    </group>
  );
}

function Heart() {
  const ref = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (ref.current) {
      const s = 1 + Math.sin(st.clock.elapsedTime * 2.5) * 0.06;
      ref.current.scale.setScalar(s);
      ref.current.rotation.y = st.clock.elapsedTime * 0.6;
    }
  });
  const mat = <meshStandardMaterial color="#d06a6f" emissive="#c25a5f" emissiveIntensity={0.8} roughness={0.3} />;
  return (
    <group ref={ref}>
      <mesh position={[-0.035, 0.02, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        {mat}
      </mesh>
      <mesh position={[0.035, 0.02, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        {mat}
      </mesh>
      <mesh position={[0, -0.03, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.073, 0.1, 24]} />
        {mat}
      </mesh>
    </group>
  );
}

function Sign() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#2b1c17";
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = "#e9dcc0";
    g.font = "italic 76px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("2027", 128, 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group rotation={[0, -0.5, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
        {M.wood}
      </mesh>
      <mesh position={[0, 0.2, 0.006]}>
        <boxGeometry args={[0.16, 0.08, 0.01]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      <mesh position={[0, 0.245, 0.006]}>
        <boxGeometry args={[0.165, 0.012, 0.014]} />
        {M.snow}
      </mesh>
    </group>
  );
}

function Fort() {
  return (
    <group>
      {[
        [-0.06, 0],
        [0, 0],
        [0.06, 0],
        [-0.03, 1],
        [0.03, 1],
      ].map(([x, row], i) => (
        <mesh key={i} position={[x, 0.025 + row * 0.045, 0]}>
          <boxGeometry args={[0.055, 0.04, 0.05]} />
          {M.snow}
        </mesh>
      ))}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.055, 0.04, 0.05]} />
        {M.snow}
      </mesh>
    </group>
  );
}

function Flake() {
  const ref = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (ref.current) ref.current.rotation.z = st.clock.elapsedTime * 0.3;
  });
  return (
    <group ref={ref}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
          <boxGeometry args={[0.24, 0.012, 0.012]} />
          <meshStandardMaterial color="#eaf2ff" emissive="#b9cdf2" emissiveIntensity={1.4} />
        </mesh>
      ))}
    </group>
  );
}

function ShootingStar() {
  const ref = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (ref.current) ref.current.position.x = -0.1 + ((st.clock.elapsedTime * 0.15) % 0.3);
  });
  return (
    <group ref={ref} rotation={[0, 0, -0.35]}>
      <mesh>
        <octahedronGeometry args={[0.035, 0]} />
        <meshStandardMaterial color="#fff6dc" emissive="#ffe6a8" emissiveIntensity={3} />
      </mesh>
      <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.02, 0.22, 12]} />
        <meshStandardMaterial color="#fff6dc" emissive="#ffe6a8" emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function Star() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((st) => {
    if (ref.current) ref.current.rotation.y = st.clock.elapsedTime;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.045, 0]} />
      <meshStandardMaterial color="#fff3cf" emissive="#ffd88a" emissiveIntensity={2.6} metalness={0.4} />
    </mesh>
  );
}

function Letter() {
  const ref = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (ref.current) {
      ref.current.rotation.y = st.clock.elapsedTime * 0.5;
      ref.current.position.y = Math.sin(st.clock.elapsedTime * 1.2) * 0.03;
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.2, 0.13, 0.008]} />
        <meshStandardMaterial color="#f6f1e6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.005, 0.006]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.1, 0.1, 0.002]} />
        <meshStandardMaterial color="#ece4d2" />
      </mesh>
      <mesh position={[0, -0.005, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.008, 20]} />
        <meshStandardMaterial color="#a8323f" emissive="#7d2c35" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

type Orn = { day: number; pos: [number, number, number]; rot?: number; node: React.ReactNode };

const ORNAMENTS: Orn[] = [
  { day: 1, pos: [-0.05, 0.06, -0.45], node: <Pine s={1.3} /> },
  { day: 2, pos: [0.45, 0.05, 0.25], node: <Snowman /> },
  { day: 3, pos: [-0.15, 0.06, 0.5], node: <Lamp /> },
  { day: 4, pos: [0.05, 0.1, 0.02], rot: -0.4, node: <House s={1.15} smoke={false} /> },
  { day: 5, pos: [0.35, 0.04, 0.58], node: <Sled /> },
  { day: 6, pos: [-0.05, 0.86, -0.45], node: <Star /> },
  { day: 7, pos: [-0.33, 0.06, 0.12], node: <Gift color="#a8323f" /> },
  { day: 8, pos: [0.55, 0.04, -0.22], node: <Pine s={1} /> },
  { day: 9, pos: [-0.55, 0.04, 0.35], node: <Bench /> },
  { day: 10, pos: [0.45, 1.38, -0.3], node: <Moon /> },
  { day: 11, pos: [-0.3, 0.04, -0.72], rot: 0.35, node: <Fence /> },
  { day: 12, pos: [-0.45, 0.06, -0.25], rot: 0.6, node: <House s={0.8} /> },
  { day: 13, pos: [0.28, 0.06, -0.65], node: <Pine s={0.75} /> },
  { day: 14, pos: [0.66, 0.03, 0.08], node: <Deer /> },
  { day: 15, pos: [0.15, 0.06, 0.7], node: <Lamp ground /> },
  { day: 16, pos: [-0.2, 1.2, 0.1], node: <Birds /> },
  { day: 17, pos: [-0.22, 0.06, 0.28], node: <Gift color="#2f5a4f" s={0.8} /> },
  { day: 18, pos: [0.05, 0.1, 0.02], rot: -0.4, node: <Smoke position={[0.092, 0.575, -0.046]} /> },
  { day: 19, pos: [-0.45, 1.22, -0.1], node: <Balloon /> },
  { day: 20, pos: [0.35, 0.04, 0.58], node: <Sled gifts /> },
  { day: 21, pos: [-0.68, 0.04, -0.2], node: <Tower /> },
  { day: 22, pos: [0, 0.06, 0], node: <StringLights /> },
  { day: 23, pos: [-0.05, 0.04, 0.8], node: <Train /> },
  { day: 24, pos: [-0.55, 0.13, 0.35], node: <Birds red /> },
  { day: 25, pos: [0.55, 0.04, -0.22], node: <Pine s={1} ornaments /> },
  { day: 26, pos: [0.05, 1.02, 0.35], node: <Heart /> },
  { day: 27, pos: [0.6, 0.04, 0.45], node: <Sign /> },
  { day: 28, pos: [-0.2, 0.04, -0.4], node: <Fort /> },
  { day: 29, pos: [-0.25, 1.5, -0.3], node: <Flake /> },
  { day: 30, pos: [0.55, 1.55, -0.1], node: <ShootingStar /> },
  { day: 31, pos: [0, 1.15, 0.05], node: <Letter /> },
];

function PairHalo() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((st) => {
    const m = ref.current;
    if (!m) return;
    const k = 0.75 + 0.25 * Math.sin(st.clock.elapsedTime * 2.2);
    (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.6 * k;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
      <torusGeometry args={[0.12, 0.007, 8, 48]} />
      <meshStandardMaterial color="#e9dcc0" emissive="#dcc7a1" emissiveIntensity={1.6} />
    </mesh>
  );
}

function Scene({ has, pair, lights, fresh }: { has: (d: number) => boolean; pair: (d: number) => boolean; lights: number; fresh: number | null }) {
  let k = 0;
  return (
    <group position={[0, -R * 0.62, 0]}>
      <mesh>
        <cylinderGeometry args={[R * 0.79, R * 0.79, 0.08, 64]} />
        <meshStandardMaterial color="#f2f5ff" roughness={1} />
      </mesh>
      <mesh position={[0, 0.03, 0]} scale={[1, 0.22, 1]}>
        <sphereGeometry args={[R * 0.62, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f7f9ff" roughness={1} />
      </mesh>
      {ORNAMENTS.filter((o) => has(o.day)).map((o) => (
        <Pop key={o.day} position={o.pos} rotation={[0, o.rot ?? 0, 0]} delay={fresh === o.day ? 0.9 : 0.15 + k++ * 0.06} highlight={fresh === o.day}>
          {o.node}
          {pair(o.day) && <PairHalo />}
        </Pop>
      ))}
      {/* küçük ışıklar: kenar boyunca peri ışıkları */}
      {Array.from({ length: lights }, (_, i) => {
        const a = (i / 17) * Math.PI * 2 + 0.3;
        return (
          <Pop key={"l" + i} position={[Math.cos(a) * 0.82, 0.08 + (i % 2) * 0.02, Math.sin(a) * 0.82]} delay={0.4 + i * 0.05}>
            <mesh>
              <sphereGeometry args={[0.018, 10, 10]} />
              <meshStandardMaterial color="#ffe1a8" emissive="#ffc46b" emissiveIntensity={3.2} />
            </mesh>
          </Pop>
        );
      })}
    </group>
  );
}

/** Küre içinde dönen kar; her dokunuşta çalkalanır */
function Snow({ shake }: { shake: number }) {
  const N = 420;
  const ref = useRef<THREE.Points>(null);
  const energy = useRef(0.6);
  const last = useRef(shake);
  const [{ positions, vel }] = useState(() => {
    const p = new Float32Array(N * 3);
    const v = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = Math.cbrt(Math.random()) * R * 0.92;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      p[i * 3] = r * Math.sin(ph) * Math.cos(th);
      p[i * 3 + 1] = r * Math.cos(ph) + 0.05;
      p[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    return { positions: p, vel: v };
  });
  const [sprite] = useState(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.4, "rgba(255,255,255,.8)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  });

  useFrame((state, dt) => {
    const pts = ref.current;
    if (!pts) return;
    if (shake !== last.current) {
      last.current = shake;
      energy.current = 2.6;
    }
    energy.current = Math.max(0.35, energy.current - dt * 0.55);
    const e = energy.current;
    const arr = (pts.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const t = state.clock.elapsedTime;
    const floor = -R * 0.55;
    for (let i = 0; i < N; i++) {
      const ix = i * 3;
      let x = arr[ix],
        y = arr[ix + 1],
        z = arr[ix + 2];
      vel[ix] += (-z * 0.6 + Math.sin(t * 1.3 + i) * 0.4) * e * dt;
      vel[ix + 2] += (x * 0.6 + Math.cos(t * 1.1 + i) * 0.4) * e * dt;
      vel[ix + 1] += (Math.sin(t * 2 + i * 0.7) * 0.5 * e - 0.35) * dt;
      vel[ix] *= 0.94;
      vel[ix + 1] *= 0.94;
      vel[ix + 2] *= 0.94;
      x += vel[ix] * dt;
      y += vel[ix + 1] * dt;
      z += vel[ix + 2] * dt;
      if (y < floor) {
        y = floor;
        vel[ix + 1] = Math.abs(vel[ix + 1]) * 0.2 + (e > 1 ? 1.2 : 0.15) * Math.random();
      }
      const d = Math.hypot(x, y - 0.05, z);
      const max = R * 0.92;
      if (d > max) {
        const k = max / d;
        x *= k;
        y = (y - 0.05) * k + 0.05;
        z *= k;
        vel[ix] *= -0.3;
        vel[ix + 1] *= -0.3;
        vel[ix + 2] *= -0.3;
      }
      arr[ix] = x;
      arr[ix + 1] = y;
      arr[ix + 2] = z;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} map={sprite} transparent depthWrite={false} color="#ffffff" sizeAttenuation />
    </points>
  );
}
