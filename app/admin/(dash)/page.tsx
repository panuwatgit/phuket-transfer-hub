import { prisma } from "@/lib/prisma";
import { Board } from "@/components/admin/Board";

export default async function BoardPage() {
  // งานที่ยังเคลื่อนไหว + งานจบ/ยกเลิกใน 30 วันล่าสุด (ที่เหลือดูใน "รายการทั้งหมด")
  const now = new Date();
  const since = new Date(now.getTime() - 30 * 86400000);
  const requests = await prisma.bookingRequest.findMany({
    where: { OR: [{ status: { in: ["NEW", "SOURCING", "QUOTED", "CONFIRMED"] } }, { updatedAt: { gte: since } }] },
    orderBy: [{ createdAt: "desc" }],
  });
  return <Board requests={requests} now={now} />;
}
