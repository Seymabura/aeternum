"""Aeternum dilek panosu çıkartmaları (sıfırdan çizildi, CC0). Çalıştır: python3 scripts/stickers.py"""
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public" / "stickers"
INK = "#2e2019"
S = {}

S["yildiz"] = '<path d="M100 22l22 46 50 6-37 34 10 50-45-25-45 25 10-50-37-34 50-6z" fill="#f2b84b"/><path d="M100 50l10 24 25 3" fill="none" stroke="#fff3cf" stroke-width="6" stroke-linecap="round"/>'
S["kalp"] = '<path d="M100 170C40 128 22 98 26 70c4-28 40-42 74-6 34-36 70-22 74 6 4 28-14 58-74 100z" fill="#b8323f"/><path d="M54 66c6-12 20-14 30-6" fill="none" stroke="#f4b0a6" stroke-width="7" stroke-linecap="round"/>'
S["bilet"] = '<g transform="rotate(-8 100 100)"><path d="M22 62h156v24a14 14 0 0 0 0 28v24H22v-24a14 14 0 0 0 0-28z" fill="#e9c79a"/><path d="M132 62v76" stroke="'+INK+'" stroke-width="3" stroke-dasharray="7 6"/><path d="M50 108l40-26 8 6-22 22 16 10-4 6-18-8-16 10-6-4z" fill="#7a1f2b"/><text x="155" y="106" font-family="Georgia" font-size="16" font-weight="700" fill="'+INK+'" text-anchor="middle" transform="rotate(90 155 100)">2027</text></g>'
S["kahve"] = '<path d="M46 80h96l-10 80a14 14 0 0 1-14 12H70a14 14 0 0 1-14-12z" fill="#fbf1e1"/><path d="M142 92h10a20 20 0 0 1 0 40h-14" fill="none" stroke="'+INK+'" stroke-width="10"/><path d="M50 110h88" stroke="#7a1f2b" stroke-width="12"/><path d="M76 34c-8 10 8 16 0 30M100 30c-8 10 8 16 0 30M124 34c-8 10 8 16 0 30" fill="none" stroke="#a9835f" stroke-width="5" stroke-linecap="round"/>'
S["kitap"] = '<path d="M100 54c-24-14-52-16-74-10v112c22-6 50-4 74 10z" fill="#1e3a2f"/><path d="M100 54c24-14 52-16 74-10v112c-22-6-50-4-74 10z" fill="#2f5a47"/><path d="M100 54v112" stroke="'+INK+'" stroke-width="3"/><path d="M40 70c18-4 36-2 50 6M40 90c18-4 36-2 50 6M110 76c14-8 32-10 50-6M110 96c14-8 32-10 50-6" stroke="#c8d5a8" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M140 44v40l9-8 9 8V46" fill="#c8922a"/>'
S["ucak"] = '<path d="M24 104l150-58c10-4 16 6 8 12l-62 50 10 52c2 8-6 12-12 6l-30-40-28 14 4 18-12 6-12-28-24-12 6-12 20 6z" fill="#f6f1e7"/><path d="M182 58l-62 50" stroke="#2f4b6e" stroke-width="6"/><circle cx="64" cy="112" r="0"/>'
S["ay"] = '<path d="M128 26a76 76 0 1 0 46 120 64 64 0 1 1-46-120z" fill="#f2d27b"/><circle cx="84" cy="92" r="9" fill="#d9b052"/><circle cx="106" cy="138" r="6" fill="#d9b052"/><path d="M150 50l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z" fill="#fff3cf"/>'
S["kar"] = ''.join(f'<g transform="rotate({a} 100 100)"><path d="M100 100V24M100 46l-14-14M100 46l14-14M100 70l-18-16M100 70l18-16" stroke="#5b7fa6" stroke-width="9" stroke-linecap="round" fill="none"/></g>' for a in range(0, 360, 60)) + '<circle cx="100" cy="100" r="13" fill="#dfe9f2"/>'
S["mum"] = '<ellipse cx="100" cy="46" rx="22" ry="30" fill="#f2a24a"/><path d="M100 26c10 14 12 22 12 28a12 12 0 0 1-24 0c0-6 2-14 12-28z" fill="#ffe7b3"/><path d="M98 74h4v12h-4z" fill="'+INK+'"/><rect x="70" y="86" width="60" height="90" rx="8" fill="#7a1f2b"/><path d="M76 96c8 4 10 12 8 22 10-6 8-18 16-24" fill="none" stroke="#f4b0a6" stroke-width="5" stroke-linecap="round"/>'
S["hediye"] = '<rect x="34" y="82" width="132" height="90" rx="6" fill="#1e3a2f"/><rect x="26" y="62" width="148" height="30" rx="6" fill="#2f5a47"/><path d="M92 62h16v110H92z" fill="#c8922a"/><path d="M100 62c-10-30-50-34-46-10 2 12 30 12 46 10zM100 62c10-30 50-34 46-10-2 12-30 12-46 10z" fill="#e2863b"/>'
S["ev"] = '<path d="M44 96l56-52 56 52v76H44z" fill="#d49a6a"/><path d="M30 104l70-64 70 64" fill="none" stroke="#7a1f2b" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/><rect x="86" y="124" width="28" height="48" rx="4" fill="#5c4636"/><rect x="58" y="112" width="20" height="20" fill="#f6d27b"/><rect x="122" y="112" width="20" height="20" fill="#f6d27b"/><path d="M124 54v-22h16v36" fill="#7a1f2b"/>'
S["nota"] = '<path d="M78 150V54l78-18v96" fill="none" stroke="'+INK+'" stroke-width="10" stroke-linejoin="round"/><path d="M78 72l78-18" stroke="'+INK+'" stroke-width="18"/><ellipse cx="62" cy="152" rx="22" ry="16" fill="#b8336a" transform="rotate(-18 62 152)"/><ellipse cx="140" cy="134" rx="22" ry="16" fill="#b8336a" transform="rotate(-18 140 134)"/>'
S["kamera"] = '<rect x="26" y="62" width="148" height="104" rx="16" fill="#c2b08f"/><rect x="26" y="96" width="148" height="20" fill="#7a5c43"/><path d="M70 62l10-18h40l10 18" fill="#7a5c43"/><circle cx="100" cy="114" r="34" fill="#3d2b20"/><circle cx="100" cy="114" r="22" fill="#2f4b6e"/><circle cx="92" cy="106" r="7" fill="#9fb8d3"/><rect x="140" y="72" width="20" height="12" rx="3" fill="#f6f1e7"/>'
S["cicek"] = ''.join(f'<ellipse cx="100" cy="58" rx="22" ry="38" fill="#f4c7c3" transform="rotate({a} 100 100)"/>' for a in range(0, 360, 60)) + '<circle cx="100" cy="100" r="24" fill="#e7a33e"/><circle cx="92" cy="94" r="6" fill="#f6c35b"/>'
S["yaprak"] = '<path d="M40 166C30 90 80 36 168 32c4 88-50 138-128 134z" fill="#4f7d5b"/><path d="M44 162C80 120 110 90 150 52" stroke="#c8d5a8" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M80 124l-8-28M104 100l-4-30M124 80l2-24M88 116l30 2M110 94l28 0" stroke="#c8d5a8" stroke-width="4" stroke-linecap="round"/>'
S["dag"] = '<path d="M14 168l60-96 30 44 26-36 56 88z" fill="#2f5a47"/><path d="M74 72l-18 28 10-4 8 10 8-10 10 4z" fill="#f6f1e7"/><path d="M130 80l-12 18 8-2 4 6 6-6 8 2z" fill="#f6f1e7"/><circle cx="150" cy="46" r="16" fill="#f2b84b"/>'
S["kedi"] = '<path d="M50 172c-10-50 0-80 18-96l-6-44 30 26h16l30-26-6 44c18 16 28 46 18 96z" fill="#3d2b20"/><path d="M150 168c30 0 34-30 18-36" fill="none" stroke="#3d2b20" stroke-width="14" stroke-linecap="round"/><ellipse cx="86" cy="96" rx="7" ry="9" fill="#f2b84b"/><ellipse cx="114" cy="96" rx="7" ry="9" fill="#f2b84b"/><path d="M96 110l4 4 4-4" fill="#f4b0a6"/>'
S["gunes"] = ''.join(f'<path d="M100 14l8 24h-16z" fill="#e2863b" transform="rotate({a} 100 100)"/>' for a in range(0, 360, 30)) + '<circle cx="100" cy="100" r="46" fill="#f2b84b"/><path d="M80 104c8 10 32 10 40 0" fill="none" stroke="#7a1f2b" stroke-width="5" stroke-linecap="round"/><circle cx="84" cy="90" r="5" fill="#7a1f2b"/><circle cx="116" cy="90" r="5" fill="#7a1f2b"/>'
S["2027"] = '<rect x="18" y="62" width="164" height="76" rx="38" fill="#7a1f2b"/><text x="100" y="117" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="50" fill="#fbf1e1" text-anchor="middle">2027</text>'
S["bant"] = '<path d="M20 70l160-12 4 44-160 12z" fill="#c8922a" opacity=".85"/>'
S["kupa"] = '<path d="M52 70h80v70a30 30 0 0 1-30 30H82a30 30 0 0 1-30-30z" fill="#b8323f"/><path d="M132 86h12a22 22 0 0 1 0 44h-12" fill="none" stroke="#b8323f" stroke-width="12"/><ellipse cx="92" cy="70" rx="40" ry="10" fill="#6e4532"/><circle cx="76" cy="66" r="9" fill="#fbf1e1"/><circle cx="96" cy="62" r="10" fill="#fbf1e1"/><circle cx="112" cy="68" r="8" fill="#fbf1e1"/><path d="M70 104c8 4 18 4 26-4 8 10 22 10 26 0" fill="none" stroke="#fbf1e1" stroke-width="5" stroke-linecap="round"/>'
S["ataç"] = '<path d="M80 40v100a20 20 0 0 0 40 0V56a12 12 0 0 0-24 0v80" fill="none" stroke="#8e9aa6" stroke-width="9" stroke-linecap="round"/>'

for name, inner in S.items():
    if name == "bant":
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">{inner}</svg>'
    else:
        # çıkartma kenarı: beyaz kalın çerçeve + ince mürekkep çizgisi
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">'
            f'<g stroke="#fffdf7" stroke-width="18" stroke-linejoin="round" stroke-linecap="round" fill="#fffdf7">{inner}</g>'
            f'<g stroke="{INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">{inner}</g>'
            f'<g>{inner}</g>'
            '</svg>'
        )
    (OUT / f"{name.replace('ç','c')}.svg").write_text(svg, encoding="utf-8")
print(len(S))
