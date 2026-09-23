import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ใช้โดย Railway healthcheck — เช็กว่าแอปตอบและต่อ DB ได้
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: true, at: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
}
