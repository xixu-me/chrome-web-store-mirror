/**
 * Cache service for managing data.json from GitHub releases
 */

import { CACHE_DURATION, DATA_JSON_URL } from "../config/constants.js";
import { logError } from "../utils/logger.js";

// In-memory cache for the data.json file
let itemsCache = null;
let lastFetch = 0;

/**
 * Fetches and caches the data.json file.
 * @returns {Promise<Array>} A promise that resolves to the array of items.
 */
export async function getItems() {
  const now = Date.now();
  if (itemsCache && now - lastFetch < CACHE_DURATION) {
    return itemsCache;
  }

  try {
    const response = await fetch(DATA_JSON_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data.json: ${response.statusText}`);
    }
    const data = await response.json();
    itemsCache = data;
    lastFetch = now;
    return itemsCache;
  } catch (error) {
    logError("Error fetching data.json:", error);
    // If fetch fails, return the old cache if it exists
    return itemsCache || [];
  }
}
