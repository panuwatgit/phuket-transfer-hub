import type { Prisma } from "@prisma/client";

/** ออกเลข PTH-YYYY-NNNN แบบ atomic (เรียกใน transaction) */
export async function nextRequestCode(tx: Prisma.TransactionClient, year = new Date().getFullYear()) {
  const key = `request:${year}`;
  const c = await tx.counter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `PTH-${year}-${String(c.value).padStart(4, "0")}`;
}
