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

// Samanyolu: 5 parlaklık katmanı, her halkada 3 noktadan biri
const mw = read("mw.json").features.map((f) =>
  f.geometry.coordinates.flatMap((poly) =>
    poly.map((ring) => ring.filter((_, i) => i % 3 === 0).map(([x, y]) => [+ra(x).toFixed(2), +y.toFixed(2)])),
  ),
);
writeFileSync("public/sky/milkyway.json", JSON.stringify(mw));

writeFileSync("public/sky/stars.json", JSON.stringify(stars));
writeFileSync("public/sky/constellations.json", JSON.stringify({ lines, labels: cons }));
console.log("yıldız", stars.length, "takımyıldız", lines.length);
