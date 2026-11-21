"use client";

import Link from "next/link";
import { FilmPlayer } from "@/components/biz/film-player";
import type { FilmData } from "@/lib/film/engine";
import { Logo } from "@/components/logo";

export function SharedFilm({ film }: { film: FilmData }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-5 py-8">
      <Logo />
      <FilmPlayer film={film} className="mt-8 shadow-[0_40px_90px_-30px_rgba(0,0,0,.95)]" />
      <Link href="/biz/2026" prefetch={false} className="btn btn-primary mt-8">
        Kendi filmini yap
      </Link>
    </main>
  );
}
