import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/server/admin";
import { handle, jsonError } from "@/server/http";
import { getStore } from "@/server/store";

export const dynamic = "force-dynamic";

export const GET = handle(async (request: NextRequest) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  const store = await getStore();
  if (!store) return NextResponse.json({ dbConfigured: false, batches: [] });
  return NextResponse.json({ dbConfigured: true, storeLabel: store.label, batches: await store.listImports() });
});
