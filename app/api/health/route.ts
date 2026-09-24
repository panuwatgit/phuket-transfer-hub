import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Railway healthcheck + ดูจากภายนอกได้ว่า migrate รันครบหรือยัง
export const dynamic = "force-dynamic";

export async function GET() {
  const out: { ok: boolean; db: boolean; migrated: boolean; tables?: number; error?: string; at: string } = { ok: false, db: false, migrated: false, at: new Date().toISOString() };
  try {
    await prisma.$queryRaw`SELECT 1`;
    out.db = true;
  } catch (e) {
    out.error = (e as Error).message.slice(0, 200);
    return NextResponse.json(out, { status: 503 });
  }
  try {
    const rows = await prisma.$queryRaw<{ n: bigint }[]>`SELECT count(*)::bigint AS n FROM information_schema.tables WHERE table_schema = 'public'`;
    out.tables = Number(rows[0]?.n ?? 0);
    await prisma.bookingRequest.count(); // ตารางหลักต้องมีจริง
    out.migrated = true;
  } catch (e) {
    out.error = (e as Error).message.slice(0, 200);
  }
  out.ok = out.db && out.migrated;
  return NextResponse.json(out, { status: out.ok ? 200 : 503 });
}
