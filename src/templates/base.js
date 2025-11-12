/**
 * Base HTML template system for Chrome Web Store Mirror
 *
 * Provides a consistent base template and utilities for generating
 * HTML pages with proper structure and styling.
 */

import { getStyles } from "../assets/styles.js";
import { generateCompleteSEO, generatePageTitle } from "../utils/seo.js";

/**
 * Generates a complete HTML page with consistent structure and SEO optimization
 * @param {string} title - Page title
 * @param {string} content - Main page content (HTML)
 * @param {Object} options - Additional options
 * @param {string} options.pageType - Type of page for specific styles
 * @param {string} options.additionalCSS - Additional CSS to include
 * @param {string} options.scripts - JavaScript code to include
 * @param {Object} options.seo - SEO configuration options
 * @param {string} options.seo.description - Page description
 * @param {string} options.seo.keywords - SEO keywords
 * @param {string} options.seo.canonical - Canonical URL
 * @param {string} options.seo.url - Current page URL
 * @param {string} options.seo.image - Social share image
 * @param {string} options.seo.type - Open Graph type
 * @param {string} options.seo.robots - Robots directive
 * @param {string} options.seo.structuredDataType - Type of structured data
 * @param {Object} options.seo.structuredDataOptions - Structured data options
 * @param {Array} options.seo.breadcrumbs - Breadcrumb items
 * @returns {string} Complete HTML page
 */
export function getPageTemplate(title, content, options = {}) {
  const {
    pageType = 'base',
    additionalCSS = '',
    scripts = '',
    seo = {}
  } = options;

  // Generate complete page title
  const fullTitle = generatePageTitle(title);

  // Generate all SEO meta tags
  const seoTags = generateCompleteSEO({
    title: fullTitle,
    ...seo
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${fullTitle}</title>
  ${seoTags}
  <style>
    ${getStyles(pageType)}
    ${additionalCSS}
  </style>
</head>
<body>
  <div class="container">
    <header class="header" role="banner">
      <h1>Chrome Web Store Mirror</h1>
      <p class="subtitle">Browse and download extensions and themes safely</p>
    </header>
    <main id="main-content" role="main">
      ${content}
    </main>
  </div>
  ${scripts ? `<script>${scripts}</script>` : ''}
</body>
</html>`;
}

/**
 * Generates a simple content wrapper for pages that don't need the full header
 * @param {string} content - Content to wrap
 * @param {string} additionalCSS - Additional CSS
 * @returns {string} Wrapped content
 */
export function getContentWrapper(content, additionalCSS = '') {
  return `
    <div class="content-wrapper">
      ${content}
    </div>
    ${additionalCSS ? `<style>${additionalCSS}</style>` : ''}
  `;
}

/**
 * Generates common HTML elements with consistent styling
 */
export const htmlElements = {
  /**
   * Creates a styled button element
   * @param {string} text - Button text
   * @param {string} href - Button link
   * @param {string} type - Button type (primary, secondary)
   * @param {Object} attributes - Additional attributes
   * @returns {string} Button HTML
   */
  button(text, href = '#', type = 'primary', attributes = {}) {
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    return `<a href="${href}" class="btn btn-${type}" ${attrs}>${text}</a>`;
  },

  /**
   * Creates a card container
   * @param {string} content - Card content
   * @param {Object} attributes - Additional attributes
   * @returns {string} Card HTML
   */
  card(content, attributes = {}) {
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    return `<div class="card" ${attrs}>${content}</div>`;
  },

  /**
   * Creates an icon element
   * @param {string} icon - Icon character or emoji
   * @param {string} className - Additional CSS classes
   * @returns {string} Icon HTML
   */
  icon(icon, className = '') {
    return `<span class="icon ${className}">${icon}</span>`;
  },

  /**
   * Creates a loading spinner
   * @param {string} text - Loading text
   * @returns {string} Loading spinner HTML
   */
  loading(text = 'Loading...') {
    return `
      <div class="loading">
        <div class="loading-spinner"></div>
        ${text}
      </div>
    `;
  }
};
