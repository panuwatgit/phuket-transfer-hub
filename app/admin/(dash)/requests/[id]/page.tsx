import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RequestDetail } from "@/components/admin/RequestDetail";

export default async function RequestPage({ params }: PageProps<"/admin/requests/[id]">) {
  const { id } = await params;
  const rid = Number(id);
  if (!Number.isInteger(rid)) notFound();
  const r = await prisma.bookingRequest.findUnique({
    where: { id: rid },
    include: { vehicle: { include: { partner: true } }, statusLogs: { orderBy: { createdAt: "asc" } }, documents: { orderBy: { issuedAt: "desc" } }, expenses: { orderBy: { paidAt: "desc" }, include: { attachments: { select: { id: true, filename: true, mime: true, size: true } } } }, attachments: { select: { id: true, filename: true, mime: true, size: true } } },
  });
  if (!r) notFound();
  const candidates = await prisma.vehicle.findMany({
    where: { type: r.vehicleType, active: true, partner: { active: true } },
    include: { partner: true },
    orderBy: [{ partner: { rating: "desc" } }, { costAirport: "asc" }],
  });
  // key = updatedAt → remount หลังบันทึก ให้ state ในฟอร์มตรงกับ DB
  const partners = await prisma.partner.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return <RequestDetail key={`${r.updatedAt.getTime()}-${r.expenses.length}-${r.attachments.length}`} r={r} candidates={candidates} now={new Date()} partners={partners} />;
}
