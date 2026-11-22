import { loadSky } from "@/app/actions/fener";
import { LanternSky } from "./lantern-sky";

export const metadata = { title: "Dilek feneri" };

export default async function FenerPage() {
  const sky = await loadSky();
  return <LanternSky initial={sky} />;
}
