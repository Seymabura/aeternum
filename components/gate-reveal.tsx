"use client";

import { useEffect, useRef, useState } from "react";

/** Kapı bölümü görünür olunca başlık ışıkla belirir */
export function GateReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={on ? "gate-in" : "gate-wait"}>
      {children}
    </div>
  );
}
