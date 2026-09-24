import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.line.me/v2/bot/message";
const token = () => process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const adminIds = () =>
  (process.env.LINE_ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export type Message = { type: "text"; text: string } | { type: "image"; originalContentUrl: string; previewImageUrl: string };

async function send(path: "push" | "multicast", body: Record<string, unknown>) {
  const res = await fetch(`${API}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`LINE ${path} ${res.status}: ${await res.text()}`);
}

/** แจ้งแอดมินทุกคนใน LINE_ADMIN_USER_IDS — ไม่มี env = log แล้วข้าม ไม่ throw */
export async function notifyAdmins(text: string) {
  const ids = adminIds();
  if (!token() || !ids.length) {
    console.log("[line] (not configured) would notify admins:\n" + text);
    return false;
  }
  const messages: Message[] = [{ type: "text", text }];
  try {
    if (ids.length === 1) await send("push", { to: ids[0], messages });
    else await send("multicast", { to: ids, messages });
    return true;
  } catch (e) {
    console.error("[line] notifyAdmins failed", e);
    return false;
  }
}

/** ส่งข้อความหาลูกค้าที่ผูก userId แล้ว (หลัง webhook จับคู่) */
export async function pushToUser(userId: string, text: string) {
  return pushMessages(userId, [{ type: "text", text }]);
}

/** ส่งได้หลายข้อความในครั้งเดียว (เช่น ข้อความ + รูป QR) */
export async function pushMessages(userId: string, messages: Message[]) {
  if (!token()) {
    console.log(`[line] (not configured) would push to ${userId}:`, JSON.stringify(messages).slice(0, 300));
    return false;
  }
  try {
    await send("push", { to: userId, messages });
    return true;
  } catch (e) {
    console.error("[line] push failed", e);
    return false;
  }
}

/** ดาวน์โหลดไฟล์ที่ลูกค้าส่งมาในแชท (เช่น สลิปโอนเงิน) */
export async function getMessageContent(messageId: string) {
  if (!token()) return null;
  const res = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, { headers: { Authorization: `Bearer ${token()}` } });
  if (!res.ok) { console.error("[line] getMessageContent", res.status); return null; }
  return { data: new Uint8Array(await res.arrayBuffer()), mime: res.headers.get("content-type") || "image/jpeg" };
}

/** ตรวจ X-Line-Signature ของ webhook (HMAC-SHA256 ด้วย channel secret) */
export function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const REQUEST_CODE_RE = /PTH-\d{4}-\d{4}/i;

/** ตอบกลับด้วย replyToken (ฟรี ไม่นับโควตา push) */
export async function replyMessage(replyToken: string, text: string) {
  if (!token()) return false;
  try {
    const res = await fetch(`${API}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }),
    });
    return res.ok;
  } catch (e) {
    console.error("[line] reply failed", e);
    return false;
  }
}
