"use client";

import dynamic from "next/dynamic";

const StarRoad = dynamic(() => import("./star-road"), {
  ssr: false,
  loading: () => <div aria-hidden className="night-stars fixed inset-0 -z-[5] bg-night" />,
});

export function StarRoadHost() {
  return <StarRoad />;
}
