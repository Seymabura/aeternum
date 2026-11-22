import { redirect } from "next/navigation";

// kar küresi kaldırıldı; mektup kendi sayfasında
export default function KurePage() {
  redirect("/mektup");
}
