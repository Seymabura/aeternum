import { describe, expect, it } from "vitest";
import { moonAt, phaseLabel } from "@/lib/astro/moon";
import { zonedToUtc } from "@/lib/astro/time";

const IST = { lat: 41.0082, lon: 28.9784 };

describe("Ay evresi", () => {
  it("8 Nisan 2024 güneş tutulması: Yeni Ay", () => {
    const m = moonAt(new Date("2024-04-08T18:20:00Z"), IST.lat, IST.lon);
    expect(m.fraction).toBeLessThan(0.01);
    expect(m.name).toBe("Yeni Ay");
  });
  it("25 Mart 2024: Dolunay", () => {
    const m = moonAt(new Date("2024-03-25T07:00:00Z"), IST.lat, IST.lon);
    expect(m.fraction).toBeGreaterThan(0.98);
    expect(m.name).toBe("Dolunay");
  });
  it("ilk dördün yaklaşık yarı aydınlık ve sağ tarafı aydınlık (kuzey yarımküre, akşam)", () => {
    // 17 Nisan 2026 → ilk dördün 24 Nisan 2026 civarı; akşam 21:00 İstanbul
    const t = zonedToUtc("2026-04-24", "21:00", "Europe/Istanbul");
    const m = moonAt(t, IST.lat, IST.lon);
    expect(m.fraction).toBeGreaterThan(0.4);
    expect(m.fraction).toBeLessThan(0.65);
    expect(m.light[0]).toBeGreaterThan(0); // ışık sağdan (batıdan) gelir
    expect(phaseLabel(m.phaseAngle)).toMatch(/Dördün|büyüyen/);
  });
  it("dolunayda ışık izleyicinin arkasından gelir", () => {
    const m = moonAt(new Date("2024-03-25T07:00:00Z"), IST.lat, IST.lon);
    expect(m.light[2]).toBeGreaterThan(0.95);
  });
});

describe("saat dilimi", () => {
  it("İstanbul 21:00 = 18:00 UTC", () => {
    expect(zonedToUtc("2026-08-12", "21:00", "Europe/Istanbul").toISOString()).toBe("2026-08-12T18:00:00.000Z");
  });
  it("New York yaz saati", () => {
    expect(zonedToUtc("2026-07-01", "20:00", "America/New_York").toISOString()).toBe("2026-07-02T00:00:00.000Z");
  });
});
