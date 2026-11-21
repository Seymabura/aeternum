import Link from "next/link";
import { cn } from "@/lib/utils";

/** Küçük dört köşeli yıldız (ayraç / işaret) */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-3 w-3", className)} aria-hidden>
      <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2 text-ink", className)} aria-label="Aeternum ana sayfa">
      <Sparkle className="h-2.5 w-2.5 text-champagne transition-transform duration-700 group-hover:rotate-90" />
      <span className="wordmark text-[0.95rem] sm:text-[1.02rem]">Aeternum</span>
    </Link>
  );
}
