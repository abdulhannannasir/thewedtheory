import type { MetadataRoute } from "next";
import { THEME_IDS } from "@/components/sites/twt/theory-content";
import { SITE_URL } from "@/lib/site";

/** Every public page, for search engines. A new page needs a line here to be listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/portfolio",
    "/about",
    "/contact",
    "/theory",
    ...THEME_IDS.map((id) => `/theory/${id}`),
  ];
  return paths.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
  }));
}
