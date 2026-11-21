import * as A from "astronomy-engine";

/** [ra (derece, J2000), dec, kadir, B–V] */
export type StarRow = [number, number, number, number];
export type ConstellationData = {
  lines: { id: string; rank: number; l: [number, number][][] }[];
  labels: Record<string, { rank: number; p: [number, number] }>;
};

export type SkyPoint = { x: number; y: number; alt: number };
export type SkyBody = SkyPoint & { name: string; mag: number; kind: "moon" | "planet"; phaseAngle?: number; fraction?: number };

export type Sky = {
  /** birim dairede (-1..1) izdüşüm; ufuk = 1. Ekranda kuzey yukarı, doğu sol (gökyüzüne bakar gibi). */
  stars: (SkyPoint & { mag: number; bv: number; i: number })[];
  lines: { id: string; rank: number; segs: [SkyPoint, SkyPoint][] }[];
  labels: { id: string; rank: number; x: number; y: number }[];
  bodies: SkyBody[];
};

const D2R = Math.PI / 180;

/** Ekvatoral (J2000) birim vektör */
function eqVec(raDeg: number, decDeg: number, t: A.AstroTime) {
  const ra = raDeg * D2R;
  const dec = decDeg * D2R;
  return new A.Vector(Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec), t);
}

/** Yatay koordinattan (x=kuzey, y=batı, z=başucu) stereografik düzleme */
function project(h: A.Vector): SkyPoint {
  const z = Math.max(-1, Math.min(1, h.z));
  const alt = Math.asin(z) / D2R;
  const az = Math.atan2(-h.y, h.x); // kuzeyden doğuya
  const r = Math.tan(((90 - alt) * D2R) / 2); // ufukta 1
  return { x: -r * Math.sin(az), y: -r * Math.cos(az), alt };
}

/** Atmosferik kırılma (ufka yakın yıldızlar biraz yukarıda görünür) */
function refract(p: SkyPoint): SkyPoint {
  if (p.alt < -1) return p;
  const dAlt = A.Refraction("normal", p.alt);
  if (!dAlt) return p;
  const alt = p.alt + dAlt;
  const r0 = Math.hypot(p.x, p.y) || 1e-9;
  const r1 = Math.tan(((90 - alt) * D2R) / 2);
  return { x: (p.x / r0) * r1, y: (p.y / r0) * r1, alt };
}

export function altAz(raDeg: number, decDeg: number, when: Date, lat: number, lon: number) {
  const t = A.MakeTime(when);
  const rot = A.Rotation_EQJ_HOR(t, new A.Observer(lat, lon, 0));
  const h = A.RotateVector(rot, eqVec(raDeg, decDeg, t));
  return project(h);
}

export function computeSky(when: Date, lat: number, lon: number, stars: StarRow[], cons: ConstellationData): Sky {
  const t = A.MakeTime(when);
  const obs = new A.Observer(lat, lon, 0);
  const rot = A.Rotation_EQJ_HOR(t, obs);
  const P = (ra: number, dec: number) => refract(project(A.RotateVector(rot, eqVec(ra, dec, t))));

  const out: Sky["stars"] = [];
  stars.forEach(([ra, dec, mag, bv], i) => {
    const p = P(ra, dec);
    if (p.alt > -0.5) out.push({ ...p, mag, bv, i });
  });

  const lines: Sky["lines"] = cons.lines.map((c) => {
    const segs: [SkyPoint, SkyPoint][] = [];
    for (const pl of c.l) {
      for (let k = 1; k < pl.length; k++) {
        const a = P(pl[k - 1][0], pl[k - 1][1]);
        const b = P(pl[k][0], pl[k][1]);
        if (a.alt > 0 && b.alt > 0) segs.push([a, b]);
      }
    }
    return { id: c.id, rank: c.rank, segs };
  });

  const labels = Object.entries(cons.labels)
    .map(([id, v]) => ({ id, rank: v.rank, ...P(v.p[0], v.p[1]) }))
    .filter((l) => l.alt > 8);

  const bodies: SkyBody[] = [];
  const add = (body: A.Body, name: string, kind: SkyBody["kind"]) => {
    const eq = A.Equator(body, t, obs, true, true);
    const hor = A.Horizon(t, obs, eq.ra, eq.dec, "normal");
    if (hor.altitude < 0) return;
    const r = Math.tan(((90 - hor.altitude) * D2R) / 2);
    const az = hor.azimuth * D2R;
    const ill = A.Illumination(body, t);
    bodies.push({
      name,
      kind,
      mag: ill.mag,
      x: -r * Math.sin(az),
      y: -r * Math.cos(az),
      alt: hor.altitude,
      ...(kind === "moon" ? { phaseAngle: A.MoonPhase(t), fraction: ill.phase_fraction } : {}),
    });
  };
  add(A.Body.Moon, "Ay", "moon");
  add(A.Body.Mercury, "Merkür", "planet");
  add(A.Body.Venus, "Venüs", "planet");
  add(A.Body.Mars, "Mars", "planet");
  add(A.Body.Jupiter, "Jüpiter", "planet");
  add(A.Body.Saturn, "Satürn", "planet");

  return { stars: out, lines, labels, bodies };
}

/** B–V renk indeksinden yumuşak bir yıldız rengi (buz mavisi → fildişi → soluk şampanya) */
export function starColor(bv: number): string {
  const t = Math.max(0, Math.min(1, (bv + 0.2) / 1.8));
  const lerp = (a: number, b: number, k: number) => Math.round(a + (b - a) * k);
  // 0: #b9cdf2, 0.45: #f2eee6, 1: #e6c89a
  if (t < 0.45) {
    const k = t / 0.45;
    return `rgb(${lerp(185, 242, k)},${lerp(205, 238, k)},${lerp(242, 230, k)})`;
  }
  const k = (t - 0.45) / 0.55;
  return `rgb(${lerp(242, 230, k)},${lerp(238, 200, k)},${lerp(230, 154, k)})`;
}
