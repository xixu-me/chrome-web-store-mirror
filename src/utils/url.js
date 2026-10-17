/**
 * URL manipulation utilities
 */

import { CHROME_WEBSTORE_BASE_URL } from "../config/constants.js";
import { rewriteImageAssetUrls } from "../services/assets.js";

/**
 * Rewrites URLs in the content to point to the mirror.
 * @param {string} content The content (HTML, CSS, JS) to process.
 * @param {string} origin The origin of the worker.
 * @returns {string} The content with rewritten URLs.
 */
export function rewriteUrls(content, origin) {
  content = rewriteImageAssetUrls(content, origin);
  content = rewriteBrandText(content);
  // General URL rewrite for CSS, JS, etc.
  content = content.split(CHROME_WEBSTORE_BASE_URL).join(origin);
  // Resolve document-relative HTML URLs against the store root, just like
  // the upstream <base>. Crawlers need not implement <base> to follow them.
  content = content.replace(/<[a-z][^>]*>/gi, (tag) =>
    tag.replace(
      /(\s(?:href|src|action)\s*=\s*)(["'])(.*?)\2/gi,
      (attribute, prefix, quote, value) => {
        if (
          !value ||
          value.startsWith("#") ||
          value.startsWith("//") ||
          /^[a-z][a-z\d+.-]*:/i.test(value)
        ) {
          return attribute;
        }
        const resolved = new URL(value, `${origin}/`).href;
        return `${prefix}${quote}${resolved}${quote}`;
      },
    ),
  );
  return content;
}

function rewriteBrandText(content) {
  return content.replace(
    />\s*Chrome Web Store\s*</g,
    ">Chrome Web Store Mirror<",
  );
}

/**
 * Handles redirects from the original site.
 * @param {Response} response The redirect response.
 * @param {Request} request The original request.
 * @returns {Response} A new redirect response for the mirror.
 */
export function handleRedirect(response, request) {
  const workerUrl = new URL(request.url);
  const location = response.headers.get("Location");
  if (location) {
    let newLocation;
    if (location.startsWith(CHROME_WEBSTORE_BASE_URL)) {
      const locationUrl = new URL(location);
      newLocation = `${workerUrl.origin}${locationUrl.pathname}${locationUrl.search}`;
    } else if (location.startsWith("http")) {
      newLocation = location;
    } else {
      newLocation = `${workerUrl.origin}${location}`;
    }
    return Response.redirect(newLocation, response.status);
  }
  return response;
}
