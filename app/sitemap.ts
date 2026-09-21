import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.siteUrl;
  const pages = ["", "/request", "/terms"];
  return pages.flatMap((p) => [
    { url: `${base}${p || "/"}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: p ? 0.7 : 1, alternates: { languages: { th: `${base}${p || "/"}`, en: `${base}/en${p}` } } },
    { url: `${base}/en${p}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: p ? 0.6 : 0.9, alternates: { languages: { th: `${base}${p || "/"}`, en: `${base}/en${p}` } } },
  ]);
}
