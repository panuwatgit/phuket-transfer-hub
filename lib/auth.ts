import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// เฟส 1: แอดมินคนเดียว รหัสผ่านใน env, session = HMAC(secret, "admin") ใน cookie httpOnly
export const SESSION_COOKIE = "pth_admin";
const secret = () => process.env.AUTH_SECRET || "dev-secret";
const sessionValue = () => createHmac("sha256", secret()).update("admin").digest("hex");

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAdmin() {
  const store = await cookies();
  const v = store.get(SESSION_COOKIE)?.value;
  if (!v) return false;
  const a = Buffer.from(v);
  const b = Buffer.from(sessionValue());
  return a.length === b.length && timingSafeEqual(a, b);
}

/** ใช้ในทุก server action / page ของ /admin */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
