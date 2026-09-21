"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { GALLERY } from "@/lib/config";
import { getDict, type Lang } from "@/lib/i18n";

/** แถบรูปจริงเลื่อนแนวนอน + lightbox (ลูกศร/ESC/แตะพื้นหลังเพื่อปิด) */
export function PhotoStrip({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const [open, setOpen] = useState<number | null>(null);
  const n = GALLERY.length;
  const step = useCallback((d: number) => setOpen((i) => (i === null ? null : (i + d + n) % n)), [n]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, step]);
  if (!n) return null;

  return (
    <>
      <div className="flex gap-3.5 overflow-x-auto pb-3 -mx-5 px-5 snap-x snap-mandatory [scrollbar-width:thin]">
        {GALLERY.map((p, i) => (
          <button key={p.src} type="button" onClick={() => setOpen(i)} className="relative shrink-0 snap-start w-[240px] md:w-[270px] aspect-[3/4] rounded-2xl overflow-hidden group shadow-soft" aria-label={p.alt[lang]}>
            <Image src={p.src} alt={p.alt[lang]} width={p.w} height={p.h} sizes="270px" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-ink/70 to-transparent text-white text-[13px] text-left leading-snug">{p.alt[lang]}</span>
            <span className="absolute top-2.5 right-2.5 bg-white/90 text-ink text-[11px] font-medium px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">🔍 {t.gallery.open}</span>
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-[120] bg-ink/90 backdrop-blur-sm flex items-center justify-center p-4 anim-in" onClick={() => setOpen(null)} role="dialog" aria-modal>
          <button className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 text-white text-2xl grid place-items-center hover:bg-white/25" onClick={() => setOpen(null)} aria-label="close">✕</button>
          {n > 1 && <>
            <button className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white text-2xl grid place-items-center hover:bg-white/25" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="previous">‹</button>
            <button className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white text-2xl grid place-items-center hover:bg-white/25" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="next">›</button>
          </>}
          <figure className="max-w-[92vw] max-h-[88vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <Image key={GALLERY[open].src} src={GALLERY[open].src} alt={GALLERY[open].alt[lang]} width={GALLERY[open].w} height={GALLERY[open].h} sizes="92vw" className="max-h-[78vh] w-auto h-auto object-contain rounded-2xl shadow-lift anim-in" />
            <figcaption className="text-white/80 text-sm text-center">{GALLERY[open].alt[lang]} <span className="text-white/40 ml-2">{open + 1}/{n}</span></figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
