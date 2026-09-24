import { createHmac, timingSafeEqual } from "node:crypto";

// สร้าง payload PromptPay ตามมาตรฐาน EMVCo (ธนาคารไทยสแกนได้ทุกแอป) — ไม่ต้องใช้ API ใคร
const f = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;

function crc16(s: string) {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** เบอร์ 0812345678 → 0066812345678 · เลขบัตร 13 หลัก → ใช้ตรง ๆ */
function target(idRaw: string) {
  const id = idRaw.replace(/[^\d]/g, "");
  if (id.length === 13) return { tag: "02", value: id }; // เลขประจำตัวประชาชน/ผู้เสียภาษี
  if (id.length === 10 && id.startsWith("0")) return { tag: "01", value: `0066${id.slice(1)}` }; // เบอร์มือถือ
  if (id.length === 12 && id.startsWith("0066")) return { tag: "01", value: id };
  throw new Error("PROMPTPAY_ID ต้องเป็นเบอร์มือถือ 10 หลัก หรือเลขบัตร 13 หลัก");
}

export function promptPayPayload(idRaw: string, amount?: number) {
  const t = target(idRaw);
  const merchant = f("00", "A000000677010111") + f(t.tag, t.value);
  const body =
    f("00", "01") +
    f("01", amount && amount > 0 ? "12" : "11") + // 11 = สแกนซ้ำได้, 12 = ครั้งเดียว (ระบุยอด)
    f("29", merchant) +
    f("53", "764") + // THB
    (amount && amount > 0 ? f("54", amount.toFixed(2)) : "") +
    f("58", "TH");
  const withCrcTag = `${body}6304`;
  return withCrcTag + crc16(withCrcTag);
}

export const promptPayId = () => process.env.PROMPTPAY_ID || "";
export const promptPayName = () => process.env.PROMPTPAY_NAME || process.env.RECEIPT_ISSUER_NAME || "";
export const promptPayConfigured = () => {
  try { target(promptPayId()); return true; } catch { return false; }
};

/** ลายเซ็นกัน URL ของ QR ถูกเดา (ผูกกับเลขงาน + ยอด) */
const secret = () => process.env.AUTH_SECRET || "dev-secret";
export const paySig = (code: string, amount: number) => createHmac("sha256", secret()).update(`${code}:${amount}`).digest("base64url").slice(0, 24);
export function verifyPaySig(code: string, amount: number, sig: string) {
  const a = Buffer.from(sig || ""), b = Buffer.from(paySig(code, amount));
  return a.length === b.length && timingSafeEqual(a, b);
}
