"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createShare } from "@/app/actions/biz";
import { cn } from "@/lib/utils";

/** Paylaşım bağlantısı oluşturmadan önce açık onay */
export function ConsentDialog({
  payload,
  prepare,
  kind = "ay",
  files,
  onClose,
  onShared,
}: {
  payload?: unknown;
  /** onaydan SONRA çalışır (ör. fotoğrafları paylaşılan klasöre yükler) */
  prepare?: () => Promise<{ payload: unknown; files: string[] }>;
  kind?: "ay" | "gok";
  files?: string[];
  onClose: () => void;
  onShared: (url: string) => void;
}) {
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(4,6,12,0.75)] backdrop-blur-sm sm:items-center" onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Bağlantı oluştur"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="safe-bottom w-full max-w-md rounded-t-[28px] border border-champagne/12 bg-[#0d1426] p-7 sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="display text-[2rem]">Bağlantı oluştur</h2>
        <p className="mt-3 text-ink-soft">Bağlantıya sahip olan herkes bu sayfayı görebilir: isimler ve görünen tarihler. İstediğin zaman Biz sayfasından silebilirsin.</p>
        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#dcc7a1]" checked={ok} onChange={(e) => setOk(e.target.checked)} />
          <span>Bu bilgiler bir bağlantıyla görüntülenebilir olacak. Partnerimin de bundan haberi var.</span>
        </label>
        <div className="mt-7 flex gap-3">
          <button
            className={cn("btn btn-primary flex-1")}
            disabled={!ok || pending}
            onClick={() =>
              start(async () => {
                let body = payload;
                let fl = files ?? [];
                if (prepare) {
                  try {
                    const pr = await prepare();
                    body = pr.payload;
                    fl = pr.files;
                  } catch {
                    return void toast.error("Fotoğraflar yüklenemedi. Bağlantını kontrol edip tekrar dene.");
                  }
                }
                const r = await createShare(kind, body, fl);
                if (!r.ok) return void toast.error(r.error);
                const url = `${window.location.origin}/s/${kind}/${r.token}`;
                try {
                  await navigator.clipboard.writeText(url);
                  toast.success("Bağlantı oluşturuldu ve kopyalandı");
                } catch {
                  toast.success("Bağlantı oluşturuldu");
                }
                onShared(url);
              })
            }
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Oluştur
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Vazgeç
          </button>
        </div>
      </motion.div>
    </div>
  );
}
