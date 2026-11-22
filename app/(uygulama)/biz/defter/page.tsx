import { coupleState } from "@/app/actions/biz";
import { journalState } from "@/app/actions/defter";
import { Journal } from "./journal";

export const metadata = { title: "Ortak defter" };

export default async function DefterPage() {
  const [couple, journal] = await Promise.all([coupleState(), journalState()]);
  return <Journal couple={couple} journal={journal} />;
}
