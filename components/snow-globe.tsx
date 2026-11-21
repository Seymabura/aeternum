"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const R = 1.15; // küre yarıçapı

/** İçinde karlı küçük bir köy olan, sallanınca karı uçuşan 3D kar küresi. */
export default function SnowGlobe({ className }: { className?: string }) {
  const [shake, setShake] = useState(0);
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 5.6], fov: 33 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onPointerDown={() => setShake((s) => s + 1)}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 4, 3]} intensity={1.2} color="#fff1dc" />
        <directionalLight position={[-4, 1, -2]} intensity={0.9} color="#9fb8ff" />
        <pointLight position={[0, -0.2, 0.2]} intensity={2.2} distance={2.2} color="#ffcf8a" />

        <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.35}>
          <group position={[0, 0.12, 0]}>
            <Scene />
            <Snow shake={shake} />
            <Glass />
            <Base />
          </group>
        </Float>

        <ContactShadows position={[0, -1.3, 0]} opacity={0.55} scale={6} blur={2.6} far={2} color="#000" />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} minPolarAngle={Math.PI / 2.8} maxPolarAngle={Math.PI / 1.9} />

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

function Glass() {
  return (
    <>
      <mesh position={[0, 0.05, 0]} scale={1.002}>
        <sphereGeometry args={[R, 64, 64]} />
        <meshBasicMaterial color="#b9cdf2" transparent opacity={0.07} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <GlassFront />
    </>
  );
}

function GlassFront() {
  return (
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
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Base() {
  return (
    <group position={[0, -R * 0.82, 0]}>
      {/* ceviz gövde */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.98, 1.1, 0.38, 96]} />
        <meshStandardMaterial color="#2b1c17" roughness={0.32} metalness={0.2} envMapIntensity={1.5} />
      </mesh>
      {/* şampanya halka */}
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.99, 0.99, 0.06, 96]} />
        <meshStandardMaterial color="#e6d2ad" roughness={0.22} metalness={1} envMapIntensity={2.2} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[1.11, 1.11, 0.045, 96]} />
        <meshStandardMaterial color="#e6d2ad" roughness={0.22} metalness={1} envMapIntensity={2.2} />
      </mesh>
      {/* küçük plaka */}
      <RoundedBox args={[0.62, 0.17, 0.04]} radius={0.03} position={[0, -0.2, 1.03]} rotation={[-0.12, 0, 0]}>
        <meshStandardMaterial color="#e6d2ad" roughness={0.18} metalness={1} envMapIntensity={2.4} />
      </RoundedBox>
    </group>
  );
}

function Pine({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.12, 8]} />
        <meshStandardMaterial color="#3b2a22" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.2 + i * 0.13, 0]}>
          <mesh>
            <coneGeometry args={[0.2 - i * 0.05, 0.24, 18]} />
            <meshStandardMaterial color="#1f4a3e" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <coneGeometry args={[0.12 - i * 0.03, 0.12, 18]} />
            <meshStandardMaterial color="#f4f6ff" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function House({ position, rot = 0, s = 1 }: { position: [number, number, number]; rot?: number; s?: number }) {
  return (
    <group position={position} rotation={[0, rot, 0]} scale={s}>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.32, 0.24, 0.26]} />
        <meshStandardMaterial color="#e9dcc8" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.24, 0.24, 0.3]} />
        <meshStandardMaterial color="#f7f9ff" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.11, 0.131]}>
        <planeGeometry args={[0.08, 0.09]} />
        <meshStandardMaterial color="#ffc977" emissive="#ffb04a" emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[0.165, 0.13, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.07, 0.07]} />
        <meshStandardMaterial color="#ffc977" emissive="#ffb04a" emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[0.08, 0.42, -0.04]}>
        <boxGeometry args={[0.05, 0.12, 0.05]} />
        <meshStandardMaterial color="#6b4a3a" />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <group position={[0, -R * 0.62, 0]}>
      {/* karlı zemin */}
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[R * 0.79, R * 0.79, 0.08, 64]} />
        <meshStandardMaterial color="#f2f5ff" roughness={1} />
      </mesh>
      <mesh position={[0, 0.03, 0]} scale={[1, 0.22, 1]}>
        <sphereGeometry args={[R * 0.62, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f7f9ff" roughness={1} />
      </mesh>
      <House position={[0.05, 0.1, 0.05]} rot={-0.4} s={1.15} />
      <House position={[-0.45, 0.06, -0.25]} rot={0.6} s={0.8} />
      <Pine position={[0.48, 0.05, -0.2]} scale={1.15} />
      <Pine position={[-0.35, 0.06, 0.35]} scale={0.8} />
      <Pine position={[0.3, 0.08, 0.45]} scale={0.65} />
      <Pine position={[-0.05, 0.08, -0.55]} scale={1.3} />
      <Pine position={[0.62, 0.02, 0.22]} scale={0.6} />
      {/* fener */}
      <group position={[-0.12, 0.06, 0.42]}>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.32, 6]} />
          <meshStandardMaterial color="#e6d2ad" metalness={1} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#ffe1a8" emissive="#ffc46b" emissiveIntensity={3} />
        </mesh>
      </group>
    </group>
  );
}

/** Küre içinde dönen kar; her dokunuşta çalkalanır */
function Snow({ shake }: { shake: number }) {
  const N = 420;
  const ref = useRef<THREE.Points>(null);
  const energy = useRef(0.6);
  const last = useRef(shake);
  const { positions, vel } = useMemo(() => {
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
  }, []);
  const sprite = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.4, "rgba(255,255,255,.8)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    return t;
  }, []);

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
      // girdap + yerçekimi
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
