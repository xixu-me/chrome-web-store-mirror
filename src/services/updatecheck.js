import { CHROME_CRX_DOWNLOAD_URL } from "../config/constants.js";

export const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

const FALLBACK_CHROME_VERSION = "147.0.0.0";

export function getChromeProductVersion(request) {
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

export function buildCrxServiceUrl(request, itemId, responseType) {
  const serviceUrl = new URL(CHROME_CRX_DOWNLOAD_URL);
  serviceUrl.searchParams.set("response", responseType);
  serviceUrl.searchParams.set("prodversion", getChromeProductVersion(request));
  serviceUrl.searchParams.set("acceptformat", "crx2,crx3");
  serviceUrl.searchParams.set("x", `id=${itemId}&installsource=ondemand&uc`);
  return serviceUrl;
}

function decodeXmlEntity(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function parseAttributes(tag) {
  const attributes = {};
  const attributePattern = /\s([A-Za-z_:-][A-Za-z0-9_:.-]*)="([^"]*)"/g;
  for (const match of tag.matchAll(attributePattern)) {
    attributes[match[1]] = decodeXmlEntity(match[2]);
  }
  return attributes;
}

export function parseUpdatecheckMetadata(xml) {
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

export async function fetchUpdatecheckMetadata(request, itemId) {
  const updateUrl = buildCrxServiceUrl(request, itemId, "updatecheck");

  const updateResponse = await fetch(updateUrl.toString(), {
    headers: {
      Accept: "text/xml, application/xml, */*",
      "User-Agent": request.headers.get("User-Agent") || "Cloudflare Worker",
    },
    redirect: "manual",
  });

  if (REDIRECT_STATUSES.has(updateResponse.status)) {
    return {
      error: "Failed to resolve CRX metadata redirect",
      status: 502,
    };
  }

  if (!updateResponse.ok) {
    return {
      error: "Failed to fetch CRX metadata",
      status: 502,
    };
  }

  const metadata = parseUpdatecheckMetadata(await updateResponse.text());
  if (!metadata?.version || Number.isNaN(metadata.size)) {
    return {
      error: "CRX metadata not found",
      status: 404,
    };
  }

  return {
    metadata,
    status: 200,
  };
}
