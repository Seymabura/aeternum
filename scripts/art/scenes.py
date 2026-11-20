"""Aeternum boyama sahneleri. Çalıştır: python3 scripts/art/scenes.py"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from core import (Scene, arc_band, box, circle, ellipse, export, hill, leaf, ngon, petal, poly, radial,  # noqa
                  rect, ring, rotate, snow_cap, star, unary_union, wave_top)

OUT = Path(__file__).resolve().parents[2] / "public" / "art"
W, H = 1000, 1250  # 4:5 dikey sahneler
M = 1000  # kare mandala


# ============================================================ MANDALALAR

def mandala_kar():
    s = Scene(M, M, seed=1)
    c = (500, 500)
    cx, cy = c
    s.add(circle(cx, cy, 490), "slices", n=48, c=c)
    s.add(ring(cx, cy, 470, 440), "slices", n=48, c=c, a0=3.75)
    # dış taç: 12 sivri yaprak
    for p in radial(petal(cx, cy, 440, 120, -90, shape=0.9, offset=250), 12, c):
        s.add(p, "bands", n=3)
    for p in radial(petal(cx, cy, 380, 70, -90, shape=1.2, offset=290), 12, c, start=15):
        s.add(p)
    s.add(ring(cx, cy, 330, 300), "slices", n=36, c=c)
    # kar tanesi kolları
    for a in range(12):
        arm = rotate(rect(cx - 9, cy - 300, 18, 300), a * 30, c)
        s.add(arm)
    for p in radial(ngon(cx, cy - 250, 34, 6, 0), 12, c):
        s.add(p, "slices", n=6, c=(cx, cy - 250))
    for p in radial(petal(cx, cy - 190, 70, 34, -60), 12, c):
        s.add(p)
    for p in radial(petal(cx, cy - 190, 70, 34, -120), 12, c):
        s.add(p)
    s.add(ring(cx, cy, 170, 150), "slices", n=24, c=c)
    for p in radial(petal(cx, cy, 150, 60, -90, offset=30), 12, c, start=15):
        s.add(p)
    for p in radial(petal(cx, cy, 120, 50, -90, offset=20), 12, c):
        s.add(p, "bands", n=2)
    s.add(star(cx, cy, 70, 40, 12, -90), "slices", n=24, c=c)
    s.add(circle(cx, cy, 30), "slices", n=6, c=c)
    s.add(circle(cx, cy, 10))
    # köşe süsleri
    for (x, y) in [(40, 40), (960, 40), (40, 960), (960, 960)]:
        s.add(star(x, y, 30, 12, 6, 0))
    return s


def mandala_gul():
    s = Scene(M, M, seed=2)
    c = (500, 500)
    cx, cy = c
    s.add(circle(cx, cy, 495), "slices", n=32, c=c)
    for p in radial(circle(cx, cy - 460, 26), 32, c):
        s.add(p, "rings", n=2)
    s.add(ring(cx, cy, 430, 412), "slices", n=64, c=c)
    for p in radial(petal(cx, cy, 300, 150, -90, shape=0.7, offset=110), 16, c, start=11.25):
        s.add(p, "bands", n=4)
    for p in radial(petal(cx, cy, 300, 120, -90, shape=0.8, offset=100), 16, c):
        s.add(p, "bands", n=4)
    for p in radial(petal(cx, cy, 230, 110, -90, shape=0.8, offset=80), 8, c, start=22.5):
        s.add(p, "bands", n=3)
    for p in radial(petal(cx, cy, 220, 100, -90, shape=0.9, offset=70), 8, c):
        s.add(p, "bands", n=3)
    s.add(ring(cx, cy, 160, 140), "slices", n=40, c=c)
    for p in radial(petal(cx, cy, 120, 70, -90, shape=0.8, offset=20), 8, c, start=22.5):
        s.add(p)
    for p in radial(petal(cx, cy, 110, 60, -90, shape=0.8, offset=15), 8, c):
        s.add(p, "bands", n=2)
    s.add(circle(cx, cy, 55), "slices", n=8, c=c, a0=22.5)
    s.add(circle(cx, cy, 30), "rings", n=2, c=c)
    for (x, y) in [(55, 55), (945, 55), (55, 945), (945, 945)]:
        for p in radial(petal(x, y, 46, 22, -90), 6, (x, y)):
            s.add(p)
        s.add(circle(x, y, 10))
    return s


def mandala_gunes():
    s = Scene(M, M, seed=3)
    c = (500, 500)
    cx, cy = c
    s.add(circle(cx, cy, 495), "rings", n=2, c=c)
    for p in radial(arc_band(cx, cy, 480, 440, -6, 6), 30, c):
        s.add(p)
    for p in radial(poly([(cx, cy - 430), (cx - 38, cy - 300), (cx + 38, cy - 300)]), 20, c):
        s.add(p, "bands", n=3)
    for p in radial(poly([(cx, cy - 360), (cx - 30, cy - 260), (cx + 30, cy - 260)]), 20, c, start=9):
        s.add(p, "bands", n=2)
    s.add(ring(cx, cy, 270, 250), "slices", n=40, c=c)
    for p in radial(circle(cx, cy - 215, 28), 20, c):
        s.add(p, "rings", n=2)
    for p in radial(circle(cx, cy - 215, 18), 20, c, start=9):
        s.add(p)
    s.add(ring(cx, cy, 190, 175), "slices", n=40, c=c)
    for p in radial(petal(cx, cy, 165, 70, -90, shape=0.8, offset=10), 10, c):
        s.add(p, "bands", n=3)
    for p in radial(petal(cx, cy, 130, 50, -90, shape=0.8, offset=10), 10, c, start=18):
        s.add(p)
    s.add(star(cx, cy, 80, 50, 10, -90), "slices", n=20, c=c)
    s.add(circle(cx, cy, 40), "slices", n=10, c=c)
    s.add(circle(cx, cy, 15))
    return s


# ============================================================ SAHNELER


def pine(s, x, base, h, w, layers=4, snow=True, detail=True):
    s.add(rect(x - w * 0.07, base - h * 0.12, w * 0.14, h * 0.14))
    for i in range(layers):
        t0 = i / layers
        top = base - h + h * t0 * 0.85
        bot = base - h * 0.1 - (layers - 1 - i) * h * 0.18
        bw = w * (0.45 + 0.55 * (i + 1) / layers)
        tri = poly([(x, top), (x - bw / 2, bot), (x + bw / 2, bot)])
        s.add(tri, "bands" if detail else None, n=2, vertical=True)
        if snow:
            s.add(poly([(x, top), (x - bw * 0.22, top + (bot - top) * 0.45), (x - bw * 0.08, top + (bot - top) * 0.38),
                        (x, top + (bot - top) * 0.5), (x + bw * 0.1, top + (bot - top) * 0.36),
                        (x + bw * 0.22, top + (bot - top) * 0.45)]))


def house(s, x, y, w, h, roof_h, seed=0, door=True, windows=2):
    rnd = random.Random(seed)
    s.add(rect(x, y, w, h), "bricks", bw=w / 4, bh=h / 7)
    roof = poly([(x - 18, y + 4), (x + w / 2, y - roof_h), (x + w + 18, y + 4)])
    s.add(roof, "bands", n=4)
    cx_ = x + w * (0.7 if rnd.random() > 0.5 else 0.25)
    s.add(rect(cx_, y - roof_h * 0.85, w * 0.12, roof_h * 0.6))
    s.add(snow_cap(x - 18, x + w / 2, y - roof_h * 0.15, 16, 3, seed).intersection(roof.buffer(8)))
    s.add(poly([(x - 20, y + 4), (x + w / 2, y - roof_h - 4), (x + w + 20, y + 4), (x + w + 20, y - 4),
                (x + w / 2, y - roof_h + 14), (x - 20, y - 4)]))
    s.add(rect(cx_ - 4, y - roof_h * 0.88, w * 0.12 + 8, 12, 4))
    ww = w * 0.22
    wy = y + h * 0.18
    xs = [x + w * 0.12, x + w * 0.66] if windows == 2 else [x + w * 0.39]
    for wx in xs:
        s.add(rect(wx - 5, wy - 5, ww + 10, ww * 1.2 + 10, 3))
        for i in range(2):
            for j in range(2):
                s.add(rect(wx + i * ww / 2 + 2, wy + j * ww * 0.6 + 2, ww / 2 - 4, ww * 0.6 - 4))
        s.add(rect(wx - 9, wy + ww * 1.2 + 4, ww + 18, 8, 3))
    if door:
        dw = w * 0.2
        dx = x + w / 2 - dw / 2
        s.add(unary_union([rect(dx, y + h * 0.55, dw, h * 0.45), circle(dx + dw / 2, y + h * 0.55, dw / 2)]), "bands", n=2, vertical=True)
        s.add(circle(dx + dw * 0.78, y + h * 0.8, 4))
        s.add(ellipse(x + w / 2, y + h * 0.47, dw * 0.45, dw * 0.2))  # çelenk
        s.add(circle(x + w / 2, y + h * 0.47 + dw * 0.18, 5))


def kis_kasabasi():
    s = Scene(W, H, seed=11)
    s.add(rect(0, 0, W, 760), "wavebands", n=6, amp=14, waves=2)
    s.add(circle(790, 170, 82))
    for (x, y, r) in [(770, 150, 14), (815, 200, 10), (800, 140, 7)]:
        s.add(circle(x, y, r))
    rnd = random.Random(4)
    for _ in range(26):
        x, y = rnd.uniform(30, 970), rnd.uniform(30, 480)
        if (x - 790) ** 2 + (y - 170) ** 2 < 130 ** 2:
            continue
        s.add(star(x, y, rnd.uniform(9, 16), rnd.uniform(4, 6), rnd.choice([4, 5])))
    s.add(hill(-200, 600, 420, 760), "voronoi", 0.5)
    s.add(hill(350, 1250, 380, 760, cx=850), "voronoi", 0.5)
    for i, x in enumerate([60, 140, 880, 950]):
        pine(s, x, 640, 190, 110, layers=3)
    # kilise kulesi
    s.add(rect(470, 330, 70, 300), "bricks", bw=35, bh=30)
    s.add(poly([(460, 335), (505, 215), (550, 335)]), "bands", n=3)
    s.add(rect(500, 175, 10, 50))
    s.add(rect(488, 190, 34, 8))
    s.add(unary_union([rect(490, 380, 30, 40), circle(505, 380, 15)]))
    s.add(circle(505, 470, 22), "slices", n=4, c=(505, 470))
    house(s, 170, 470, 210, 170, 120, seed=1)
    house(s, 590, 480, 190, 160, 110, seed=2, windows=1)
    house(s, 790, 520, 170, 130, 90, seed=3, door=False)
    house(s, 20, 540, 150, 120, 80, seed=4, door=False, windows=1)
    # ön plan kar ve yol
    s.add(wave_top(-10, W + 10, 660, 18, 3, H), "voronoi", 0.4)
    s.add(poly([(470, 700), (540, 700), (700, H), (300, H)]), "bricks", bw=60, bh=40)
    s.add(wave_top(-10, 330, 800, 22, 2, H, 0.5), "voronoi", 0.4)
    s.add(wave_top(680, W + 10, 820, 20, 2, H, 2.0), "voronoi", 0.4)
    # sokak lambası
    s.add(rect(195, 760, 16, 340))
    s.add(rect(180, 1090, 46, 20, 4))
    s.add(poly([(178, 760), (228, 760), (218, 700), (188, 700)]), "bands", n=2, vertical=True)
    s.add(poly([(175, 700), (231, 700), (203, 672)]))
    for (x, y) in [(150, 1000), (350, 1150), (870, 980), (720, 1150), (60, 1180)]:
        s.add(star(x, y, 22, 9, 6, 0))
    # kardan adam
    s.add(circle(820, 1070, 90), "voronoi", 2)
    s.add(circle(820, 940, 62))
    s.add(rect(780, 860, 80, 20))
    s.add(rect(793, 800, 54, 64))
    s.add(poly([(820, 945), (880, 952), (820, 958)]))
    s.add(rect(765, 985, 112, 22, 8), "bands", n=5, vertical=True)
    for y in (1030, 1070, 1110):
        s.add(circle(820, y, 8))
    s.add(circle(802, 925, 6))
    s.add(circle(838, 925, 6))
    return s


def ciceki_pencere():
    s = Scene(W, H, seed=12)
    s.add(rect(0, 0, W, H), "bricks", bw=125, bh=56)
    # pencere dış çerçeve (kemerli)
    def arch(x, y, w, h):
        return unary_union([rect(x, y + w / 2, w, h - w / 2), ellipse(x + w / 2, y + w / 2, w / 2, w / 2)])
    s.add(arch(170, 120, 660, 760))
    s.add(arch(205, 155, 590, 700))
    sky = arch(225, 175, 550, 660)
    s.add(sky, "wavebands", n=5, amp=10, waves=2)
    s.add(circle(640, 300, 58))
    rnd = random.Random(8)
    for _ in range(14):
        x, y = rnd.uniform(260, 740), rnd.uniform(220, 600)
        if sky.contains(circle(x, y, 18)) and (x - 640) ** 2 + (y - 300) ** 2 > 90 ** 2:
            s.add(star(x, y, rnd.uniform(10, 15), 5, 6, 0))
    s.add(hill(225, 775, 620, 840, cx=420).intersection(sky), "voronoi", 1.2)
    for x in (300, 360, 690):
        pine(s, x, 800, 150, 80, layers=3, detail=False)
    # pencere kayıtları
    s.add(rect(492, 175, 16, 660))
    s.add(rect(225, 500, 550, 16))
    # perdeler
    def curtain(x0, x1, left=True):
        pts = []
        n = 40
        for i in range(n + 1):
            t = i / n
            pts.append((x0 + (x1 - x0) * t, 90 + 6 * math.sin(t * 6 * math.pi)))
        for i in range(n, -1, -1):
            t = i / n
            y = 900
            gather = 0.55 if left else 0.45
            xx = x0 + (x1 - x0) * t
            # bağlanan kısım
            pinch = (1 - math.sin(t * math.pi) * 0.0)
            pts.append((xx if (t < gather if left else t > gather) else (x0 + (x1 - x0) * gather), y * pinch))
        return poly(pts)
    lc = poly([(110, 80), (330, 80), (300, 300), (240, 520), (250, 560), (300, 900), (110, 900)])
    rc = poly([(670, 80), (890, 80), (890, 900), (700, 900), (750, 560), (760, 520), (700, 300)])
    s.add(lc, "bands", n=5, vertical=True)
    s.add(rc, "bands", n=5, vertical=True)
    s.add(rect(225, 515, 50, 34, 10))
    s.add(rect(725, 515, 50, 34, 10))
    s.add(rect(80, 50, 840, 40, 12), "bands", n=12, vertical=True)
    s.add(circle(80, 70, 26))
    s.add(circle(920, 70, 26))
    # ışık zinciri
    for i in range(11):
        t = i / 10
        x = 240 + 520 * t
        y = 210 + 70 * math.sin(t * math.pi)
        s.add(ellipse(x, y + 14, 9, 13))
        s.add(rect(x - 6, y - 2, 12, 8))
    # pervaz
    s.add(rect(140, 880, 720, 46, 6), "bands", n=6, vertical=True)
    s.add(rect(160, 926, 680, 22))
    # saksılar ve çiçekler
    def pot(x, w, h, seed):
        base_y = 880
        s.add(poly([(x - w / 2, base_y - h), (x + w / 2, base_y - h), (x + w * 0.38, base_y), (x - w * 0.38, base_y)]),
              "bands", n=3)
        s.add(rect(x - w / 2 - 8, base_y - h - 22, w + 16, 26, 6))
    def daisy(x, y, r, n=12, rot=0):
        for p in radial(petal(x, y, r, r * 0.45, -90 + rot, offset=r * 0.25), n, (x, y)):
            s.add(p)
        s.add(circle(x, y, r * 0.3), "rings", n=2, c=(x, y))
    def tulip(x, y, r):
        s.add(poly([(x - r, y - r * 0.2), (x - r * 0.6, y - r * 1.3), (x - r * 0.2, y - r * 0.6), (x, y - r * 1.5),
                    (x + r * 0.2, y - r * 0.6), (x + r * 0.6, y - r * 1.3), (x + r, y - r * 0.2),
                    (x + r * 0.7, y + r * 0.5), (x - r * 0.7, y + r * 0.5)]), "bands", n=3, vertical=True)
    # sol saksı
    for (x0, y0, x1, y1) in [(270, 770, 250, 640), (270, 770, 300, 600), (270, 770, 330, 680)]:
        s.add(rect(min(x0, x1) - 3, min(y0, y1), abs(x1 - x0) + 6, abs(y1 - y0)).intersection(
            poly([(x0 - 4, y0), (x0 + 4, y0), (x1 + 4, y1), (x1 - 4, y1)])))
    s.add(leaf(270, 760, 90, 34, -140))
    s.add(leaf(275, 760, 90, 34, -40))
    pot(270, 130, 110, 1)
    daisy(250, 630, 44)
    daisy(305, 590, 38, rot=12)
    daisy(335, 675, 30, n=10)
    # orta: lale
    for (x1, y1) in [(470, 600), (520, 570), (560, 620)]:
        s.add(poly([(512, 790), (520, 790), (x1 + 4, y1), (x1 - 4, y1)]))
    s.add(leaf(510, 780, 120, 40, -110))
    s.add(leaf(520, 780, 120, 40, -70))
    pot(515, 150, 100, 2)
    tulip(470, 590, 34)
    tulip(520, 560, 38)
    tulip(560, 610, 32)
    # sağ saksı: sarkan yapraklar
    pot(730, 140, 120, 3)
    for i, a in enumerate([-160, -130, -100, -70, -40, -20]):
        s.add(leaf(730, 760, 110 + (i % 2) * 30, 40, a), "bands", n=2)
    for i in range(6):
        s.add(leaf(800, 880 + i * 45, 50, 26, 60 + (i % 2) * 40))
        s.add(leaf(800, 880 + i * 45, 50, 26, 120 - (i % 2) * 40))
    s.add(rect(796, 870, 6, 290))
    # duvarda kedi silueti? hayır: alt kısım halı
    s.add(rect(0, 948, W, H - 948), "grid", cw=100, ch=76)
    # mum
    s.add(rect(390, 800, 40, 80, 6), "bands", n=3)
    s.add(ellipse(410, 785, 10, 18))
    s.add(ellipse(410, 790, 5, 9))
    return s


def deniz_feneri():
    s = Scene(W, H, seed=13)
    s.add(rect(0, 0, W, 760), "wavebands", n=8, amp=16, waves=2)
    s.add(circle(170, 170, 70), "rings", n=2, c=(170, 170))
    rnd = random.Random(31)
    for _ in range(24):
        x, y = rnd.uniform(30, 970), rnd.uniform(30, 640)
        if (x - 170) ** 2 + (y - 170) ** 2 < 120 ** 2 or abs(x - 600) < 150:
            continue
        s.add(star(x, y, rnd.uniform(9, 15), 4.5, rnd.choice([4, 5])))
    # ışık huzmeleri
    s.add(poly([(640, 205), (W, 40), (W, 330)]), "bands", n=4)
    s.add(poly([(560, 205), (0, 330), (0, 560)]), "bands", n=5)
    # deniz
    s.add(wave_top(-10, W + 10, 760, 14, 6, H), "wavebands", n=6, amp=10, waves=3)
    # kayalık (denizin önünde)
    rocks = unary_union([ellipse(620, 960, 330, 150), ellipse(400, 1020, 200, 110), ellipse(860, 1010, 200, 120)])
    s.add(rocks, "voronoi", 0.9)
    s.add(wave_top(-10, W + 10, 1120, 12, 7, H), "wavebands", n=3, amp=8, waves=6)
    # fener gövdesi
    body = poly([(520, 880), (680, 880), (650, 330), (550, 330)])
    s.add(body, "bands", n=7)
    s.add(unary_union([rect(575, 790, 50, 90), circle(600, 790, 25)]), "bands", n=2, vertical=True)
    for yy in (650, 520, 400):
        s.add(unary_union([rect(586, yy, 28, 40), circle(600, yy, 14)]))
    s.add(rect(515, 305, 170, 28, 4), "bands", n=8, vertical=True)
    for i in range(9):
        s.add(rect(522 + i * 19.5, 268, 5, 40))
    s.add(rect(515, 262, 170, 10))
    s.add(rect(548, 170, 104, 95), "bands", n=4, vertical=True)
    s.add(circle(600, 215, 30), "slices", n=8, c=(600, 215))
    s.add(poly([(535, 172), (665, 172), (600, 110)]), "bands", n=3, vertical=True)
    s.add(circle(600, 102, 12))
    s.add(snow_cap(535, 665, 160, 12, 3, 6).intersection(poly([(535, 172), (665, 172), (600, 110)]).buffer(6)))
    # ev
    s.add(rect(700, 780, 170, 110), "bricks", bw=42, bh=22)
    roof = poly([(688, 784), (785, 705), (882, 784)])
    s.add(roof, "bands", n=3)
    s.add(snow_cap(688, 882, 760, 14, 4, 4).intersection(roof.buffer(6)))
    s.add(rect(718, 805, 40, 40))
    s.add(rect(728, 815, 20, 20))
    s.add(rect(800, 815, 38, 75), "bands", n=2, vertical=True)
    # tekne
    hull = poly([(110, 900), (390, 900), (350, 965), (150, 965)])
    s.add(hull, "bands", n=3)
    s.add(rect(245, 690, 8, 210))
    s.add(poly([(256, 700), (256, 890), (380, 890)]), "bands", n=4, vertical=True)
    s.add(poly([(242, 720), (242, 890), (150, 890)]), "bands", n=3, vertical=True)
    s.add(poly([(253, 690), (253, 660), (290, 675)]))
    for (x, y) in [(380, 180), (440, 140), (860, 470), (900, 430)]:
        s.line([(x - 22, y), (x - 10, y - 10), (x, y)])
        s.line([(x, y), (x + 10, y - 10), (x + 22, y)])
    return s


def kitaplik():
    s = Scene(W, H, seed=14)
    s.add(rect(0, 0, W, H), "bands", n=14, vertical=True)  # ahşap duvar
    s.add(rect(60, 60, 880, 1120, 10))
    s.add(rect(90, 90, 820, 1060))
    shelves = [330, 600, 870, 1140]
    for y in shelves:
        s.add(rect(80, y, 840, 24, 3))
    rnd = random.Random(5)
    tops = [90, 354, 624, 894]
    for si, (top, y) in enumerate(zip(tops, shelves)):
        x = 100
        while x < 880:
            r = rnd.random()
            if r < 0.07 and x < 760:
                # bitki saksısı
                pw = 90
                s.add(poly([(x, y - 70), (x + pw, y - 70), (x + pw - 12, y), (x + 12, y)]), "bands", n=2)
                for a in (-150, -120, -90, -60, -30):
                    s.add(leaf(x + pw / 2, y - 70, rnd.uniform(70, 110), 34, a + rnd.uniform(-8, 8)))
                x += pw + 16
                continue
            if r < 0.12 and x < 780:
                # mum ve fincan
                s.add(rect(x + 10, y - 90, 36, 90, 5), "bands", n=3)
                s.add(ellipse(x + 28, y - 108, 9, 18))
                s.add(ellipse(x + 28, y - 103, 4, 9))
                x += 70
                continue
            if r < 0.2 and x < 760:
                # yatık kitap yığını
                bx = x
                hgt = 0
                for k in range(rnd.randint(2, 4)):
                    bw_ = rnd.uniform(110, 150)
                    bh_ = rnd.uniform(18, 28)
                    s.add(rect(bx + rnd.uniform(-6, 6), y - hgt - bh_, bw_, bh_, 2), "bands", n=3, vertical=True)
                    hgt += bh_
                if rnd.random() < 0.6:
                    s.add(ellipse(bx + 70, y - hgt - 30, 26, 30), "voronoi", 4)  # küre/ fincan
                x += 160
                continue
            bw = rnd.uniform(28, 52)
            bh = rnd.uniform(0.62, 0.92) * (y - top)
            if x + bw > 900:
                break
            if rnd.random() < 0.12 and x > 140:
                # eğik kitap
                b = rect(x, y - bh, bw, bh, 2)
                b = rotate(b, -12, (x + bw, y))
                s.add(b, "bands", n=4)
                x += bw + 26
                continue
            s.add(rect(x, y - bh, bw, bh, 2), "bands", n=rnd.choice([3, 4, 5]))
            x += bw + 2
    # üst tabela
    s.add(rect(330, 20, 340, 60, 10))
    s.add(rect(345, 32, 310, 36, 6))
    # yer halısı ve kedi yok; alt kenar
    return s


def cay_kosesi():
    s = Scene(W, H, seed=15)
    s.add(rect(0, 0, W, 700), "grid", cw=125, ch=125)  # duvar karosu
    # pencere
    s.add(rect(560, 80, 360, 420, 8))
    s.add(rect(580, 100, 320, 380), "wavebands", n=4, amp=8, waves=2)
    s.add(hill(560, 920, 380, 480, cx=700).intersection(rect(580, 100, 320, 380)), "voronoi", 1.5)
    s.add(rect(732, 100, 16, 380))
    s.add(rect(580, 282, 320, 16))
    s.add(circle(840, 170, 34))
    # raf ve kavanozlar
    s.add(rect(60, 300, 420, 22, 4))
    for i, (x, w, h) in enumerate([(80, 80, 120), (180, 70, 90), (270, 90, 140), (380, 70, 100)]):
        s.add(rect(x, 300 - h, w, h, 14), "bands", n=3)
        s.add(rect(x - 4, 300 - h - 16, w + 8, 20, 6))
    s.add(ellipse(200, 140, 70, 50), "slices", n=12, c=(200, 140))  # duvar tabağı
    s.add(ring(200, 140, 78, 70))
    # masa
    table = rect(-10, 700, W + 20, H - 700)
    s.add(table, "grid", cw=62.5, ch=55)  # kareli örtü
    s.add(wave_top(-10, W + 10, 1180, 10, 12, H + 10), "bands", n=1)
    # semaver/çaydanlık
    cx, cy = 300, 760
    s.add(ellipse(cx, cy + 120, 150, 30))
    s.add(ellipse(cx, cy, 130, 120), "bands", n=4)
    s.add(rect(cx - 80, cy - 150, 160, 40, 10))
    s.add(ellipse(cx, cy - 165, 60, 26), "bands", n=2)
    s.add(circle(cx, cy - 200, 14))
    s.add(poly([(cx + 120, cy + 10), (cx + 230, cy - 90), (cx + 245, cy - 80), (cx + 140, cy + 50)]))
    s.add(ring(cx - 120, cy - 20, 70, 50).difference(rect(cx - 120, cy - 120, 200, 200)))
    s.add(ellipse(cx, cy - 10, 60, 50), "slices", n=8, c=(cx, cy - 10))
    # ince belli çay bardakları
    def glass(x, y):
        s.add(ellipse(x, y + 8, 62, 16), "rings", n=2, c=(x, y + 8))  # tabak
        pts = []
        n = 30
        for i in range(n + 1):
            t = i / n
            w = 32 - 14 * math.sin(t * math.pi) * 0.95 + 4 * t
            pts.append((x - w, y - 150 * (1 - t)))
        for i in range(n, -1, -1):
            t = i / n
            w = 32 - 14 * math.sin(t * math.pi) * 0.95 + 4 * t
            pts.append((x + w, y - 150 * (1 - t)))
        g = poly(pts)
        s.add(g, "bands", n=2)
        s.add(g.intersection(rect(x - 60, y - 120, 120, 120)), "bands", n=3)  # çay
        s.add(rect(x - 3, y - 175, 6, 70).union(ellipse(x + 2, y - 30, 12, 4)))  # kaşık
    glass(620, 1000)
    glass(800, 1060)
    # tabak ve kurabiyeler
    s.add(ellipse(330, 1040, 170, 60), "rings", n=2, c=(330, 1040))
    for (x, y) in [(260, 1030), (340, 1010), (410, 1040), (310, 1060)]:
        s.add(circle(x, y, 38), "slices", n=6, c=(x, y))
        s.add(circle(x, y, 12))
    # buhar
    for x in (610, 790):
        s.line([(x, 830), (x - 12, 800), (x + 8, 770), (x - 6, 740), (x + 6, 710)])
    s.line([(cx + 240, cy - 100), (cx + 230, cy - 130), (cx + 250, cy - 160), (cx + 238, cy - 190)])
    return s


def somine_kedi():
    s = Scene(W, H, seed=16)
    s.add(rect(0, 0, W, 960), "bands", n=10, vertical=True)  # duvar kağıdı
    for i in range(10):
        for j in range(7):
            x = 50 + i * 100
            y = 60 + j * 140 + (i % 2) * 70
            s.add(star(x, y, 14, 6, 4, 0))
    # şömine
    s.add(rect(130, 230, 740, 680), "bricks", bw=74, bh=34)
    s.add(rect(90, 190, 820, 56, 6), "bands", n=8, vertical=True)
    s.add(rect(110, 246, 780, 18))
    opening = unary_union([rect(300, 470, 400, 420), ellipse(500, 470, 200, 110)])
    s.add(opening.buffer(22), "slices", n=14, c=(500, 600))
    s.add(opening, "voronoi", 0.7)
    # ateş
    for (x, h, w) in [(410, 230, 110), (500, 300, 150), (590, 240, 110)]:
        s.add(petal(x, 855, h, w, -90, shape=0.6), "bands", n=3)
    s.add(petal(500, 855, 180, 74, -90, shape=0.6), "bands", n=2)
    s.add(petal(445, 855, 110, 44, -90, shape=0.6))
    s.add(petal(555, 855, 110, 44, -90, shape=0.6))
    s.add(rotate(rect(340, 840, 320, 44, 20), -6, (500, 862)), "bands", n=4, vertical=True)
    s.add(rotate(rect(340, 858, 320, 40, 20), 6, (500, 878)), "bands", n=4, vertical=True)
    s.add(rect(100, 890, 800, 46, 6), "bands", n=8, vertical=True)  # ocak taşı
    # rafta mumlar ve çerçeve
    for (x, h) in [(190, 110), (240, 80), (750, 95), (805, 130)]:
        s.add(rect(x - 18, 190 - h, 36, h, 5), "bands", n=2)
        s.add(ellipse(x, 190 - h - 16, 9, 16))
        s.add(ellipse(x, 190 - h - 12, 4, 8))
    s.add(rect(420, 70, 160, 120, 8))
    s.add(rect(434, 84, 132, 92), "voronoi", 3)
    # çoraplar
    for i, x in enumerate([200, 370, 630, 800]):
        st = unary_union([rect(x - 30, 270, 60, 110, 4), ellipse(x + 12, 390, 54, 34)])
        s.add(st, "bands", n=4)
        s.add(rect(x - 36, 262, 72, 30, 8))
        s.add(star(x, 335, 14, 6, 5))
    # zemin ve halı
    s.add(rect(0, 936, W, 320), "bands", n=9, vertical=True)
    s.add(ellipse(500, 1110, 480, 120), "rings", n=4, c=(500, 1110))
    s.add(ellipse(500, 1110, 400, 92), "slices", n=24, c=(500, 1110))
    # kedi (arkadan, ateşe bakıyor)
    cx = 500
    s.add(unary_union([ellipse(cx + 150, 1155, 120, 24, 4), circle(cx + 262, 1150, 24)]), "bands", n=4, vertical=True)
    s.add(ellipse(cx, 1070, 125, 115), "bands", n=5)
    s.add(ellipse(cx, 950, 82, 72), "bands", n=3)
    s.add(poly([(cx - 74, 925), (cx - 68, 850), (cx - 22, 896)]))
    s.add(poly([(cx + 74, 925), (cx + 68, 850), (cx + 22, 896)]))
    s.add(poly([(cx - 62, 912), (cx - 59, 872), (cx - 36, 896)]))
    s.add(poly([(cx + 62, 912), (cx + 59, 872), (cx + 36, 896)]))
    s.add(rect(cx - 74, 1004, 148, 20, 9), "bands", n=5, vertical=True)
    s.add(circle(cx, 1036, 13))
    # sıcak çikolata kupası
    s.add(rect(790, 1040, 90, 100, 14), "bands", n=3)
    s.add(ring(890, 1085, 30, 17).difference(rect(850, 1040, 30, 100)))
    s.add(ellipse(835, 1040, 45, 10))
    s.line([(820, 1020), (810, 990), (825, 965), (815, 940)])
    s.line([(850, 1020), (860, 992), (848, 970)])
    return s


def orman_evi():
    s = Scene(W, H, seed=17)
    s.add(rect(0, 0, W, 700), "wavebands", n=5, amp=12, waves=2)
    s.add(circle(160, 150, 60))
    s.add(poly([(-50, 620), (250, 220), (520, 620)]), "voronoi", 0.8)
    s.add(poly([(300, 620), (640, 160), (1050, 620)]), "voronoi", 0.8)
    s.add(poly([(250, 220), (200, 290), (230, 280), (260, 300), (290, 270), (310, 300)]))
    s.add(poly([(640, 160), (580, 245), (615, 235), (650, 260), (680, 230), (710, 250)]))
    s.add(wave_top(-10, W + 10, 600, 14, 2, 760), "voronoi", 0.3)
    rnd = random.Random(9)
    for x in [40, 110, 900, 960, 820]:
        pine(s, x, 760, rnd.uniform(210, 290), 130, layers=4)
    # kulübe
    x, y, w, h = 280, 560, 440, 260
    walls = rect(x, y, w, h)
    s.add(walls, "bands", n=9)
    for i in range(9):
        s.add(circle(x + 4, y + h * (i + 0.5) / 9, h / 20))
        s.add(circle(x + w - 4, y + h * (i + 0.5) / 9, h / 20))
    roof = poly([(x - 50, y + 10), (x + w / 2, y - 190), (x + w + 50, y + 10)])
    s.add(roof, "bands", n=5)
    s.add(snow_cap(x - 50, x + w + 50, y - 40, 22, 6, 2).intersection(roof.buffer(10)), "bands", n=2, vertical=True)
    s.add(rect(x + w * 0.68, y - 200, 50, 110), "bricks", bw=25, bh=22)
    for i, (sx, sy, r) in enumerate([(x + w * 0.68 + 25, y - 230, 26), (x + w * 0.68 + 50, y - 280, 34), (x + w * 0.68 + 30, y - 345, 42)]):
        s.add(circle(sx, sy, r))
    # pencere ve kapı
    s.add(rect(x + 40, y + 70, 120, 100, 6))
    for i in range(2):
        for j in range(2):
            s.add(rect(x + 48 + i * 54, y + 78 + j * 44, 50, 40))
    s.add(rect(x + 30, y + 168, 140, 14, 3))
    s.add(rect(x + 300, y + 60, 100, 200), "bands", n=3, vertical=True)
    s.add(circle(x + 380, y + 170, 6))
    s.add(circle(x + 350, y + 30, 26), "slices", n=6, c=(x + 350, y + 30))
    # basamak, çit, odun
    s.add(rect(x + 280, y + h, 140, 20))
    for i in range(10):
        fx = 20 + i * 26
        s.add(poly([(fx, 900), (fx + 16, 900), (fx + 16, 820), (fx + 8, 808), (fx, 820)]))
    s.add(rect(10, 840, 270, 12))
    s.add(rect(10, 870, 270, 12))
    for (lx, ly) in [(760, 880), (820, 880), (880, 880), (790, 835), (850, 835), (820, 790)]:
        s.add(circle(lx, ly, 28), "rings", n=3, c=(lx, ly))
    # ön plan kar
    s.add(wave_top(-10, W + 10, 900, 16, 3, H), "voronoi", 0.3)
    s.add(poly([(560, 840), (700, 840), (820, H), (440, H)]), "bricks", bw=80, bh=40)
    # geyik silueti yerine tavşan
    s.add(ellipse(200, 1060, 50, 40))
    s.add(circle(160, 1020, 26))
    s.add(ellipse(150, 975, 8, 28, -10))
    s.add(ellipse(168, 975, 8, 28, 10))
    s.add(circle(250, 1065, 14))
    pine(s, 940, 1200, 300, 160, layers=4)
    return s


def cicek_buketi():
    s = Scene(W, H, seed=18)
    s.add(rect(0, 0, W, H), "voronoi", 0.35)
    # vazo
    vase = []
    n = 40
    for i in range(n + 1):
        t = i / n
        w = 110 + 70 * math.sin(t * math.pi * 1.1) - 40 * t
        vase.append((500 - w, 780 + 400 * t))
    for i in range(n, -1, -1):
        t = i / n
        w = 110 + 70 * math.sin(t * math.pi * 1.1) - 40 * t
        vase.append((500 + w, 780 + 400 * t))
    v = poly(vase)
    s.add(v, "bands", n=6)
    s.add(v.intersection(rect(0, 900, W, 60)), "grid", cw=40, ch=60)
    s.add(rect(340, 750, 320, 40, 10))
    s.add(rect(0, 1180, W, 70), "bands", n=1)
    # yapraklar
    rnd = random.Random(21)
    for a in range(-170, -5, 14):
        L = rnd.uniform(150, 260)
        s.add(leaf(500, 760, L, 60, a + rnd.uniform(-5, 5)), "bands", n=2)
    def daisy(x, y, r, n=14):
        for p in radial(petal(x, y, r, r * 0.42, -90, offset=r * 0.25), n, (x, y)):
            s.add(p)
        s.add(circle(x, y, r * 0.32), "rings", n=2, c=(x, y))
    def rose(x, y, r):
        for k in range(5):
            rr = r * (1 - k * 0.18)
            for p in radial(petal(x, y, rr, rr * 0.9, -90 + k * 23, shape=0.6, offset=rr * 0.05), 5, (x, y), start=k * 36):
                s.add(p)
        s.add(circle(x, y, r * 0.18))
    def bell(x, y, r, ang):
        b = unary_union([ellipse(0, 0, r, r * 1.2), poly([(-r, 0), (r, 0), (r * 1.2, r * 1.3), (-r * 1.2, r * 1.3)])])
        b = b.difference(ellipse(0, r * 1.3, r * 1.2, r * 0.3)).buffer(0)
        b = rotate(b, ang, (0, 0))
        from shapely import affinity as af
        s.add(af.translate(b, x, y), "bands", n=2, vertical=True)
    for (x, y, a) in [(250, 520, 20), (220, 600, 30), (770, 500, -20), (800, 580, -30), (280, 440, 10)]:
        bell(x, y, 26, a)
    daisy(330, 340, 80)
    daisy(690, 330, 76)
    daisy(250, 650, 60, 12)
    daisy(760, 650, 60, 12)
    rose(500, 250, 120)
    rose(420, 520, 95)
    rose(600, 520, 95)
    daisy(500, 690, 55, 12)
    for (x, y) in [(150, 360), (860, 380), (420, 120), (590, 110), (140, 760), (880, 760)]:
        for p in radial(circle(x, y - 18, 12), 5, (x, y)):
            s.add(p)
        s.add(circle(x, y, 8))
    return s


def baykus():
    s = Scene(W, H, seed=19)
    s.add(rect(0, 0, W, H), "wavebands", n=6, amp=18, waves=2)
    s.add(circle(500, 360, 300), "rings", n=3, c=(500, 360))  # büyük ay
    rnd = random.Random(2)
    for _ in range(18):
        x, y = rnd.uniform(30, 970), rnd.uniform(30, 1100)
        if (x - 500) ** 2 + (y - 360) ** 2 < 330 ** 2 or 820 < y < 1000:
            continue
        s.add(star(x, y, rnd.uniform(10, 16), 5, rnd.choice([4, 5])))
    # dal
    branch = poly([(-10, 880), (300, 860), (700, 900), (1010, 860), (1010, 920), (700, 950), (300, 920), (-10, 940)])
    s.add(branch, "bands", n=3)
    for (x, a) in [(120, -120), (200, -60), (780, -130), (860, -50), (930, -110)]:
        s.add(leaf(x, 870, 110, 44, a), "bands", n=2)
    s.add(snow_cap(-10, 1010, 862, 14, 12, 3).difference(rect(380, 600, 240, 260)))
    # baykuş
    cx = 500
    body = ellipse(cx, 700, 170, 210)
    s.add(body)
    # tüy pulları (göğüs)
    belly = ellipse(cx, 740, 110, 150)
    scales = []
    for row in range(8):
        for col in range(-4, 5):
            x = cx + col * 32 + (row % 2) * 16
            y = 620 + row * 30
            sc = unary_union([circle(x, y, 17)]).intersection(rect(x - 17, y, 34, 17))
            scales.append(sc)
    s.add(belly, "voronoi", 0.1)
    for sc in scales:
        sc = sc.intersection(belly)
        if not sc.is_empty and sc.area > 80:
            s.add(sc)
    s.add(leaf(cx - 150, 600, 220, 90, 100), "bands", n=4)
    s.add(leaf(cx + 150, 600, 220, 90, 80), "bands", n=4)
    head = ellipse(cx, 500, 160, 130)
    s.add(head, "voronoi", 0.6)
    s.add(poly([(cx - 150, 450), (cx - 130, 350), (cx - 70, 410)]))
    s.add(poly([(cx + 150, 450), (cx + 130, 350), (cx + 70, 410)]))
    for ex in (cx - 65, cx + 65):
        s.add(circle(ex, 495, 62), "slices", n=12, c=(ex, 495))
        s.add(circle(ex, 495, 40), "rings", n=2, c=(ex, 495))
        s.add(circle(ex, 495, 20))
        s.add(circle(ex + 7, 487, 6))
    s.add(poly([(cx - 18, 545), (cx + 18, 545), (cx, 590)]))
    for fx in (cx - 50, cx + 50):
        for k in (-14, 0, 14):
            s.add(ellipse(fx + k, 905, 9, 18))
    # yıldızlı atkı
    s.add(rect(cx - 120, 600, 240, 34, 14), "bands", n=6, vertical=True)
    s.add(poly([(cx + 40, 620), (cx + 100, 620), (cx + 110, 760), (cx + 60, 750)]), "bands", n=4)
    return s


def kis_celengi():
    s = Scene(W, H, seed=20)
    s.add(rect(0, 0, W, H), "bands", n=8, vertical=True)  # kapı tahtaları
    s.add(rect(470, 0, 60, 300), "bands", n=1)  # kurdele asma
    c = (500, 620)
    cx, cy = c
    s.add(ring(cx, cy, 330, 190), "slices", n=24, c=c)
    rnd = random.Random(3)
    for i in range(30):
        a = i * 12
        r = rnd.uniform(240, 280)
        x = cx + r * math.cos(math.radians(a))
        y = cy + r * math.sin(math.radians(a))
        s.add(leaf(x, y, rnd.uniform(90, 120), 40, a + 100 + rnd.uniform(-20, 20)), "bands", n=2)
    for i in range(24):
        a = i * 15 + 7
        r = rnd.uniform(220, 300)
        x = cx + r * math.cos(math.radians(a))
        y = cy + r * math.sin(math.radians(a))
        s.add(leaf(x, y, 80, 30, a - 80))
    for i in range(14):
        a = i * 360 / 14 + 4
        r = rnd.uniform(230, 290)
        x = cx + r * math.cos(math.radians(a))
        y = cy + r * math.sin(math.radians(a))
        for k in range(3):
            s.add(circle(x + 18 * math.cos(k * 2.1), y + 18 * math.sin(k * 2.1), 15))
    # kozalaklar
    for a in (200, 340, 100):
        x = cx + 260 * math.cos(math.radians(a))
        y = cy + 260 * math.sin(math.radians(a))
        cone = ellipse(x, y, 34, 52, a + 90)
        s.add(cone, "grid", cw=18, ch=18)
    # fiyonk
    bx, by = cx, cy - 300
    s.add(poly([(bx, by), (bx - 150, by - 90), (bx - 170, by + 40)]), "bands", n=3)
    s.add(poly([(bx, by), (bx + 150, by - 90), (bx + 170, by + 40)]), "bands", n=3)
    s.add(poly([(bx - 10, by + 10), (bx - 90, by + 200), (bx - 60, by + 190), (bx - 40, by + 220), (bx + 8, by + 20)]))
    s.add(poly([(bx + 10, by + 10), (bx + 90, by + 200), (bx + 60, by + 190), (bx + 40, by + 220), (bx - 8, by + 20)]))
    s.add(rect(bx - 30, by - 30, 60, 60, 14))
    # ortada mum ışığı ve isim levhası
    s.add(rect(cx - 120, cy - 40, 240, 90, 12))
    s.add(rect(cx - 104, cy - 26, 208, 62, 8))
    # kapı kolu ve alt
    s.add(circle(880, 820, 34), "rings", n=2, c=(880, 820))
    s.add(rect(0, 1150, W, 100), "bands", n=10, vertical=True)
    for (x, y) in [(120, 200), (860, 160), (130, 1050), (860, 1040), (300, 1100), (700, 1100)]:
        s.add(star(x, y, 30, 12, 6, 0))
    return s


SCENES = [
    (mandala_kar, dict(id="kar-mandala", title="Kar Tanesi Mandala", category="Mandala"), (500, 500)),
    (mandala_gul, dict(id="gul-mandala", title="Gül Mandala", category="Mandala"), (500, 500)),
    (mandala_gunes, dict(id="gunes-mandala", title="Kış Güneşi Mandala", category="Mandala"), (500, 500)),
    (kis_kasabasi, dict(id="kis-kasabasi", title="Kış Kasabası", category="Kış"), (505, 420)),
    (ciceki_pencere, dict(id="cicekli-pencere", title="Çiçekli Pencere", category="Çiçekler"), (515, 600)),
    (deniz_feneri, dict(id="deniz-feneri", title="Kar Altında Deniz Feneri", category="Şehir"), (600, 300)),
    (kitaplik, dict(id="kitaplik", title="Sıcak Kitaplık", category="Sıcak Köşeler"), (500, 470)),
    (cay_kosesi, dict(id="cay-kosesi", title="Çay Köşesi", category="Sıcak Köşeler"), (300, 760)),
    (somine_kedi, dict(id="somine-kedi", title="Şömine Başında Kedi", category="Hayvanlar"), (500, 760)),
    (orman_evi, dict(id="orman-evi", title="Ormandaki Ev", category="Kış"), (500, 620)),
    (cicek_buketi, dict(id="cicek-buketi", title="Kış Buketi", category="Çiçekler"), (500, 400)),
    (baykus, dict(id="baykus", title="Ay Işığında Baykuş", category="Hayvanlar"), (500, 520)),
    (kis_celengi, dict(id="kis-celengi", title="Kapıdaki Çelenk", category="Kış"), (500, 320)),
]

def build_catalog():
    """lib/art/catalog.json (liste) ve lib/art/sections.json (sunucu kontrolü) + webp önizlemeler."""
    import json
    import subprocess
    from PIL import Image
    lib = Path(__file__).resolve().parents[2] / "lib" / "art"
    lib.mkdir(parents=True, exist_ok=True)
    thumbs = OUT / "thumbs"
    thumbs.mkdir(exist_ok=True)
    catalog, sections = [], {}
    for _, meta, _ in SCENES:
        data = json.loads((OUT / f"{meta['id']}.json").read_text(encoding="utf-8"))
        catalog.append({"id": data["id"], "title": data["title"], "category": data["category"],
                        "w": data["w"], "h": data["h"], "regions": len(data["regions"]),
                        "sections": max(data["sections"]) + 1})
        sections[data["id"]] = data["sections"]
        svg = OUT / f"{meta['id']}.svg"
        png = thumbs / f"{meta['id']}.png"
        subprocess.run(["rsvg-convert", "-w", "480", str(svg), "-o", str(png)], check=True)
        Image.open(png).convert("RGB").save(thumbs / f"{meta['id']}.webp", "WEBP", quality=82)
        png.unlink()
        svg.unlink()
    (lib / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=1), encoding="utf-8")
    (lib / "sections.json").write_text(json.dumps(sections, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    only = sys.argv[1:]
    for fn, meta, focal in SCENES:
        if only and meta["id"] not in only:
            continue
        n, secs, kb = export(fn(), meta, OUT, focal)
        print(f"{meta['id']:18s} bölge={n:4d} bölüm={secs:2d} {kb}KB")
    if not only:
        build_catalog()
