import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

// ไฟล์แนบ (สลิป/ใบเสร็จ) — เฉพาะแอดมิน
export async function GET(_req: Request, ctx: RouteContext<"/api/files/[id]">) {
  if (!(await isAdmin())) return new NextResponse("unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const a = await prisma.attachment.findUnique({ where: { id: Number(id) } });
  if (!a) return new NextResponse("not found", { status: 404 });
  return new NextResponse(new Uint8Array(a.data), {
    headers: { "Content-Type": a.mime, "Content-Length": String(a.size), "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(a.filename)}`, "Cache-Control": "private, max-age=3600" },
  });
}
