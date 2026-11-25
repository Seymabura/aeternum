import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getShare } from "@/lib/shares";
import type { MoonPayload } from "@/lib/astro/moon-poster";
import { phaseLabel } from "@/lib/astro/moon";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Doğduğun gecenin Ay'ı";

export default async function OG({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const s = await getShare(token);
  const p = (s?.payload ?? null) as MoonPayload | null;
  const moon = `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public/moon/full-520.png"))).toString("base64")}`;
  const phase = (a: number) => phaseLabel(a).replace(/ \(.*\)/, "");
  const shade = (f: number) => `${Math.round((1 - f) * 100)}%`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 50% 40%, #111a36, #04060c 75%)", color: "#f2eee6", fontFamily: "serif" }}>
        {p ? (
          <div style={{ display: "flex", alignItems: "center", gap: 70 }}>
            {[p.a, p.b].filter((m): m is NonNullable<typeof m> => !!m).map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ position: "relative", width: 230, height: 230, display: "flex" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={moon} width={230} height={230} alt="" />
                  <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: `linear-gradient(${m.phaseAngle < 180 ? 270 : 90}deg, rgba(4,6,12,.92) ${shade(m.fraction)}, rgba(4,6,12,0) ${shade(m.fraction)})` }} />
                </div>
                <div style={{ fontSize: 46, marginTop: 26 }}>{m.name}</div>
                <div style={{ fontSize: 24, color: "#dcc7a1", marginTop: 6, fontFamily: "sans-serif" }}>
                  {phase(m.phaseAngle)} · %{Math.round(m.fraction * 100)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 60 }}>Doğduğun gecenin Ay&apos;ı</div>
        )}
        <div style={{ position: "absolute", bottom: 34, fontSize: 18, letterSpacing: 6, color: "rgba(220,199,161,.7)", fontFamily: "sans-serif" }}>✦ AETERNUM</div>
      </div>
    ),
    size,
  );
}
