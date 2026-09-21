"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PaymentTerm, RequestStatus, VehicleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { STATUS_ORDER, VEHICLES } from "@/lib/config";
import { pushToUser } from "@/lib/line";
import { baht } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { routeText as routeTextFor } from "@/lib/request-view";

// ── auth ───────────────────────────────────────────────────────────────────
export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  if (!checkPassword(pw)) return { error: "รหัสผ่านไม่ถูกต้อง" };
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

function refresh(id?: number) {
  revalidatePath("/admin");
  revalidatePath("/admin/list");
  if (id) revalidatePath(`/admin/requests/${id}`);
}

// ── request status ─────────────────────────────────────────────────────────
export async function setStatus(id: number, to: RequestStatus, note?: string) {
  await requireAdmin();
  if (!STATUS_ORDER.includes(to)) throw new Error("bad status");
  const r = await prisma.bookingRequest.findUniqueOrThrow({ where: { id } });
  if (r.status === to) return;
  await prisma.bookingRequest.update({
    where: { id },
    data: {
      status: to,
      cancelReason: to === "CANCELLED" ? note || r.cancelReason || "ไม่ระบุ" : r.cancelReason,
      statusLogs: { create: { fromStatus: r.status, toStatus: to, note: note || null } },
    },
  });
  refresh(id);
}

// ── sourcing ───────────────────────────────────────────────────────────────
export async function assignVehicle(id: number, vehicleId: number | null) {
  await requireAdmin();
  const r = await prisma.bookingRequest.findUniqueOrThrow({ where: { id } });
  const v = vehicleId ? await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId }, include: { partner: true } }) : null;
  const charter = r.serviceType === "DAILY_CHARTER" || r.serviceType === "MULTI_DAY";
  const cost = v ? (charter ? v.costDaily : v.costAirport) : null;
  await prisma.bookingRequest.update({
    where: { id },
    data: {
      vehicleId,
      costPrice: r.costPrice ?? cost ?? undefined,
      status: r.status === "NEW" && v ? "SOURCING" : r.status,
      statusLogs: {
        create: v
          ? { fromStatus: r.status, toStatus: r.status === "NEW" ? "SOURCING" : r.status, note: `เลือกรถ ${v.plate} (${v.partner.name})` }
          : { fromStatus: r.status, toStatus: r.status, note: "ยกเลิกการจัดรถ" },
      },
    },
  });
  refresh(id);
}

// ── pricing / payment / note ───────────────────────────────────────────────
export async function savePricing(id: number, data: { costPrice: number; sellPrice: number; otRate?: number; otHours?: number; fuelIncluded?: boolean }) {
  await requireAdmin();
  const r = await prisma.bookingRequest.findUniqueOrThrow({ where: { id } });
  await prisma.bookingRequest.update({
    where: { id },
    data: {
      costPrice: data.costPrice || null,
      sellPrice: data.sellPrice || null,
      otRate: data.otRate ?? r.otRate,
      otHours: data.otHours ?? r.otHours,
      fuelIncluded: data.fuelIncluded ?? r.fuelIncluded,
      statusLogs: { create: { fromStatus: r.status, toStatus: r.status, note: `ตั้งราคา ทุน ${baht(data.costPrice)} ขาย ${baht(data.sellPrice)}` } },
    },
  });
  refresh(id);
}

/** ส่งราคาเข้าแชท LINE ลูกค้า (ถ้าผูกแล้ว) + เปลี่ยนเป็น QUOTED */
export async function sendQuoteViaLine(id: number) {
  await requireAdmin();
  const r = await prisma.bookingRequest.findUniqueOrThrow({ where: { id } });
  if (!r.sellPrice) return { ok: false, error: "ใส่ราคาขายก่อน" };
  const charter = r.serviceType === "DAILY_CHARTER" || r.serviceType === "MULTI_DAY";
  const text = (r.lang === "en"
    ? [
        `Hi ${r.customerName}, this is Phuket Transfer Hub 🙏`,
        `Request #${r.code} — ${getDict("en").vehicle[r.vehicleType].name}${r.vehicleCount > 1 ? ` × ${r.vehicleCount} cars` : ""}`,
        charter
          ? `Day rate ${baht(r.sellPrice)}/day (8 hrs, overtime ${baht(r.otRate)}/hr, fuel ${r.fuelIncluded ? "included" : "not included"})`
          : `Price ${baht(r.sellPrice)} per trip (fuel included)`,
        `Reply "confirm" and we'll send payment details.`,
      ]
    : [
        `สวัสดีคุณ${r.customerName} จาก Phuket Transfer Hub ครับ 🙏`,
        `คำขอ #${r.code} — ${VEHICLES[r.vehicleType].name}${r.vehicleCount > 1 ? ` × ${r.vehicleCount} คัน` : ""}`,
        charter
          ? `ราคาเหมา ${baht(r.sellPrice)}/วัน (8 ชม. เกินคิด OT ${baht(r.otRate)}/ชม. ${r.fuelIncluded ? "รวมน้ำมัน" : "ไม่รวมน้ำมัน"})`
          : `ราคา ${baht(r.sellPrice)} ต่อเที่ยว (รวมน้ำมัน)`,
        `ถ้าตกลง แจ้ง "ยืนยัน" ได้เลย เดี๋ยวส่งรายละเอียดการชำระเงินให้ครับ`,
      ]).join("\n");
  const sent = r.lineUserId ? await pushToUser(r.lineUserId, text) : false;
  await prisma.bookingRequest.update({
    where: { id },
    data: {
      status: r.status === "NEW" || r.status === "SOURCING" ? "QUOTED" : r.status,
      statusLogs: { create: { fromStatus: r.status, toStatus: "QUOTED", note: sent ? `ส่งราคา ${baht(r.sellPrice)} ทาง LINE` : `ตั้งเป็นเสนอราคาแล้ว (${baht(r.sellPrice)}) — ${r.lineUserId ? "LINE ส่งไม่สำเร็จ" : "ลูกค้ายังไม่ผูก LINE ส่งเอง"}` } },
    },
  });
  refresh(id);
  return { ok: true, sent, text };
}

export async function savePayment(id: number, data: { paymentTerm: PaymentTerm; amountPaid: number }) {
  await requireAdmin();
  const r = await prisma.bookingRequest.findUniqueOrThrow({ where: { id } });
  await prisma.bookingRequest.update({
    where: { id },
    data: {
      paymentTerm: data.paymentTerm,
      amountPaid: data.amountPaid,
      paidAt: data.amountPaid > 0 && !r.paidAt ? new Date() : data.amountPaid === 0 ? null : r.paidAt,
      ...(data.amountPaid !== r.amountPaid ? { statusLogs: { create: { fromStatus: r.status, toStatus: r.status, note: `รับชำระแล้ว ${baht(data.amountPaid)}` } } } : {}),
    },
  });
  refresh(id);
}

export async function saveAdminNote(id: number, adminNote: string) {
  await requireAdmin();
  await prisma.bookingRequest.update({ where: { id }, data: { adminNote: adminNote || null } });
  refresh(id);
}

// ── partners & vehicles ────────────────────────────────────────────────────
export async function upsertPartner(data: { id?: number; name: string; phone: string; lineId?: string; rating: number; note?: string }) {
  await requireAdmin();
  if (!data.name.trim()) return { error: "ใส่ชื่อก่อนนะ" };
  const payload = { name: data.name.trim(), phone: data.phone.trim(), lineId: data.lineId?.trim() || null, rating: Math.min(5, Math.max(1, data.rating)), note: data.note?.trim() || null };
  if (data.id) await prisma.partner.update({ where: { id: data.id }, data: payload });
  else await prisma.partner.create({ data: payload });
  revalidatePath("/admin/partners");
  return { ok: true };
}

export async function upsertVehicle(data: { id?: number; partnerId: number; type: VehicleType; plate: string; model?: string; costAirport?: number; costDaily?: number; note?: string }) {
  await requireAdmin();
  if (!data.plate.trim()) return { error: "ใส่ทะเบียนก่อนนะ" };
  const payload = { partnerId: data.partnerId, type: data.type, plate: data.plate.trim(), model: data.model?.trim() || null, seats: VEHICLES[data.type].seats, costAirport: data.costAirport || null, costDaily: data.costDaily || null, note: data.note?.trim() || null };
  if (data.id) await prisma.vehicle.update({ where: { id: data.id }, data: payload });
  else await prisma.vehicle.create({ data: payload });
  revalidatePath("/admin/partners");
  return { ok: true };
}

export async function toggleVehicle(id: number) {
  await requireAdmin();
  const v = await prisma.vehicle.findUniqueOrThrow({ where: { id } });
  await prisma.vehicle.update({ where: { id }, data: { active: !v.active } });
  revalidatePath("/admin/partners");
  return !v.active;
}

/** ส่งข้อมูลคนขับ (ชื่อ เบอร์ ทะเบียน รุ่น) ให้ลูกค้า — LINE push ถ้าผูกแล้ว, ไม่งั้นคืนข้อความให้คัดลอก/เปิด WhatsApp */
export async function sendDriverInfo(id: number) {
  await requireAdmin();
  const r = await prisma.bookingRequest.findUniqueOrThrow({ where: { id }, include: { vehicle: { include: { partner: true } } } });
  if (!r.vehicle) return { ok: false as const, error: "ยังไม่ได้จัดรถ" };
  const v = r.vehicle, p = v.partner;
  const en = r.lang === "en";
  const d = getDict(en ? "en" : "th");
  const when = `${r.pickupDate.toLocaleDateString(en ? "en-GB" : "th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" })} ${r.pickupTime}`;
  const text = (en
    ? [
        `Hi ${r.customerName}, your driver for #${r.code} is confirmed ✅`,
        `👤 Driver: ${p.name}`,
        `📞 ${p.phone}${p.lineId ? ` · LINE ${p.lineId}` : ""}`,
        `🚐 ${d.vehicle[v.type].name} · ${v.model ?? ""} · plate ${v.plate}`,
        `📅 ${when}`,
        `📍 ${routeTextFor(r, "en")}`,
        r.serviceType === "AIRPORT" ? `The driver will wait at the arrivals exit with a sign with your name. If you can't find each other, call the number above.` : `The driver will message you before pick-up.`,
        `— Phuket Transfer Hub · WhatsApp +66 86 422 6141`,
      ]
    : [
        `สวัสดีคุณ${r.customerName} ยืนยันคนขับสำหรับ #${r.code} แล้วครับ ✅`,
        `👤 คนขับ: ${p.name}`,
        `📞 ${p.phone}${p.lineId ? ` · LINE ${p.lineId}` : ""}`,
        `🚐 ${VEHICLES[v.type].name} · ${v.model ?? ""} · ทะเบียน ${v.plate}`,
        `📅 ${when}`,
        `📍 ${routeTextFor(r, "th")}`,
        r.serviceType === "AIRPORT" ? `คนขับถือป้ายชื่อรอที่ประตูผู้โดยสารขาเข้า หากันไม่เจอโทรเบอร์ด้านบนได้เลยครับ` : `คนขับจะทักหาก่อนถึงเวลารับครับ`,
        `— Phuket Transfer Hub · LINE @024tyswy`,
      ]).join("\n");
  const sent = r.lineUserId ? await pushToUser(r.lineUserId, text) : false;
  await prisma.bookingRequest.update({
    where: { id },
    data: { statusLogs: { create: { fromStatus: r.status, toStatus: r.status, note: sent ? `ส่งข้อมูลคนขับ ${p.name} ${v.plate} ทาง LINE` : `เตรียมข้อความข้อมูลคนขับ ${p.name} ${v.plate} (คัดลอกส่งเอง)` } } },
  });
  refresh(id);
  return { ok: true as const, sent, text };
}

// ── documents: ใบเสนอราคา / ใบเสร็จ ───────────────────────────────────────
import type { DocumentType } from "@prisma/client";
import { buildItems, docLang, jobTotal, newToken, nextDocNumber, DOC_LABEL } from "@/lib/documents";

export async function issueDocument(
  requestId: number,
  type: DocumentType,
  opts: { amountPaid?: number; paymentMethod?: string; showTaxId?: boolean; customerTaxId?: string; customerAddress?: string; note?: string; validDays?: number } = {},
) {
  await requireAdmin();
  const r = await prisma.bookingRequest.findUniqueOrThrow({ where: { id: requestId }, include: { documents: { where: { type: "RECEIPT", voidedAt: null } } } });
  if (!r.sellPrice) return { ok: false as const, error: "ตั้งราคาขายก่อนออกเอกสาร" };
  const items = buildItems(r);
  const total = jobTotal(r);
  const paidBefore = r.documents.reduce((a, d) => a + d.amountPaid, 0);
  const amountPaid = type === "RECEIPT" ? Math.max(0, Math.round(opts.amountPaid ?? Math.max(0, r.amountPaid - paidBefore))) : 0;
  if (type === "RECEIPT" && amountPaid <= 0) return { ok: false as const, error: "ใส่ยอดที่รับครั้งนี้" };

  const doc = await prisma.$transaction(async (tx) => {
    const number = await nextDocNumber(tx, type);
    return tx.document.create({
      data: {
        number, type, token: newToken(), lang: docLang(r), requestId,
        customerName: r.customerName, customerCompany: r.company, customerPhone: r.phone,
        customerTaxId: opts.customerTaxId?.trim() || null, customerAddress: opts.customerAddress?.trim() || null,
        items, total,
        amountPaid, paidBefore: type === "RECEIPT" ? paidBefore : 0, balance: type === "RECEIPT" ? Math.max(0, total - paidBefore - amountPaid) : total,
        paymentMethod: type === "RECEIPT" ? opts.paymentMethod || "TRANSFER" : null,
        paymentTerm: type === "QUOTE" ? r.paymentTerm : null,
        validDays: type === "QUOTE" ? (opts.validDays ?? 7) : null,
        showTaxId: !!opts.showTaxId, note: opts.note?.trim() || null,
      },
    });
  });
  // ใบเสร็จ: sync ยอดรับรวมกลับไปที่ request ถ้ามากกว่าที่บันทึกไว้
  if (type === "RECEIPT" && paidBefore + amountPaid > r.amountPaid) {
    await prisma.bookingRequest.update({ where: { id: requestId }, data: { amountPaid: paidBefore + amountPaid, paidAt: r.paidAt ?? new Date() } });
  }
  await prisma.statusLog.create({ data: { requestId, fromStatus: r.status, toStatus: r.status, note: `ออก${DOC_LABEL[type].short} ${doc.number}${type === "RECEIPT" ? ` ยอด ${baht(amountPaid)}` : ""}` } });
  refresh(requestId);
  return { ok: true as const, id: doc.id, number: doc.number, url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100"}/doc/${doc.token}` };
}

export async function voidDocument(id: number) {
  await requireAdmin();
  const d = await prisma.document.findUniqueOrThrow({ where: { id } });
  await prisma.document.update({ where: { id }, data: { voidedAt: new Date() } });
  await prisma.statusLog.create({ data: { requestId: d.requestId, toStatus: (await prisma.bookingRequest.findUniqueOrThrow({ where: { id: d.requestId } })).status, note: `ยกเลิกเอกสาร ${d.number}` } });
  refresh(d.requestId);
}

/** ส่งลิงก์เอกสารเข้าแชท LINE ลูกค้า (ถ้าผูกแล้ว) — ไม่งั้นคืนข้อความให้คัดลอก */
export async function sendDocumentLink(id: number) {
  await requireAdmin();
  const d = await prisma.document.findUniqueOrThrow({ where: { id }, include: { request: true } });
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100"}/doc/${d.token}`;
  const en = d.lang === "en";
  const text = en
    ? `${DOC_LABEL[d.type].en} ${d.number} for request #${d.request.code}\n${url}\nTap to view or save as PDF. — Phuket Transfer Hub`
    : `${DOC_LABEL[d.type].th} ${d.number} สำหรับคำขอ #${d.request.code}\n${url}\nกดเปิดดูหรือบันทึกเป็น PDF ได้เลยครับ — Phuket Transfer Hub`;
  const sent = d.request.lineUserId ? await pushToUser(d.request.lineUserId, text) : false;
  return { ok: true as const, sent, text, url };
}

// ── expenses & attachments ─────────────────────────────────────────────────
import type { ExpenseCategory } from "@prisma/client";
import { ATTACHMENT_TYPES, MAX_ATTACHMENT } from "@/lib/expenses";

async function readFiles(formData: FormData, key = "files") {
  const out: { filename: string; mime: string; size: number; data: Uint8Array<ArrayBuffer> }[] = [];
  for (const f of formData.getAll(key)) {
    if (!(f instanceof File) || f.size === 0) continue;
    if (f.size > MAX_ATTACHMENT) throw new Error(`ไฟล์ ${f.name} ใหญ่เกิน 4MB`);
    if (!ATTACHMENT_TYPES.includes(f.type)) throw new Error(`ไฟล์ ${f.name} ต้องเป็นรูปหรือ PDF`);
    out.push({ filename: f.name, mime: f.type, size: f.size, data: new Uint8Array(await f.arrayBuffer()) });
  }
  return out;
}

/** เพิ่มรายจ่าย (FormData: requestId?, partnerId?, category, amount, paidAt, method, payee, note, files[]) */
export async function addExpense(formData: FormData) {
  await requireAdmin();
  const num = (k: string) => { const v = formData.get(k); return v ? Number(v) : undefined; };
  const str = (k: string) => { const v = formData.get(k); return typeof v === "string" && v.trim() ? v.trim() : undefined; };
  const amount = Math.round(num("amount") ?? 0);
  if (amount <= 0) return { ok: false as const, error: "ใส่จำนวนเงิน" };
  const paidAt = str("paidAt");
  if (!paidAt) return { ok: false as const, error: "เลือกวันที่จ่าย" };
  const files = await readFiles(formData);
  const requestId = num("requestId") || null;
  const e = await prisma.expense.create({
    data: {
      requestId, partnerId: num("partnerId") || null,
      category: (str("category") as ExpenseCategory) ?? "OTHER", amount,
      paidAt: new Date(paidAt + "T00:00:00Z"), method: str("method") ?? null, payee: str("payee") ?? null, note: str("note") ?? null,
      attachments: { create: files },
    },
  });
  if (requestId) {
    const r = await prisma.bookingRequest.findUnique({ where: { id: requestId } });
    if (r) await prisma.statusLog.create({ data: { requestId, fromStatus: r.status, toStatus: r.status, note: `บันทึกรายจ่าย ${baht(amount)}${str("payee") ? ` → ${str("payee")}` : ""}` } });
    refresh(requestId);
  }
  revalidatePath("/admin/reports");
  return { ok: true as const, id: e.id };
}

export async function deleteExpense(id: number) {
  await requireAdmin();
  const e = await prisma.expense.delete({ where: { id } });
  if (e.requestId) refresh(e.requestId);
  revalidatePath("/admin/reports");
}

/** แนบสลิปลูกค้าโอนเข้า (หลักฐานรับเงิน) กับ request */
export async function addRequestAttachment(formData: FormData) {
  await requireAdmin();
  const requestId = Number(formData.get("requestId"));
  const files = await readFiles(formData);
  if (!files.length) return { ok: false as const, error: "เลือกไฟล์" };
  await prisma.attachment.createMany({ data: files.map((f) => ({ ...f, requestId })) });
  refresh(requestId);
  return { ok: true as const };
}

export async function deleteAttachment(id: number) {
  await requireAdmin();
  const a = await prisma.attachment.delete({ where: { id } });
  if (a.requestId) refresh(a.requestId);
  if (a.expenseId) { const e = await prisma.expense.findUnique({ where: { id: a.expenseId } }); if (e?.requestId) refresh(e.requestId); }
  revalidatePath("/admin/reports");
}
