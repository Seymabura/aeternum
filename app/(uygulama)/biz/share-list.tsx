"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";
import { deleteShare, type ShareRow } from "@/app/actions/biz";

const KIND = { ay: "Ay", gok: "Gökyüzü", film: "Film" } as const;

export function ShareList({ initial }: { initial: ShareRow[] }) {
  const [rows, setRows] = useState(initial);
  if (!rows.length) return null;
  return (
    <section className="mt-20">
      <h2 className="display text-[2rem]">Bağlantıların</h2>
      <p className="mt-2 text-sm text-ink-soft">Bağlantıyı silince sayfa ve paylaşılan fotoğraflar kalıcı olarak kaldırılır.</p>
      <ul className="mt-6 border-t border-champagne/10">
        {rows.map((r) => (
          <li key={r.token} className="flex items-center gap-3 border-b border-champagne/10 py-4">
            <span className="w-20 shrink-0 text-xs text-champagne">{KIND[r.kind]}</span>
            <span className="min-w-0 flex-1 truncate">{r.title || "İsimsiz"}</span>
            <span className="num hidden text-xs text-ink-mute sm:block">{new Date(r.created_at).toLocaleDateString("tr-TR")}</span>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:text-ink"
              aria-label="Bağlantıyı kopyala"
              onClick={async () => {
                await navigator.clipboard.writeText(`${window.location.origin}/s/${r.kind}/${r.token}`);
                toast.success("Bağlantı kopyalandı");
              }}
            >
              <Copy className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink-mute hover:text-bordo"
              aria-label="Bağlantıyı sil"
              onClick={async () => {
                setRows((x) => x.filter((y) => y.token !== r.token));
                await deleteShare(r.token);
                toast("Bağlantı silindi");
              }}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
