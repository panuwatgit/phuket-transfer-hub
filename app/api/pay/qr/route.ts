import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { promptPayId, promptPayPayload, verifyPaySig } from "@/lib/promptpay";

// รูป QR PromptPay สำหรับส่งเข้าแชท LINE — ต้องมีลายเซ็นตรงกับเลขงาน+ยอด
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const code = q.get("code") ?? "";
  const amount = Number(q.get("amount") ?? 0);
  if (!code || !amount || !verifyPaySig(code, amount, q.get("sig") ?? "")) return new NextResponse("forbidden", { status: 403 });
  try {
    const png = await QRCode.toBuffer(promptPayPayload(promptPayId(), amount), { type: "png", width: 640, margin: 2, color: { dark: "#1A2B3C", light: "#FFFFFF" } });
    return new NextResponse(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
  } catch (e) {
    return new NextResponse((e as Error).message, { status: 500 });
  }
}
