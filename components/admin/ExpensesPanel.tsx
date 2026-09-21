"use client";
import { useRef, useState, useTransition } from "react";
import type { Attachment, Expense, Partner } from "@prisma/client";
import { addExpense, addRequestAttachment, deleteAttachment, deleteExpense } from "@/app/admin/actions";
import { EXPENSE_CATEGORIES, EXPENSE_ORDER, METHODS } from "@/lib/expenses";
import { baht, thDate } from "@/lib/format";
import { toast } from "./Toast";

type Exp = Expense & { attachments: Pick<Attachment, "id" | "filename" | "mime" | "size">[] };
type Props = {
  requestId?: number; // ไม่มี = รายจ่ายทั่วไป
  expenses: Exp[];
  income?: number; // รับจริง (จากใบเสร็จ) — เฉพาะหน้า request
  partners: Pick<Partner, "id" | "name">[];
  defaultPartnerId?: number | null;
  defaultAmount?: number;
  slips?: Pick<Attachment, "id" | "filename" | "mime" | "size">[]; // สลิปลูกค้าโอนเข้า
  compact?: boolean;
};

export function ExpensesPanel({ requestId, expenses, income, partners, defaultPartnerId, defaultAmount, slips, compact }: Props) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const slipRef = useRef<HTMLFormElement>(null);
  const total = expenses.reduce((a, e) => a + e.amount, 0);
  const today = new Date().toISOString().slice(0, 10);
  const net = income !== undefined ? income - total : undefined;

  const submit = (fd: FormData) => start(async () => {
    try {
      const res = await addExpense(fd);
      if (!res.ok) return toast(res.error);
      toast("บันทึกรายจ่ายแล้ว ✓"); setOpen(false); formRef.current?.reset();
    } catch (e) { toast("ผิดพลาด: " + (e as Error).message); }
  });
  const submitSlip = (fd: FormData) => start(async () => {
    try { const res = await addRequestAttachment(fd); if (!res.ok) return toast(res.error); toast("แนบสลิปแล้ว ✓"); slipRef.current?.reset(); }
    catch (e) { toast("ผิดพลาด: " + (e as Error).message); }
  });

  return (
    <section className={`sec ${compact ? "" : "md:col-span-2"}`}>
      <h4>💸 {requestId ? "ค่าใช้จ่ายของงานนี้" : "รายจ่ายทั่วไป"} <span className="ml-auto text-xs font-normal">รวม {baht(total)}</span></h4>

      {income !== undefined && (
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <Stat label="รับจริง (ใบเสร็จ)" v={baht(income)} cls="text-teal-deep" />
          <Stat label="จ่ายจริง" v={baht(total)} cls="text-coral-deep" />
          <Stat label="กำไรสุทธิ" v={baht(net!)} cls={net! >= 0 ? "text-ink" : "text-coral-deep"} strong />
        </div>
      )}

      {expenses.length ? (
        <div className="grid gap-1.5 mb-3">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-2.5 text-[13px] px-3 py-2 rounded-xl border border-line flex-wrap">
              <span className="chip">{EXPENSE_CATEGORIES[e.category].icon} {EXPENSE_CATEGORIES[e.category].name}</span>
              <span className="text-ink-faint">{thDate(e.paidAt, false)}</span>
              {e.payee && <span>→ {e.payee}</span>}
              {e.method && <span className="text-ink-faint">· {METHODS[e.method] ?? e.method}</span>}
              {e.note && <span className="text-ink-soft">· {e.note}</span>}
              <span className="ml-auto kanit font-medium text-coral-deep">−{baht(e.amount)}</span>
              {e.attachments.map((a) => <a key={a.id} className="chip chip-teal" href={`/api/files/${a.id}`} target="_blank" rel="noopener" title={a.filename}>📎 {a.mime.startsWith("image") ? "สลิป" : "ไฟล์"}</a>)}
              <button className="text-ink-faint hover:text-coral-deep text-xs" disabled={pending} onClick={() => { if (confirm("ลบรายจ่ายนี้?")) start(() => deleteExpense(e.id)); }} title="ลบ">✕</button>
            </div>
          ))}
        </div>
      ) : <div className="text-[12.5px] text-ink-faint mb-3">ยังไม่มีรายจ่าย</div>}

      {!open ? (
        <div className="flex gap-2 flex-wrap items-center">
          <button className="btn btn-teal btn-sm" onClick={() => setOpen(true)}>+ บันทึกรายจ่าย</button>
          {requestId && (
            <form ref={slipRef} action={submitSlip} className="flex items-center gap-2 text-[12.5px] text-ink-soft ml-auto">
              <input type="hidden" name="requestId" value={requestId} />
              <label className="btn btn-ghost btn-sm cursor-pointer">📎 แนบสลิปลูกค้าโอน<input type="file" name="files" accept="image/*,.pdf" multiple className="hidden" onChange={(e) => e.currentTarget.form?.requestSubmit()} /></label>
              {slips?.map((a) => <a key={a.id} className="chip chip-teal" href={`/api/files/${a.id}`} target="_blank" rel="noopener">🧾 {a.filename.slice(0, 18)}</a>)}
              {slips?.length ? <button type="button" className="text-ink-faint hover:text-coral-deep" onClick={() => { const last = slips[slips.length - 1]; if (confirm(`ลบ ${last.filename}?`)) start(() => deleteAttachment(last.id)); }} title="ลบสลิปล่าสุด">✕</button> : null}
            </form>
          )}
        </div>
      ) : (
        <form ref={formRef} action={submit} className="p-3.5 rounded-xl bg-cream border border-line anim-in">
          {requestId && <input type="hidden" name="requestId" value={requestId} />}
          <div className="grid sm:grid-cols-4 gap-2.5">
            <F label="หมวด"><select name="category" defaultValue={requestId ? "PARTNER_PAYOUT" : "FUEL"}>{EXPENSE_ORDER.map((k) => <option key={k} value={k}>{EXPENSE_CATEGORIES[k].icon} {EXPENSE_CATEGORIES[k].name}</option>)}</select></F>
            <F label="จำนวนเงิน"><input name="amount" type="number" min={1} defaultValue={defaultAmount || ""} placeholder="0" required /><span className="text-ink-faint text-xs">฿</span></F>
            <F label="วันที่จ่าย"><input name="paidAt" type="date" defaultValue={today} required /></F>
            <F label="จ่ายโดย"><select name="method" defaultValue="TRANSFER">{Object.entries(METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></F>
            <F label="จ่ายให้ (พาร์ทเนอร์)"><select name="partnerId" defaultValue={defaultPartnerId ?? ""}><option value="">— ไม่ระบุ —</option>{partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></F>
            <F label="หรือชื่อผู้รับเงิน"><input name="payee" placeholder="เช่น ปั๊ม ปตท. / คุณสมชาย" /></F>
            <F label="บันทึก"><input name="note" placeholder="เช่น ค่ารถเที่ยวไป-กลับ" /></F>
            <F label="แนบสลิป/ใบเสร็จ"><input name="files" type="file" accept="image/*,.pdf" multiple className="text-xs" /></F>
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>ยกเลิก</button>
            <button className="btn btn-teal btn-sm" disabled={pending}>{pending ? "กำลังบันทึก…" : "บันทึก"}</button>
          </div>
        </form>
      )}
    </section>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[12.5px] text-ink-soft kanit font-medium block mb-1">{label}</label><div className="in in-sm !bg-white">{children}</div></div>;
}
function Stat({ label, v, cls, strong }: { label: string; v: string; cls: string; strong?: boolean }) {
  return <div className="rounded-xl bg-cream px-2 py-2"><div className="text-[11px] text-ink-faint">{label}</div><div className={`kanit ${strong ? "text-lg font-semibold" : "font-medium"} ${cls}`}>{v}</div></div>;
}
