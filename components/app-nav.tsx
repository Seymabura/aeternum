"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Images, ListChecks, Palette, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/takvim", label: "Takvim", icon: CalendarDays },
  { href: "/boyama", label: "Boyama", icon: Palette },
  { href: "/pano", label: "Stüdyo", icon: Smartphone },
  { href: "/liste", label: "Wishlist", icon: ListChecks },
  { href: "/vision", label: "Vision", icon: Images },
] as const;

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="safe-bottom fixed inset-x-3 bottom-3 z-50 md:hidden" aria-label="Ana menü">
      <ul className="sheet mx-auto grid max-w-md grid-cols-5 !rounded-[26px] px-1.5 py-1.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-[20px] py-2 text-[0.64rem] font-medium tracking-wide transition-colors",
                  active ? "bg-champagne/12 text-gold" : "text-ink-soft",
                )}
              >
                <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={active ? 2 : 1.6} />
                {label}
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
                "rounded-full px-3.5 py-2 text-sm transition-colors",
                active ? "bg-champagne/12 text-gold" : "text-ink-soft hover:text-ink",
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
