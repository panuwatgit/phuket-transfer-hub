import { NextResponse } from "next/server";
import { beginLogin, loginConfigured } from "@/lib/line-login";

// เริ่ม LINE Login: /api/line/login?return=/request&lang=th
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ret = url.searchParams.get("return") || "/request";
  const safeReturn = ret.startsWith("/") && !ret.startsWith("//") ? ret : "/request";
  if (!loginConfigured()) return NextResponse.redirect(new URL(`${safeReturn}${safeReturn.includes("?") ? "&" : "?"}line=unavailable`, url.origin));
  return NextResponse.redirect(await beginLogin(safeReturn, url.searchParams.get("lang") || "th"));
}
