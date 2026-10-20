import type { MetadataRoute } from "next";
import { pages } from "@/lib/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    ...Object.keys(pages).map((slug) => ({
      url: `${baseUrl}/${slug}/`,
      changeFrequency: "monthly" as const,
      priority: slug === "contact-us" ? 0.9 : 0.8,
    })),
  ];
}
