"use client";

import { useId, useState } from "react";

/** "2005-03-14" ↔ "14.03.2005" */
function isoToText(iso: string) {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : "";
}

function textToIso(t: string): string {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(t);
  if (!m) return "";
  const [, d, mo, y] = m;
  const dt = new Date(Date.UTC(+y, +mo - 1, +d));
  // 31.02 gibi geçersiz günleri reddet
  if (dt.getUTCFullYear() !== +y || dt.getUTCMonth() !== +mo - 1 || dt.getUTCDate() !== +d) return "";
  return `${y}-${mo}-${d}`;
}

/** Rakamları yazdıkça noktaları kendisi koyar: 14032005 → 14.03.2005 */
function mask(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join(".");
}

/**
 * Gün.Ay.Yıl sırasıyla, soldan sağa yazılan tarih alanı.
 * Takvim penceresi açmaz; telefonda sayı klavyesi çıkar.
 */
export function DateInput({ label, value, onChange, optional }: { label: string; value: string; onChange: (iso: string) => void; optional?: boolean }) {
  const id = useId();
  const [text, setText] = useState(() => isoToText(value));
  const complete = text.length === 10;
  const invalid = complete && !textToIso(text);
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
        {optional && <span className="normal-case tracking-normal text-ink-mute"> (isteğe bağlı)</span>}
      </label>
      <input
        id={id}
        className="field num tracking-wide"
        inputMode="numeric"
        autoComplete="off"
        placeholder="GG.AA.YYYY"
        maxLength={10}
        value={text}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-err` : undefined}
        onChange={(e) => {
          // silerken noktaya takılmasın
          const prev = text;
          let next = mask(e.target.value);
          if (e.target.value.length < prev.length && prev.endsWith(".") && next === prev) next = next.slice(0, -1);
          setText(next);
          onChange(textToIso(next));
        }}
      />
      {invalid && (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-bordo">
          Böyle bir tarih yok. Gün.Ay.Yıl şeklinde yaz, ör. 14.03.2005
        </p>
      )}
    </div>
  );
}
