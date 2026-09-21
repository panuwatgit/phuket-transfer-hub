"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Suggestion } from "@/app/api/places/route";

/** ช่องกรอกสถานที่ + autocomplete (รายชื่อของเรา + Google ถ้ามี key) — พิมพ์เองได้เสมอ */
export function PlaceInput({ value, onChange, placeholder, lang, icon = "📍" }: { value: string; onChange: (v: string) => void; placeholder?: string; lang: "th" | "en"; icon?: string }) {
  const [list, setList] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = value.trim();
    const t = setTimeout(async () => {
      if (q.length < 2) { setList([]); setOpen(false); return; }
      ctrl.current?.abort();
      const ac = new AbortController(); ctrl.current = ac;
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}&lang=${lang}`, { signal: ac.signal });
        if (res.ok) { const data = (await res.json()) as Suggestion[]; setList(data); setOpen(data.length > 0); setHi(-1); }
      } catch { /* aborted */ }
    }, 180);
    return () => clearTimeout(t);
  }, [value, lang]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (s: Suggestion) => { onChange(s.sub && s.source === "google" ? `${s.label}, ${s.sub}` : s.label); setOpen(false); };

  return (
    <div ref={box} className="relative">
      <div className="in"><span>{icon}</span>
        <input value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => list.length && setOpen(true)} placeholder={placeholder} autoComplete="off" role="combobox" aria-expanded={open} aria-controls={id} aria-autocomplete="list"
          onKeyDown={(e) => { if (!open) return; if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, list.length - 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); } if (e.key === "Enter" && hi >= 0) { e.preventDefault(); pick(list[hi]); } if (e.key === "Escape") setOpen(false); }} />
      </div>
      {open && (
        <ul id={id} role="listbox" className="absolute z-30 left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-lift overflow-hidden anim-in max-h-[280px] overflow-y-auto">
          {list.map((s, i) => (
            <li key={`${s.source}-${s.placeId ?? s.label}`} role="option" aria-selected={i === hi} onMouseDown={(e) => { e.preventDefault(); pick(s); }} onMouseEnter={() => setHi(i)}
              className={`flex items-center gap-2.5 px-3 py-2 text-[14px] cursor-pointer ${i === hi ? "bg-teal-wash" : ""}`}>
              <span className="text-base">{s.icon}</span>
              <span className="min-w-0"><span className="block truncate font-medium">{s.label}</span>{s.sub && <span className="block truncate text-[12px] text-ink-faint">{s.sub}</span>}</span>
              {s.source === "google" && <span className="ml-auto text-[10px] text-ink-faint">Google</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
