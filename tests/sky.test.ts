import { describe, expect, it } from "vitest";
import * as A from "astronomy-engine";
import { altAz } from "@/lib/astro/sky";
import { zonedToUtc } from "@/lib/astro/time";

describe("gökyüzü izdüşümü", () => {
  const when = zonedToUtc("2026-08-12", "22:00", "Europe/Istanbul");
  const lat = 41.0082;
  const lon = 28.9784;

  it("Vega'nın yüksekliği astronomy-engine ile aynı (±0.5°)", () => {
    const vega = altAz(279.2347, 38.7837, when, lat, lon);
    A.DefineStar(A.Body.Star1, 279.2347 / 15, 38.7837, 25.04);
    const t = A.MakeTime(when);
    const obs = new A.Observer(lat, lon, 0);
    const eq = A.Equator(A.Body.Star1, t, obs, true, true);
    const hor = A.Horizon(t, obs, eq.ra, eq.dec);
    expect(Math.abs(vega.alt - hor.altitude)).toBeLessThan(0.5);
    // Yaz Üçgeni o saatte yüksekte
    expect(vega.alt).toBeGreaterThan(60);
  });

  it("Deneb ve Altair de ufkun üstünde", () => {
    expect(altAz(310.358, 45.28, when, lat, lon).alt).toBeGreaterThan(45);
    expect(altAz(297.696, 8.868, when, lat, lon).alt).toBeGreaterThan(30);
  });

  it("Kutup Yıldızı yüksekliği ≈ enlem", () => {
    const pol = altAz(37.95, 89.264, when, lat, lon);
    expect(Math.abs(pol.alt - lat)).toBeLessThan(1.2);
    // kuzey yukarıda: y negatif (ekranda üst)
    expect(pol.y).toBeLessThan(0);
  });
});
