import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { BRAND } from "./config";

// LINE Login (OAuth 2.1) — ใช้ในฟอร์มขั้น 3 เพื่อรู้ userId ลูกค้าก่อนส่ง + ชวนแอด OA (bot_prompt)
export const LINE_COOKIE = "pth_line";
const STATE_COOKIE = "pth_line_state";
const secret = () => process.env.AUTH_SECRET || "dev-secret";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");

export type LineProfile = { userId: string; displayName: string; pictureUrl?: string; friend: boolean; at: number };

export const loginConfigured = () => !!(process.env.LINE_LOGIN_CHANNEL_ID && process.env.LINE_LOGIN_CHANNEL_SECRET);
export const redirectUri = () => `${BRAND.siteUrl}/api/line/login/callback`;

/** สร้าง URL ไปหน้า LINE Login + เก็บ state/return ใน cookie */
export async function beginLogin(returnTo: string, lang: string) {
  const state = randomBytes(12).toString("base64url");
  const store = await cookies();
  store.set(STATE_COOKIE, `${state}|${returnTo}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  const p = new URLSearchParams({
    response_type: "code", client_id: process.env.LINE_LOGIN_CHANNEL_ID!, redirect_uri: redirectUri(), state,
    scope: "profile openid", bot_prompt: "aggressive", ui_locales: lang === "en" ? "en" : "th",
  });
  return `https://access.line.me/oauth2/v2.1/authorize?${p}`;
}

/** callback: ตรวจ state → แลก token → ดึงโปรไฟล์ + สถานะเพื่อน → เก็บ cookie (เซ็นด้วย HMAC) */
export async function completeLogin(code: string, state: string) {
  const store = await cookies();
  const raw = store.get(STATE_COOKIE)?.value ?? "";
  const [expected, returnTo = "/request"] = raw.split("|");
  store.delete(STATE_COOKIE);
  if (!expected || expected !== state) throw new Error("bad state");

  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri(), client_id: process.env.LINE_LOGIN_CHANNEL_ID!, client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET! }),
  });
  if (!tokenRes.ok) throw new Error(`token ${tokenRes.status}: ${await tokenRes.text()}`);
  const tok = (await tokenRes.json()) as { access_token: string };
  const [profile, friendship] = await Promise.all([
    fetch("https://api.line.me/v2/profile", { headers: { Authorization: `Bearer ${tok.access_token}` } }).then((r) => r.json() as Promise<{ userId: string; displayName: string; pictureUrl?: string }>),
    fetch("https://api.line.me/friendship/v1/status", { headers: { Authorization: `Bearer ${tok.access_token}` } }).then((r) => (r.ok ? (r.json() as Promise<{ friendFlag: boolean }>) : { friendFlag: false })),
  ]);
  const lp: LineProfile = { userId: profile.userId, displayName: profile.displayName, pictureUrl: profile.pictureUrl, friend: !!friendship.friendFlag, at: Date.now() };
  const payload = Buffer.from(JSON.stringify(lp)).toString("base64url");
  store.set(LINE_COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 });
  return { profile: lp, returnTo };
}

/** อ่านโปรไฟล์ LINE ที่เชื่อมไว้ (ถ้ามีและลายเซ็นถูก) */
export async function getLineProfile(): Promise<LineProfile | null> {
  const store = await cookies();
  const v = store.get(LINE_COOKIE)?.value;
  if (!v) return null;
  const [payload, sig] = v.split(".");
  if (!payload || !sig) return null;
  const a = Buffer.from(sig), b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()) as LineProfile; } catch { return null; }
}

export async function clearLineProfile() {
  (await cookies()).delete(LINE_COOKIE);
}
