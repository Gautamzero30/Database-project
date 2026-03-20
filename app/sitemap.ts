import type { MetadataRoute } from "next";
import { LEVELS } from "@/lib/levels";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const levelRoutes: MetadataRoute.Sitemap = LEVELS.map((level) => ({
    url: `${baseUrl}/level/${level.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...coreRoutes, ...levelRoutes];
}
