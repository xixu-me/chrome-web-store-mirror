/**
 * Chrome Web Store Mirror - Cloudflare Worker Entry Point
 * 
 * This worker provides a mirror for Chrome Web Store functionality,
 * allowing users to safely browse and download extensions and themes.
 */

import { handleRequest } from "./router.js";

/**
 * Main worker export using modern Cloudflare Workers syntax
 */
export default {
  /**
   * Handles incoming fetch requests
   * @param {Request} request - The incoming request
   * @param {Object} env - Environment variables and bindings
   * @param {Object} ctx - Execution context
   * @returns {Promise<Response>} - Response to the request
   */
  async fetch(request, _env, _ctx) {
    return handleRequest(request);
  },
};
