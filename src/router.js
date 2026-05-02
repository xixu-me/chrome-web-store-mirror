/**
 * Request router for Chrome Web Store Mirror
 */

import { handleAsset } from "./handlers/asset.js";
import { handleCrx } from "./handlers/crx.js";
import { handleData } from "./handlers/data.js";
import { handleDetail } from "./handlers/detail.js";
import { handle404 } from "./handlers/error.js";
import { handleMeta } from "./handlers/meta.js";
import { handleRobots } from "./handlers/robots.js";
import { handleSitemap } from "./handlers/sitemap.js";
import { proxyRequest } from "./utils/proxy.js";
import {
  buildChromeWebStoreUrl,
  isMirrorPagePath,
  isRedirectOnlyPath,
} from "./utils/routes.js";

/**
 * Handles incoming requests and routes them to the appropriate handler.
 * @param {Request} request The incoming request.
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
export async function handleRequest(request) {
  const url = new URL(request.url);

  // SEO files
  if (url.pathname === "/robots.txt") {
    return handleRobots(request);
  }

  if (url.pathname === "/sitemap.xml") {
    return handleSitemap(request);
  }

  if (url.pathname === "/data.json") {
    return handleData();
  }

  if (url.pathname === "/asset") {
    return handleAsset(request);
  }

  if (url.pathname.startsWith("/detail/")) {
    return handleDetail(request);
  }

  if (url.pathname.startsWith("/crx/")) {
    return handleCrx(request);
  }

  if (url.pathname.startsWith("/meta/")) {
    return handleMeta(request);
  }

  if (isRedirectOnlyPath(url.pathname)) {
    return Response.redirect(buildChromeWebStoreUrl(url), 302);
  }

  if (isMirrorPagePath(url.pathname)) {
    try {
      const proxyResponse = await proxyRequest(
        request,
        buildChromeWebStoreUrl(url),
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

  return handle404(request);
}
