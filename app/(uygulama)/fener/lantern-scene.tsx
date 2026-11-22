"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { drawLantern } from "@/lib/lantern-draw";
import type { SkyLantern } from "@/app/actions/fener";

function lanternTexture(mine: boolean) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d")!;
  if (mine) {
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,236,200,0.35)");
    g.addColorStop(1, "rgba(255,236,200,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
  }
  drawLantern(x, 128, 128, 92, mine ? 1.2 : 1);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296);
}

function Background() {
  const geo = useMemo(() => {
    const n = 3500;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(700);
      pos.set([v.x, Math.abs(v.y) * 0.9 - 60, v.z < 0 ? v.z : -v.z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={1.6} sizeAttenuation={false} color="#f2ece2" transparent opacity={0.75} depthWrite={false} />
    </points>
  );
}

type Item = SkyLantern & { x: number; z: number; y0: number; sp: number; ph: number; s: number };

function Lanterns({ items, fresh, onPick, reduced }: { items: Item[]; fresh: string | null; onPick: (l: SkyLantern) => void; reduced: boolean }) {
  const tex = useMemo(() => ({ other: lanternTexture(false), mine: lanternTexture(true) }), []);
  const refs = useRef<Map<string, THREE.Sprite>>(new Map());
  const born = useRef<Map<string, number>>(new Map());
  useFrame((st) => {
    const t = reduced ? 0 : st.clock.elapsedTime;
    for (const it of items) {
      const sp = refs.current.get(it.id);
      if (!sp) continue;
      const mat = sp.material as THREE.SpriteMaterial;
      if (it.id === fresh) {
        // yeni fener: önde yanar ve yükselir
        if (!born.current.has(it.id)) born.current.set(it.id, st.clock.elapsedTime);
        const a = st.clock.elapsedTime - born.current.get(it.id)!;
        const ign = Math.min(1, a / 1.6);
        const y = -26 + Math.max(0, a - 1.2) * 3.2;
        sp.position.set(Math.sin(a * 0.5) * 2, y, -48 - a * 2.2);
        sp.scale.setScalar(13 * (0.7 + 0.3 * ign));
        mat.opacity = ign * Math.min(1, (120 - y) / 30);
        continue;
      }
      const y = ((it.y0 + t * it.sp + 80) % 170) - 80;
      sp.position.set(it.x + Math.sin(t * 0.25 + it.ph) * 2.5, y, it.z);
      mat.opacity = Math.min(1, (y + 80) / 25) * Math.min(1, (90 - y) / 25);
    }
  });
  return (
    <>
      {items.map((it) => (
        <sprite
          key={it.id}
          ref={(r) => {
            if (r) refs.current.set(it.id, r);
            else refs.current.delete(it.id);
          }}
          scale={[it.s, it.s, 1]}
          onClick={(e) => {
            e.stopPropagation();
            onPick(it);
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "")}
        >
          <spriteMaterial map={it.mine ? tex.mine : tex.other} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </>
  );
}

export default function LanternScene({ lanterns, fresh, onPick }: { lanterns: SkyLantern[]; fresh: string | null; onPick: (l: SkyLantern) => void }) {
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches);
    const v = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", v);
    return () => document.removeEventListener("visibilitychange", v);
  }, []);
  // örnek fenerler: gökyüzü hiç boş görünmesin (dokunulamaz, sadece ışık)
  const items = useMemo<Item[]>(() => {
    const base = lanterns.slice(0, 90);
    return base.map((l) => {
      const r = hash(l.id);
      const depth = 40 + r() * 170;
      return {
        ...l,
        x: (r() - 0.5) * depth * 1.5,
        z: -depth,
        y0: r() * 170 - 80,
        sp: 0.9 + r() * 1.3,
        ph: r() * 6,
        s: (l.mine ? 9 : 7) * (0.8 + r() * 0.5),
      };
    });
  }, [lanterns]);
  return (
    <Canvas
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
      frameloop={visible ? "always" : "never"}
      dpr={[1, 1.6]}
      gl={{ antialias: false, alpha: false }}
      camera={{ position: [0, 0, 0], fov: 60, near: 0.5, far: 2000 }}
      onCreated={({ gl }) => gl.setClearColor("#020203")}
    >
      <Background />
      <AmbientLanterns reduced={reduced} />
      <Lanterns items={items} fresh={fresh} onPick={onPick} reduced={reduced} />
    </Canvas>
  );
}

/** Uzakta, dokunulamayan küçük fener ışıkları (atmosfer) */
function AmbientLanterns({ reduced }: { reduced: boolean }) {
  const tex = useMemo(() => lanternTexture(false), []);
  const data = useMemo(
    () => Array.from({ length: 26 }, () => ({ x: (Math.random() - 0.5) * 700, z: -260 - Math.random() * 300, y0: Math.random() * 400 - 200, sp: 1 + Math.random() * 2, s: 5 + Math.random() * 5 })),
    [],
  );
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  useFrame((st) => {
    const t = reduced ? 0 : st.clock.elapsedTime;
    data.forEach((d, i) => {
      const sp = refs.current[i];
      if (!sp) return;
      const y = ((d.y0 + t * d.sp + 200) % 400) - 200;
      sp.position.set(d.x, y, d.z);
    });
  });
  return (
    <>
      {data.map((d, i) => (
        <sprite key={i} ref={(r) => void (refs.current[i] = r)} scale={[d.s, d.s, 1]} raycast={() => null}>
          <spriteMaterial map={tex} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </>
  );
}
