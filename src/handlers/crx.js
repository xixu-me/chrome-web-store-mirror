/**
 * CRX download handler
 */

import { CHROME_CRX_DOWNLOAD_URL } from "../config/constants.js";
import { isValidExtensionId } from "../utils/extension.js";
import { handle404 } from "./error.js";

const FALLBACK_CHROME_VERSION = "147.0.0.0";
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function getChromeProductVersion(request) {
  const userAgent = request.headers.get("User-Agent") || "";
  const match = userAgent.match(
    /(?:Chrome|Chromium)\/([0-9]+(?:\.[0-9]+){0,3})/,
  );

  if (!match) {
    return FALLBACK_CHROME_VERSION;
  }

  const parts = match[1].split(".").slice(0, 4);
  while (parts.length < 4) {
    parts.push("0");
  }
  return parts.join(".");
}

/**
 * Handles requests for CRX file downloads.
 * @param {Request} request The incoming request.
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
export async function handleCrx(request) {
  const url = new URL(request.url);
  const itemId = url.pathname.split("/")[2];

  if (!isValidExtensionId(itemId)) {
    return handle404(request);
  }

  const downloadUrl = new URL(CHROME_CRX_DOWNLOAD_URL);
  downloadUrl.searchParams.set("response", "redirect");
  downloadUrl.searchParams.set("prodversion", getChromeProductVersion(request));
  downloadUrl.searchParams.set("acceptformat", "crx2,crx3");
  downloadUrl.searchParams.set("x", `id=${itemId}&installsource=ondemand&uc`);

  const crxResponse = await fetch(downloadUrl.toString(), {
    headers: {
      Accept: "application/x-chrome-extension, application/octet-stream, */*",
      "User-Agent": request.headers.get("User-Agent") || "Cloudflare Worker",
    },
    redirect: "follow",
  });

  if (REDIRECT_STATUSES.has(crxResponse.status)) {
    return new Response("Failed to resolve CRX download redirect", {
      status: 502,
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
      },
    });
  }

  const newHeaders = new Headers(crxResponse.headers);
  newHeaders.delete("Location");
  newHeaders.delete("Set-Cookie");
  newHeaders.set("Content-Disposition", `attachment; filename="${itemId}.crx"`);
  if (!newHeaders.has("Content-Type")) {
    newHeaders.set("Content-Type", "application/x-chrome-extension");
  }

  return new Response(crxResponse.body, {
    status: crxResponse.status,
    statusText: crxResponse.statusText,
    headers: newHeaders,
  });
}
