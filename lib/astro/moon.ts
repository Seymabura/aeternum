import * as A from "astronomy-engine";

export type MoonInfo = {
  /** 0 yeni ay, 90 ilk dördün, 180 dolunay, 270 son dördün */
  phaseAngle: number;
  /** aydınlık oranı 0..1 (görünen disk alanına göre) */
  fraction: number;
  name: string;
  waxing: boolean;
  /** ekran koordinatında (sağ = +x, yukarı = +y, izleyiciye doğru = +z) güneş yönü */
  light: [number, number, number];
  /** Ay'ın kuzey kutbunun ekranda yukarıdan saat yönünün tersine dönüklüğü (radyan) */
  northAngle: number;
  /** Ay ufkun üstünde miydi? */
  aboveHorizon: boolean;
  altitude: number;
};

export function phaseName(angle: number): string {
  const a = ((angle % 360) + 360) % 360;
  if (a < 11.25 || a >= 348.75) return "Yeni Ay";
  if (a < 78.75) return "Hilal";
  if (a < 101.25) return "İlk Dördün";
  if (a < 168.75) return "Şişkin Ay";
  if (a < 191.25) return "Dolunay";
  if (a < 258.75) return "Şişkin Ay";
  if (a < 281.25) return "Son Dördün";
  return "Hilal";
}

/** Tam evre etiketi: "Hilal (büyüyen)" gibi */
export function phaseLabel(angle: number): string {
  const n = phaseName(angle);
  if (n === "Hilal" || n === "Şişkin Ay") return `${n} (${angle < 180 ? "büyüyen" : "küçülen"})`;
  return n;
}

type V = [number, number, number];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const norm = (a: V): V => scale(a, 1 / Math.hypot(a[0], a[1], a[2]));
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * Belirli bir anda ve yerde Ay'ın görünüşü.
 * Işık yönü ve kuzey dönüklüğü gözlemcinin ufkuna göre (başucu ekranın üstü) hesaplanır,
 * böylece hilalin eğimi o şehirden gerçekten görüldüğü gibi olur.
 */
export function moonAt(when: Date, lat: number, lon: number): MoonInfo {
  const t = A.MakeTime(when);
  const phaseAngle = A.MoonPhase(t);
  const fraction = A.Illumination(A.Body.Moon, t).phase_fraction;

  const obs = new A.Observer(lat, lon, 0);
  const rot = A.Rotation_EQJ_HOR(t, obs);
  const toHor = (v: A.Vector): V => {
    const r = A.RotateVector(rot, v);
    return [r.x, r.y, r.z]; // x = kuzey, y = batı, z = başucu
  };

  const moonG = A.GeoVector(A.Body.Moon, t, true);
  const sunG = A.GeoVector(A.Body.Sun, t, true);
  // gözlemciden Ay'a (topo merkezli: Dünya yarıçapı kadar düzeltme)
  const obsV = A.ObserverVector(t, obs, false);
  const moonTopo = new A.Vector(moonG.x - obsV.x, moonG.y - obsV.y, moonG.z - obsV.z, t);

  const m = norm(toHor(moonTopo)); // bakış yönü
  const toSun = norm(sub(toHor(sunG), toHor(moonG))); // Ay'dan Güneş'e
  const zen: V = [0, 0, 1];
  let up = sub(zen, scale(m, dot(zen, m)));
  if (Math.hypot(...up) < 1e-6) up = [1, 0, 0];
  up = norm(up);
  const right = norm(cross(m, up));

  const light = norm([dot(toSun, right), dot(toSun, up), -dot(toSun, m)]);

  // Göksel kuzey kutbu (EQJ z ekseni) ekranda nereye düşüyor
  const pole = toHor(new A.Vector(0, 0, 1, t));
  const px = dot(pole, right);
  const py = dot(pole, up);
  const northAngle = Math.atan2(-px, py); // 0 = yukarı, pozitif = saat yönünün tersi

  const altitude = (Math.asin(Math.max(-1, Math.min(1, m[2]))) * 180) / Math.PI;

  return {
    phaseAngle,
    fraction,
    name: phaseName(phaseAngle),
    waxing: phaseAngle < 180,
    light,
    northAngle,
    aboveHorizon: altitude > 0,
    altitude,
  };
}
