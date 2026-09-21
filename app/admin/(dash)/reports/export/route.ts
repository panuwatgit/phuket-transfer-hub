import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { csv, monthlyReport } from "@/lib/reports";
import { EXPENSE_CATEGORIES, METHODS } from "@/lib/expenses";
import { PAYMENT_METHODS } from "@/lib/documents";
import { SERVICES, VEHICLES } from "@/lib/config";

// CSV รายรับ+รายจ่ายของเดือน (เปิดใน Excel/Google Sheets ได้ทันที)
export async function GET(req: Request) {
  if (!(await isAdmin())) return new NextResponse("unauthorized", { status: 401 });
  const m = new URL(req.url).searchParams.get("m");
  const rep = await monthlyReport(m);
  const d = (x: Date) => x.toISOString().slice(0, 10);
  const rows: (string | number)[][] = [["ประเภท", "วันที่", "เลขที่/หมวด", "งาน", "คู่ค้า/ลูกค้า", "รายละเอียด", "วิธีชำระ", "รายรับ", "รายจ่าย"]];
  for (const r of rep.receipts) rows.push(["รายรับ", d(r.issuedAt), r.number, r.request.code, r.request.company ?? r.request.customerName, `${VEHICLES[r.request.vehicleType].name} · ${SERVICES[r.request.serviceType].name}`, r.paymentMethod ? PAYMENT_METHODS[r.paymentMethod]?.th ?? r.paymentMethod : "", r.amountPaid, ""]);
  for (const e of rep.expenses) rows.push(["รายจ่าย", d(e.paidAt), EXPENSE_CATEGORIES[e.category].name, e.request?.code ?? "", e.partner?.name ?? e.payee ?? "", e.note ?? "", e.method ? METHODS[e.method] ?? e.method : "", "", e.amount]);
  rows.push([]); rows.push(["รวม", rep.range.key, "", "", "", "", "", rep.income, rep.expense]); rows.push(["กำไรสุทธิ", "", "", "", "", "", "", rep.net, ""]);
  return new NextResponse(csv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="pth-${rep.range.key}.csv"` } });
}
