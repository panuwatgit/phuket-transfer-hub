import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RequestDetail } from "@/components/admin/RequestDetail";

export default async function RequestPage({ params }: PageProps<"/admin/requests/[id]">) {
  const { id } = await params;
  const rid = Number(id);
  if (!Number.isInteger(rid)) notFound();
  const r = await prisma.bookingRequest.findUnique({
    where: { id: rid },
    include: { vehicle: { include: { partner: true } }, statusLogs: { orderBy: { createdAt: "asc" } } },
  });
  if (!r) notFound();
  const candidates = await prisma.vehicle.findMany({
    where: { type: r.vehicleType, active: true, partner: { active: true } },
    include: { partner: true },
    orderBy: [{ partner: { rating: "desc" } }, { costAirport: "asc" }],
  });
  // key = updatedAt → remount หลังบันทึก ให้ state ในฟอร์มตรงกับ DB
  return <RequestDetail key={r.updatedAt.getTime()} r={r} candidates={candidates} now={new Date()} />;
}
