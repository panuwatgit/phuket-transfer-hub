import { NextResponse } from "next/server";
import { completeLogin } from "@/lib/line-login";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code"), state = url.searchParams.get("state");
  if (!code || !state) return NextResponse.redirect(new URL("/request?line=cancelled", url.origin));
  try {
    const { returnTo } = await completeLogin(code, state);
    return NextResponse.redirect(new URL(`${returnTo}${returnTo.includes("?") ? "&" : "?"}line=ok`, url.origin));
  } catch (e) {
    console.error("[line-login]", e);
    return NextResponse.redirect(new URL("/request?line=error", url.origin));
  }
}
