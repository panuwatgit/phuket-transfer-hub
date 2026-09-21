import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SERVICES, STATUSES, VEHICLES } from "@/lib/config";
import { baht, thDate } from "@/lib/format";
import { routeText } from "@/lib/request-view";

export default async function ListPage({ searchParams }: PageProps<"/admin/list">) {
  const { q = "" } = (await searchParams) as { q?: string };
  const requests = await prisma.bookingRequest.findMany({
    where: q ? { OR: [{ code: { contains: q, mode: "insensitive" } }, { customerName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { pickupPlace: { contains: q, mode: "insensitive" } }, { dropoffPlace: { contains: q, mode: "insensitive" } }] } : undefined,
    orderBy: [{ pickupDate: "desc" }, { pickupTime: "desc" }],
    take: 200,
  });
  return (
    <>
      <div className="flex items-center gap-3.5 mb-4 flex-wrap">
        <div><h1 className="text-2xl font-semibold">รายการทั้งหมด</h1><div className="text-ink-soft text-[13.5px]">เรียงตามวันเดินทาง · {requests.length} รายการ</div></div>
        <form className="in in-sm md:ml-auto w-full md:w-[280px] !bg-white"><span>🔍</span><input name="q" defaultValue={q} placeholder="ค้นหา แล้วกด Enter" /></form>
      </div>
      <div className="overflow-x-auto">
        <table className="tbl min-w-[860px]">
          <thead><tr><th>เลข</th><th>สถานะ</th><th>วันเดินทาง</th><th>รถ / บริการ</th><th>เส้นทาง</th><th>ลูกค้า</th><th className="text-right">ราคาขาย</th></tr></thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/admin/requests/${r.id}`} className="kanit font-medium hover:text-teal-deep">{r.code}</Link></td>
                <td><span className="pill" style={{ background: STATUSES[r.status].wash, color: STATUSES[r.status].color }}><i style={{ background: STATUSES[r.status].color }} />{STATUSES[r.status].name}</span></td>
                <td>{thDate(r.pickupDate, false)} {r.pickupTime}</td>
                <td>{VEHICLES[r.vehicleType].short}{r.vehicleCount > 1 ? ` ×${r.vehicleCount}` : ""} · {SERVICES[r.serviceType].short}</td>
                <td className="max-w-[260px] truncate">{routeText(r, "th")}</td>
                <td>{r.customerName}<br /><small className="text-ink-faint">{r.phone}</small></td>
                <td className="text-right kanit font-medium">{r.sellPrice ? baht(r.sellPrice) : "—"}</td>
              </tr>
            ))}
            {!requests.length && <tr><td colSpan={7} className="text-center text-ink-faint py-8">ยังไม่มีรายการ</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
