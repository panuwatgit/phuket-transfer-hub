"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { Attachment, BookingRequest, Document, Expense, Partner, PaymentTerm, StatusLog, Vehicle } from "@prisma/client";
import { ExpensesPanel } from "./ExpensesPanel";
import { DocumentsPanel } from "./DocumentsPanel";
import { NEXT_STATUS, PAYMENT_TERMS, SERVICES, STATUSES, VEHICLES, isCharter } from "@/lib/config";
import { ago, baht, thDate } from "@/lib/format";
import { routeText } from "@/lib/request-view";
import { assignVehicle, saveAdminNote, savePayment, savePricing, sendDriverInfo, sendQuoteViaLine, setStatus } from "@/app/admin/actions";
import { copy, toast } from "./Toast";

const CHANNEL: Record<string, string> = { LINE: "💬 LINE", PHONE: "📞 โทร", WHATSAPP: "💬 WhatsApp", EMAIL: "✉️ อีเมล" };

type Req = BookingRequest & { vehicle: (Vehicle & { partner: Partner }) | null; statusLogs: StatusLog[]; documents: Document[]; expenses: (Expense & { attachments: Pick<Attachment, "id" | "filename" | "mime" | "size">[] })[]; attachments: Pick<Attachment, "id" | "filename" | "mime" | "size">[] };
type Cand = Vehicle & { partner: Partner };

export function RequestDetail({ r, candidates, now, partners }: { r: Req; candidates: Cand[]; now: Date; partners: Pick<Partner, "id" | "name">[] }) {
  const [pending, start] = useTransition();
  const charter = isCharter(r.serviceType);
  const next = NEXT_STATUS[r.status];
  const st = STATUSES[r.status];

  const [cost, setCost] = useState(r.costPrice ?? 0);
  const [price, setPrice] = useState(r.sellPrice ?? 0);
  const [otRate, setOtRate] = useState(r.otRate);
  const [otHours, setOtHours] = useState(r.otHours);
  const [fuel, setFuel] = useState(r.fuelIncluded);
  const [term, setTerm] = useState<PaymentTerm>(r.paymentTerm);
  const [paid, setPaid] = useState(r.amountPaid);
  const [note, setNote] = useState(r.adminNote ?? "");

  const margin = price - cost;
  const days = r.days ?? 1;
  const total = charter ? price * days + otHours * otRate : price;
  const due = term === "DEPOSIT_50" ? Math.round(total * 0.5) : term === "CREDIT" ? 0 : total;
  const overCap = r.passengers > VEHICLES[r.vehicleType].seats * r.vehicleCount;

  const go = (fn: () => Promise<unknown>, msg?: string) => start(async () => { try { await fn(); if (msg) toast(msg); } catch (e) { toast("ผิดพลาด: " + (e as Error).message); } });
  const cancel = () => { const v = window.prompt("เหตุผลที่ยกเลิก", "ราคาไม่โดน"); if (v === null) return; go(() => setStatus(r.id, "CANCELLED", v || "ไม่ระบุ"), "ยกเลิกแล้ว"); };

  return (
    <div className="max-w-[960px] mx-auto">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Link href="/admin" className="btn btn-ghost btn-sm">← กระดาน</Link>
        <div>
          <h1 className="text-2xl font-semibold leading-tight">{r.code}</h1>
          <span className="pill" style={{ background: st.wash, color: st.color }}><i style={{ background: st.color }} />{st.name}</span>
          <small className="text-ink-faint ml-2">รับเมื่อ {ago(r.createdAt, now)}ที่แล้ว</small>
        </div>
        <div className="flex gap-2 md:ml-auto flex-wrap">
          {next && <button className="btn btn-teal btn-sm" disabled={pending} onClick={() => go(() => setStatus(r.id, next), `→ ${STATUSES[next].name}`)}>→ {STATUSES[next].name}</button>}
          {["NEW", "SOURCING", "QUOTED"].includes(r.status) && <button className="btn btn-danger btn-sm" disabled={pending} onClick={cancel}>ยกเลิก</button>}
          {r.status === "CANCELLED" && <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => go(() => setStatus(r.id, "NEW", "เปิดใหม่"), "เปิดใหม่แล้ว")}>เปิดใหม่</button>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* ลูกค้า */}
        <section className="sec">
          <h4>👤 ลูกค้า {r.lang === "en" && <span className="chip">🇬🇧 ตอบเป็นอังกฤษ</span>}{r.company && <span className="chip chip-purple ml-auto">บริษัท · วางบิลได้</span>}</h4>
          <div className="kv grid grid-cols-2 gap-x-3.5 gap-y-2 text-[13.5px]">
            <div><span className="k">ชื่อ</span><span className="v">{r.customerName}</span></div>
            <div><span className="k">เบอร์</span><span className="v">{r.phone}</span></div>
            {r.company && <div className="col-span-2"><span className="k">บริษัท</span><span className="v">{r.company}</span></div>}
            <div><span className="k">สะดวกทาง</span><span className="v">{CHANNEL[r.contactChannel]}{r.lineId ? ` · ${r.lineId}` : ""}</span></div>
            {r.email && <div><span className="k">อีเมล</span><span className="v"><a className="text-teal-deep" href={`mailto:${r.email}`}>{r.email}</a></span></div>}
            <div><span className="k">LINE</span><span className="v">{r.lineUserId ? <span className="text-[#06A047]">✓ ผูกแชทแล้ว ({ago(r.lineLinkedAt!, now)}ที่แล้ว)</span> : <span className="text-ink-faint">ยังไม่ทักมา — โทร/แอดเอง</span>}</span></div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <a className="btn btn-soft btn-sm" href={`tel:${r.phone}`}>📞 โทร</a>
            {(r.contactChannel === "WHATSAPP" || r.lang === "en") && <a className="btn btn-sm !bg-[#E5F9EC] !text-[#06A047]" href={`https://wa.me/${r.phone.replace(/[^\d]/g, "").replace(/^0/, "66")}`} target="_blank" rel="noopener">💬 WhatsApp</a>}
            {r.email && <a className="btn btn-ghost btn-sm" href={`mailto:${r.email}?subject=${encodeURIComponent(`#${r.code} Phuket Transfer Hub`)}`}>✉️ อีเมล</a>}
            <button className="btn btn-ghost btn-sm" onClick={() => copy(r.code, `คัดลอก ${r.code}`)}>คัดลอกเลข</button>
            <button className="btn btn-ghost btn-sm" onClick={() => copy(r.phone, "คัดลอกเบอร์แล้ว")}>คัดลอกเบอร์</button>
          </div>
        </section>

        {/* การเดินทาง */}
        <section className="sec">
          <h4>🧭 การเดินทาง</h4>
          <div className="kv grid grid-cols-2 gap-x-3.5 gap-y-2 text-[13.5px]">
            <div><span className="k">รถ</span><span className="v">{VEHICLES[r.vehicleType].name}{r.vehicleCount > 1 ? ` × ${r.vehicleCount} คัน` : ""}</span></div>
            <div><span className="k">รูปแบบ</span><span className="v">{SERVICES[r.serviceType].name}{charter ? ` (8 ชม. OT ${r.otRate}/ชม. ${r.fuelIncluded ? "รวมน้ำมัน" : "น้ำมันแยก"})` : ""}</span></div>
            <div><span className="k">วัน-เวลา</span><span className="v">{thDate(r.pickupDate)} {r.pickupTime}{r.roundTrip && r.returnDate ? <><br />กลับ {thDate(r.returnDate)} {r.returnTime}</> : null}{r.serviceType === "MULTI_DAY" ? ` · ${r.days} วัน` : ""}</span></div>
            <div><span className="k">ผู้โดยสาร</span><span className="v">{r.passengers} คน · กระเป๋า {r.luggage} ใบ{overCap && <span className="text-coral-deep"> ⚠ เกินที่นั่ง</span>}</span></div>
            <div className="col-span-2"><span className="k">เส้นทาง</span><span className="v">{routeText(r, "th")}</span></div>
            {r.flightNo && <div><span className="k">เที่ยวบิน</span><span className="v">✈️ {r.flightNo}</span></div>}
            {r.itinerary && <div className="col-span-2"><span className="k">แผนเที่ยว</span><span className="v whitespace-pre-line">{r.itinerary}</span></div>}
            {r.customerNote && <div className="col-span-2"><span className="k">หมายเหตุลูกค้า</span><span className="v text-coral-deep">📝 {r.customerNote}</span></div>}
          </div>
        </section>

        {/* รถที่จัดให้ */}
        <section className="sec">
          <h4>🚐 รถที่จัดให้ <span className="ml-auto text-xs font-normal">{candidates.length} คันตรงประเภท (เปิดใช้งาน)</span></h4>
          {candidates.length ? candidates.map((v) => (
            <button key={v.id} type="button" className={`vopt ${r.vehicleId === v.id ? "on" : ""}`} disabled={pending} onClick={() => go(() => assignVehicle(r.id, r.vehicleId === v.id ? null : v.id), r.vehicleId === v.id ? "ยกเลิกการจัดรถ" : `จัดรถ ${v.plate}`)}>
              <span className="plate">{v.plate.split(" ").slice(0, 2).join(" ")}</span>
              <span>{v.partner.name} <span className="text-sun tracking-wider">{"★".repeat(v.partner.rating)}</span>{v.model && <small className="block text-ink-faint">{v.model}</small>}</span>
              <small className="ml-auto text-ink-soft whitespace-nowrap">ทุน {charter ? `${baht(v.costDaily)}/วัน` : baht(v.costAirport)}</small>
            </button>
          )) : <div className="text-center text-ink-faint text-[12.5px] py-4 border-[1.5px] border-dashed border-line rounded-xl">ไม่มีรถประเภทนี้ในเครือข่าย — <Link href="/admin/partners" className="text-teal-deep underline">เพิ่มพาร์ทเนอร์</Link></div>}
          {r.vehicle && (
            <div className="mt-3 flex items-center gap-2 flex-wrap text-[13px] text-ink-soft">
              <span>ติดต่อพาร์ทเนอร์: <a className="text-teal-deep font-medium" href={`tel:${r.vehicle.partner.phone}`}>📞 {r.vehicle.partner.phone}</a>{r.vehicle.partner.lineId && <> · 💬 {r.vehicle.partner.lineId}</>}</span>
              {(() => { const ok = r.status === "CONFIRMED" && (r.amountPaid > 0 || r.paymentTerm === "CREDIT"); return (
              <button className={`btn btn-sm ml-auto ${ok ? "!bg-[#E5F9EC] !text-[#06A047]" : "btn-ghost"}`} disabled={pending || !ok} title={ok ? "" : "ส่งได้เมื่อสถานะ 'ยืนยันแล้ว' และรับชำระแล้ว (นโยบาย: ไม่ส่งข้อมูลคนขับก่อนชำระ)"} onClick={() => go(async () => {
                const res = await sendDriverInfo(r.id);
                if (!res.ok) throw new Error(res.error);
                if (res.sent) { toast("ส่งข้อมูลคนขับเข้าแชท LINE แล้ว", true); return; }
                await copy(res.text, "คัดลอกข้อความข้อมูลคนขับแล้ว");
                if (r.lang === "en" || r.contactChannel === "WHATSAPP") window.open(`https://wa.me/${r.phone.replace(/[^\d]/g, "").replace(/^0/, "66")}?text=${encodeURIComponent(res.text)}`, "_blank");
              })}>🚐 ส่งข้อมูลคนขับให้ลูกค้า{ok ? (r.lineUserId ? " (LINE)" : r.lang === "en" || r.contactChannel === "WHATSAPP" ? " (WhatsApp)" : " (คัดลอก)") : " 🔒 หลังยืนยัน+ชำระ"}</button>
              ); })()}
            </div>
          )}
        </section>

        {/* ราคา */}
        <section className="sec">
          <h4>💰 ราคา</h4>
          {charter ? (
            <>
              <div className="grid grid-cols-3 gap-2.5">
                <Num label="ทุนเหมา/วัน" v={cost} set={setCost} ph="2200" />
                <Num label="ขายเหมา/วัน" v={price} set={setPrice} ph="3000" />
                <Num label="OT/ชม." v={otRate} set={setOtRate} ph="300" />
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-2.5 items-end">
                <Num label="OT ที่เกิดจริง (ชม.)" v={otHours} set={setOtHours} ph="0" />
                <label className="flex items-center gap-2 text-[13px] pb-2.5 cursor-pointer"><button type="button" className={`sw sw-sm ${fuel ? "on" : ""}`} onClick={() => setFuel(!fuel)} /> {fuel ? "รวมน้ำมันในราคาเหมา" : "น้ำมันแยก จ่ายตามจริง"}</label>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <Num label="ราคาทุน (จ่ายพาร์ทเนอร์)" v={cost} set={setCost} ph="900" />
              <Num label="ราคาขาย (เสนอลูกค้า)" v={price} set={setPrice} ph="1400" />
            </div>
          )}
          <div className={`mt-2.5 rounded-[10px] px-3 py-2.5 flex justify-between items-center text-[13.5px] ${!price ? "bg-cream text-ink-faint" : margin < 0 ? "bg-coral-wash" : "bg-teal-wash"}`}>
            {price ? <><span>กำไร{charter ? `/วัน` : ""} ({Math.round((margin / price) * 100)}%){charter && days > 1 ? ` · รวม ${days} วัน ${baht(margin * days)}` : ""}</span><b className={`kanit text-lg font-semibold ${margin < 0 ? "text-coral-deep" : "text-teal-deep"}`}>{baht(margin)}</b></> : <><span>ใส่ราคาขายเพื่อดูกำไร</span><b>—</b></>}
          </div>
          <div className="flex gap-2 mt-2.5 flex-wrap">
            <button className="btn btn-teal btn-sm" disabled={pending} onClick={() => go(() => savePricing(r.id, { costPrice: cost, sellPrice: price, otRate, otHours, fuelIncluded: fuel }), "บันทึกราคาแล้ว ✓")}>บันทึกราคา</button>
            {r.sellPrice ? <button className="btn btn-sm !bg-[#E5F9EC] !text-[#06A047]" disabled={pending} onClick={() => go(async () => { const res = await sendQuoteViaLine(r.id); if (!res.ok) throw new Error(res.error); toast(res.sent ? `ส่งราคาเข้าแชท LINE แล้ว` : "ตั้งเป็นเสนอราคาแล้ว — คัดลอกข้อความราคาให้แล้ว ไปวางในแชท/อีเมล", true); if (!res.sent && res.text) await copy(res.text, "คัดลอกข้อความราคาแล้ว"); })}>{r.lineUserId ? "💬 ส่งราคาทาง LINE" : `📋 เสนอราคา + คัดลอกข้อความ${r.lang === "en" ? " (EN)" : ""}`}</button> : null}
          </div>
        </section>

        {/* ชำระเงิน */}
        <section className="sec">
          <h4>💳 ชำระเงิน</h4>
          <div className="grid grid-cols-3 gap-2.5">
            <div><label className="text-[12.5px] text-ink-soft kanit font-medium block mb-1">เงื่อนไข</label><div className="in in-sm"><select value={term} onChange={(e) => setTerm(e.target.value as PaymentTerm)}>{(Object.keys(PAYMENT_TERMS) as PaymentTerm[]).map((k) => <option key={k} value={k}>{PAYMENT_TERMS[k].name}</option>)}</select></div></div>
            <div><label className="text-[12.5px] text-ink-soft kanit font-medium block mb-1">ต้องชำระ{charter && days > 1 ? ` (รวม ${days} วัน)` : ""}</label><div className="in in-sm !bg-white"><input readOnly value={term === "CREDIT" ? "วางบิล" : baht(due)} /></div></div>
            <Num label="รับแล้ว" v={paid} set={setPaid} ph="0" />
          </div>
          {r.paidAt && <div className="text-xs text-ink-faint mt-1.5">รับครั้งแรก {thDate(r.paidAt)}</div>}
          <div className="text-xs text-ink-faint mt-1.5">เฟส 1 กรอกมือหลังเช็กสลิปใน LINE · เฟส 3 ต่อ PromptPay + อัปโหลดสลิป</div>
          <button className="btn btn-teal btn-sm mt-2.5" disabled={pending} onClick={() => go(() => savePayment(r.id, { paymentTerm: term, amountPaid: paid }), "บันทึกการชำระแล้ว ✓")}>บันทึกการชำระ</button>
        </section>

        {/* บันทึก */}
        <section className="sec">
          <h4>📝 บันทึกภายใน</h4>
          <div className="in in-sm"><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น ลูกค้าขอรถสีขาว / พาร์ทเนอร์ขอมัดจำ 500" /></div>
          <button className="btn btn-ghost btn-sm mt-2.5" disabled={pending || note === (r.adminNote ?? "")} onClick={() => go(() => saveAdminNote(r.id, note), "บันทึกแล้ว ✓")}>บันทึก</button>
        </section>

        {/* เอกสาร */}
        <DocumentsPanel requestId={r.id} documents={r.documents} total={total} amountPaid={r.amountPaid} hasPrice={!!r.sellPrice} isCompany={!!r.company} lang={r.lang} phone={r.phone} lineLinked={!!r.lineUserId} />

        {/* ค่าใช้จ่าย */}
        <ExpensesPanel requestId={r.id} expenses={r.expenses} income={r.documents.filter((d) => d.type === "RECEIPT" && !d.voidedAt).reduce((a, d) => a + d.amountPaid, 0)} partners={partners} defaultPartnerId={r.vehicle?.partnerId ?? null} defaultAmount={(r.costPrice ?? 0) * (charter ? days : 1)} slips={r.attachments} />

        {/* ไทม์ไลน์ */}
        <section className="sec md:col-span-2">
          <h4>🕓 ไทม์ไลน์</h4>
          <ul className="tl">
            {[...r.statusLogs].reverse().map((l) => (
              <li key={l.id}><div><b style={{ color: STATUSES[l.toStatus].color }}>{STATUSES[l.toStatus].name}</b> {l.note ? `— ${l.note}` : ""}<small className="block text-ink-faint text-[11.5px]">{l.actor === "customer" ? "ลูกค้า" : "แอดมิน"} · {thDate(l.createdAt)} {l.createdAt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" })}</small></div></li>
            ))}
          </ul>
          {r.cancelReason && <div className="mt-2 text-center text-coral-deep text-[12.5px] py-2.5 border-[1.5px] border-dashed border-coral-wash rounded-xl">เหตุผลยกเลิก: {r.cancelReason}</div>}
        </section>
      </div>
    </div>
  );
}

function Num({ label, v, set, ph }: { label: string; v: number; set: (n: number) => void; ph: string }) {
  return (
    <div>
      <label className="text-[12.5px] text-ink-soft kanit font-medium block mb-1">{label}</label>
      <div className="in in-sm"><input type="number" min={0} value={v || ""} onChange={(e) => set(Number(e.target.value) || 0)} placeholder={ph} /><span className="text-ink-faint text-xs">฿</span></div>
    </div>
  );
}
