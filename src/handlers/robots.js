/**
 * Robots.txt handler for Chrome Web Store Mirror
 *
 * Provides robots.txt file to guide search engine crawlers
 */

import { getDefaultSEOConfig } from "../utils/seo.js";

/**
 * Handles requests for robots.txt
 * @param {Request} request - The incoming request
 * @returns {Response} Response containing robots.txt content
 */
export function handleRobots(request) {
  const url = new URL(request.url);
  const seoConfig = getDefaultSEOConfig();
  const sitemapUrl = `${url.origin}/sitemap.xml`;

  const robotsTxt = `# Robots.txt for Chrome Web Store Mirror
# Allow crawling of all public pages

User-agent: *
Allow: /
Allow: /search/
Allow: /detail/

# Disallow download endpoints (not useful for indexing)
Disallow: /crx/

# Crawl delay to be respectful
Crawl-delay: 1

# Sitemap location
Sitemap: ${sitemapUrl}

# Specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
}
