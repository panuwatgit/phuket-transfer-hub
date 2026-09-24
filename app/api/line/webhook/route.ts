import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { REQUEST_CODE_RE, getMessageContent, notifyAdmins, replyMessage, verifySignature } from "@/lib/line";
import { BRAND } from "@/lib/config";

type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { type?: string; userId?: string; groupId?: string };
  message?: { id: string; type: string; text?: string };
};

const CONFIRM_RE = /^(ยืนยัน|คอนเฟิร์ม|ตกลง|confirm|confirmed|ok)\b/i;

/** งานล่าสุดของลูกค้าคนนี้ที่ยังไม่จบ */
async function activeRequestOf(userId: string) {
  return prisma.bookingRequest.findFirst({
    where: { lineUserId: userId, status: { in: ["NEW", "SOURCING", "QUOTED", "CONFIRMED"] } },
    orderBy: { createdAt: "desc" },
  });
}

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
    // OA ถูกดึงเข้ากลุ่ม → log groupId ไว้ใส่ LINE_ADMIN_USER_IDS (ให้แจ้งเตือนเข้ากลุ่มทีมงานแทนแชทส่วนตัว)
    if (ev.type === "join" && ev.source?.groupId) {
      console.log(`[line] joined group — ใส่ค่านี้ใน LINE_ADMIN_USER_IDS: ${ev.source.groupId}`);
      if (ev.replyToken) await replyMessage(ev.replyToken, `สวัสดีครับ ทีมงาน 🙏 กลุ่มนี้พร้อมรับแจ้งเตือนคำขอราคาแล้ว\nGroup ID: ${ev.source.groupId}`);
      continue;
    }
    // ข้อความในกลุ่ม = ทีมงานคุยกัน ไม่ใช่ลูกค้า → ข้าม
    if (ev.source?.type === "group" || ev.source?.type === "room") continue;
    if (ev.type !== "message" || !ev.source?.userId) continue;
    const userId = ev.source.userId;

    // ลูกค้าส่งรูป = สลิปโอนเงิน → เก็บแนบกับงาน + แจ้งแอดมิน
    if (ev.message?.type === "image") {
      const r = await activeRequestOf(userId);
      if (!r) continue;
      const file = await getMessageContent(ev.message.id);
      if (!file) continue;
      const en = r.lang === "en";
      await prisma.attachment.create({ data: { requestId: r.id, filename: `slip-${r.code}-${Date.now()}.jpg`, mime: file.mime, size: file.data.byteLength, data: file.data } });
      await prisma.statusLog.create({ data: { requestId: r.id, fromStatus: r.status, toStatus: r.status, note: "ลูกค้าส่งสลิปโอนเงินในแชท", actor: "customer" } });
      await Promise.all([
        ev.replyToken ? replyMessage(ev.replyToken, en ? `Got your slip for #${r.code} 🙏 We'll confirm shortly.` : `ได้รับสลิปของ #${r.code} แล้วครับ 🙏 ทีมงานกำลังตรวจสอบ เดี๋ยวยืนยันให้ทันที`) : Promise.resolve(false),
        notifyAdmins(`🧾 ได้รับสลิปจาก ${r.customerName} — #${r.code}\n${BRAND.siteUrl}/admin/requests/${r.id}`),
      ]);
      continue;
    }

    if (ev.message?.type !== "text") continue;
    const text = ev.message.text ?? "";
    const code = text.match(REQUEST_CODE_RE)?.[0]?.toUpperCase();
    if (!code) {
      // ตอบ "ยืนยัน" ในแชท → เตือนแอดมินให้ส่งรายละเอียดชำระเงิน
      if (CONFIRM_RE.test(text.trim())) {
        const r = await activeRequestOf(userId);
        if (r) {
          await prisma.statusLog.create({ data: { requestId: r.id, fromStatus: r.status, toStatus: r.status, note: `ลูกค้าตอบ "${text.trim().slice(0, 40)}" ในแชท`, actor: "customer" } });
          await notifyAdmins(`✅ ลูกค้ายืนยันแล้ว — #${r.code} (${r.customerName})\nส่ง QR ชำระเงินได้เลย\n${BRAND.siteUrl}/admin/requests/${r.id}`);
        }
      }
      continue;
    }

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
