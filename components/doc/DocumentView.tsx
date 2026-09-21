import type { Document, BookingRequest } from "@prisma/client";
import { BrandMark } from "@/components/ui/BrandMark";
import { DOC_LABEL, PAYMENT_METHODS, issuer, paymentTermText, type DocItem } from "@/lib/documents";
import { baht } from "@/lib/format";
import { fmtDate, type Lang } from "@/lib/i18n";

const T = {
  th: { no: "เลขที่", date: "วันที่", issuer: "ผู้ออกเอกสาร", receiver: "ผู้รับเงิน", customer: "ลูกค้า", request: "คำขอเลขที่", desc: "รายการ", qty: "จำนวน", unit: "หน่วย", price: "ราคา/หน่วย", amount: "จำนวนเงิน", total: "รวมทั้งสิ้น", paidBefore: "รับไว้ก่อนหน้า", paidNow: "รับชำระครั้งนี้", balance: "คงเหลือ", method: "ชำระโดย", term: "เงื่อนไขชำระเงิน", valid: (d: number) => `ยืนราคา ${d} วันนับจากวันที่ออก`, taxId: "เลขประจำตัวผู้เสียภาษี", phone: "โทร", note: "หมายเหตุ", sign: "ผู้รับเงิน", signQ: "ผู้เสนอราคา", thanks: "ขอบคุณที่ใช้บริการ", notTax: "เอกสารนี้ออกในนามบุคคลธรรมดา ไม่ใช่ใบกำกับภาษี", void: "ยกเลิกแล้ว", confirm: "ยืนยันการจองได้ทาง LINE / WhatsApp พร้อมชำระตามเงื่อนไข", paidFull: "ชำระครบแล้ว" },
  en: { no: "No.", date: "Date", issuer: "Issued by", receiver: "Received by", customer: "Customer", request: "Request", desc: "Description", qty: "Qty", unit: "Unit", price: "Unit price", amount: "Amount", total: "Total", paidBefore: "Previously received", paidNow: "Received (this receipt)", balance: "Balance due", method: "Paid by", term: "Payment terms", valid: (d: number) => `Valid for ${d} days from issue date`, taxId: "Tax ID", phone: "Tel", note: "Note", sign: "Received by", signQ: "Quoted by", thanks: "Thank you for travelling with us", notTax: "Issued by an individual — this is not a tax invoice", void: "VOID", confirm: "Confirm via LINE / WhatsApp and pay as per the terms above", paidFull: "Paid in full" },
};

export function DocumentView({ doc, request }: { doc: Document; request: BookingRequest }) {
  const lang: Lang = doc.lang === "en" ? "en" : "th";
  const t = T[lang];
  const label = DOC_LABEL[doc.type][lang];
  const items = doc.items as unknown as DocItem[];
  const iss = issuer();
  const receipt = doc.type === "RECEIPT";
  const money = (n: number) => baht(n).replace("฿", "฿ ");

  return (
    <article className="doc relative bg-white text-ink mx-auto w-full max-w-[794px] min-h-[1000px] p-10 md:p-12 shadow-lift print:shadow-none print:max-w-none print:min-h-0 print:p-0 rounded-2xl print:rounded-none">
      {doc.voidedAt && <div className="absolute inset-0 grid place-items-center pointer-events-none"><span className="text-[110px] font-bold text-coral/25 -rotate-[20deg] kanit tracking-widest">{t.void}</span></div>}

      {/* header */}
      <header className="flex justify-between items-start gap-6 border-b-2 border-teal pb-5">
        <div className="flex items-center gap-3">
          <BrandMark size={56} />
          <div>
            <div className="kanit font-semibold text-xl leading-tight">Phuket Transfer <span className="text-coral">Hub</span></div>
            <div className="text-[12px] text-ink-soft">{iss.phone} · {iss.email}<br />LINE {iss.line} · WhatsApp +{iss.whatsapp}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="kanit font-semibold text-2xl text-teal-deep">{label}</div>
          {lang === "th" && <div className="text-[12px] text-ink-faint -mt-0.5">{DOC_LABEL[doc.type].en}</div>}
          <div className="text-sm mt-2"><span className="text-ink-soft">{t.no}</span> <b className="kanit">{doc.number}</b></div>
          <div className="text-sm"><span className="text-ink-soft">{t.date}</span> {fmtDate(doc.issuedAt, lang)}</div>
        </div>
      </header>

      {/* parties */}
      <section className="grid grid-cols-2 gap-6 py-5 text-[13.5px]">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-ink-faint kanit mb-1">{receipt ? t.receiver : t.issuer}</div>
          <div className="font-semibold">{iss.name}</div>
          <div className="text-ink-soft">{iss.brand}{iss.address ? ` · ${iss.address}` : ""}</div>
          {doc.showTaxId && iss.taxId && <div className="text-ink-soft">{t.taxId}: {iss.taxId}</div>}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-ink-faint kanit mb-1">{t.customer}</div>
          <div className="font-semibold">{doc.customerCompany ? doc.customerCompany : doc.customerName}</div>
          {doc.customerCompany && <div className="text-ink-soft">{doc.customerName}</div>}
          <div className="text-ink-soft">{t.phone} {doc.customerPhone}</div>
          {doc.customerAddress && <div className="text-ink-soft">{doc.customerAddress}</div>}
          {doc.customerTaxId && <div className="text-ink-soft">{t.taxId}: {doc.customerTaxId}</div>}
          <div className="text-ink-faint text-[12px] mt-1">{t.request} #{request.code}</div>
        </div>
      </section>

      {/* items */}
      <table className="w-full text-[13.5px] border-collapse">
        <thead>
          <tr className="bg-cream kanit text-[12.5px] text-ink-soft">
            <th className="text-left px-3 py-2 rounded-l-lg font-medium">{t.desc}</th>
            <th className="text-right px-2 py-2 font-medium w-[70px]">{t.qty}</th>
            <th className="text-left px-2 py-2 font-medium w-[60px]">{t.unit}</th>
            <th className="text-right px-2 py-2 font-medium w-[110px]">{t.price}</th>
            <th className="text-right px-3 py-2 rounded-r-lg font-medium w-[120px]">{t.amount}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-b border-line align-top">
              <td className="px-3 py-3 whitespace-pre-line">{it.desc}</td>
              <td className="px-2 py-3 text-right">{it.qty}</td>
              <td className="px-2 py-3">{it.unit}</td>
              <td className="px-2 py-3 text-right">{money(it.unitPrice)}</td>
              <td className="px-3 py-3 text-right kanit font-medium">{money(it.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* totals */}
      <section className="flex justify-end mt-4">
        <div className="w-[320px] text-[13.5px]">
          <Row k={t.total} v={money(doc.total)} strong />
          {receipt && doc.paidBefore > 0 && <Row k={t.paidBefore} v={money(doc.paidBefore)} muted />}
          {receipt && <Row k={t.paidNow} v={money(doc.amountPaid)} strong accent />}
          {receipt && <Row k={t.balance} v={doc.balance > 0 ? money(doc.balance) : t.paidFull} muted={doc.balance === 0} />}
        </div>
      </section>

      {/* terms / payment */}
      <section className="mt-6 text-[13px] text-ink-soft grid gap-1">
        {receipt && doc.paymentMethod && <div>{t.method}: <b className="text-ink">{PAYMENT_METHODS[doc.paymentMethod]?.[lang] ?? doc.paymentMethod}</b></div>}
        {!receipt && doc.paymentTerm && <div>{t.term}: <b className="text-ink">{paymentTermText(doc.paymentTerm, lang)}</b></div>}
        {!receipt && doc.validDays && <div>{t.valid(doc.validDays)}</div>}
        {!receipt && <div>{t.confirm}</div>}
        {doc.note && <div>{t.note}: {doc.note}</div>}
      </section>

      {/* signature */}
      <footer className="mt-12 flex justify-between items-end">
        <div className="text-[11.5px] text-ink-faint max-w-[300px]">{t.notTax}<br />{t.thanks} 🙏</div>
        <div className="text-center text-[13px]">
          <div className="w-[220px] border-b border-ink-faint mb-1.5 h-10" />
          <div className="font-medium">{iss.name}</div>
          <div className="text-ink-faint text-[12px]">{receipt ? t.sign : t.signQ}</div>
        </div>
      </footer>
    </article>
  );
}

function Row({ k, v, strong, muted, accent }: { k: string; v: string; strong?: boolean; muted?: boolean; accent?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 ${strong ? "border-t border-line mt-1 pt-2" : ""} ${muted ? "text-ink-faint" : ""}`}>
      <span>{k}</span>
      <span className={`kanit ${strong ? "font-semibold text-base" : ""} ${accent ? "text-teal-deep" : ""}`}>{v}</span>
    </div>
  );
}
