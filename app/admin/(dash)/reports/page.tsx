import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { availableMonths, monthlyReport } from "@/lib/reports";
import { EXPENSE_CATEGORIES, EXPENSE_ORDER, METHODS } from "@/lib/expenses";
import { SERVICES, VEHICLES } from "@/lib/config";
import { baht, thDate } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/documents";
import { ExpensesPanel } from "@/components/admin/ExpensesPanel";

const TH_MONTH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const label = (key: string) => { const [y, m] = key.split("-").map(Number); return `${TH_MONTH[m - 1]} ${y + 543}`; };

export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const { m } = (await searchParams) as { m?: string };
  const [rep, months, partners] = await Promise.all([monthlyReport(m), availableMonths(), prisma.partner.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })]);
  const general = rep.expenses.filter((e) => !e.requestId);

  return (
    <>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div><h1 className="text-2xl font-semibold">รายงานรายเดือน</h1><div className="text-ink-soft text-[13.5px]">รายรับจากใบเสร็จ − รายจ่ายที่บันทึก · สำหรับทำบัญชี/ภาษี</div></div>
        <form className="md:ml-auto flex items-center gap-2">
          <div className="in in-sm !bg-white"><select name="m" defaultValue={rep.range.key}>{months.map((k) => <option key={k} value={k}>{label(k)}</option>)}</select></div>
          <button className="btn btn-ghost btn-sm">ดู</button>
        </form>
        <a className="btn btn-teal btn-sm" href={`/admin/reports/export?m=${rep.range.key}`}>⬇︎ ส่งออก CSV (รายรับ + รายจ่าย)</a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi icon="💰" bg="bg-teal-wash" v={baht(rep.income)} l={`รายรับ · ${rep.receipts.length} ใบเสร็จ`} />
        <Kpi icon="💸" bg="bg-coral-wash" v={baht(rep.expense)} l={`รายจ่าย · ${rep.expenses.length} รายการ`} />
        <Kpi icon={rep.net >= 0 ? "📈" : "📉"} bg={rep.net >= 0 ? "bg-green-wash" : "bg-sun-wash"} v={baht(rep.net)} l="กำไรสุทธิ" />
        <Kpi icon="🚐" bg="bg-purple-wash" v={baht(rep.byCategory.PARTNER_PAYOUT ?? 0)} l="จ่ายพาร์ทเนอร์/คนขับ" />
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4 items-start mb-5">
        <div className="overflow-x-auto">
          <h3 className="kanit font-medium text-base mb-2">รายรับ — ใบเสร็จเดือน {label(rep.range.key)}</h3>
          <table className="tbl min-w-[720px]">
            <thead><tr><th>วันที่</th><th>เลขที่</th><th>งาน</th><th>ลูกค้า</th><th>ชำระโดย</th><th className="text-right">รับ</th></tr></thead>
            <tbody>
              {rep.receipts.map((d) => (
                <tr key={d.id}>
                  <td>{thDate(d.issuedAt, false)}</td>
                  <td><a className="kanit font-medium hover:text-teal-deep" href={`/doc/${d.token}`} target="_blank" rel="noopener">{d.number}</a></td>
                  <td><Link href={`/admin/requests/${d.requestId}`} className="hover:text-teal-deep">{d.request.code}</Link><br /><small className="text-ink-faint">{VEHICLES[d.request.vehicleType].short} · {SERVICES[d.request.serviceType].short}</small></td>
                  <td>{d.request.company ?? d.request.customerName}</td>
                  <td>{d.paymentMethod ? PAYMENT_METHODS[d.paymentMethod]?.th ?? d.paymentMethod : "—"}</td>
                  <td className="text-right kanit font-medium text-teal-deep">{baht(d.amountPaid)}</td>
                </tr>
              ))}
              {!rep.receipts.length && <tr><td colSpan={6} className="text-center text-ink-faint py-6">ยังไม่มีใบเสร็จในเดือนนี้</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="sec">
          <h4>รายจ่ายแยกหมวด</h4>
          <div className="grid gap-1.5 text-[13.5px]">
            {EXPENSE_ORDER.filter((k) => rep.byCategory[k]).map((k) => (
              <div key={k} className="flex justify-between"><span>{EXPENSE_CATEGORIES[k].icon} {EXPENSE_CATEGORIES[k].name}</span><b className="kanit font-medium">{baht(rep.byCategory[k])}</b></div>
            ))}
            {!rep.expenses.length && <div className="text-ink-faint text-[12.5px]">ยังไม่มีรายจ่าย</div>}
            <div className="flex justify-between border-t border-line pt-1.5 mt-1"><span>รวม</span><b className="kanit font-semibold text-coral-deep">{baht(rep.expense)}</b></div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mb-5">
        <h3 className="kanit font-medium text-base mb-2">รายจ่ายทั้งหมด</h3>
        <table className="tbl min-w-[760px]">
          <thead><tr><th>วันที่</th><th>หมวด</th><th>จ่ายให้</th><th>งาน</th><th>โดย</th><th>บันทึก</th><th>หลักฐาน</th><th className="text-right">จำนวน</th></tr></thead>
          <tbody>
            {rep.expenses.map((e) => (
              <tr key={e.id}>
                <td>{thDate(e.paidAt, false)}</td>
                <td>{EXPENSE_CATEGORIES[e.category].icon} {EXPENSE_CATEGORIES[e.category].name}</td>
                <td>{e.partner?.name ?? e.payee ?? "—"}</td>
                <td>{e.request ? <Link href={`/admin/requests/${e.requestId}`} className="hover:text-teal-deep">{e.request.code}</Link> : <span className="text-ink-faint">ทั่วไป</span>}</td>
                <td>{e.method ? METHODS[e.method] ?? e.method : "—"}</td>
                <td className="max-w-[220px] truncate">{e.note ?? ""}</td>
                <td>{e.attachments.map((a) => <a key={a.id} className="chip chip-teal mr-1" href={`/api/files/${a.id}`} target="_blank" rel="noopener">📎</a>)}</td>
                <td className="text-right kanit font-medium text-coral-deep">{baht(e.amount)}</td>
              </tr>
            ))}
            {!rep.expenses.length && <tr><td colSpan={8} className="text-center text-ink-faint py-6">ยังไม่มีรายจ่ายในเดือนนี้</td></tr>}
          </tbody>
        </table>
      </div>

      <ExpensesPanel expenses={general} partners={partners} />
    </>
  );
}

function Kpi({ icon, bg, v, l }: { icon: string; bg: string; v: string; l: string }) {
  return (
    <div className="bg-white border border-line rounded-2xl px-4 py-3.5 flex items-center gap-3">
      <div className={`w-[42px] h-[42px] rounded-xl grid place-items-center text-xl ${bg}`}>{icon}</div>
      <div><b className="kanit text-2xl font-semibold leading-none block">{v}</b><span className="text-[12.5px] text-ink-soft">{l}</span></div>
    </div>
  );
}
