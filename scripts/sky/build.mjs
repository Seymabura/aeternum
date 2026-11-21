// Yıldız ve takımyıldız verisini d3-celestial'dan (BSD-3, Olaf Frohn) küçük JSON'lara çevirir.
// Kullanım: npm pack d3-celestial && tar xzf d3-celestial-*.tgz && node scripts/sky/build.mjs package/data
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = process.argv[2] ?? "package/data";
const read = (f) => JSON.parse(readFileSync(path.join(dir, f), "utf8"));
const ra = (lon) => ((lon % 360) + 360) % 360; // d3-celestial: -180..180 → 0..360

const stars = read("stars.6.json").features
  .filter((f) => f.properties.mag <= 6)
  .map((f) => [+ra(f.geometry.coordinates[0]).toFixed(3), +f.geometry.coordinates[1].toFixed(3), +f.properties.mag.toFixed(2), +(+f.properties.bv || 0.6).toFixed(2)])
  .sort((a, b) => a[2] - b[2]);

const lines = read("constellations.lines.json").features.map((f) => ({
  id: f.id,
  rank: +f.properties.rank,
  l: f.geometry.coordinates.map((pl) => pl.map(([x, y]) => [+ra(x).toFixed(3), +y.toFixed(3)])),
}));

const cons = Object.fromEntries(
  read("constellations.json").features.map((f) => [f.id, { rank: +f.properties.rank, p: [+ra(f.geometry.coordinates[0]).toFixed(2), +f.geometry.coordinates[1].toFixed(2)] }]),
);

// Samanyolu: 5 parlaklık katmanı, d3-geo ile küresel doldurma için GeoJSON yapısı korunur (boylam -180..180)
const mw = read("mw.json").features.map((f) =>
  f.geometry.coordinates.map((poly) =>
    poly.map((ring) => ring.filter((_, i) => i % 2 === 0 || i === ring.length - 1).map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)])),
  ),
);
writeFileSync("public/sky/milkyway.json", JSON.stringify(mw));

writeFileSync("public/sky/stars.json", JSON.stringify(stars));

// Derin katalog (kadir ≤ 8): duvar kağıtları için. [ra, dec, mag, bv] 2 ondalık, parlaklık sırasıyla
const deep = read("stars.8.json").features
  .filter((f) => f.properties.mag <= 8)
  .map((f) => [+ra(f.geometry.coordinates[0]).toFixed(2), +f.geometry.coordinates[1].toFixed(2), +f.properties.mag.toFixed(1), +(+f.properties.bv || 0.6).toFixed(1)])
  .sort((a, b) => a[2] - b[2]);
writeFileSync("public/sky/stars8.json", JSON.stringify(deep));
console.log("derin yıldız", deep.length);
writeFileSync("public/sky/constellations.json", JSON.stringify({ lines, labels: cons }));
console.log("yıldız", stars.length, "takımyıldız", lines.length);
