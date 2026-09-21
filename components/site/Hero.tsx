"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { BRAND } from "@/lib/config";
import { getDict, href, type Lang } from "@/lib/i18n";
import { VehicleArt } from "@/components/ui/VehicleArt";
import { chatUrl } from "./Nav";

export function Hero({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const van = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // parallax ตามเมาส์ — เฉพาะจอที่มีเมาส์
    if (!window.matchMedia("(hover: hover)").matches) return;
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      if (van.current) van.current.style.transform = `translate(${x * 18}px,${y * 12}px) rotate(${x * 2}deg)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  const icons = [["✓", "bg-teal"], ["฿", "bg-coral"], ["★", "bg-sun text-ink"]];

  return (
    <header className="relative pt-20 pb-14 overflow-hidden">
      <div className="blob bg-teal w-[420px] h-[420px] -top-[120px] -left-[120px]" />
      <div className="blob bg-sun w-[360px] h-[360px] top-10 -right-20 [animation-delay:-6s]" />
      <div className="blob bg-coral w-[300px] h-[300px] -bottom-[140px] left-[40%] [animation-delay:-12s] !opacity-40" />
      <div className="relative max-w-[1140px] mx-auto px-5 grid md:grid-cols-[1.1fr_.9fr] gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 bg-white border border-line px-3.5 py-1.5 rounded-full text-sm font-medium text-teal-deep shadow-soft"><span className="eyebrow-dot" /> {t.hero.online(BRAND.replyMinutes)}</span>
          <h1 className={`font-bold mt-4 mb-3.5 -tracking-[.5px] ${lang === "en" ? "text-[clamp(34px,5vw,58px)]" : "text-[clamp(40px,6vw,68px)]"}`}>
            <span className="hero-word [animation-delay:.05s]">{t.hero.t1}</span>{" "}
            <span className="hero-word hero-hl [animation-delay:.2s]">{t.hero.t2}</span><br />
            <span className="hero-word [animation-delay:.35s] text-[.55em] font-medium text-ink-soft">{t.hero.t3(BRAND.name)}</span>
          </h1>
          <p className="text-[19px] text-ink-soft max-w-[520px] mb-7">{t.hero.lead}</p>
          <div className="flex gap-3 flex-wrap">
            <Link className="btn btn-primary" href={href(lang, "/request")}>{t.hero.cta}</Link>
            <a className="btn btn-line" href={chatUrl(lang)} target="_blank" rel="noopener">{t.hero.chat}</a>
          </div>
          <div className="flex gap-2.5 flex-wrap mt-7">
            {t.hero.trust.map((label, i) => (
              <span key={label} className="inline-flex items-center gap-2 bg-white border border-line px-3.5 py-2 rounded-xl text-sm font-medium shadow-soft"><i className={`w-[22px] h-[22px] rounded-[7px] grid place-items-center not-italic text-xs text-white ${icons[i][1]}`}>{icons[i][0]}</i>{label}</span>
            ))}
          </div>
        </div>
        <div className="relative h-[300px] md:h-[380px] grid place-items-center">
          <div className="van-ring" />
          <div className="van" ref={van}>
            <VehicleArt type="VAN_VIP8" />
            <div className="van-shadow" />
          </div>
          <div className="tag top-5 left-0 [animation-delay:-2s] text-teal-deep">{t.hero.tag1}</div>
          <div className="tag bottom-8 right-0 [animation-delay:-4s] text-coral-deep">{t.hero.tag2}</div>
        </div>
      </div>
    </header>
  );
}
