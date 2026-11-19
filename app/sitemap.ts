import type { MetadataRoute } from "next";
import { pageMeta, siteUrl } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(pageMeta).map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: new Date("2026-11-17"),
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.path === "/" ? 1 : 0.7,
  }));
}
