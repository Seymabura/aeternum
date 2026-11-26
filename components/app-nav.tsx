"use client";

import { Moons } from "@/components/icons";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, Images, Mail, UserRound } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/vision", label: "Vision", icon: Images, mobile: true },
  { href: "/mektup", label: "Mektup", icon: Mail, mobile: true },
  { href: "/biz", label: "Biz", icon: Moons, mobile: true },
  { href: "/takvim", label: "Aralık", icon: CalendarDays, mobile: true },
  { href: "/profil", label: "Ben", icon: UserRound, mobile: true, desktop: false },
] as const;

/** Telefonda klavye açıkken (bir alana yazı yazılırken) alt menü formun üstüne binmesin diye gizlenir. */
function useTyping() {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      (el.isContentEditable ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit", "range", "color", "file"].includes(el.type)));
    const onIn = (e: FocusEvent) => isField(e.target) && setTyping(true);
    const onOut = () => setTimeout(() => setTyping(isField(document.activeElement)), 60);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);
  return typing;
}

export function BottomNav() {
  const path = usePathname();
  const typing = useTyping();
  return (
    <nav
      className={cn(
        "safe-bottom fixed inset-x-3 bottom-3 z-50 transition-[transform,opacity] duration-300 md:hidden",
        typing && "pointer-events-none translate-y-[130%] opacity-0",
      )}
      aria-label="Ana menü"
      aria-hidden={typing || undefined}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 rounded-full border border-champagne/12 bg-[rgba(8,7,11,0.78)] px-1 py-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl backdrop-saturate-150">
        {NAV.filter((n) => n.mobile).map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-full text-[0.625rem] font-medium transition-colors duration-300",
                  active ? "text-[#ffd6dc]" : "text-ink-soft",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span>{label}</span>
                {active && (
                  <motion.span
                    layoutId="nav-dot"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    className="absolute bottom-0.5 h-1 w-4 rounded-full bg-nar-soft shadow-[0_0_10px_rgba(210,70,92,.9)]"
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
      {NAV.filter((n) => !("desktop" in n) || n.desktop !== false).map(({ href, label }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                active ? "text-[#ffd6dc]" : "text-ink-soft hover:text-ink",
              )}
            >
              {label}
              {active && (
                <motion.span layoutId="top-dot" className="absolute -bottom-0.5 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-nar-soft shadow-[0_0_10px_rgba(210,70,92,.9)]" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
