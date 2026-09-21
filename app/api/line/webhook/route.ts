import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { REQUEST_CODE_RE, replyMessage, verifySignature } from "@/lib/line";
import { BRAND } from "@/lib/config";

type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { userId?: string };
  message?: { type: string; text?: string };
};

// LINE Developers console กด "Verify" จะยิง GET/POST เปล่า ๆ มา
export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-line-signature"))) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }
  let events: LineEvent[] = [];
  try {
    events = (JSON.parse(raw).events ?? []) as LineEvent[];
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  for (const ev of events) {
    if (ev.type !== "message" || ev.message?.type !== "text" || !ev.source?.userId) continue;
    const userId = ev.source.userId;
    const text = ev.message.text ?? "";
    const code = text.match(REQUEST_CODE_RE)?.[0]?.toUpperCase();
    if (!code) continue;

    const r = await prisma.bookingRequest.findUnique({ where: { code } });
    if (!r) {
      if (ev.replyToken) await replyMessage(ev.replyToken, `ไม่พบเลขคำขอ ${code} ครับ ลองเช็กอีกครั้ง หรือพิมพ์รายละเอียดมาได้เลย`);
      continue;
    }
    if (!r.lineUserId) {
      await prisma.bookingRequest.update({
        where: { id: r.id },
        data: {
          lineUserId: userId,
          lineLinkedAt: new Date(),
          statusLogs: { create: { fromStatus: r.status, toStatus: r.status, note: "ลูกค้าทัก LINE มาพร้อมเลข — ผูกแชทแล้ว", actor: "customer" } },
        },
      });
    }
    if (ev.replyToken) {
      await replyMessage(
        ev.replyToken,
        `รับเรื่อง #${code} แล้วครับ 🙏 ทีมงานกำลังเช็กรถว่างให้ จะส่งราคาในแชทนี้ภายใน ${BRAND.replyMinutes} นาที (${BRAND.hours})`,
      );
    }
  }
  return NextResponse.json({ ok: true });
}
