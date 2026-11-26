import "server-only";
import { randomUUID } from "node:crypto";
import type { Order, OrderStatus } from "@/types/exam";

/**
 * Buyurtmalar ombori. Hozircha faqat jarayon xotirasida — bu mock to'lov
 * (faqat development) uchun yetarli. Haqiqiy provayder (Click/Payme) callback'lari
 * server-server keladi va bir nechta instansiyada ishlaydi, shuning uchun
 * production'da OrderStore'ning DB implementatsiyasi majburiy (docs/ARCHITECTURE.md).
 */
export interface OrderStore {
  create(input: Pick<Order, "uid" | "productId" | "examId" | "amount" | "provider">): Promise<Order>;
  get(id: string): Promise<Order | undefined>;
  setStatus(id: string, status: OrderStatus): Promise<Order | undefined>;
  markClaimed(id: string): Promise<boolean>;
}

const PENDING_TTL_MS = 30 * 60 * 1000;

const g = globalThis as typeof globalThis & { __huquqlabOrders?: Map<string, Order> };
const orders = (g.__huquqlabOrders ??= new Map());

export const memoryOrderStore: OrderStore = {
  async create(input) {
    const now = new Date().toISOString();
    const order: Order = { ...input, id: randomUUID(), status: "pending", createdAt: now, updatedAt: now, claimed: false };
    orders.set(order.id, order);
    return order;
  },
  async get(id) {
    const order = orders.get(id);
    if (order?.status === "pending" && Date.now() - Date.parse(order.createdAt) > PENDING_TTL_MS) {
      order.status = "expired";
      order.updatedAt = new Date().toISOString();
    }
    return order;
  },
  async setStatus(id, status) {
    const order = orders.get(id);
    if (!order) return undefined;
    // Yakuniy holat o'zgarmaydi: to'langan buyurtma «failed»ga qaytmaydi
    if (order.status !== "pending") return order;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  },
  async markClaimed(id) {
    const order = orders.get(id);
    if (!order || order.claimed || order.status !== "paid") return false;
    order.claimed = true;
    return true;
  },
};

export const orderStore: OrderStore = memoryOrderStore;
