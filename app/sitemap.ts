import { MetadataRoute } from "next";
import { listPublicCars } from "@/lib/data/cars";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ksrautos.nl";

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/aanbod", changeFrequency: "daily", priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/over-ons", changeFrequency: "monthly", priority: 0.6 },
  { path: "/auto-verkopen", changeFrequency: "monthly", priority: 0.6 },
  { path: "/auto-zoeken", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacyverklaring", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let carEntries: MetadataRoute.Sitemap = [];
  try {
    const { cars } = await listPublicCars({ filters: { includeReserved: true, includeSold: false }, limit: 1000 });
    carEntries = cars.map((c) => ({
      url: `${siteUrl}/aanbod/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // ignore — sitemap should never block the build
  }

  return [...staticEntries, ...carEntries];
}
