/**
 * Detail page handler
 */

import { CHROME_WEBSTORE_BASE_URL } from "../config/constants.js";
import { isValidExtensionId } from "../utils/extension.js";
import { proxyRequest } from "../utils/proxy.js";
import { handle404 } from "./error.js";

/**
 * Handles requests for item detail pages.
 * @param {Request} request The incoming request.
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
export async function handleDetail(request) {
  const url = new URL(request.url);
  // Accept /detail/id and /detail/slug/id, optionally followed by a
  // supported subpage. Reject repeated detail segments before any fetch.
  let pathSegments;
  try {
    pathSegments = url.pathname
      .replace(/\/$/, "")
      .split("/")
      .slice(2)
      .map((segment) => decodeURIComponent(segment));
  } catch {
    return handle404(request);
  }
  if (
    pathSegments.some(
      (segment) => !segment || segment.includes("/") || segment.includes("\\"),
    )
  ) {
    return handle404(request);
  }
  if (["reviews", "support", "report"].includes(pathSegments.at(-1))) {
    pathSegments.pop();
  }
  const itemId = pathSegments.at(-1);
  if (
    !isValidExtensionId(itemId) ||
    pathSegments.length < 1 ||
    pathSegments.length > 2 ||
    (pathSegments.length === 2 && pathSegments[0].toLowerCase() === "detail")
  ) {
    return handle404(request);
  }

  return proxyRequest(
    request,
    `${CHROME_WEBSTORE_BASE_URL}${url.pathname}${url.search}`,
    itemId,
  );
}
