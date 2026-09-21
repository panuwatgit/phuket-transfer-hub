import { NextResponse, type NextRequest } from "next/server";

// ภาษาไทยเป็นหลัก URL ไม่มี prefix → rewrite ภายในไป /th/... ; /en/... ผ่านตรง
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/en" || pathname.startsWith("/en/") || pathname === "/th" || pathname.startsWith("/th/")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/th${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // เฉพาะหน้า public — ข้าม admin, api, ไฟล์ static
  matcher: ["/((?!admin|api|_next|.*\\..*).*)"],
};
