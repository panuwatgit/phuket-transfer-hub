"use client";
import { useState, useTransition } from "react";
import type { Document, DocumentType } from "@prisma/client";
import { issueDocument, sendDocumentLink, voidDocument } from "@/app/admin/actions";
import { DOC_LABEL, PAYMENT_METHODS } from "@/lib/documents";
import { baht, thDate } from "@/lib/format";
import { copy, toast } from "./Toast";

type Props = { requestId: number; documents: Document[]; total: number; amountPaid: number; hasPrice: boolean; isCompany: boolean; lang: string; phone: string; lineLinked: boolean };

export function DocumentsPanel({ requestId, documents, total, amountPaid, hasPrice, isCompany, lang, phone, lineLinked }: Props) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState<DocumentType | null>(null);
  const receipted = documents.filter((d) => d.type === "RECEIPT" && !d.voidedAt).reduce((a, d) => a + d.amountPaid, 0);
  const [amt, setAmt] = useState(Math.max(0, amountPaid - receipted) || Math.max(0, total - receipted));
  const [method, setMethod] = useState("TRANSFER");
  const [showTax, setShowTax] = useState(isCompany);
  const [custTax, setCustTax] = useState("");
  const [custAddr, setCustAddr] = useState("");
  const [note, setNote] = useState("");
  const [validDays, setValidDays] = useState(7);

  const run = (fn: () => Promise<unknown>) => start(async () => { try { await fn(); } catch (e) { toast("ผิดพลาด: " + (e as Error).message); } });

  const issue = () => run(async () => {
    const res = await issueDocument(requestId, form!, { amountPaid: amt, paymentMethod: method, showTaxId: showTax, customerTaxId: custTax, customerAddress: custAddr, note, validDays });
    if (!res.ok) { toast(res.error); return; }
    toast(`ออก${DOC_LABEL[form!].short} ${res.number} แล้ว ✓`);
    setForm(null);
    window.open(res.url, "_blank");
  });

  const send = (d: Document) => run(async () => {
    const res = await sendDocumentLink(d.id);
    if (res.sent) { toast("ส่งลิงก์เข้าแชท LINE แล้ว", true); return; }
    await copy(res.text, "คัดลอกข้อความ + ลิงก์แล้ว");
    if (lang === "en") window.open(`https://wa.me/${phone.replace(/[^\d]/g, "").replace(/^0/, "66")}?text=${encodeURIComponent(res.text)}`, "_blank");
  });

  return (
    <section className="sec md:col-span-2">
      <h4>📄 เอกสาร <span className="ml-auto text-xs font-normal">ใบเสนอราคา / ใบเสร็จ · ภาษา{lang === "en" ? "อังกฤษ" : "ไทย"}ตามลูกค้า</span></h4>

      {documents.length ? (
        <div className="grid gap-1.5 mb-3">
          {documents.map((d) => (
            <div key={d.id} className={`flex items-center gap-2.5 text-[13px] px-3 py-2 rounded-xl border border-line ${d.voidedAt ? "opacity-50 line-through" : ""}`}>
              <span className={`chip ${d.type === "RECEIPT" ? "chip-teal" : "chip-purple"}`}>{DOC_LABEL[d.type].short}</span>
              <b className="kanit">{d.number}</b>
              <span className="text-ink-faint">{thDate(d.issuedAt)}</span>
              <span className="ml-auto kanit font-medium">{d.type === "RECEIPT" ? baht(d.amountPaid) : baht(d.total)}</span>
              {!d.voidedAt && <>
                <a className="btn btn-ghost btn-sm !px-2.5" href={`/doc/${d.token}`} target="_blank" rel="noopener">เปิด</a>
                <button className="btn btn-sm !px-2.5 !bg-[#E5F9EC] !text-[#06A047]" disabled={pending} onClick={() => send(d)}>{lineLinked ? "💬 ส่ง LINE" : lang === "en" ? "💬 WhatsApp" : "คัดลอกลิงก์"}</button>
                <button className="btn btn-ghost btn-sm !px-2.5 text-coral-deep" disabled={pending} onClick={() => { if (confirm(`ยกเลิก ${d.number}?`)) run(() => voidDocument(d.id)); }} title="ยกเลิกเอกสาร">✕</button>
              </>}
            </div>
          ))}
        </div>
      ) : <div className="text-[12.5px] text-ink-faint mb-3">ยังไม่มีเอกสาร</div>}

      {!hasPrice && <div className="text-[12.5px] text-ink-faint">ตั้งราคาขายก่อน จึงออกเอกสารได้</div>}
      {hasPrice && !form && (
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-ghost btn-sm" onClick={() => setForm("QUOTE")}>📝 ออกใบเสนอราคา</button>
          <button className="btn btn-teal btn-sm" onClick={() => setForm("RECEIPT")}>🧾 ออกใบเสร็จ{receipted > 0 ? ` (รับแล้ว ${baht(receipted)} / ${baht(total)})` : ""}</button>
        </div>
      )}

      {form && (
        <div className="mt-2 p-3.5 rounded-xl bg-cream border border-line anim-in">
          <div className="kanit font-medium mb-2.5">{form === "RECEIPT" ? "🧾 ออกใบเสร็จรับเงิน" : "📝 ออกใบเสนอราคา"} <span className="text-ink-faint font-normal text-xs">ยอดงาน {baht(total)}</span></div>
          <div className="grid sm:grid-cols-3 gap-2.5">
            {form === "RECEIPT" ? (
              <>
                <F label="ยอดรับครั้งนี้"><input type="number" min={1} value={amt || ""} onChange={(e) => setAmt(Number(e.target.value) || 0)} /><span className="text-ink-faint text-xs">฿</span></F>
                <F label="ชำระโดย"><select value={method} onChange={(e) => setMethod(e.target.value)}>{Object.entries(PAYMENT_METHODS).map(([k, v]) => <option key={k} value={k}>{v.th}</option>)}</select></F>
              </>
            ) : (
              <F label="ยืนราคา (วัน)"><input type="number" min={1} value={validDays} onChange={(e) => setValidDays(Number(e.target.value) || 7)} /></F>
            )}
            <label className="flex items-center gap-2 text-[13px] self-end pb-2 cursor-pointer"><button type="button" className={`sw sw-sm ${showTax ? "on" : ""}`} onClick={() => setShowTax(!showTax)} /> แสดงเลขผู้เสียภาษีของเรา</label>
            {showTax && <>
              <F label="เลขผู้เสียภาษีลูกค้า (ถ้ามี)"><input value={custTax} onChange={(e) => setCustTax(e.target.value)} placeholder="0-1055-xxxxx-xx-x" /></F>
              <F label="ที่อยู่ลูกค้า (ถ้ามี)"><input value={custAddr} onChange={(e) => setCustAddr(e.target.value)} placeholder="สำหรับลูกค้าองค์กร" /></F>
            </>}
            <F label="หมายเหตุบนเอกสาร"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น มัดจำงวดที่ 1" /></F>
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <button className="btn btn-ghost btn-sm" onClick={() => setForm(null)}>ยกเลิก</button>
            <button className="btn btn-teal btn-sm" disabled={pending} onClick={issue}>{pending ? "กำลังออก…" : "ออกเอกสาร + เปิดดู"}</button>
          </div>
        </div>
      )}
    </section>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[12.5px] text-ink-soft kanit font-medium block mb-1">{label}</label><div className="in in-sm !bg-white">{children}</div></div>;
}
