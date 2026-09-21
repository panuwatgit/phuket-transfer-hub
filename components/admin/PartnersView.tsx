"use client";
import { useMemo, useState, useTransition } from "react";
import type { Partner, Vehicle, VehicleType } from "@prisma/client";
import { VEHICLES, VEHICLE_ORDER } from "@/lib/config";
import { baht } from "@/lib/format";
import { toggleVehicle, upsertPartner, upsertVehicle } from "@/app/admin/actions";
import { toast } from "./Toast";

type P = Partner & { vehicles: Vehicle[] };
type Modal = { kind: "partner"; p?: Partner } | { kind: "vehicle"; v?: Vehicle; partnerId?: number } | null;

export function PartnersView({ partners }: { partners: P[] }) {
  const [q, setQ] = useState("");
  const [tf, setTf] = useState<VehicleType | "">("");
  const [modal, setModal] = useState<Modal>(null);
  const [pending, start] = useTransition();

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return partners.map((p) => ({ ...p, vehicles: p.vehicles.filter((v) => (!tf || v.type === tf) && (!s || `${v.plate} ${v.model ?? ""} ${p.name}`.toLowerCase().includes(s))) })).filter((p) => (!tf && !s) || p.vehicles.length);
  }, [partners, q, tf]);

  return (
    <>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div><h1 className="text-2xl font-semibold">พาร์ทเนอร์ & รถ</h1><div className="text-ink-soft text-[13.5px]">เจ้าของรถ/คนขับในเครือข่าย พร้อมราคาทุนอ้างอิง</div></div>
        <div className="in in-sm md:ml-auto w-full md:w-[240px] !bg-white"><span>🔍</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ทะเบียน / ชื่อ / รุ่น" /></div>
        <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: "partner" })}>+ พาร์ทเนอร์</button>
        <button className="btn btn-teal btn-sm" onClick={() => setModal({ kind: "vehicle" })} disabled={!partners.length}>+ เพิ่มรถ</button>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {(["", ...VEHICLE_ORDER] as (VehicleType | "")[]).map((t) => <button key={t} className={`chip !px-3 !py-1.5 !text-[13px] cursor-pointer ${tf === t ? "chip-teal" : ""}`} onClick={() => setTf(t)}>{t ? VEHICLES[t].name : "ทุกประเภท"}</button>)}
      </div>

      <div className="grid lg:grid-cols-2 gap-3.5">
        {shown.map((p) => (
          <div key={p.id} className={`bg-white border border-line rounded-2xl p-4 ${p.active ? "" : "opacity-60"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-[42px] h-[42px] rounded-xl bg-sun-wash grid place-items-center kanit font-semibold text-[#8A6200]">{p.name[0]}</div>
              <div className="min-w-0"><b className="kanit font-medium text-base block truncate">{p.name}</b><small className="text-ink-soft text-[12.5px]">📞 {p.phone}{p.lineId ? ` · 💬 ${p.lineId}` : ""} · <span className="text-sun tracking-wider">{"★".repeat(p.rating)}{"☆".repeat(5 - p.rating)}</span></small></div>
              <div className="ml-auto flex gap-1.5"><a className="btn btn-soft btn-sm" href={`tel:${p.phone}`}>โทร</a><button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: "partner", p })}>แก้ไข</button></div>
            </div>
            {p.note && <div className="text-[12.5px] text-ink-soft mb-1.5">📝 {p.note}</div>}
            {p.vehicles.map((v) => (
              <div key={v.id} className={`flex items-center gap-2.5 p-2.5 border border-line rounded-xl mt-2 transition-all hover:border-teal hover:bg-cream ${v.active ? "" : "opacity-50"}`}>
                <span className="plate !text-[13px] !px-2.5 !py-1">{v.plate.split(" ").slice(0, 2).join(" ")}</span>
                <div className="flex-1 min-w-0"><b className="font-semibold text-[13.5px]">{VEHICLES[v.type].name}</b><small className="block text-ink-soft text-xs truncate">{v.model ?? "—"} · {v.plate.split(" ").pop()}</small></div>
                <div className="text-right text-xs text-ink-soft leading-tight hidden sm:block">สนามบิน <b className="block kanit font-medium text-ink text-sm">{baht(v.costAirport)}</b>รายวัน <b className="block kanit font-medium text-ink text-sm">{baht(v.costDaily)}</b></div>
                <button className="btn btn-ghost btn-sm !px-2.5" onClick={() => setModal({ kind: "vehicle", v })}>✎</button>
                <button type="button" className={`sw sw-sm ${v.active ? "on" : ""}`} title="เปิด/ปิดใช้งาน" disabled={pending} onClick={() => start(async () => { const on = await toggleVehicle(v.id); toast(`${v.plate} ${on ? "เปิดใช้งาน" : "ปิดชั่วคราว"}`); })} />
              </div>
            ))}
            {!p.vehicles.length && <div className="text-center text-ink-faint text-[12.5px] py-3 border-[1.5px] border-dashed border-line rounded-xl mt-2">ยังไม่มีรถ <button className="text-teal-deep underline" onClick={() => setModal({ kind: "vehicle", partnerId: p.id })}>เพิ่มรถ</button></div>}
          </div>
        ))}
        {!shown.length && <div className="text-center text-ink-faint py-10 border-[1.5px] border-dashed border-line rounded-2xl lg:col-span-2">ยังไม่มีพาร์ทเนอร์ — กด “+ พาร์ทเนอร์” เพื่อเริ่ม</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-ink/35 backdrop-blur-[2px] p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-[18px] p-[22px] w-full max-w-[520px] shadow-lift anim-in" onClick={(e) => e.stopPropagation()}>
            {modal.kind === "partner" ? <PartnerForm p={modal.p} onDone={() => setModal(null)} /> : <VehicleForm v={modal.v} partners={partners} partnerId={modal.partnerId} onDone={() => setModal(null)} />}
          </div>
        </div>
      )}
    </>
  );
}

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={full ? "col-span-2" : ""}><label className="text-[12.5px] text-ink-soft kanit font-medium block mb-1">{label}</label><div className="in in-sm">{children}</div></div>;
}

function PartnerForm({ p, onDone }: { p?: Partner; onDone: () => void }) {
  const [f, setF] = useState({ name: p?.name ?? "", phone: p?.phone ?? "", lineId: p?.lineId ?? "", rating: p?.rating ?? 4, note: p?.note ?? "" });
  const [pending, start] = useTransition();
  const save = () => start(async () => { const res = await upsertPartner({ id: p?.id, ...f }); if (res?.error) return toast(res.error); toast(p ? "แก้ไขพาร์ทเนอร์แล้ว ✓" : "เพิ่มพาร์ทเนอร์แล้ว ✓"); onDone(); });
  return (
    <>
      <h3 className="text-lg font-semibold mb-3.5">{p ? "แก้ไขพาร์ทเนอร์" : "เพิ่มพาร์ทเนอร์"}</h3>
      <div className="grid grid-cols-2 gap-2.5">
        <F label="ชื่อ / ชื่อเล่น"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="พี่หนุ่ม (ถลาง)" autoFocus /></F>
        <F label="เบอร์โทร"><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="08x-xxx-xxxx" /></F>
        <F label="LINE ID"><input value={f.lineId} onChange={(e) => setF({ ...f, lineId: e.target.value })} /></F>
        <F label="เรตติ้งภายใน"><select value={f.rating} onChange={(e) => setF({ ...f, rating: +e.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}</select></F>
        <F label="บันทึก (จุดเด่น / ข้อควรระวัง)" full><input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="ตรงเวลา รถใหม่ รับงานดึกได้" /></F>
      </div>
      <div className="flex justify-end gap-2 mt-4"><button className="btn btn-ghost btn-sm" onClick={onDone}>ยกเลิก</button><button className="btn btn-teal btn-sm" disabled={pending} onClick={save}>บันทึก</button></div>
    </>
  );
}

function VehicleForm({ v, partners, partnerId, onDone }: { v?: Vehicle; partners: Partner[]; partnerId?: number; onDone: () => void }) {
  const [f, setF] = useState({ partnerId: v?.partnerId ?? partnerId ?? partners[0]?.id ?? 0, type: (v?.type ?? "VAN_VIP8") as VehicleType, plate: v?.plate ?? "", model: v?.model ?? "", costAirport: v?.costAirport ?? 0, costDaily: v?.costDaily ?? 0, note: v?.note ?? "" });
  const [pending, start] = useTransition();
  const save = () => start(async () => { const res = await upsertVehicle({ id: v?.id, ...f }); if (res?.error) return toast(res.error); toast(v ? "แก้ไขรถแล้ว ✓" : "เพิ่มรถแล้ว ✓"); onDone(); });
  return (
    <>
      <h3 className="text-lg font-semibold mb-3.5">{v ? "แก้ไขรถ" : "เพิ่มรถพาร์ทเนอร์"}</h3>
      <div className="grid grid-cols-2 gap-2.5">
        <F label="พาร์ทเนอร์"><select value={f.partnerId} onChange={(e) => setF({ ...f, partnerId: +e.target.value })}>{partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></F>
        <F label="ประเภท"><select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as VehicleType })}>{VEHICLE_ORDER.map((k) => <option key={k} value={k}>{VEHICLES[k].name}</option>)}</select></F>
        <F label="ทะเบียน"><input value={f.plate} onChange={(e) => setF({ ...f, plate: e.target.value })} placeholder="ฮข 1234 ภูเก็ต" autoFocus /></F>
        <F label="ยี่ห้อ / รุ่น / ปี"><input value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} placeholder="Toyota Commuter 2023" /></F>
        <F label="ทุนสนามบิน / เที่ยว"><input type="number" value={f.costAirport || ""} onChange={(e) => setF({ ...f, costAirport: +e.target.value || 0 })} placeholder="900" /><span className="text-ink-faint text-xs">฿</span></F>
        <F label="ทุนรายวัน 8 ชม."><input type="number" value={f.costDaily || ""} onChange={(e) => setF({ ...f, costDaily: +e.target.value || 0 })} placeholder="2200" /><span className="text-ink-faint text-xs">฿</span></F>
        <F label="บันทึก" full><input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="สีขาว รถใหม่" /></F>
      </div>
      <div className="flex justify-end gap-2 mt-4"><button className="btn btn-ghost btn-sm" onClick={onDone}>ยกเลิก</button><button className="btn btn-teal btn-sm" disabled={pending} onClick={save}>บันทึก</button></div>
    </>
  );
}
