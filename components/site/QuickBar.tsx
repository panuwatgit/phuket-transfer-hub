"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { VEHICLE_ORDER } from "@/lib/config";
import { getDict, href, type Lang } from "@/lib/i18n";
import { PlaceInput } from "@/components/request/PlaceInput";

/** แถบขอราคาด่วนใต้ hero — ส่งค่าไปกรอกฟอร์มให้ */
export function QuickBar({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const router = useRouter();
  const [type, setType] = useState("VAN_VIP8");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(4);
  const go = () => {
    const p = new URLSearchParams({ type, pax: String(pax) });
    if (to.trim()) p.set("to", to.trim());
    if (date) p.set("date", date);
    router.push(`${href(lang, "/request")}?${p}`);
  };
  return (
    <div id="quick" className="max-w-[1140px] mx-auto px-5 -mt-2.5 relative z-[2]">
      <div className="card p-[18px] grid md:grid-cols-[1.2fr_1.2fr_1fr_.8fr_auto] grid-cols-2 gap-3 items-end shadow-lift">
        <Field label={t.quick.vehicle}><span>🚐</span><select value={type} onChange={(e) => setType(e.target.value)}>{VEHICLE_ORDER.map((k) => <option key={k} value={k}>{t.vehicle[k].name}</option>)}</select></Field>
        <div><label className="block text-xs font-semibold text-ink-soft mb-1.5 tracking-wide">{t.quick.to}</label><PlaceInput icon="📍" lang={lang} value={to} onChange={setTo} placeholder={t.quick.toPh} /></div>
        <Field label={t.quick.date}><span>📅</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label={t.quick.pax}><span>👥</span><input type="number" min={1} value={pax} onChange={(e) => setPax(+e.target.value || 1)} /></Field>
        <button className="btn btn-primary col-span-2 md:col-span-1" onClick={go}>{t.quick.go}</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-soft mb-1.5 tracking-wide">{label}</label>
      <div className="in">{children}</div>
    </div>
  );
}
