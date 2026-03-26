import { MetadataRoute } from "next";

import { i18n } from "../i18n-config";
import { WEBSITE_CONFIG } from "@workspace/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = WEBSITE_CONFIG.url;
  const routes = [
    "",
    "/pricing",
    "/story",
    "/features",
    "/integrations",
    "/support",
    "/terms",
    "/policy",
  ];

  const sitemapItems: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    for (const locale of i18n.locales) {
      const isDefault = locale === i18n.defaultLocale;
      // For default locale home page, use baseUrl directly
      const url =
        isDefault && route === "" ? baseUrl : `${baseUrl}/${locale}${route}`;

      const priority =
        route === ""
          ? 1
          : route === "/pricing"
            ? 0.9
            : route === "/features" || route === "/integrations"
              ? 0.8
              : 0.7;

      sitemapItems.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority,
      });
    }
  }

  return sitemapItems;
}
