"""
Siyah-beyaz bir çizimi (PNG) Aeternum boyama sayfasına çevirir.

  python3 scripts/art/vectorize.py girdi.png --id kis-koyu --title "Kış Köyü" --category Kış [--crop wallpaper]

Çıktı: public/art/<id>.json  (bölgeler + mürekkep çizgileri + bölümler)
       public/art/thumbs/<id>.webp
Yöntem:
  1) Resim büyütülür, mürekkep (siyah çizgiler) ayrılır, küçük boşluklar kapatılır.
  2) Çizgilerin arasında kalan her beyaz alan bir "bölge" olur (dokununca boyanır).
  3) Bölgeler çizginin altına hafifçe taşırılır (boyada beyaz boşluk kalmaz).
  4) Mürekkep potrace ile pürüzsüz vektöre çevrilir (her çözünürlükte keskin, 4K).
  5) Bölgeler 32 bölüme ayrılır: her görev bir bölüm açar.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np
import potrace

ROOT = Path(__file__).resolve().parents[2]
SECTIONS = 32
WALL_RATIO = 9 / 19.5


def load_ink(path: Path, crop: str | None, target_h: int):
    img = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    if img is None:
        sys.exit(f"okunamadı: {path}")
    h, w = img.shape
    # kenardaki beyaz boşluğu kırp (çerçeve dışı)
    if crop == "wallpaper":
        want_w = int(round(h * WALL_RATIO))
        if want_w < w:
            x0 = (w - want_w) // 2
            img = img[:, x0 : x0 + want_w]
    s = target_h / img.shape[0]
    img = cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_CUBIC)
    img = cv2.GaussianBlur(img, (3, 3), 0)
    ink = (img < 150).astype(np.uint8)
    # bölge sınırları için daha cömert bir "duvar": ince çizgiler de alanları ayırsın
    barrier = cv2.dilate((img < 215).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    # küçük boşlukları kapat, tozları temizle
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    ink = cv2.morphologyEx(ink, cv2.MORPH_CLOSE, k, iterations=1)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(ink, 8)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < 25:
            ink[lab == i] = 0
    return ink, np.maximum(ink, barrier)


def regions_from_ink(ink: np.ndarray, min_area: int):
    free = (1 - ink).astype(np.uint8)
    n, lab, stats, cents = cv2.connectedComponentsWithStats(free, 4)
    keep = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= min_area]
    return lab, stats, cents, keep


def fmt(v: float) -> str:
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


def contour_path(mask: np.ndarray, ox: int, oy: int, scale: float, eps: float) -> str:
    cs, hier = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    d = []
    for c in cs:
        if len(c) < 3:
            continue
        c = cv2.approxPolyDP(c, eps, True)
        if len(c) < 3:
            continue
        pts = [(float(p[0][0] + ox) * scale, float(p[0][1] + oy) * scale) for p in c]
        d.append("M" + " ".join(f"{fmt(x)} {fmt(y)}" for x, y in pts) + "Z")
    return "".join(d)


def ink_path(ink: np.ndarray, scale: float) -> str:
    bmp = potrace.Bitmap(~ink.astype(bool))  # potracer: False = mürekkep
    plist = bmp.trace(turdsize=6, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.3)
    out = []
    for curve in plist:
        sp = curve.start_point
        seg = [f"M{fmt(sp.x * scale)} {fmt(sp.y * scale)}"]
        for s in curve.segments:
            if s.is_corner:
                seg.append(f"L{fmt(s.c.x * scale)} {fmt(s.c.y * scale)}L{fmt(s.end_point.x * scale)} {fmt(s.end_point.y * scale)}")
            else:
                seg.append(
                    f"C{fmt(s.c1.x * scale)} {fmt(s.c1.y * scale)} {fmt(s.c2.x * scale)} {fmt(s.c2.y * scale)} {fmt(s.end_point.x * scale)} {fmt(s.end_point.y * scale)}"
                )
        out.append("".join(seg) + "Z")
    return "".join(out)


def assign_sections(cents: np.ndarray, areas: np.ndarray, focal, seed=3):
    k = min(SECTIONS, len(cents))
    rng = np.random.default_rng(seed)
    w = np.sqrt(areas)
    idx = rng.choice(len(cents), size=k, replace=False, p=w / w.sum())
    centers = cents[idx].copy()
    for _ in range(50):
        d = ((cents[:, None, :] - centers[None, :, :]) ** 2).sum(-1)
        lab = d.argmin(1)
        for j in range(k):
            m = lab == j
            if m.any():
                centers[j] = np.average(cents[m], axis=0, weights=w[m])
    fx, fy = focal
    order = np.argsort((centers[:, 0] - fx) ** 2 + (centers[:, 1] - fy) ** 2)
    rank = {int(c): i for i, c in enumerate(order)}
    secs = [rank[int(l)] for l in lab]
    used = sorted(set(secs))
    remap = {s: i for i, s in enumerate(used)}
    return [remap[s] for s in secs]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--id", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--category", required=True)
    ap.add_argument("--crop", default=None)
    ap.add_argument("--focal", default="0.5,0.55", help="bölüm 0'ın merkezi (oran)")
    ap.add_argument("--work-h", type=int, default=3072, help="işleme yüksekliği (px)")
    ap.add_argument("--out-w", type=int, default=1179, help="çıktı koordinat genişliği")
    args = ap.parse_args()

    ink, barrier = load_ink(Path(args.src), args.crop, args.work_h)
    H, W = ink.shape
    scale = args.out_w / W
    out_h = round(H * scale, 1)

    min_area = int((W * H) * 0.00004)  # çok küçük boşluklar boyanmaz (mürekkebe katılır)
    lab, stats, cents, keep = regions_from_ink(barrier, min_area)
    # mürekkep çizgi kalınlığının yarısı kadar taşır
    dist = cv2.distanceTransform((1 - ink).astype(np.uint8), cv2.DIST_L2, 3)
    stroke = max(2, int(np.median(cv2.distanceTransform(ink, cv2.DIST_L2, 3)[ink > 0]) * 2 + 1))
    grow = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (stroke + 2, stroke + 2))

    regions, rc, ra = [], [], []
    for i in keep:
        x, y, w, h, a = stats[i]
        pad = stroke + 2
        x0, y0 = max(0, x - pad), max(0, y - pad)
        x1, y1 = min(W, x + w + pad), min(H, y + h + pad)
        m = (lab[y0:y1, x0:x1] == i).astype(np.uint8)
        m = cv2.dilate(m, grow)
        d = contour_path(m, x0, y0, scale, eps=1.2)
        if not d:
            continue
        regions.append(d)
        rc.append([cents[i][0] * scale, cents[i][1] * scale])
        ra.append(a)
    rc = np.array(rc)
    ra = np.array(ra, dtype=float)
    # sırala: üstten alta
    order = np.lexsort((rc[:, 0], np.round(rc[:, 1] / 60)))
    regions = [regions[i] for i in order]
    rc, ra = rc[order], ra[order]
    fx, fy = [float(v) for v in args.focal.split(",")]
    secs = assign_sections(rc, ra, (fx * args.out_w, fy * out_h))

    lines = ink_path(ink, scale)
    data = {
        "id": args.id,
        "title": args.title,
        "category": args.category,
        "w": args.out_w,
        "h": out_h,
        "regions": regions,
        "sections": secs,
        "lines": "",
        "ink": lines,
    }
    out = ROOT / "public" / "art"
    out.mkdir(parents=True, exist_ok=True)
    (out / f"{args.id}.json").write_text(json.dumps(data, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")

    # önizleme (mürekkep, krem kağıt)
    thumbs = out / "thumbs"
    thumbs.mkdir(exist_ok=True)
    th = cv2.resize(255 - ink * 255, (480, int(480 * H / W)), interpolation=cv2.INTER_AREA)
    rgb = cv2.cvtColor(th, cv2.COLOR_GRAY2BGR)
    paper = np.full_like(rgb, (241, 248, 253))
    rgb = np.where(rgb < 250, (rgb * 0.18 + np.array([25, 32, 46]) * 0.82).astype(np.uint8), paper)
    cv2.imwrite(str(thumbs / f"{args.id}.webp"), rgb, [cv2.IMWRITE_WEBP_QUALITY, 85])
    kb = (out / f"{args.id}.json").stat().st_size // 1024
    print(f"{args.id}: {len(regions)} bölge, {max(secs) + 1} bölüm, çizgi {len(lines) // 1024}KB, toplam {kb}KB, {args.out_w}x{out_h}")


if __name__ == "__main__":
    main()
