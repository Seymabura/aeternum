"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2, Plus } from "lucide-react";
import { saveBonus } from "@/app/actions/tasks";
import type { Bonus } from "@/lib/tasks";

export function BonusList({ items, done }: { items: Bonus[]; done: number[] }) {
  const [doneSet, setDone] = useState(() => new Set(done));
  const [openId, setOpenId] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const [text, setText] = useState("");

  function submit(id: number) {
    start(async () => {
      const r = await saveBonus(id, text);
      if (!r.ok) return void toast.error(r.error);
      setDone((s) => new Set(s).add(id));
      setOpenId(null);
      setText("");
      toast.success("Boyamanda yeni bir bölüm açıldı 🎨");
    });
  }

  return (
    <ul className="space-y-2">
      {items.map((b) => {
        const isDone = doneSet.has(b.id);
        const isOpen = openId === b.id;
        return (
          <li key={b.id} className="rounded-2xl border border-white/[.08] bg-white/[.025]">
            <button
              type="button"
              disabled={isDone}
              onClick={() => {
                setOpenId(isOpen ? null : b.id);
                setText("");
              }}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
            >
              <span
                className={
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border " +
                  (isDone ? "border-transparent bg-gradient-to-b from-[#fbf5e8] to-[#c9b089] text-midnight" : "border-white/20 text-ink-soft")
                }
              >
                {isDone ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
              <span className={isDone ? "text-ink-soft line-through decoration-white/20" : ""}>{b.prompt}</span>
            </button>
            {isOpen && (
              <form
                className="flex gap-2 px-3.5 pb-3.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(b.id);
                }}
              >
                <input
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={280}
                  className="field hand !py-2 !text-xl"
                  placeholder="bir iki kelime yeter..."
                />
                <button className="btn btn-primary shrink-0" disabled={pending || !text.trim()}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ekle"}
                </button>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}
