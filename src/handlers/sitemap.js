/**
 * Sitemap handler for Chrome Web Store Mirror
 *
 * Generates dynamic XML sitemap for search engine crawlers
 */

import { logError } from "../utils/logger.js";

/**
 * Escapes XML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeXml(text) {
  if (!text) return "";

  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  };

  return text.toString().replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Generates a sitemap URL entry
 * @param {string} loc - URL location
 * @param {string} lastmod - Last modification date (ISO format)
 * @param {string} changefreq - Change frequency
 * @param {string} priority - Priority (0.0 to 1.0)
 * @returns {string} XML URL entry
 */
function generateUrlEntry(
  loc,
  lastmod = "",
  changefreq = "weekly",
  priority = "0.5",
) {
  return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Handles requests for sitemap.xml
 * @param {Request} request - The incoming request
 * @returns {Promise<Response>} Response containing sitemap XML
 */
export async function handleSitemap(request) {
  const url = new URL(request.url);
  const baseUrl = url.origin;

  try {
    // Get current date in ISO format for lastmod
    const currentDate = new Date().toISOString().split("T")[0];

    let urlEntries = "";

    // Add main pages
    urlEntries += generateUrlEntry(baseUrl, currentDate, "daily", "1.0");
    urlEntries += generateUrlEntry(
      `${baseUrl}/search`,
      currentDate,
      "daily",
      "1.0",
    );

    // Generate complete sitemap XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;

    return new Response(sitemapXml, {
      headers: {
        "Content-Type": "application/xml;charset=UTF-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logError("Error generating sitemap:", error);

    // Return a minimal sitemap with just the main pages if generation fails
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      headers: {
        "Content-Type": "application/xml;charset=UTF-8",
        "Cache-Control": "public, max-age=600", // Shorter cache for fallback
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}
