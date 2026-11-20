"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarHeart, Palette, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/takvim", label: "Takvim", icon: CalendarHeart },
  { href: "/boyama", label: "Boyama", icon: Palette },
  { href: "/pano", label: "Dilek Panosu", icon: Sparkles },
  { href: "/profil", label: "Ben", icon: UserRound },
] as const;

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-paper-3/92 backdrop-blur-md md:hidden"
      aria-label="Ana menü"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 px-2 pt-1.5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[0.7rem] font-medium transition-colors",
                  active ? "text-bordo" : "text-ink-soft",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_2px_6px_rgba(122,31,43,.35)]")} strokeWidth={active ? 2.2 : 1.7} />
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
    <ul className="hidden items-center gap-1 md:flex">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                active ? "bg-bordo text-paper-3" : "text-ink-soft hover:bg-paper-2",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
