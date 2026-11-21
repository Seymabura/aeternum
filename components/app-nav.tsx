"use client";

function Globe({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" className={className}>
      <circle cx="12" cy="10" r="7.5" />
      <path d="M6.5 19.5h11M8 17l-1 2.5M16 17l1 2.5" />
      <path d="M9 11.5l1.5-2.5 1.5 2.5M11 8.5l1.2-2 1.3 2" opacity=".7" />
    </svg>
  );
}

function Moons({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  // iki iç içe hilal
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10.5 4.2a7.5 7.5 0 1 0 6.3 11.6A6 6 0 0 1 10.5 4.2Z" />
      <path d="M15.6 3.6a5.6 5.6 0 0 1 4.9 8.3 4.4 4.4 0 0 0-4.9-8.3Z" opacity=".75" />
    </svg>
  );
}

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Gift, Images, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/takvim", label: "Takvim", icon: CalendarDays, mobile: true },
  { href: "/kure", label: "Küre", icon: Globe, mobile: true },
  { href: "/biz", label: "Biz", icon: Moons, mobile: true },
  { href: "/pano", label: "Stüdyo", icon: Smartphone, mobile: false },
  { href: "/liste", label: "Wishlist", icon: Gift, mobile: true },
  { href: "/vision", label: "Vision", icon: Images, mobile: true },
] as const;

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="safe-bottom fixed inset-x-3 bottom-3 z-50 md:hidden" aria-label="Ana menü">
      <ul className="mx-auto grid max-w-md grid-cols-5 rounded-full border border-champagne/12 bg-[rgba(10,15,28,0.78)] px-1 py-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl backdrop-saturate-150">
        {NAV.filter((n) => n.mobile).map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-full text-[0.625rem] font-medium transition-colors duration-300",
                  active ? "text-champagne" : "text-ink-soft",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span>{label}</span>
                {active && (
                  <motion.span
                    layoutId="nav-dot"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    className="absolute bottom-0.5 h-1 w-1 rounded-full bg-champagne"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TopLinks() {
  const path = usePathname();
  return (
    <ul className="hidden items-center gap-0.5 md:flex">
      {NAV.map(({ href, label }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                active ? "text-champagne" : "text-ink-soft hover:text-ink",
              )}
            >
              {label}
              {active && (
                <motion.span layoutId="top-dot" className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-champagne" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
