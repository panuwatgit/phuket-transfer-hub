import { NextResponse } from "next/server";
import { beginLogin, loginConfigured } from "@/lib/line-login";
import { BRAND } from "@/lib/config";

// เริ่ม LINE Login: /api/line/login?return=/request&lang=th
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ret = url.searchParams.get("return") || "/request";
  const safeReturn = ret.startsWith("/") && !ret.startsWith("//") ? ret : "/request";
  // ใช้โดเมนของเว็บเสมอ — หลังพร็อกซีของ Railway req.url เป็น localhost:8080
  if (!loginConfigured()) return NextResponse.redirect(new URL(`${safeReturn}${safeReturn.includes("?") ? "&" : "?"}line=unavailable`, BRAND.siteUrl));
  return NextResponse.redirect(await beginLogin(safeReturn, url.searchParams.get("lang") || "th"));
}
