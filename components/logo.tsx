import Link from "next/link";
import { cn } from "@/lib/utils";

export function Candle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={cn("h-7 w-auto", className)} aria-hidden>
      <defs>
        <radialGradient id="cg" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#ffe3a8" />
          <stop offset="55%" stopColor="#f2a24a" />
          <stop offset="100%" stopColor="#e2863b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="9" r="9" fill="url(#cg)" opacity=".55" />
      <path className="flame" d="M12 2c2.6 3.6 3.6 5.7 3.6 7.6A3.6 3.6 0 0 1 12 13.2a3.6 3.6 0 0 1-3.6-3.6C8.4 7.7 9.4 5.6 12 2Z" fill="#f2a24a" />
      <path className="flame" d="M12 6.5c1.1 1.6 1.6 2.6 1.6 3.4a1.6 1.6 0 0 1-3.2 0c0-.8.5-1.8 1.6-3.4Z" fill="#ffe7b3" />
      <rect x="11.4" y="12.6" width="1.2" height="3" rx=".6" fill="#3a2a1e" />
      <rect x="6" y="15.5" width="12" height="22" rx="2.2" fill="#f6ead5" stroke="#d9b26a" strokeWidth="1" />
      <path d="M6.6 18.5c2 .9 3 2.6 2.4 5 2.3-1 2.4-3.4 3.4-4.6.6 1.4 2.6 2 5 .9" fill="none" stroke="#b98a4a" strokeWidth=".9" opacity=".6" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-end gap-1.5", className)} aria-label="Aeternum ana sayfa">
      <Candle />
      <span className="display gold-shine text-[1.65rem] italic" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
        aeternum
      </span>
    </Link>
  );
}
