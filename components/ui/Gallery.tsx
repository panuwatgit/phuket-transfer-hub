"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

export type Photo = { src: string; alt: { th: string; en: string }; w: number; h: number };

/** รูปปก + lightbox เลื่อนดูทั้งชุด (ลูกศร/ESC/แตะขอบ) */
export function Gallery({ photos, lang, label, className = "", priority = false }: { photos: Photo[]; lang: Lang; label: string; className?: string; priority?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const cover = photos[0];
  const step = useCallback((d: number) => setOpen((i) => (i === null ? null : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, step]);

  return (
    <>
      <button type="button" className={`relative block w-full overflow-hidden rounded-2xl group ${className}`} onClick={() => setOpen(0)} aria-label={label}>
        <Image src={cover.src} alt={cover.alt[lang]} width={cover.w} height={cover.h} priority={priority} sizes="(max-width: 640px) 90vw, 300px" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-ink text-[12px] font-medium px-2.5 py-1 rounded-lg shadow-soft">{label}</span>
      </button>

      {open !== null && (
        <div className="fixed inset-0 z-[120] bg-ink/90 backdrop-blur-sm flex items-center justify-center p-4 anim-in" onClick={() => setOpen(null)} role="dialog" aria-modal>
          <button className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 text-white text-2xl grid place-items-center hover:bg-white/25" onClick={() => setOpen(null)} aria-label="close">✕</button>
          <button className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white text-2xl grid place-items-center hover:bg-white/25" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="previous">‹</button>
          <button className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white text-2xl grid place-items-center hover:bg-white/25" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="next">›</button>
          <figure className="max-w-[92vw] max-h-[88vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <Image key={photos[open].src} src={photos[open].src} alt={photos[open].alt[lang]} width={photos[open].w} height={photos[open].h} sizes="92vw" className="max-h-[78vh] w-auto h-auto object-contain rounded-2xl shadow-lift anim-in" />
            <figcaption className="text-white/80 text-sm text-center">{photos[open].alt[lang]} <span className="text-white/40 ml-2">{open + 1}/{photos.length}</span></figcaption>
            <div className="flex gap-1.5">{photos.map((_, i) => <button key={i} className={`w-2 h-2 rounded-full ${i === open ? "bg-sun" : "bg-white/30"}`} onClick={() => setOpen(i)} aria-label={`${i + 1}`} />)}</div>
          </figure>
        </div>
      )}
    </>
  );
}
