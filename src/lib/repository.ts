import { scenarios as demoScenarios } from "@/data/simulators";
import { topics as demoTopics } from "@/data/topics";
import type { Scenario, Topic } from "@/types";
import { readJSON, removeKey, STORAGE_KEYS, writeJSON } from "./storage";

/**
 * Kontent manbasi uchun abstraksiya.
 *
 * Hozir: LocalContentRepository — demo ma'lumotlar + admin o'zgarishlari
 * brauzer localStorage'ida.
 * Keyin: PrismaContentRepository (PostgreSQL) yoki /api orqali ishlovchi
 * HttpContentRepository shu interfeysni amalga oshiradi va UI o'zgarmaydi.
 * Batafsil: prisma/schema.prisma va README.md.
 */
export interface ContentRepository {
  listTopics(): Promise<Topic[]>;
  saveTopic(topic: Topic): Promise<Topic>;
  deleteTopic(id: string): Promise<void>;
  replaceTopics(topics: Topic[]): Promise<void>;
  listScenarios(): Promise<Scenario[]>;
  reset(): Promise<void>;
}

interface StoredContent {
  version: 1;
  topics: Topic[];
}

export class LocalContentRepository implements ContentRepository {
  private load(): Topic[] {
    const stored = readJSON<StoredContent | null>(STORAGE_KEYS.content, null);
    if (stored && stored.version === 1 && Array.isArray(stored.topics)) return stored.topics;
    return demoTopics;
  }

  private persist(topics: Topic[]) {
    if (!writeJSON(STORAGE_KEYS.content, { version: 1, topics } satisfies StoredContent)) {
      throw new Error("Brauzer xotirasiga saqlab bo‘lmadi. Xotira to‘lgan yoki bloklangan bo‘lishi mumkin.");
    }
  }

  async listTopics() {
    return this.load();
  }

  async saveTopic(topic: Topic) {
    const topics = this.load();
    const slugTaken = topics.some((t) => t.slug === topic.slug && t.id !== topic.id);
    if (slugTaken) throw new Error(`«${topic.slug}» manzili band. Boshqa slug tanlang.`);
    const saved = { ...topic, updatedAt: new Date().toISOString().slice(0, 10) };
    const index = topics.findIndex((t) => t.id === topic.id);
    const next = index === -1 ? [...topics, saved] : topics.map((t) => (t.id === topic.id ? saved : t));
    this.persist(next);
    return saved;
  }

  async deleteTopic(id: string) {
    this.persist(this.load().filter((t) => t.id !== id));
  }

  async replaceTopics(topics: Topic[]) {
    this.persist(topics);
  }

  async listScenarios() {
    return demoScenarios;
  }

  async reset() {
    removeKey(STORAGE_KEYS.content);
  }
}

export const contentRepository: ContentRepository = new LocalContentRepository();
