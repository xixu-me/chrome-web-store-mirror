/**
 * Data catalog streaming handler.
 */

import { DATA_JSON_URL } from "../config/constants.js";
import { logError } from "../utils/logger.js";

/**
 * Streams the remote catalog without parsing it inside the Worker.
 * @returns {Promise<Response>} Streamed catalog response.
 */
export async function handleData() {
  try {
    const response = await fetch(DATA_JSON_URL, {
      headers: {
        Accept: "application/json,application/octet-stream;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return new Response("Failed to fetch data catalog", {
        status: response.status,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const headers = new Headers(response.headers);
    headers.set("Content-Type", "application/json;charset=UTF-8");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set(
      "Cache-Control",
      response.headers.get("Cache-Control") || "public, max-age=1800",
    );
    headers.delete("Content-Disposition");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    logError("Error streaming data catalog:", error);
    return new Response("Failed to fetch data catalog", {
      status: 502,
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}
