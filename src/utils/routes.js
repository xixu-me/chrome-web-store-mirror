/**
 * Route classification utilities.
 */

import { CHROME_WEBSTORE_BASE_URL } from "../config/constants.js";

const REDIRECT_ONLY_PREFIXES = [
  "/user",
  "/webstore/devconsole",
  "/developer",
  "/account",
];

function matchesPathOrChild(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isMirrorPagePath(pathname) {
  return (
    pathname === "/" ||
    pathname === "/search" ||
    pathname.startsWith("/search/") ||
    matchesPathOrChild(pathname, "/category/extensions") ||
    matchesPathOrChild(pathname, "/category/themes") ||
    matchesPathOrChild(pathname, "/collection")
  );
}

export function isRedirectOnlyPath(pathname) {
  return REDIRECT_ONLY_PREFIXES.some((prefix) =>
    matchesPathOrChild(pathname, prefix),
  );
}

export function buildChromeWebStoreUrl(requestUrl) {
  return `${CHROME_WEBSTORE_BASE_URL}${requestUrl.pathname}${requestUrl.search}`;
}
