import { BRAND } from "./config";

// อีเมลผ่าน Resend (REST, ไม่ต้องลง SDK) — ไม่มี RESEND_API_KEY = log แล้วข้าม
export async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || `${BRAND.name} <onboarding@resend.dev>`;
  if (!key) {
    console.log(`[email] (not configured) to=${to} subject=${subject}\n${text}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from, to, subject, text, reply_to: BRAND.email }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return true;
  } catch (e) {
    console.error("[email] send failed", e);
    return false;
  }
}
