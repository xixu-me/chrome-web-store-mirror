/**
 * Search page template for Chrome Web Store Mirror
 *
 * Provides the HTML template and structure for the search functionality.
 */

import { getSearchScript } from "../assets/scripts.js";
import { getPageTemplate } from "./base.js";
import { getDefaultSEOConfig } from "../utils/seo.js";

/**
 * Generates the search page HTML with SEO optimization
 * @param {Array} items - Array of extension items
 * @param {string} initialQuery - Initial search query from URL
 * @param {number} maxResults - Maximum number of results to display
 * @param {string} currentUrl - Current page URL for SEO
 * @returns {string} Complete search page HTML
 */
export function getSearchPageTemplate(items, initialQuery = '', maxResults = 100, currentUrl = '') {
  const searchContent = `
    <section class="search-container" role="search" aria-label="Extension search">
      <input type="text" id="search-input" placeholder="Search extensions and themes..." aria-label="Search extensions and themes">
      <div class="search-icon" aria-hidden="true">🔍</div>
    </section>

    <section id="results" role="region" aria-live="polite" aria-label="Search results"></section>
  `;

  const seoConfig = getDefaultSEOConfig();
  const pageTitle = initialQuery
    ? `Search: ${initialQuery}`
    : 'Browse Chrome Extensions & Themes';

  const description = initialQuery
    ? `Search results for "${initialQuery}" - Browse Chrome extensions and themes safely`
    : 'Search and browse thousands of Chrome extensions and themes safely. Download .crx files from our secure Chrome Web Store mirror.';

  const keywords = initialQuery
    ? `${initialQuery}, chrome extensions, browser extensions, ${seoConfig.defaultKeywords}`
    : seoConfig.defaultKeywords;

  const searchPageHtml = getPageTemplate(
    pageTitle,
    searchContent,
    {
      pageType: 'search',
      scripts: getSearchScript(items, initialQuery, maxResults),
      seo: {
        description: description,
        keywords: keywords,
        canonical: currentUrl || seoConfig.siteUrl,
        url: currentUrl || seoConfig.siteUrl,
        type: 'website',
        robots: 'index, follow',
        structuredDataType: 'web',
        structuredDataOptions: {
          name: seoConfig.siteName,
          description: description,
          url: seoConfig.siteUrl
        }
      }
    }
  );

  return searchPageHtml;
}
