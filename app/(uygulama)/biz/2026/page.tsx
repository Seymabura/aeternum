import { requireUser } from "@/lib/data";
import { FilmMaker } from "./film-maker";

export const metadata = { title: "Bizim 2026'mız" };

export default async function Page() {
  const user = await requireUser();
  return <FilmMaker userId={user.id} />;
}
