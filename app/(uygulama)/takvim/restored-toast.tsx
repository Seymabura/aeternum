"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function RestoredToast() {
  const router = useRouter();
  useEffect(() => {
    toast.success("Defterin bu cihazda açıldı");
    router.replace("/takvim", { scroll: false });
  }, [router]);
  return null;
}
