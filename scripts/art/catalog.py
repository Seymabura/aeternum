"""public/art/*.json dosyalarından lib/art/catalog.json ve lib/art/sections.json üretir."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ORDER = ["istanbul-kis", "somine-kedi", "kis-koyu", "cay-kosesi", "kis-mandala"]  # öne çıkacaklar
cat, secs = [], {}
for f in sorted((ROOT / "public" / "art").glob("*.json")):
    d = json.loads(f.read_text(encoding="utf-8"))
    if "ink" not in d:
        continue
    cat.append({"id": d["id"], "title": d["title"], "category": d["category"], "w": d["w"], "h": d["h"],
                "regions": len(d["regions"]), "sections": max(d["sections"]) + 1})
    secs[d["id"]] = d["sections"]
cat.sort(key=lambda a: (ORDER.index(a["id"]) if a["id"] in ORDER else 99, a["category"], a["title"]))
(ROOT / "lib" / "art" / "catalog.json").write_text(json.dumps(cat, ensure_ascii=False, indent=1), encoding="utf-8")
(ROOT / "lib" / "art" / "sections.json").write_text(json.dumps(secs, separators=(",", ":")), encoding="utf-8")
print(len(cat), "resim")
