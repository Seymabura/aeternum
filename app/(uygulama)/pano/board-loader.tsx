"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const BoardEditor = dynamic(() => import("./board-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70dvh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-latte" />
    </div>
  ),
});

export default BoardEditor;
