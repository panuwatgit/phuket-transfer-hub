"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ServiceType, VehicleType } from "@prisma/client";
import { CHARTER, PROVINCES, SERVICE_ORDER, VEHICLES, VEHICLE_ORDER, defaultPaymentTerm, isCharter } from "@/lib/config";
import { addHours } from "@/lib/format";
import { fmtDate, getDict, href, type Lang } from "@/lib/i18n";
import { VehicleArt } from "@/components/ui/VehicleArt";
import { createRequest } from "@/app/request/actions";
import type { RequestInput } from "@/lib/validation";
import type { ContactChannel } from "@prisma/client";

type Prefill = { type?: string; to?: string; date?: string; pax?: string };

const PROVINCE_EN: Record<string, string> = { "ภูเก็ต": "Phuket", "พังงา": "Phang Nga", "กระบี่": "Krabi", "สุราษฎร์ธานี": "Surat Thani", "ตรัง": "Trang", "นครศรีธรรมราช": "Nakhon Si Thammarat", "สงขลา": "Songkhla (Hat Yai)", "สตูล": "Satun", "พัทลุง": "Phatthalung", "ระนอง": "Ranong", "ชุมพร": "Chumphon", "ปัตตานี": "Pattani", "ยะลา": "Yala", "นราธิวาส": "Narathiwat" };

type State = {
  vehicleType: VehicleType | null; vehicleCount: number;
  serviceType: ServiceType | null; direction: "FROM_AIRPORT" | "TO_AIRPORT";
  apPlace: string; p2pFrom: string; p2pTo: string; prov: string; chPlace: string;
  date: string; time: string; roundTrip: boolean; rdate: string; rtime: string;
  flight: string; days: number; plan: string; pax: number; lug: number;
  name: string; phone: string; chan: ContactChannel; lineId: string; email: string; company: string; note: string; website: string;
};

export function RequestForm({ lang, prefill }: { lang: Lang; prefill: Prefill }) {
  const t = getDict(lang);
  const f = t.form;
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [s, setS] = useState<State>({
    vehicleType: (VEHICLE_ORDER as string[]).includes(prefill.type ?? "") ? (prefill.type as VehicleType) : null,
    vehicleCount: 1,
    serviceType: prefill.to ? "POINT_TO_POINT" : null, direction: "FROM_AIRPORT",
    apPlace: "", p2pFrom: "", p2pTo: prefill.to ?? "", prov: "ภูเก็ต", chPlace: "",
    date: prefill.date ?? "", time: "09:00", roundTrip: false, rdate: "", rtime: "12:00",
    flight: "", days: 2, plan: "", pax: Math.max(1, Number(prefill.pax) || 4), lug: 2,
    name: "", phone: "", chan: lang === "en" ? "WHATSAPP" : "LINE", lineId: "", email: "", company: "", note: "", website: "",
  });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const set = <K extends keyof State>(k: K, v: State[K]) => { setS((p) => ({ ...p, [k]: v })); setErrors((e) => { const rest = { ...e }; delete rest[k as string]; return rest; }); };

  const charter = s.serviceType ? isCharter(s.serviceType) : false;
  const pickupPlace = s.serviceType === "AIRPORT" ? s.apPlace : s.serviceType === "POINT_TO_POINT" ? s.p2pFrom : s.chPlace;
  const route = useMemo(() => {
    const r = t.route;
    if (!s.serviceType) return "";
    if (s.serviceType === "AIRPORT") return s.direction === "FROM_AIRPORT" ? `${r.airport} → ${s.apPlace || "…"}` : `${s.apPlace || "…"} → ${r.airport}`;
    if (s.serviceType === "POINT_TO_POINT") return `${s.p2pFrom || "…"} → ${s.p2pTo || "…"} (${s.prov})`;
    if (s.serviceType === "DAILY_CHARTER") return `${r.pickupAt} ${s.chPlace || "…"} · ${r.charterDay(CHARTER.hoursPerDay)}`;
    return `${r.pickupAt} ${s.chPlace || "…"} · ${r.days(s.days)}`;
  }, [s, t]);
  const payTerm = s.serviceType ? (s.company ? "CREDIT" : defaultPaymentTerm(s.serviceType, s.prov)) : null;
  const cap = s.vehicleType ? VEHICLES[s.vehicleType] : null;
  const capWarn = useMemo(() => {
    if (!cap) return "";
    const seats = cap.seats * s.vehicleCount, lug = cap.luggage * s.vehicleCount;
    const name = t.vehicle[s.vehicleType!].name;
    if (s.pax > seats) {
      const alt = VEHICLE_ORDER.find((k) => VEHICLES[k].seats >= s.pax);
      return f.s2.capSeats(name, seats, s.pax, alt ? t.vehicle[alt].name : null, Math.ceil(s.pax / cap.seats));
    }
    if (s.lug > lug) return f.s2.capLug(s.lug, name, lug);
    return "";
  }, [cap, s.pax, s.lug, s.vehicleCount, s.vehicleType, t, f]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (step === 1 && !s.vehicleType) e.vehicleType = f.s1.err;
    if (step === 2) {
      if (!s.serviceType) e.serviceType = f.s2.err;
      else {
        if (s.serviceType === "AIRPORT" && !s.apPlace.trim()) e.apPlace = f.s2.apPlaceErr;
        if (s.serviceType === "POINT_TO_POINT") { if (!s.p2pFrom.trim()) e.p2pFrom = f.s2.p2pFromErr; if (!s.p2pTo.trim()) e.p2pTo = f.s2.p2pToErr; }
        if (charter && !s.chPlace.trim()) e.chPlace = f.s2.chPlaceErr;
        if (!s.date) e.date = f.s2.dateErr;
      }
    }
    if (step === 3) {
      if (!s.name.trim()) e.name = f.s3.nameErr;
      if (!/^(0\d{8,9}|\+?[1-9]\d{6,14})$/.test(s.phone.replace(/[-\s().]/g, ""))) e.phone = f.s3.phoneErr;
      if (s.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())) e.email = f.s3.emailErr;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate()) return;
    if (step < 3) { setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const input: RequestInput = {
      vehicleType: s.vehicleType!, vehicleCount: s.vehicleCount, serviceType: s.serviceType!,
      direction: s.serviceType === "AIRPORT" ? s.direction : undefined,
      pickupDate: s.date, pickupTime: s.time, pickupPlace,
      dropoffPlace: s.serviceType === "POINT_TO_POINT" ? s.p2pTo : undefined,
      dropoffProvince: s.serviceType === "POINT_TO_POINT" ? s.prov : undefined,
      roundTrip: s.roundTrip, returnDate: s.roundTrip ? s.rdate || undefined : undefined, returnTime: s.roundTrip ? s.rtime : undefined,
      flightNo: s.flight || undefined, days: s.serviceType === "MULTI_DAY" ? s.days : undefined, itinerary: s.plan || undefined,
      passengers: s.pax, luggage: s.lug,
      customerName: s.name, phone: s.phone, lineId: s.lineId || undefined, email: s.email || undefined, company: s.company || undefined, contactChannel: s.chan, customerNote: s.note || undefined,
      website: s.website, lang,
    };
    start(async () => {
      const res = await createRequest(input);
      if (res.ok) router.push(`${href(lang, "/request")}/${res.code}`);
      else { setErrors(res.errors); setStep(res.errors.customerName || res.errors.phone ? 3 : res.errors.vehicleType ? 1 : 2); }
    });
  }

  const err = (k: string) => (errors[k] ? <div className="emsg">{errors[k]}</div> : null);
  const summaryRows: [string, string, boolean][] = [
    ["🚐", s.vehicleType ? t.vehicle[s.vehicleType].name + (s.vehicleCount > 1 ? f.summary.cars(s.vehicleCount) : "") : "", !s.vehicleType],
    ["🧭", s.serviceType ? t.service[s.serviceType].name : "", !s.serviceType],
    ["📅", s.date ? `${fmtDate(s.date, lang)} ${s.time}${s.roundTrip && s.rdate ? ` · ${t.route.back} ${fmtDate(s.rdate, lang)} ${s.rtime}` : ""}` : "", !s.date],
    ["📍", route, !route],
    ["👥", f.summary.pax(s.pax, s.lug), false],
    ["👤", [s.name, s.phone].filter(Boolean).join(" · ") + (s.name || s.phone ? ` (${f.s3.channels[s.chan].replace(/^\S+\s/, "")})` : ""), !s.name && !s.phone],
  ];
  const labels = f.summary.labels;
  const channels: ContactChannel[] = lang === "en" ? ["WHATSAPP", "EMAIL", "PHONE"] : ["LINE", "PHONE"];

  return (
    <>
      {/* progress */}
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        {f.steps.map((label, i) => {
          const n = i + 1, on = n === step, done = n < step;
          return (
            <div key={label} className={`flex items-center justify-center sm:justify-start gap-2.5 px-3.5 py-3 rounded-[14px] bg-white border-[1.5px] kanit font-medium text-[15px] transition-all ${on ? "border-teal text-ink shadow-[0_0_0_4px_rgba(20,184,166,.12)]" : done ? "border-teal-wash bg-teal-wash text-teal-deep" : "border-line text-ink-faint"}`}>
              <span className={`w-7 h-7 rounded-[9px] grid place-items-center text-sm transition-all ${on ? "bg-teal text-white -rotate-6 scale-105" : done ? "bg-teal-deep text-white" : "bg-line text-ink-soft"}`}>{done ? "✓" : n}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 bg-line rounded-md mb-7 overflow-hidden"><i className="block h-full bg-gradient-to-r from-teal to-[#2DD4BF] rounded-md transition-[width] duration-500" style={{ width: `${step * 33.3}%` }} /></div>

      <div className="grid md:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="card">
          {/* STEP 1 */}
          {step === 1 && (
            <section className="p-7 anim-slide">
              <h2 className="text-[22px] font-semibold">{f.s1.title}</h2>
              <p className="text-ink-soft text-[14.5px] mb-5">{f.s1.hint}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {VEHICLE_ORDER.map((k) => (
                  <button type="button" key={k} className={`choice ${s.vehicleType === k ? "on" : ""}`} onClick={() => set("vehicleType", k)}>
                    <VehicleArt type={k} className="w-full h-14 mb-1" />
                    <b className="kanit font-medium block text-[15px]">{t.vehicle[k].name.replace(" ที่นั่ง", "").replace(/ · \d+ seats$/, "")}</b>
                    <small className="text-ink-soft text-[12.5px] block leading-snug">{f.s1.seatsLug(VEHICLES[k].seats, VEHICLES[k].luggage)}</small>
                  </button>
                ))}
              </div>
              {err("vehicleType")}
              <div className="mt-5"><span className="lbl">{f.s1.count}</span><Stepper v={s.vehicleCount} min={1} onChange={(v) => set("vehicleCount", v)} /></div>
            </section>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <section className="p-7 anim-slide">
              <h2 className="text-[22px] font-semibold">{f.s2.title}</h2>
              <p className="text-ink-soft text-[14.5px] mb-5">{f.s2.hint}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SERVICE_ORDER.map((k) => (
                  <button type="button" key={k} className={`choice ${s.serviceType === k ? "on" : ""}`} onClick={() => set("serviceType", k)}>
                    <div className="text-[26px] mb-1.5">{["🛬", "📍", "🚐", "🗺️"][SERVICE_ORDER.indexOf(k)]}</div>
                    <b className="kanit font-medium block text-[15px]">{t.service[k].name.replace("พร้อมคนขับ", "").replace(" with driver", "")}</b>
                    <small className="text-ink-soft text-[12.5px] block leading-snug">{t.service[k].formTag}</small>
                  </button>
                ))}
              </div>
              {err("serviceType")}

              {s.serviceType && (
                <div className="mt-5 anim-slide">
                  {s.serviceType === "AIRPORT" && (
                    <>
                      <div className="mb-5"><span className="lbl">{f.s2.direction}</span>
                        <div className="seg"><button type="button" className={s.direction === "FROM_AIRPORT" ? "on" : ""} onClick={() => set("direction", "FROM_AIRPORT")}>{f.s2.fromAirport}</button><button type="button" className={s.direction === "TO_AIRPORT" ? "on" : ""} onClick={() => set("direction", "TO_AIRPORT")}>{f.s2.toAirport}</button></div>
                      </div>
                      <Field label={f.s2.apPlace} err={errors.apPlace}><span>🏨</span><input value={s.apPlace} onChange={(e) => set("apPlace", e.target.value)} placeholder={f.s2.apPlacePh} /></Field>
                      <Field label={f.s2.flight} opt={f.s2.flightOpt}><span>✈️</span><input value={s.flight} onChange={(e) => set("flight", e.target.value)} placeholder={f.s2.flightPh} /></Field>
                    </>
                  )}
                  {s.serviceType === "POINT_TO_POINT" && (
                    <>
                      <Field label={f.s2.p2pFrom} err={errors.p2pFrom}><span>📍</span><input value={s.p2pFrom} onChange={(e) => set("p2pFrom", e.target.value)} placeholder={f.s2.p2pFromPh} /></Field>
                      <div className="grid sm:grid-cols-2 gap-3.5">
                        <Field label={f.s2.p2pTo} err={errors.p2pTo}><span>🏁</span><input value={s.p2pTo} onChange={(e) => set("p2pTo", e.target.value)} placeholder={f.s2.p2pToPh} /></Field>
                        <Field label={f.s2.prov}><span>🗺️</span><select value={s.prov} onChange={(e) => set("prov", e.target.value)}>{PROVINCES.map((p) => <option key={p} value={p}>{lang === "en" ? PROVINCE_EN[p] ?? p : p}</option>)}</select></Field>
                      </div>
                    </>
                  )}
                  {charter && <Field label={f.s2.chPlace} err={errors.chPlace}><span>🏨</span><input value={s.chPlace} onChange={(e) => set("chPlace", e.target.value)} placeholder={f.s2.chPlacePh} /></Field>}

                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <Field label={s.serviceType === "MULTI_DAY" ? f.s2.dateStart : f.s2.date} err={errors.date}><span>📅</span><input type="date" min={today} value={s.date} onChange={(e) => set("date", e.target.value)} /></Field>
                    <div>
                      <Field label={charter ? f.s2.timeStart : f.s2.time}><span>🕘</span><input type="time" value={s.time} onChange={(e) => set("time", e.target.value)} /></Field>
                      {s.serviceType === "DAILY_CHARTER" && s.time && <div className="text-[13px] text-teal-deep -mt-3 mb-4">{f.s2.endTime(CHARTER.hoursPerDay, addHours(s.time, CHARTER.hoursPerDay), CHARTER.otRate)}</div>}
                    </div>
                  </div>
                  {s.serviceType === "MULTI_DAY" && <div className="mb-5"><span className="lbl">{f.s2.days}</span><Stepper v={s.days} min={2} onChange={(v) => set("days", v)} /></div>}
                  {!charter && (
                    <div className="mb-5">
                      <label className="flex items-center gap-2.5 cursor-pointer text-[15px]"><button type="button" className={`sw ${s.roundTrip ? "on" : ""}`} onClick={() => set("roundTrip", !s.roundTrip)} aria-pressed={s.roundTrip} /> {f.s2.round}</label>
                      {s.roundTrip && (
                        <div className="grid sm:grid-cols-2 gap-3.5 mt-3.5 anim-slide">
                          <Field label={f.s2.rdate}><span>📅</span><input type="date" min={s.date || today} value={s.rdate} onChange={(e) => set("rdate", e.target.value)} /></Field>
                          <Field label={f.s2.rtime}><span>🕘</span><input type="time" value={s.rtime} onChange={(e) => set("rtime", e.target.value)} /></Field>
                        </div>
                      )}
                    </div>
                  )}
                  {charter && (
                    <>
                      <Field label={f.s2.plan} opt={f.s2.planOpt}><textarea value={s.plan} onChange={(e) => set("plan", e.target.value)} placeholder={f.s2.planPh} /></Field>
                      <div className="info -mt-1 mb-5"><span>{f.s2.charterInfo(CHARTER.hoursPerDay, CHARTER.otRate)}</span></div>
                    </>
                  )}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div><span className="lbl">{f.s2.pax}</span><Stepper v={s.pax} min={1} onChange={(v) => set("pax", v)} /></div>
                    <div><span className="lbl">{f.s2.lug}</span><Stepper v={s.lug} min={0} onChange={(v) => set("lug", v)} /></div>
                  </div>
                  {capWarn && <div className="warn mt-3">⚠️ <span>{capWarn}</span></div>}
                </div>
              )}
            </section>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <section className="p-7 anim-slide">
              <h2 className="text-[22px] font-semibold">{f.s3.title}</h2>
              <p className="text-ink-soft text-[14.5px] mb-5">{f.s3.hint}</p>
              <div className="grid sm:grid-cols-2 gap-3.5">
                <Field label={f.s3.name} err={errors.name ?? errors.customerName}><span>👤</span><input value={s.name} onChange={(e) => set("name", e.target.value)} placeholder={f.s3.namePh} autoComplete="name" /></Field>
                <Field label={f.s3.phone} err={errors.phone}><span>📞</span><input value={s.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" placeholder={f.s3.phonePh} autoComplete="tel" /></Field>
              </div>
              <div className="mb-5"><span className="lbl">{f.s3.channel}</span>
                <div className="seg">{channels.map((c) => <button key={c} type="button" className={s.chan === c ? "on" : ""} onClick={() => set("chan", c)}>{f.s3.channels[c]}</button>)}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3.5">
                {lang === "en"
                  ? <Field label={f.s3.email} opt={f.s3.emailOpt} err={errors.email}><span>✉️</span><input type="email" value={s.email} onChange={(e) => set("email", e.target.value)} placeholder={f.s3.emailPh} autoComplete="email" /></Field>
                  : <Field label={f.s3.lineId} opt={f.s3.lineIdOpt}><span>💬</span><input value={s.lineId} onChange={(e) => set("lineId", e.target.value)} placeholder={f.s3.lineIdPh} /></Field>}
                <Field label={f.s3.company} opt={f.s3.companyOpt}><span>🏢</span><input value={s.company} onChange={(e) => set("company", e.target.value)} placeholder={f.s3.companyPh} autoComplete="organization" /></Field>
              </div>
              {lang !== "en" && <Field label={f.s3.email} opt={f.s3.emailOpt} err={errors.email}><span>✉️</span><input type="email" value={s.email} onChange={(e) => set("email", e.target.value)} placeholder={f.s3.emailPh} autoComplete="email" /></Field>}
              <Field label={f.s3.note} opt={f.s3.noteOpt}><textarea value={s.note} onChange={(e) => set("note", e.target.value)} placeholder={f.s3.notePh} /></Field>
              {/* honeypot */}
              <input className="hidden" tabIndex={-1} autoComplete="off" value={s.website} onChange={(e) => set("website", e.target.value)} name="website" aria-hidden />
              {payTerm && <div className="info">💳 <span><b>{f.s3.payThis} {f.pay[payTerm].name}</b><br />{f.pay[payTerm].desc} · {f.s3.refund}</span></div>}
              {errors.form && <div className="emsg">{errors.form}</div>}
            </section>
          )}

          <div className="flex justify-between gap-3 px-7 py-5 border-t border-line">
            <button type="button" className="btn btn-ghost" style={{ visibility: step > 1 ? "visible" : "hidden" }} onClick={() => setStep(step - 1)}>{f.back}</button>
            <button type="button" className="btn btn-primary min-w-[180px]" onClick={next} disabled={pending}>{pending ? f.sending : step === 3 ? f.submit : f.next}</button>
          </div>
        </div>

        {/* live summary — sticky บนจอกว้าง, แถบชิปบนมือถือ */}
        <aside className="md:sticky md:top-[88px] max-md:-order-1">
          <div className="card p-5 max-md:p-3 max-md:flex max-md:flex-wrap max-md:gap-1.5 max-md:items-center">
            <h3 className="text-[17px] font-semibold mb-3.5 flex justify-between items-center max-md:hidden">{f.summary.title} <span className="text-xs font-normal text-teal-deep bg-teal-wash px-2 py-0.5 rounded-full font-[family-name:var(--font-body)]">{f.summary.live}</span></h3>
            {summaryRows.map(([ic, v, empty], i) => (
              <div key={labels[i]} className={`flex gap-2.5 py-2 border-b border-dashed border-line last:border-0 text-sm items-start max-md:border-0 max-md:py-1 max-md:px-2.5 max-md:bg-cream max-md:rounded-lg max-md:text-[13px] ${empty ? "max-md:hidden" : "max-md:inline-flex"}`}>
                <i className="not-italic w-[22px] shrink-0 text-center max-md:w-auto">{ic}</i>
                <div><span className="text-ink-faint text-xs block max-md:hidden">{labels[i]}</span><span className={`font-medium ${empty ? "text-ink-faint font-normal" : ""}`}>{empty ? "—" : v}</span></div>
              </div>
            ))}
            <div className="mt-3.5 p-3 rounded-xl bg-sun-wash text-[13.5px] max-md:hidden"><b className="block kanit font-medium text-sm">{payTerm ? f.pay[payTerm].name : f.summary.payTitle}</b>{payTerm ? f.pay[payTerm].desc : f.summary.payNone}</div>
          </div>
        </aside>
      </div>
    </>
  );
}

function Field({ label, opt, err, children }: { label: string; opt?: string; err?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <span className="lbl">{label} {opt && <span className="opt">{opt}</span>}</span>
      <div className={`in ${err ? "err" : ""}`}>{children}</div>
      {err && <div className="emsg">{err}</div>}
    </div>
  );
}

function Stepper({ v, min, onChange }: { v: number; min: number; onChange: (v: number) => void }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, v - 1))} aria-label="-">−</button>
      <output>{v}</output>
      <button type="button" onClick={() => onChange(v + 1)} aria-label="+">+</button>
    </div>
  );
}
