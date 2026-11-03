/**
 * Output escaping helpers for Chrome Web Store Mirror
 *
 * Centralizes context-aware escaping so untrusted values (search queries,
 * request paths, item ids, etc.) can be safely embedded in generated HTML.
 */

const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

const SCRIPT_ESCAPE_MAP = {
  "<": "\\u003C",
  ">": "\\u003E",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

/**
 * Escapes HTML special characters for use in HTML text or quoted attributes
 * @param {*} text - Value to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) return "";

  return String(text).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

/**
 * Serializes a value as JSON that is safe to embed inside an inline
 * <script> element (including JSON-LD). Escapes characters that could close
 * the script element, open an HTML comment, or break JavaScript parsing.
 * @param {*} value - Value to serialize
 * @param {number|string} [space] - Optional JSON.stringify indentation
 * @returns {string} Script-safe JSON string
 */
export function serializeForScript(value, space) {
  const json = JSON.stringify(value, null, space);
  if (json === undefined) return "undefined";

  return json.replace(/[<>&\u2028\u2029]/g, (char) => SCRIPT_ESCAPE_MAP[char]);
}
