/**
 * CRX metadata handler
 */

import { CHROME_CRX_DOWNLOAD_URL } from "../config/constants.js";
import { isValidExtensionId } from "../utils/extension.js";

const FALLBACK_CHROME_VERSION = "147.0.0.0";

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

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });
}

function decodeXmlEntity(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parseAttributes(tag) {
  const attributes = {};
  const attributePattern = /\s([A-Za-z_:-][A-Za-z0-9_:.-]*)="([^"]*)"/g;
  for (const match of tag.matchAll(attributePattern)) {
    attributes[match[1]] = decodeXmlEntity(match[2]);
  }
  return attributes;
}

function parseUpdatecheckMetadata(xml) {
  const appTag = xml.match(/<app\b[^>]*>/)?.[0];
  const updatecheckTag = xml.match(/<updatecheck\b[^>]*>/)?.[0];

  if (!appTag || !updatecheckTag) {
    return null;
  }

  const app = parseAttributes(appTag);
  const updatecheck = parseAttributes(updatecheckTag);

  if (app.status !== "ok" || updatecheck.status !== "ok") {
    return null;
  }

  return {
    version: updatecheck.version,
    size: Number.parseInt(updatecheck.size, 10),
    hashSha256: updatecheck.hash_sha256,
    fingerprint: updatecheck.fp,
  };
}

/**
 * Handles requests for live CRX metadata.
 * @param {Request} request The incoming request.
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
export async function handleMeta(request) {
  const url = new URL(request.url);
  const itemId = url.pathname.split("/")[2];

  if (!isValidExtensionId(itemId)) {
    return jsonResponse({ error: "Invalid extension id" }, 404);
  }

  const updateUrl = new URL(CHROME_CRX_DOWNLOAD_URL);
  updateUrl.searchParams.set("response", "updatecheck");
  updateUrl.searchParams.set("prodversion", getChromeProductVersion(request));
  updateUrl.searchParams.set("acceptformat", "crx2,crx3");
  updateUrl.searchParams.set("x", `id=${itemId}&installsource=ondemand&uc`);

  const updateResponse = await fetch(updateUrl.toString(), {
    headers: {
      Accept: "text/xml, application/xml, */*",
      "User-Agent": request.headers.get("User-Agent") || "Cloudflare Worker",
    },
    redirect: "error",
  });

  if (!updateResponse.ok) {
    return jsonResponse({ error: "Failed to fetch CRX metadata" }, 502);
  }

  const metadata = parseUpdatecheckMetadata(await updateResponse.text());
  if (!metadata?.version || Number.isNaN(metadata.size)) {
    return jsonResponse({ error: "CRX metadata not found" }, 404);
  }

  return jsonResponse({
    id: itemId,
    ...metadata,
    downloadUrl: `/crx/${itemId}`,
  });
}
