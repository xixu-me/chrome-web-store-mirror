/**
 * Image asset proxy handler
 */

import { validateImageAssetUrl } from "../services/assets.js";

/**
 * Handles requests for proxied Chrome Web Store image assets.
 * @param {Request} request The incoming request.
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
export async function handleAsset(request) {
  const requestUrl = new URL(request.url);
  const validation = validateImageAssetUrl(requestUrl.searchParams.get("url"));

  if (validation.error) {
    return new Response(validation.error, {
      status: validation.status,
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
      },
    });
  }

  const assetResponse = await fetch(validation.url.toString(), {
    headers: {
      Accept:
        request.headers.get("Accept") ||
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "User-Agent": request.headers.get("User-Agent") || "Cloudflare Worker",
      Referer: "https://chromewebstore.google.com/",
    },
    redirect: "follow",
  });

  const headers = new Headers(assetResponse.headers);
  headers.delete("Set-Cookie");
  headers.set("Cache-Control", "public, max-age=86400");

  return new Response(assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers,
  });
}
