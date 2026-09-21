export const baht = (n?: number | null) => "฿" + (n ?? 0).toLocaleString("th-TH");

/** "2026-10-25" หรือ Date → "25 ต.ค. 2569" */
export function thDate(d?: string | Date | null, withYear = true) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}), timeZone: "Asia/Bangkok" });
}

/** Date (@db.Date) → "YYYY-MM-DD" */
export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function ago(from: Date, now = new Date()) {
  const ms = now.getTime() - from.getTime();
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} นาที`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ชม.`;
  return `${Math.round(h / 24)} วัน`;
}

export function minutesSince(from: Date, now = new Date()) {
  return Math.round((now.getTime() - from.getTime()) / 60000);
}

export function addHours(hhmm: string, hours: number) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${String((h + hours) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
