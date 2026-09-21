import { prisma } from "./prisma";
import { monthRange } from "./expenses";

/** ข้อมูลรายเดือน: รายรับจากใบเสร็จ (ไม่นับที่ยกเลิก) + รายจ่ายทั้งหมด */
export async function monthlyReport(m?: string | null) {
  const range = monthRange(m);
  const [receipts, expenses] = await Promise.all([
    prisma.document.findMany({ where: { type: "RECEIPT", voidedAt: null, issuedAt: { gte: range.start, lt: range.end } }, include: { request: { select: { code: true, serviceType: true, vehicleType: true, customerName: true, company: true } } }, orderBy: { issuedAt: "asc" } }),
    prisma.expense.findMany({ where: { paidAt: { gte: range.start, lt: range.end } }, include: { request: { select: { code: true } }, partner: { select: { name: true } }, attachments: { select: { id: true, filename: true, mime: true, size: true } } }, orderBy: { paidAt: "asc" } }),
  ]);
  const income = receipts.reduce((a, r) => a + r.amountPaid, 0);
  const expense = expenses.reduce((a, e) => a + e.amount, 0);
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => { acc[e.category] = (acc[e.category] ?? 0) + e.amount; return acc; }, {});
  return { range, receipts, expenses, income, expense, net: income - expense, byCategory };
}

/** เดือนที่มีข้อมูล (สำหรับ dropdown) */
export async function availableMonths() {
  const [d, e] = await Promise.all([
    prisma.document.findMany({ where: { type: "RECEIPT" }, select: { issuedAt: true } }),
    prisma.expense.findMany({ select: { paidAt: true } }),
  ]);
  const set = new Set<string>();
  for (const x of d) set.add(x.issuedAt.toISOString().slice(0, 7));
  for (const x of e) set.add(x.paidAt.toISOString().slice(0, 7));
  const now = new Date(); set.add(now.toISOString().slice(0, 7));
  return [...set].sort().reverse();
}

export function csv(rows: (string | number)[][]) {
  const esc = (v: string | number) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return "﻿" + rows.map((r) => r.map(esc).join(",")).join("\n"); // BOM ให้ Excel อ่านไทยถูก
}
