import { NextResponse } from "next/server";
import { clearLineProfile } from "@/lib/line-login";
import { BRAND } from "@/lib/config";

export async function GET(req: Request) {
  await clearLineProfile();
  const url = new URL(req.url);
  const ret = url.searchParams.get("return") || "/request";
  return NextResponse.redirect(new URL(ret.startsWith("/") && !ret.startsWith("//") ? ret : "/request", BRAND.siteUrl));
}
