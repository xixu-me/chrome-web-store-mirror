/**
 * CRX metadata handler
 */

import { fetchUpdatecheckMetadata } from "../services/updatecheck.js";
import { isValidExtensionId } from "../utils/extension.js";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });
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

  const result = await fetchUpdatecheckMetadata(request, itemId);
  if (result.error) {
    return jsonResponse({ error: result.error }, result.status);
  }

  return jsonResponse({
    id: itemId,
    ...result.metadata,
    downloadUrl: `/crx/${itemId}`,
  });
}
