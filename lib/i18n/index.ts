import { th, type Dict } from "./th";
import { en } from "./en";

export type Lang = "th" | "en";
export const LANGS: Lang[] = ["th", "en"];
export const isLang = (s: string): s is Lang => (LANGS as string[]).includes(s);
export const getDict = (lang: Lang): Dict => (lang === "en" ? en : th);
export type { Dict };

/** path ของหน้า public ตามภาษา — ไทยไม่มี prefix, อังกฤษ /en */
export const href = (lang: Lang, path = "/") => (lang === "th" ? path : `/en${path === "/" ? "" : path}`) || "/";

/** วันที่ตามภาษา: "25 ต.ค. 2569" / "25 Oct 2026" */
export function fmtDate(d: string | Date | null | undefined, lang: Lang, withYear = true) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  return date.toLocaleDateString(lang === "en" ? "en-GB" : "th-TH", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}), timeZone: "Asia/Bangkok" });
}
