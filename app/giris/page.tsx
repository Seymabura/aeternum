import { redirect } from "next/navigation";

// E-postayla giriş kaldırıldı: defter, ilk ziyarette bu cihaza özel açılır.
export default function LoginPage() {
  redirect("/takvim");
}
