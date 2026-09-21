"use client";
import Link from "next/link";
import type { BookingRequest } from "@prisma/client";
import { SERVICES, VEHICLES } from "@/lib/config";
import { ago, baht, minutesSince, thDate } from "@/lib/format";
import { routeText } from "@/lib/request-view";

export function RequestCard({ r, now, draggable = true, onDragStart, onDragEnd, dragging }: { r: BookingRequest; now: Date; draggable?: boolean; onDragStart?: () => void; onDragEnd?: () => void; dragging?: boolean }) {
  const isNew = r.status === "NEW";
  const late = isNew && minutesSince(r.createdAt, now) > 30;
  return (
    <Link
      href={`/admin/requests/${r.id}`}
      className={`rcard-admin ${isNew ? "is-new" : ""} ${dragging ? "dragging" : ""}`}
      draggable={draggable}
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(r.id)); e.dataTransfer.effectAllowed = "move"; onDragStart?.(); }}
      onDragEnd={onDragEnd}
    >
      <span className={`float-right mr-3.5 text-[11.5px] ${late ? "text-coral-deep font-semibold" : "text-ink-faint"}`}>{isNew ? `รอ ${ago(r.createdAt, now)}` : `${ago(r.createdAt, now)}ที่แล้ว`}</span>
      <span className="kanit font-medium text-[13px] text-ink-soft">{r.code}</span>
      <div className="flex gap-1.5 flex-wrap my-1.5">
        <span className="chip chip-teal">{VEHICLES[r.vehicleType].short}{r.vehicleCount > 1 ? ` ×${r.vehicleCount}` : ""}</span>
        <span className="chip chip-sun">{SERVICES[r.serviceType].short}</span>
        {r.lang === "en" && <span className="chip">🇬🇧 EN</span>}
        {r.company && <span className="chip chip-purple">บริษัท</span>}
        {r.lineUserId && <span className="chip chip-line">💬 LINE</span>}
      </div>
      <div className="kanit font-medium text-[14.5px]">{thDate(r.pickupDate, false)} · {r.pickupTime}</div>
      <div className="text-[12.5px] text-ink-soft truncate">{routeText(r, "th")}</div>
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-line text-[12.5px]">
        <span>👤 {r.customerName}</span>
        {r.sellPrice ? <span className="kanit font-medium text-teal-deep">{baht(r.sellPrice)}<span className="text-[11px] text-ink-faint font-[family-name:var(--font-body)]"> กำไร {baht(r.sellPrice - (r.costPrice ?? 0))}</span></span> : <span className="text-[11px] text-ink-faint">ยังไม่มีราคา</span>}
      </div>
    </Link>
  );
}
