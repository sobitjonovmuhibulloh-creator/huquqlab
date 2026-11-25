import type { MetadataRoute } from "next";
import { scenarios } from "@/data/simulators";
import { topics } from "@/data/topics";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/mavzular", "/simulyatorlar", "/testlar", "/kutubxona", "/haqida"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  return [
    ...pages,
    ...topics.map((t) => ({ url: `${SITE_URL}/mavzular/${t.slug}`, lastModified: t.updatedAt, priority: 0.7 })),
    ...scenarios.map((s) => ({ url: `${SITE_URL}/simulyatorlar/${s.id}`, priority: 0.7 })),
  ];
}
