"use client";
import { useEffect, useState } from "react";

type T = { id: number; msg: string; line?: boolean };

/** เรียก toast("ข้อความ") ได้จากทุก client component ใน admin */
export function toast(msg: string, line = false) {
  window.dispatchEvent(new CustomEvent("pth-toast", { detail: { msg, line } }));
}

export function Toaster() {
  const [list, setList] = useState<T[]>([]);
  useEffect(() => {
    const on = (e: Event) => {
      const { msg, line } = (e as CustomEvent).detail;
      const id = Date.now() + Math.random();
      setList((l) => [...l, { id, msg, line }]);
      setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3800);
    };
    window.addEventListener("pth-toast", on);
    return () => window.removeEventListener("pth-toast", on);
  }, []);
  return (
    <div className="fixed right-5 bottom-5 max-md:bottom-20 flex flex-col gap-2 z-[100]">
      {list.map((t) => <div key={t.id} className={`toast ${t.line ? "line" : ""}`}>{t.msg}</div>)}
    </div>
  );
}

/** คัดลอกแบบไม่โยน error (บางเบราว์เซอร์/iframe ไม่ให้สิทธิ์) */
export async function copy(text: string, label = "คัดลอกแล้ว") {
  try { await navigator.clipboard.writeText(text); toast(label); }
  catch { toast("คัดลอกไม่ได้ในเบราว์เซอร์นี้"); }
}
