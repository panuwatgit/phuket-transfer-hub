"use client";
import { useMemo, useState, useTransition } from "react";
import type { BookingRequest, RequestStatus } from "@prisma/client";
import { STATUSES, STATUS_ORDER } from "@/lib/config";
import { baht, minutesSince } from "@/lib/format";
import { setStatus } from "@/app/admin/actions";
import { RequestCard } from "./RequestCard";
import { toast } from "./Toast";

export function Board({ requests, now }: { requests: BookingRequest[]; now: Date }) {
  const [q, setQ] = useState("");
  const [over, setOver] = useState<RequestStatus | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [local, setLocal] = useState(requests);
  const [, start] = useTransition();
  // props เปลี่ยน (หลัง revalidate) → sync
  const [prev, setPrev] = useState(requests);
  if (prev !== requests) { setPrev(requests); setLocal(requests); }

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? local.filter((r) => `${r.code} ${r.customerName} ${r.phone} ${r.pickupPlace} ${r.dropoffPlace ?? ""}`.toLowerCase().includes(s)) : local;
  }, [local, q]);

  const news = local.filter((r) => r.status === "NEW");
  const late = news.filter((r) => minutesSince(r.createdAt, now) > 30).length;
  const confirmed = local.filter((r) => r.status === "CONFIRMED").length;
  const month = now.getMonth(), year = now.getFullYear();
  const profit = local.filter((r) => ["CONFIRMED", "COMPLETED"].includes(r.status) && r.pickupDate.getMonth() === month && r.pickupDate.getFullYear() === year).reduce((a, r) => a + ((r.sellPrice ?? 0) - (r.costPrice ?? 0)) * (r.days ?? 1) + r.otHours * r.otRate, 0);

  function drop(status: RequestStatus, e: React.DragEvent) {
    e.preventDefault(); setOver(null);
    const id = Number(e.dataTransfer.getData("text/plain"));
    const r = local.find((x) => x.id === id);
    if (!r || r.status === status) return;
    let note: string | undefined;
    if (status === "CANCELLED") { const v = window.prompt("เหตุผลที่ยกเลิก (เก็บไว้ดูว่าเสียลูกค้าเพราะอะไร)", "ราคาไม่โดน"); if (v === null) return; note = v || "ไม่ระบุ"; }
    setLocal((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
    start(async () => { await setStatus(id, status, note ?? "ลากบนกระดาน"); toast(`${r.code} → ${STATUSES[status].name}`); });
  }

  return (
    <>
      <div className="flex items-center gap-3.5 mb-4 flex-wrap">
        <div><h1 className="text-2xl font-semibold">กระดาน request</h1><div className="text-ink-soft text-[13.5px]">ลากการ์ดเพื่อเปลี่ยนสถานะ · คลิกเพื่อดูรายละเอียด</div></div>
        <div className="in in-sm md:ml-auto w-full md:w-[280px] !bg-white"><span>🔍</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหา เลข / ชื่อ / เบอร์ / สถานที่" /></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[["🔔", "bg-coral-wash", news.length, "รอตอบ (ใหม่)"], ["⏱️", "bg-sun-wash", late, "ตอบช้าเกิน 30 นาที"], ["🚐", "bg-teal-wash", confirmed, "งานที่ยืนยันแล้ว"], ["💰", "bg-purple-wash", baht(profit), "กำไรเดือนนี้ (ยืนยัน+จบ)"]].map(([ic, bg, v, l]) => (
          <div key={l as string} className="bg-white border border-line rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <div className={`w-[42px] h-[42px] rounded-xl grid place-items-center text-xl ${bg}`}>{ic}</div>
            <div><b className="kanit text-2xl font-semibold leading-none block">{v}</b><span className="text-[12.5px] text-ink-soft">{l}</span></div>
          </div>
        ))}
      </div>
      <div className="grid grid-flow-col auto-cols-[82vw] md:auto-cols-[minmax(232px,1fr)] gap-3 overflow-x-auto pb-2.5 items-start">
        {STATUS_ORDER.map((s) => {
          const items = list.filter((r) => r.status === s);
          return (
            <div key={s} className={`col ${over === s ? "over" : ""}`} onDragOver={(e) => { e.preventDefault(); setOver(s); }} onDragLeave={() => setOver(null)} onDrop={(e) => drop(s, e)}>
              <h3 className="text-sm font-medium flex items-center gap-2 px-1.5 pb-2.5"><span className="w-[9px] h-[9px] rounded-full" style={{ background: STATUSES[s].color }} />{STATUSES[s].name}<span className="ml-auto bg-white border border-line text-xs px-2 rounded-full font-[family-name:var(--font-body)] text-ink-soft">{items.length}</span></h3>
              <div className="flex flex-col gap-2 min-h-[60px]">
                {items.length ? items.map((r) => <RequestCard key={r.id} r={r} now={now} dragging={draggingId === r.id} onDragStart={() => setDraggingId(r.id)} onDragEnd={() => setDraggingId(null)} />) : <div className="text-center text-ink-faint text-[12.5px] py-[18px] px-1.5 border-[1.5px] border-dashed border-line rounded-xl">ว่าง</div>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
