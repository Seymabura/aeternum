/** Türkiye saatine göre gün hesapları (gösterim için; asıl kontrol veritabanında). */

export const EVENT_YEAR = Number(process.env.NEXT_PUBLIC_EVENT_YEAR ?? 2026);
export const TZ = "Europe/Istanbul";

/** İstanbul'daki tarih parçaları */
export function trParts(now = new Date()) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(f.formatToParts(now).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour) % 24,
    minute: Number(p.minute),
    second: Number(p.second),
  };
}

/** 0 = Aralık öncesi (hazırlık), 1-31 = Aralık günü, 32 = bitti */
export function todayIndexLocal(now = new Date()) {
  const p = trParts(now);
  if (p.year < EVENT_YEAR || (p.year === EVENT_YEAR && p.month < 12)) return 0;
  if (p.year > EVENT_YEAR) return 32;
  return p.day;
}

/** Türkiye saatiyle bir sonraki gece yarısına kalan milisaniye */
export function msUntilTrMidnight(now = new Date()) {
  const p = trParts(now);
  const passed = ((p.hour * 60 + p.minute) * 60 + p.second) * 1000 + now.getMilliseconds();
  return 24 * 3600 * 1000 - passed;
}

/** 1 Aralık 00:00 TR'ye kalan ms (UTC+3 sabit, Türkiye'de yaz saati yok) */
export function msUntilDecember(now = new Date()) {
  return Date.UTC(EVENT_YEAR, 11, 1, 0, 0, 0) - 3 * 3600 * 1000 - now.getTime();
}

export function dayLabel(day: number) {
  return `${day} Aralık`;
}

export type TimeOfDay = "morning" | "day" | "evening" | "night";
export function timeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
