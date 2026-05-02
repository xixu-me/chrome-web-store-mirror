/**
 * CRX download handler
 */

import { CHROME_WEBSTORE_BASE_URL } from "../config/constants.js";
import {
  buildCrxServiceUrl,
  fetchUpdatecheckMetadata,
  REDIRECT_STATUSES,
} from "../services/updatecheck.js";
import { isValidExtensionId } from "../utils/extension.js";
import { handle404 } from "./error.js";

const CHROME_WEB_STORE_TITLE_SUFFIX = " - Chrome Web Store";

function decodeHtmlEntity(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parseExtensionName(html) {
  const metaTitle =
    html.match(
      /<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    )?.[1] ||
    html.match(
      /<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i,
    )?.[1] ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

  if (!metaTitle) {
    return null;
  }

  const title = decodeHtmlEntity(metaTitle).trim();
  return title.endsWith(CHROME_WEB_STORE_TITLE_SUFFIX)
    ? title.slice(0, -CHROME_WEB_STORE_TITLE_SUFFIX.length).trim()
    : title;
}

function sanitizeFilenamePart(value) {
  return value
    .split("")
    .map((character) => {
      const codePoint = character.charCodeAt(0);
      return codePoint < 32 ||
        codePoint === 127 ||
        '<>:"/\\|?*'.includes(character)
        ? "_"
        : character;
    })
    .join("")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim()
    .slice(0, 120);
}

function encodeRFC5987Value(value) {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function buildContentDisposition(filename) {
  const fallback = filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "_");
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeRFC5987Value(filename)}`;
}

async function fetchExtensionName(request, itemId) {
  const detailUrl = `${CHROME_WEBSTORE_BASE_URL}/detail/${itemId}`;
  const response = await fetch(detailUrl, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language":
        request.headers.get("Accept-Language") || "en-US,en;q=0.9",
      "User-Agent": request.headers.get("User-Agent") || "Cloudflare Worker",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    return null;
  }

  return parseExtensionName(await response.text());
}

async function buildDownloadFilename(request, itemId) {
  try {
    const namePromise = fetchExtensionName(request, itemId);
    const metadataPromise = fetchUpdatecheckMetadata(request, itemId);
    const [nameResult, metadataResult] = await Promise.allSettled([
      namePromise,
      metadataPromise,
    ]);

    if (
      nameResult.status !== "fulfilled" ||
      metadataResult.status !== "fulfilled" ||
      metadataResult.value.error
    ) {
      return `${itemId}.crx`;
    }

    const name = sanitizeFilenamePart(nameResult.value || itemId);
    const version = sanitizeFilenamePart(metadataResult.value.metadata.version);

    if (!name || !version) {
      return `${itemId}.crx`;
    }

    return `${name} ${version}.crx`;
  } catch {
    return `${itemId}.crx`;
  }
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

  const filename = await buildDownloadFilename(request, itemId);
  const downloadUrl = buildCrxServiceUrl(request, itemId, "redirect");

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
  newHeaders.set("Content-Disposition", buildContentDisposition(filename));
  if (!newHeaders.has("Content-Type")) {
    newHeaders.set("Content-Type", "application/x-chrome-extension");
  }

  return new Response(crxResponse.body, {
    status: crxResponse.status,
    statusText: crxResponse.statusText,
    headers: newHeaders,
  });
}
