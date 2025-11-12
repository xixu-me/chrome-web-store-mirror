/**
 * Request router for Chrome Web Store Mirror
 */

import { CHROME_WEBSTORE_BASE_URL } from "./config/constants.js";
import { handleCrx } from "./handlers/crx.js";
import { handleDetail } from "./handlers/detail.js";
import { handle404 } from "./handlers/error.js";
import { handleRobots } from "./handlers/robots.js";
import { handleSearch } from "./handlers/search.js";
import { handleSitemap } from "./handlers/sitemap.js";
import { proxyRequest } from "./utils/proxy.js";

/**
 * Handles incoming requests and routes them to the appropriate handler.
 * @param {Request} request The incoming request.
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
export async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === "/" || url.pathname === "") {
    // Show search page directly at root
    return handleSearch(request);
  }

  // SEO files
  if (url.pathname === "/robots.txt") {
    return handleRobots(request);
  }

  if (url.pathname === "/sitemap.xml") {
    return handleSitemap(request);
  }

  if (url.pathname.startsWith("/detail/")) {
    return handleDetail(request);
  }

  if (url.pathname.startsWith("/crx/")) {
    return handleCrx(request);
  }

  if (url.pathname.startsWith("/search")) {
    return handleSearch(request);
  }

  // For other paths, attempt to proxy them from the original site.
  try {
    const proxyResponse = await proxyRequest(
      request,
      `${CHROME_WEBSTORE_BASE_URL}${url.pathname}${url.search}`
    );

    // If proxy request returns 404 or fails, show our 404 page
    if (proxyResponse.status === 404) {
      return handle404(request);
    }

    return proxyResponse;
  } catch (error) {
    // If proxy request fails, show our 404 page
    return handle404(request);
  }
}
