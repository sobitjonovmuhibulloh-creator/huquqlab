import "server-only";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, getAdminConfig, verifySessionToken } from "@/lib/admin-auth";

/** /api/admin/* middleware bilan himoyalanmagan — har bir route sessiyani shu yerda tekshiradi */
export function isAdmin(request: NextRequest) {
  return verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value, getAdminConfig());
}
