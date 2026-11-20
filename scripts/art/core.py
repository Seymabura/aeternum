"""
Aeternum boyama resmi üreticisi - çekirdek araçlar.

Her resim, önden arkaya boyanmış basit şekillerden oluşur. Şekiller üst üste
bindiğinde görünen parçalar "bölge" olur (dokununca boyanan alanlar).
Büyük bölgeler isteğe göre vitray/mozaik gibi küçük parçalara bölünür.
Sonra bölgeler 32 bölüme ayrılır: bölüm 0 hediye, her görev bir bölüm daha açar.

Bu dosya ve ürettiği resimler Aeternum için sıfırdan yazılmıştır (CC0).
"""
from __future__ import annotations

import json
import math
import random
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from scipy.spatial import Voronoi
from shapely import affinity
from shapely.geometry import LineString, MultiPolygon, Point, Polygon, box
from shapely.geometry.base import BaseGeometry
from shapely.ops import unary_union

SECTIONS = 32

# ---------------------------------------------------------------- şekiller


def circle(x, y, r, res=48):
    return Point(x, y).buffer(r, quad_segs=max(8, res // 4))


def ellipse(x, y, rx, ry, rot=0.0):
    e = affinity.scale(Point(0, 0).buffer(1, quad_segs=24), rx, ry)
    e = affinity.rotate(e, rot, origin=(0, 0))
    return affinity.translate(e, x, y)


def rect(x, y, w, h, r=0.0):
    b = box(x, y, x + w, y + h)
    if r > 0:
        b = b.buffer(-r).buffer(r, quad_segs=6)
    return b


def poly(pts):
    p = Polygon(pts)
    return p if p.is_valid else p.buffer(0)


def ngon(x, y, r, n, rot=0.0):
    return poly([(x + r * math.cos(math.radians(rot) + 2 * math.pi * i / n),
                  y + r * math.sin(math.radians(rot) + 2 * math.pi * i / n)) for i in range(n)])


def star(x, y, r1, r2, n=5, rot=-90.0):
    pts = []
    for i in range(2 * n):
        r = r1 if i % 2 == 0 else r2
        a = math.radians(rot) + math.pi * i / n
        pts.append((x + r * math.cos(a), y + r * math.sin(a)))
    return poly(pts)


def petal(x, y, length, width, angle_deg, shape=1.0, offset=0.0):
    """Taban (x,y) noktasında, angle yönünde uzanan damla/yaprak şekli."""
    pts = []
    n = 40
    for i in range(n + 1):
        t = i / n
        w = width * (math.sin(math.pi * t) ** shape) * (1 - 0.25 * t)
        pts.append((offset + length * t, w / 2))
    for i in range(n, -1, -1):
        t = i / n
        w = width * (math.sin(math.pi * t) ** shape) * (1 - 0.25 * t)
        pts.append((offset + length * t, -w / 2))
    p = poly(pts)
    p = affinity.rotate(p, angle_deg, origin=(0, 0))
    return affinity.translate(p, x, y)


def leaf(x, y, length, width, angle_deg):
    pts = []
    n = 30
    for i in range(n + 1):
        t = i / n
        pts.append((length * t, width / 2 * math.sin(math.pi * t) ** 0.8))
    for i in range(n, -1, -1):
        t = i / n
        pts.append((length * t, -width / 2 * math.sin(math.pi * t) ** 0.8 * 0.85))
    p = poly(pts)
    p = affinity.rotate(p, angle_deg, origin=(0, 0))
    return affinity.translate(p, x, y)


def ring(x, y, r_out, r_in):
    return circle(x, y, r_out).difference(circle(x, y, r_in))


def arc_band(x, y, r_out, r_in, a0, a1):
    """Halka dilimi (derece)."""
    pts = []
    steps = max(6, int(abs(a1 - a0) / 3))
    for i in range(steps + 1):
        a = math.radians(a0 + (a1 - a0) * i / steps)
        pts.append((x + r_out * math.cos(a), y + r_out * math.sin(a)))
    for i in range(steps, -1, -1):
        a = math.radians(a0 + (a1 - a0) * i / steps)
        pts.append((x + r_in * math.cos(a), y + r_in * math.sin(a)))
    return poly(pts)


def wave_top(x0, x1, y, amp, waves, bottom, phase=0.0):
    """Üst kenarı dalgalı, altı düz bant (kar yığını, tepe, deniz)."""
    pts = []
    n = 80
    for i in range(n + 1):
        t = i / n
        xx = x0 + (x1 - x0) * t
        yy = y + amp * math.sin(phase + t * waves * 2 * math.pi)
        pts.append((xx, yy))
    pts += [(x1, bottom), (x0, bottom)]
    return poly(pts)


def hill(x0, x1, y_peak, bottom, cx=None, flat=1.6):
    cx = (x0 + x1) / 2 if cx is None else cx
    pts = []
    n = 60
    for i in range(n + 1):
        t = i / n
        xx = x0 + (x1 - x0) * t
        d = (xx - cx) / ((x1 - x0) / 2)
        yy = bottom - (bottom - y_peak) * max(0.0, 1 - abs(d) ** flat)
        pts.append((xx, yy))
    pts += [(x1, bottom + 2), (x0, bottom + 2)]
    return poly(pts)


def rotate(g, deg, origin):
    return affinity.rotate(g, deg, origin=origin)


def radial(g, n, center, start=0.0):
    return [affinity.rotate(g, start + 360.0 * i / n, origin=center) for i in range(n)]


def snow_cap(x0, x1, y, depth, bumps=4, seed=0):
    """Çatı/dal üstü kar: üstü düz, altı tırtıklı damla."""
    rnd = random.Random(seed)
    pts = [(x0 - 4, y - depth * 0.25), (x1 + 4, y - depth * 0.25)]
    n = bumps * 6
    for i in range(n, -1, -1):
        t = i / n
        xx = x0 + (x1 - x0) * t
        yy = y + depth * (0.35 + 0.65 * abs(math.sin(t * bumps * math.pi))) * (0.8 + 0.4 * rnd.random())
        pts.append((xx, yy))
    return poly(pts)


# ---------------------------------------------------------------- sahne


@dataclass
class Layer:
    geom: BaseGeometry
    detail: str | None = None  # None | "voronoi" | "bands" | "rings" | "grid"
    density: float = 1.0
    seed: int = 0
    opts: dict = field(default_factory=dict)


class Scene:
    def __init__(self, w, h, seed=7):
        self.w, self.h = w, h
        self.layers: list[Layer] = []
        self.lines: list[BaseGeometry] = []  # sadece süs çizgileri (bölge değil)
        self.rnd = random.Random(seed)

    def add(self, geom, detail=None, density=1.0, **opts):
        if geom is None or geom.is_empty:
            return
        if isinstance(geom, (list, tuple)):
            geom = unary_union(geom)
        self.layers.append(Layer(geom.buffer(0), detail, density, self.rnd.randint(0, 10**6), opts))

    def line(self, pts, width=0):
        self.lines.append(LineString(pts))

    # ------------------------------------------------------------ çözümleme
    def regions(self, min_area=60.0):
        frame = box(0, 0, self.w, self.h)
        covered = Polygon()
        pieces: list[tuple[Polygon, Layer]] = []
        for layer in reversed(self.layers):
            g = layer.geom.intersection(frame)
            vis = g.difference(covered) if not covered.is_empty else g
            covered = unary_union([covered, g])
            for p in explode(vis):
                if p.area >= min_area:
                    pieces.append((p, layer))
        # arka plan (hiçbir şeyin kapatmadığı yer)
        rest = frame.difference(covered)
        for p in explode(rest):
            if p.area >= min_area:
                pieces.append((p, Layer(p, "voronoi", 0.6, 11)))
        out: list[Polygon] = []
        for p, layer in pieces:
            out.extend(subdivide(p, layer))
        cleaned = []
        for p in out:
            p = p.simplify(0.35, preserve_topology=True)
            for q in explode(p):
                if q.area >= min_area * 0.6:
                    cleaned.append(q)
        return cleaned


def explode(g):
    if g is None or g.is_empty:
        return []
    if isinstance(g, Polygon):
        return [g]
    if isinstance(g, MultiPolygon):
        return list(g.geoms)
    if hasattr(g, "geoms"):
        res = []
        for x in g.geoms:
            res.extend(explode(x))
        return res
    return []


def subdivide(p: Polygon, layer: Layer):
    kind = layer.detail
    if not kind:
        return [p]
    rnd = random.Random(layer.seed)
    minx, miny, maxx, maxy = p.bounds
    if kind == "voronoi":
        # hücre sayısı alana göre
        target = max(1, int(p.area / (5200 / max(layer.density, 0.05))))
        if target <= 1:
            return [p]
        pts = []
        tries = 0
        while len(pts) < target and tries < target * 40:
            tries += 1
            x, y = rnd.uniform(minx, maxx), rnd.uniform(miny, maxy)
            if p.contains(Point(x, y)):
                pts.append((x, y))
        if len(pts) < 2:
            return [p]
        # Lloyd gevşetmesi ile daha düzgün mozaik
        for _ in range(2):
            cells = voronoi_cells(pts, p)
            pts = [(c.centroid.x, c.centroid.y) for c in cells if not c.is_empty]
            if len(pts) < 2:
                return [p]
        return [c for c in voronoi_cells(pts, p) if c.area > 1]
    if kind == "bands":
        n = layer.opts.get("n", 6)
        vertical = layer.opts.get("vertical", False)
        res = []
        for i in range(n):
            if vertical:
                b = box(minx + (maxx - minx) * i / n, miny - 1, minx + (maxx - minx) * (i + 1) / n, maxy + 1)
            else:
                b = box(minx - 1, miny + (maxy - miny) * i / n, maxx + 1, miny + (maxy - miny) * (i + 1) / n)
            res.extend(explode(p.intersection(b)))
        return res
    if kind == "wavebands":
        n = layer.opts.get("n", 6)
        amp = layer.opts.get("amp", 10)
        waves = layer.opts.get("waves", 3)
        res = []
        prev = p
        for i in range(1, n):
            y = miny + (maxy - miny) * i / n
            cut = wave_top(minx - 10, maxx + 10, y, amp, waves, maxy + 10, phase=i * 1.3)
            upper = prev.difference(cut)
            res.extend(explode(upper))
            prev = prev.intersection(cut)
        res.extend(explode(prev))
        return res
    if kind == "grid":
        cw = layer.opts.get("cw", 40)
        ch = layer.opts.get("ch", 40)
        res = []
        y = miny
        while y < maxy:
            x = minx
            while x < maxx:
                res.extend(explode(p.intersection(box(x, y, x + cw, y + ch))))
                x += cw
            y += ch
        return res
    if kind == "bricks":
        bw = layer.opts.get("bw", 60)
        bh = layer.opts.get("bh", 26)
        res = []
        row = 0
        y = miny
        while y < maxy:
            x = minx - (bw / 2 if row % 2 else 0)
            while x < maxx:
                res.extend(explode(p.intersection(box(x, y, x + bw, y + bh))))
                x += bw
            y += bh
            row += 1
        return res
    if kind == "rings":
        cx, cy = layer.opts.get("c", (p.centroid.x, p.centroid.y))
        n = layer.opts.get("n", 4)
        rmax = max(abs(maxx - cx), abs(minx - cx), abs(maxy - cy), abs(miny - cy)) * 1.5
        res = []
        prev = p
        for i in range(n - 1, 0, -1):
            c = circle(cx, cy, rmax * i / n)
            res.extend(explode(prev.difference(c)))
            prev = prev.intersection(c)
        res.extend(explode(prev))
        return res
    if kind == "slices":
        cx, cy = layer.opts.get("c", (p.centroid.x, p.centroid.y))
        n = layer.opts.get("n", 8)
        a0 = layer.opts.get("a0", 0)
        r = 4000
        res = []
        for i in range(n):
            a = math.radians(a0 + 360 * i / n)
            b = math.radians(a0 + 360 * (i + 1) / n)
            wedge = poly([(cx, cy), (cx + r * math.cos(a), cy + r * math.sin(a)),
                          (cx + r * math.cos((a + b) / 2), cy + r * math.sin((a + b) / 2)),
                          (cx + r * math.cos(b), cy + r * math.sin(b))])
            res.extend(explode(p.intersection(wedge)))
        return res
    return [p]


def voronoi_cells(pts, clip: Polygon):
    minx, miny, maxx, maxy = clip.bounds
    span = max(maxx - minx, maxy - miny) * 4 + 100
    cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
    far = [(cx - span, cy - span), (cx + span, cy - span), (cx + span, cy + span), (cx - span, cy + span)]
    vor = Voronoi(np.array(list(pts) + far))
    cells = []
    for i in range(len(pts)):
        reg = vor.regions[vor.point_region[i]]
        if -1 in reg or not reg:
            continue
        cell = Polygon([vor.vertices[j] for j in reg])
        inter = cell.intersection(clip)
        cells.extend(explode(inter))
    return cells


# ---------------------------------------------------------------- bölümler


def assign_sections(regions, focal, w, h, seed=3):
    """Bölgeleri 32 bölüme ayırır. Bölüm 0 odak noktasına en yakın küme,
    sonra odaktan uzaklaştıkça açılır. Her bölüm benzer alan alır."""
    cents = np.array([[r.centroid.x, r.centroid.y] for r in regions])
    areas = np.array([r.area for r in regions])
    k = min(SECTIONS, len(regions))
    rng = np.random.default_rng(seed)
    # alan ağırlıklı k-means
    idx = rng.choice(len(regions), size=k, replace=False, p=areas / areas.sum())
    centers = cents[idx].copy()
    for _ in range(40):
        d = ((cents[:, None, :] - centers[None, :, :]) ** 2).sum(-1)
        lab = d.argmin(1)
        for j in range(k):
            m = lab == j
            if m.any():
                centers[j] = np.average(cents[m], axis=0, weights=areas[m])
    fx, fy = focal
    order = np.argsort(((centers[:, 0] - fx) ** 2 + (centers[:, 1] - fy) ** 2))
    rank = {int(c): i for i, c in enumerate(order)}
    secs = [rank[int(l)] for l in lab]
    # boş kalan bölüm numaralarını sıkıştır
    used = sorted(set(secs))
    remap = {s: i for i, s in enumerate(used)}
    secs = [remap[s] for s in secs]
    # 32'den az küme çıktıysa son bölümleri çoğalt (her görev yine bir şey açsın)
    return secs


# ---------------------------------------------------------------- çıktı


def fmt(v):
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


def ring_d(coords):
    c = list(coords)
    if len(c) > 1 and c[0] == c[-1]:
        c = c[:-1]
    if not c:
        return ""
    out = "M" + fmt(c[0][0]) + " " + fmt(c[0][1])
    px, py = c[0]
    for x, y in c[1:]:
        dx, dy = x - px, y - py
        out += "l" + fmt(dx) + " " + fmt(dy)
        px, py = round(px + float(fmt(dx)), 1), round(py + float(fmt(dy)), 1)
    return out + "z"


def poly_d(p: Polygon):
    # göreli koordinatlarda yuvarlama hatası birikmesin diye mutlak noktalar
    def absring(coords):
        c = list(coords)
        if len(c) > 1 and c[0] == c[-1]:
            c = c[:-1]
        return "M" + " L".join(fmt(x) + " " + fmt(y) for x, y in c) + "Z"

    d = absring(p.exterior.coords)
    for i in p.interiors:
        d += absring(i.coords)
    return d


def line_d(g):
    if isinstance(g, LineString):
        c = list(g.coords)
        return "M" + " L".join(fmt(x) + " " + fmt(y) for x, y in c)
    if hasattr(g, "geoms"):
        return "".join(line_d(x) for x in g.geoms)
    return ""


def export(scene: Scene, meta: dict, outdir: Path, focal, min_area=60.0):
    regions = scene.regions(min_area=min_area)
    # üstten alta, soldan sağa sırala (id'ler düzenli olsun)
    regions.sort(key=lambda r: (round(r.centroid.y / 40), r.centroid.x))
    secs = assign_sections(regions, focal, scene.w, scene.h)
    data = {
        "id": meta["id"],
        "title": meta["title"],
        "category": meta["category"],
        "w": scene.w,
        "h": scene.h,
        "regions": [poly_d(r) for r in regions],
        "sections": secs,
        "lines": "".join(line_d(l) for l in scene.lines),
    }
    outdir.mkdir(parents=True, exist_ok=True)
    (outdir / f"{meta['id']}.json").write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    # küçük önizleme svg'si (sadece çizgiler)
    outline = "".join(data["regions"])
    thumb = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {scene.w} {scene.h}">'
        f'<rect width="100%" height="100%" fill="#fbf5ea"/>'
        f'<path d="{outline}" fill="none" stroke="#2e2019" stroke-width="{max(scene.w, scene.h) / 420:.2f}" stroke-linejoin="round"/>'
        f'<path d="{data["lines"]}" fill="none" stroke="#2e2019" stroke-width="{max(scene.w, scene.h) / 520:.2f}" stroke-linecap="round"/>'
        "</svg>"
    )
    (outdir / f"{meta['id']}.svg").write_text(thumb, encoding="utf-8")
    return len(regions), max(secs) + 1, len(json.dumps(data)) // 1024
