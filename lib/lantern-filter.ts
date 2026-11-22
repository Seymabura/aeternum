/** Fener metni filtresi (veritabanındaki ae_text_ok ile aynı kurallar) */
const BAD =
  /(?<![\p{L}\p{N}])(siktir|sikerim|sikeyim|sikik|sikiş|sik(?![\p{L}])|amk(?![\p{L}])|aq(?![\p{L}])|amına|orospu|piç(?![\p{L}])|piçler|yarrak|yarak(?![\p{L}])|göt(?![\p{L}])|götveren|anan[ıi](?![\p{L}])|anan[ıi]z[ıi](?![\p{L}])|oç(?![\p{L}])|pezevenk|kahpe|gavat|ibne|şerefsiz|gerizekal|puşt|kaltak|amcık|dalyarak|fuck|shit(?![\p{L}])|bitch)/iu;
const LINK = /(https?:\/\/|www\.|\.com(?![\p{L}])|\.net(?![\p{L}])|\.org(?![\p{L}])|\.com\.tr|t\.me\/|@[a-z0-9_]{3,})/iu;

export function cleanLantern(raw: string) {
  return raw.replace(/\s+/g, " ").trim();
}

export function lanternProblem(raw: string): string | null {
  const t = cleanLantern(raw);
  if (t.length < 2) return "Dileğini birkaç kelimeyle yaz.";
  if (t.length > 80) return "Dilek en fazla 80 karakter olabilir.";
  if (LINK.test(t)) return "Fenerlere bağlantı ya da kullanıcı adı yazılamaz.";
  if (/[0-9]{7,}/.test(t.replace(/[^0-9]/g, ""))) return "Fenerlere telefon numarası yazılamaz.";
  if (BAD.test(t.toLocaleLowerCase("tr"))) return "Bu dilek ortak gökyüzüne uygun değil. Biraz daha nazik yazar mısın?";
  return null;
}
