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
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const itemId = pathSegments[pathSegments.length - 1];

  if (!isValidExtensionId(itemId)) {
    return handle404(request);
  }

  return proxyRequest(
    request,
    `${CHROME_WEBSTORE_BASE_URL}${url.pathname}${url.search}`,
    itemId,
  );
}
