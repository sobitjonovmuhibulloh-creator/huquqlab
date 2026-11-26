import { NextResponse, type NextRequest } from "next/server";
import { publicAccess, readAccess } from "@/server/access";
import { handle } from "@/server/http";

export const dynamic = "force-dynamic";

export const GET = handle(async (request: NextRequest) => {
  return NextResponse.json(publicAccess(readAccess(request)), { headers: { "Cache-Control": "no-store" } });
});
