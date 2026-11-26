import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_PRICING } from "@/config/pricing";
import type { PricingConfig, Product } from "@/types/exam";

/**
 * Narxlar ombori. Admin saqlagan narxlar .data/pricing.json faylida turadi
 * (lokal server / VPS uchun). Vercel kabi faqat-o'qish fayl tizimida saqlash
 * xato beradi — u yerda DB kerak (docs/ARCHITECTURE.md, «Pricing»).
 * Shu interfeys saqlanib qoladi, faqat implementatsiya almashtiriladi.
 */

const FILE = path.join(process.cwd(), ".data", "pricing.json");

export async function getPricing(): Promise<PricingConfig> {
  try {
    const saved = JSON.parse(await readFile(FILE, "utf8")) as PricingConfig;
    if (Array.isArray(saved?.products) && saved.products.length) return saved;
  } catch {
    /* fayl yo'q yoki buzilgan — standart narxlar */
  }
  return DEFAULT_PRICING;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return (await getPricing()).products.find((p) => p.id === id);
}

export function validatePricing(raw: unknown): { ok: true; value: PricingConfig } | { ok: false; error: string } {
  const products = (raw as { products?: unknown })?.products;
  if (!Array.isArray(products) || products.length === 0) return { ok: false, error: "Mahsulotlar ro‘yxati bo‘sh" };
  const ids = new Set<string>();
  const clean: Product[] = [];
  for (const p of products as Partial<Product>[]) {
    const base = DEFAULT_PRICING.products.find((d) => d.id === p.id);
    if (!base) return { ok: false, error: `Noma’lum mahsulot: ${String(p.id)}` };
    if (ids.has(base.id)) return { ok: false, error: `Takroriy mahsulot: ${base.id}` };
    ids.add(base.id);
    const price = Number(p.price);
    if (!Number.isInteger(price) || price < 1000 || price > 10_000_000) return { ok: false, error: `${base.title}: narx 1 000 – 10 000 000 so‘m oralig‘ida butun son bo‘lishi kerak` };
    const credits = base.kind === "single" ? 1 : Number(p.credits);
    if (!Number.isInteger(credits) || credits < 1 || credits > 100) return { ok: false, error: `${base.title}: testlar soni 1–100 bo‘lishi kerak` };
    clean.push({
      ...base,
      title: typeof p.title === "string" && p.title.trim() ? p.title.trim().slice(0, 80) : base.title,
      description: typeof p.description === "string" ? p.description.trim().slice(0, 200) : base.description,
      price,
      credits,
      active: p.active !== false,
      highlight: Boolean(p.highlight),
    });
  }
  return { ok: true, value: { currency: "UZS", products: clean, updatedAt: new Date().toISOString().slice(0, 10) } };
}

export async function savePricing(config: PricingConfig) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(config, null, 2), "utf8");
}
