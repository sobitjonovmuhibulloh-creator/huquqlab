import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, getAdminConfig, verifySessionToken } from "@/lib/admin-auth";

/** /admin sahifalariga faqat haqiqiy sessiya bilan kirish mumkin */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/kirish") return NextResponse.next();

  const valid = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value, getAdminConfig());
  if (valid) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/admin/kirish";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  const response = NextResponse.redirect(url);
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
