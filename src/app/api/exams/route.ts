import { NextResponse } from "next/server";
import { listCatalog } from "@/server/exam-repository";
import { handle } from "@/server/http";

export const dynamic = "force-dynamic";

/** Ochiq katalog (faqat meta-ma'lumot, savollarsiz) */
export const GET = handle(async () => NextResponse.json(await listCatalog(), { headers: { "Cache-Control": "no-store" } }));
