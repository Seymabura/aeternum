"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { searchCities, type City } from "@/lib/astro/cities";
import { searchWorldCities } from "@/app/actions/geo";
import { cn } from "@/lib/utils";

/** Aranabilir şehir seçici: önce Türkiye'nin 81 ili, bulunamazsa dünya şehirleri */
export function CityPicker({ value, onChange, label = "Şehir" }: { value: City; onChange: (c: City) => void; label?: string }) {
  const id = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [world, setWorld] = useState<City[]>([]);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const local = searchCities(q, 6);

  useEffect(() => {
    if (q.trim().length < 3 || local.length >= 3) return;
    const t = setTimeout(async () => setWorld(await searchWorldCities(q)), 350);
    return () => clearTimeout(t);
  }, [q, local.length]);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);

  const list = [...local, ...(q.trim().length >= 3 && local.length < 3 ? world.filter((w) => w.country !== "Türkiye") : [])].slice(0, 8);

  function pick(c: City) {
    onChange(c);
    setQ("");
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" strokeWidth={1.5} />
        <input
          id={id}
          className="field !pl-10"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          autoComplete="off"
          placeholder={value.country && value.country !== "Türkiye" ? `${value.name}, ${value.country}` : value.name}
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(list.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter" && list[active]) {
              e.preventDefault();
              pick(list[active]);
            } else if (e.key === "Escape") setOpen(false);
          }}
        />
      </div>
      {open && list.length > 0 && (
        <ul id={`${id}-list`} role="listbox" className="absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-[14px] border border-champagne/15 bg-[#0d1426] p-1 shadow-[0_24px_60px_-20px_rgba(0,0,0,.9)]">
          {list.map((c, i) => (
            <li key={`${c.name}-${c.lat}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => pick(c)}
                className={cn("flex min-h-11 w-full items-center justify-between rounded-[10px] px-3 text-left text-sm", i === active ? "bg-white/[.06] text-ink" : "text-ink-soft hover:text-ink")}
              >
                <span>{c.name}</span>
                <span className="text-xs text-ink-mute">{c.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
