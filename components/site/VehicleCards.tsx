"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { VEHICLES, VEHICLE_ORDER, VEHICLE_IMAGE } from "@/lib/config";
import { getDict, href, type Lang } from "@/lib/i18n";
import { VehicleArt } from "@/components/ui/VehicleArt";

function Card({ k, delay, lang }: { k: (typeof VEHICLE_ORDER)[number]; delay: number; lang: Lang }) {
  const t = getDict(lang);
  const v = VEHICLES[k], tv = t.vehicle[k], img = VEHICLE_IMAGE[k];
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add("revealed"); io.disconnect(); } }), { threshold: 0.15 });
    io.observe(el);
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
      el.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 8}deg) rotateX(${(0.5 - y) * 8}deg) translateY(-6px)`;
    };
    const leave = () => { el.style.transform = ""; };
    el.addEventListener("mousemove", move); el.addEventListener("mouseleave", leave);
    return () => { io.disconnect(); el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, []);
  const badgeCls = k === "VAN_VIP8" ? "bg-coral-wash text-coral-deep" : "bg-sun-wash text-[#8A6200]";
  return (
    <div ref={ref} className="vcard reveal" style={{ transitionDelay: `${delay}ms` }}>
      <span className={`absolute top-4 right-4 kanit text-xs font-medium px-2.5 py-1 rounded-full ${badgeCls}`}>{tv.badge}</span>
      <div className="art h-[110px] grid place-items-center mb-3.5">
        {img ? <Image src={img.src} alt={tv.name} width={img.w} height={img.h} sizes="200px" className="h-[104px] w-auto drop-shadow-[0_14px_18px_rgba(26,43,60,.22)]" /> : <VehicleArt type={k} className="w-[150px]" />}
      </div>
      <h3 className="text-[22px] font-semibold">{tv.name}</h3>
      <p className="text-ink-soft text-sm mt-0.5 mb-3.5">{tv.tagline}</p>
      <div className="seats flex gap-[5px] flex-wrap mb-1.5">{Array.from({ length: v.seats }).map((_, i) => <span key={i} style={{ transitionDelay: `${i * 60}ms` }} />)}</div>
      <div className="flex gap-3.5 text-[13px] text-ink-soft mb-4"><span>👥 <b className="text-ink font-semibold">{v.seats}</b> {t.vehicle.seats}</span><span>🧳 <b className="text-ink font-semibold">{v.luggage}</b> {t.vehicle.luggage}</span></div>
      <Link className="btn btn-teal w-full !py-3" href={`${href(lang, "/request")}?type=${k}`}>{t.vehicle.pick}</Link>
    </div>
  );
}

export function VehicleCards({ lang }: { lang: Lang }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {VEHICLE_ORDER.map((k, i) => <Card key={k} k={k} delay={i * 80} lang={lang} />)}
    </div>
  );
}
