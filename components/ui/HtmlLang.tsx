"use client";
import { useEffect } from "react";

/** ตั้ง <html lang> ตามภาษาของหน้า (root layout อยู่นอก [lang]) */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return null;
}
