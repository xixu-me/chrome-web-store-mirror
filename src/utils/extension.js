/**
 * Chrome extension ID helpers.
 */

const EXTENSION_ID_PATTERN = /^[a-p]{32}$/;

/**
 * Checks whether a path segment is a valid Chrome extension ID.
 * @param {string} itemId - Candidate extension ID.
 * @returns {boolean} Whether the ID is syntactically valid.
 */
export function isValidExtensionId(itemId) {
  return EXTENSION_ID_PATTERN.test(itemId);
}
