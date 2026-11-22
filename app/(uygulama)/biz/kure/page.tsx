import { redirect } from "next/navigation";

// Ortak küre kaldırıldı; yerine ortak defter
export default function Page() {
  redirect("/biz/defter");
}
