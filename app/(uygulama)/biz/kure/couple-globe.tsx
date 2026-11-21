"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, Check, Copy, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { GlobeHero } from "@/components/globe-hero";
import { createInvite, leaveCouple, renameMe, type CoupleState } from "@/app/actions/biz";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type ListItem = { id: string; title: string; done: boolean; added_by: string | null; position: number };

export function CoupleGlobe({ initial, items: initialItems, myDays, lights, myName, userId }: { initial: CoupleState; items: ListItem[]; myDays: number[]; lights: number; myName: string; userId: string }) {
  const router = useRouter();
  const state = initial;
  const me = state?.members.find((m) => m.me);
  const partner = state?.members.find((m) => !m.me);
  const paired = !!partner;

  // karşı tarafın görevleri: 30 sn'de bir tazele
  useEffect(() => {
    if (!state) return;
    const t = setInterval(() => router.refresh(), 30000);
    return () => clearInterval(t);
  }, [state, router]);

  const days = useMemo(() => Array.from(new Set([...(me?.days ?? myDays), ...(partner?.days ?? [])])).sort((a, b) => a - b), [me, partner, myDays]);
  const both = useMemo(() => (partner ? (me?.days ?? myDays).filter((d) => partner.days.includes(d)) : []), [me, partner, myDays]);

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/biz" className="link-line inline-flex items-center gap-1.5 text-sm !text-ink-soft hover:!text-ink">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Biz
      </Link>
      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="lg:sticky lg:top-24">
          <GlobeHero days={days} pairDays={both} lights={lights} />
          <p className="hand -mt-2 text-center text-2xl text-gold/70">{paired ? "ikinizin küresi" : "küren, birlikte süslenmeyi bekliyor"}</p>
        </div>

        <div>
          <p className="eyebrow">Ortak küre</p>
          <h1 className="display mt-5 text-[2.75rem] sm:text-[3.75rem]">
            {paired ? (
              <>
                {me?.name || "Sen"} <span className="gold-shine italic">&</span> {partner?.name || "o"}
              </>
            ) : (
              <>
                Bir küre, <em className="gold-shine italic">iki kişi</em>
              </>
            )}
          </h1>

          {paired ? (
            <>
              <p className="mt-5 max-w-md text-ink-soft">İkinizin tamamladığı her gün aynı küreye süs ekler. Aynı gün ikiniz de yaptıysanız süsün altında altın bir hale belirir.</p>
              <dl className="mt-10 grid grid-cols-3 border-y border-champagne/10 py-6 text-center">
                {[
                  { v: me?.days.length ?? 0, l: `${me?.name || "Sen"}` },
                  { v: partner?.days.length ?? 0, l: `${partner?.name || "O"}` },
                  { v: both.length, l: "gün birlikte" },
                ].map((x, i) => (
                  <div key={i} className="relative">
                    {i > 0 && <span aria-hidden className="hairline-v absolute inset-y-0 left-0" />}
                    <dd className="display num text-[2.25rem] leading-none">{x.v}</dd>
                    <dt className="mt-2 truncate px-2 text-xs text-ink-soft">{i < 2 ? `${x.l} · süs` : x.l}</dt>
                  </div>
                ))}
              </dl>
              <SharedList coupleId={state!.id} initial={initialItems} userId={userId} names={{ [userId]: me?.name || "Sen" }} partnerName={partner?.name || "O"} />
              <Leave owner={me?.role === "owner"} />
            </>
          ) : (
            <Invite state={state} myName={me?.name || myName} />
          )}
        </div>
      </div>
    </div>
  );
}

function Invite({ state, myName }: { state: CoupleState; myName: string }) {
  const router = useRouter();
  const [name, setName] = useState(myName === "Misafir" ? "" : myName);
  const [pending, start] = useTransition();
  const code = state?.invite?.code;
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const url = code ? `${origin}/biz/katil/${code}` : "";
  const msg = `Aeternum'da ortak bir kar küremiz olsun mu? Aralık boyunca ikimiz de görev yaptıkça aynı küre süslenecek: ${url}`;

  return (
    <div className="mt-6">
      <p className="max-w-md text-ink-soft">Partnerine bir davet bağlantısı gönder. Katıldığında ikinizin günleri aynı kürede birleşir ve ortak bir 2027 listeniz olur. Görev cevaplarınız birbirinize görünmez; sadece hangi günleri yaptığınız.</p>
      {!code ? (
        <form
          className="mt-10 max-w-sm space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return void toast.error("Adını yaz; partnerin davette görecek.");
            start(async () => {
              const r = await createInvite(name);
              if (!r.ok) return void toast.error(r.error);
              router.refresh();
            });
          }}
        >
          <div>
            <label className="label" htmlFor="ad">Adın</label>
            <input id="ad" className="field" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={1.5} />} Davet bağlantısı oluştur
          </button>
        </form>
      ) : (
        <div className="mt-10 max-w-md">
          <div className="sheet p-5" style={{ borderColor: "rgba(220,199,161,.25)" }}>
            <p className="text-sm text-ink-soft">Davet bağlantın · 7 gün geçerli, tek kullanımlık</p>
            <p className="num mt-2 break-all text-[0.95rem]">{url.replace(/^https?:\/\//, "")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(url);
                  toast.success("Bağlantı kopyalandı");
                }}
              >
                <Copy className="h-4 w-4" strokeWidth={1.5} /> Kopyala
              </button>
              <a className="btn btn-ghost btn-sm" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                WhatsApp ile gönder
              </a>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-soft">Partnerin katılınca bu sayfa kendiliğinden güncellenir.</p>
          <button
            className="mt-6 text-sm text-ink-mute underline-offset-4 hover:text-ink hover:underline"
            onClick={() =>
              start(async () => {
                const r = await createInvite(name || myName);
                if (r.ok) router.refresh();
              })
            }
          >
            Yeni bağlantı oluştur (eskisi geçersiz olur)
          </button>
        </div>
      )}
      <NameEdit initial={name} hidden={!code} />
    </div>
  );
}

function NameEdit({ initial, hidden }: { initial: string; hidden?: boolean }) {
  const [v, setV] = useState(initial);
  if (hidden) return null;
  return (
    <form
      className="mt-10 flex max-w-sm items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await renameMe(v);
        toast.success("Adın güncellendi");
      }}
    >
      <div className="flex-1">
        <label className="label" htmlFor="adim">Kürede görünen adın</label>
        <input id="adim" className="field" maxLength={40} value={v} onChange={(e) => setV(e.target.value)} />
      </div>
      <button className="btn btn-ghost">Kaydet</button>
    </form>
  );
}

function SharedList({ coupleId, initial, userId, names, partnerName }: { coupleId: string; initial: ListItem[]; userId: string; names: Record<string, string>; partnerName: string }) {
  const [items, setItems] = useState(initial);
  const [title, setTitle] = useState("");
  const [pending, start] = useTransition();
  const initialOf = (id: string | null) => ((id === userId ? names[userId] : partnerName) || "?").slice(0, 1).toLocaleUpperCase("tr");

  // gerçek zamanlı: karşı taraf ekleyince/işaretleyince anında görünsün
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel(`couple:${coupleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "couple_list", filter: `couple_id=eq.${coupleId}` }, (payload: { eventType: string; new: unknown; old: unknown }) => {
        setItems((cur) => {
          if (payload.eventType === "DELETE") return cur.filter((x) => x.id !== (payload.old as ListItem).id);
          const row = payload.new as ListItem;
          const exists = cur.some((x) => x.id === row.id);
          const next = exists ? cur.map((x) => (x.id === row.id ? row : x)) : [...cur, row];
          return next.sort((a, b) => a.position - b.position);
        });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [coupleId]);

  const done = items.filter((i) => i.done).length;

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between gap-4">
        <h2 className="display text-[2rem] sm:text-[2.5rem]">
          2027&apos;de <em className="gold-shine italic">birlikte</em>
        </h2>
        {items.length > 0 && (
          <p className="num text-sm text-ink-soft">
            {done}/{items.length}
          </p>
        )}
      </div>
      <p className="mt-3 text-ink-soft">Gidilecek yerler, denenecek şeyler. İkiniz de ekleyip işaretleyebilirsiniz.</p>
      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const t = title.trim();
          if (!t) return;
          start(async () => {
            const { data, error } = await createClient().from("couple_list").insert({ couple_id: coupleId, title: t, added_by: userId }).select("id,title,done,added_by,position").single();
            if (error) return void toast.error("Eklenemedi.");
            setItems((x) => (x.some((y) => y.id === data.id) ? x : [...x, data as ListItem]));
            setTitle("");
          });
        }}
      >
        <label className="sr-only" htmlFor="yeni">Yeni madde</label>
        <input id="yeni" className="field" maxLength={140} placeholder="Ör. Kapadokya'da gün doğumu" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn btn-primary shrink-0" disabled={pending || !title.trim()} aria-label="Ekle">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" strokeWidth={1.5} />}
        </button>
      </form>
      <ol className="mt-6 border-t border-champagne/10">
        <AnimatePresence initial={false}>
          {items.map((it) => (
            <motion.li
              key={it.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-[1.75rem_1fr_auto_auto] items-center gap-3 border-b border-champagne/10 py-4"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-champagne/20 text-xs text-champagne" title={it.added_by === userId ? "Sen ekledin" : `${partnerName} ekledi`}>
                {initialOf(it.added_by)}
              </span>
              <p className="relative min-w-0 truncate">
                <span className={cn("transition-colors duration-500", it.done && "text-ink-soft")}>{it.title}</span>
                <span aria-hidden className="absolute left-0 top-1/2 h-px w-full origin-left bg-champagne transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: `scaleX(${it.done ? 1 : 0})` }} />
              </p>
              <button
                className="flex h-11 w-11 items-center justify-center"
                aria-pressed={it.done}
                aria-label={it.done ? "Yapılmadı olarak işaretle" : "Yapıldı olarak işaretle"}
                onClick={async () => {
                  setItems((x) => x.map((y) => (y.id === it.id ? { ...y, done: !y.done } : y)));
                  await createClient().from("couple_list").update({ done: !it.done }).eq("id", it.id);
                }}
              >
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-full border transition-all", it.done ? "border-transparent bg-[linear-gradient(180deg,#f3e6c8,#dcc7a1_55%,#a88a5c)] text-[#1a1408]" : "border-champagne/30 hover:border-champagne")}>
                  {it.done && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                </span>
              </button>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink-mute hover:text-bordo"
                aria-label="Sil"
                onClick={async () => {
                  setItems((x) => x.filter((y) => y.id !== it.id));
                  await createClient().from("couple_list").delete().eq("id", it.id);
                }}
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {items.length === 0 && <p className="py-8 text-ink-soft">İlk maddeyi sen ekle.</p>}
    </section>
  );
}

function Leave({ owner }: { owner: boolean }) {
  const router = useRouter();
  const [ask, setAsk] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className="mt-16 border-t border-champagne/10 pt-8">
      {!ask ? (
        <button className="text-sm text-ink-mute hover:text-bordo" onClick={() => setAsk(true)}>
          Ortak küreden ayrıl
        </button>
      ) : (
        <div className="rounded-[20px] border border-bordo/35 p-5">
          <p className="text-sm">{owner ? "Küreyi sen oluşturdun. Ayrılırsan ortak küre ve 2027 listesi ikiniz için de silinir." : "Ayrılırsan ortak küreyi ve listeyi artık göremezsin. Kendi küren olduğu gibi kalır."}</p>
          <div className="mt-4 flex gap-2">
            <button
              className="btn btn-sm border border-bordo/60 text-bordo hover:bg-bordo/10"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await leaveCouple();
                  toast("Ortak küreden ayrıldın");
                  router.refresh();
                })
              }
            >
              Evet, ayrıl
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setAsk(false)}>
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
