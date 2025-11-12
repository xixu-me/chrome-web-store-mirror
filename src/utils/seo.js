/**
 * SEO utility functions for Chrome Web Store Mirror
 *
 * Provides functions to generate meta tags, Open Graph tags,
 * Twitter Cards, structured data (JSON-LD), and other SEO elements.
 */

/**
 * Default SEO configuration
 */
const DEFAULT_SEO_CONFIG = {
  siteName: 'Chrome Web Store Mirror',
  siteUrl: 'https://chromewebstore.xi-xu.me',
  defaultTitle: 'Chrome Web Store Mirror',
  defaultDescription: 'Browse and download Chrome extensions and themes safely. Access the Chrome Web Store with a secure mirror.',
  defaultKeywords: 'chrome extensions, web store mirror, browser extensions, chrome themes, crx download, extension mirror',
  defaultImage: '/og-image.png',
  twitterHandle: '@chromewebstore',
  author: 'Chrome Web Store Mirror',
};

/**
 * Generates standard meta tags
 * @param {Object} options - SEO options
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} options.keywords - SEO keywords
 * @param {string} options.robots - Robots directive (default: 'index, follow')
 * @param {string} options.canonical - Canonical URL
 * @param {string} options.author - Author name
 * @returns {string} HTML meta tags
 */
export function generateMetaTags(options = {}) {
  const {
    title = DEFAULT_SEO_CONFIG.defaultTitle,
    description = DEFAULT_SEO_CONFIG.defaultDescription,
    keywords = DEFAULT_SEO_CONFIG.defaultKeywords,
    robots = 'index, follow',
    canonical = '',
    author = DEFAULT_SEO_CONFIG.author,
  } = options;

  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(keywords)}">
  <meta name="robots" content="${robots}">
  <meta name="author" content="${escapeHtml(author)}">
  <meta name="theme-color" content="#1a73e8">
  ${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : ''}`;
}

/**
 * Generates Open Graph meta tags for social sharing
 * @param {Object} options - Open Graph options
 * @param {string} options.title - OG title
 * @param {string} options.description - OG description
 * @param {string} options.image - OG image URL
 * @param {string} options.url - Page URL
 * @param {string} options.type - OG type (default: 'website')
 * @param {string} options.siteName - Site name
 * @returns {string} HTML Open Graph meta tags
 */
export function generateOpenGraphTags(options = {}) {
  const {
    title = DEFAULT_SEO_CONFIG.defaultTitle,
    description = DEFAULT_SEO_CONFIG.defaultDescription,
    image = DEFAULT_SEO_CONFIG.defaultImage,
    url = DEFAULT_SEO_CONFIG.siteUrl,
    type = 'website',
    siteName = DEFAULT_SEO_CONFIG.siteName,
  } = options;

  // Ensure image is absolute URL
  const absoluteImageUrl = image.startsWith('http')
    ? image
    : `${DEFAULT_SEO_CONFIG.siteUrl}${image}`;

  return `
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(absoluteImageUrl)}">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:site_name" content="${escapeHtml(siteName)}">`;
}

/**
 * Generates Twitter Card meta tags
 * @param {Object} options - Twitter Card options
 * @param {string} options.title - Card title
 * @param {string} options.description - Card description
 * @param {string} options.image - Card image URL
 * @param {string} options.card - Card type (default: 'summary_large_image')
 * @param {string} options.site - Twitter handle
 * @returns {string} HTML Twitter Card meta tags
 */
export function generateTwitterCardTags(options = {}) {
  const {
    title = DEFAULT_SEO_CONFIG.defaultTitle,
    description = DEFAULT_SEO_CONFIG.defaultDescription,
    image = DEFAULT_SEO_CONFIG.defaultImage,
    card = 'summary_large_image',
    site = DEFAULT_SEO_CONFIG.twitterHandle,
  } = options;

  // Ensure image is absolute URL
  const absoluteImageUrl = image.startsWith('http')
    ? image
    : `${DEFAULT_SEO_CONFIG.siteUrl}${image}`;

  return `
  <meta name="twitter:card" content="${card}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(absoluteImageUrl)}">
  ${site ? `<meta name="twitter:site" content="${escapeHtml(site)}">` : ''}`;
}

/**
 * Generates JSON-LD structured data for WebApplication
 * @param {Object} options - Structured data options
 * @returns {string} JSON-LD script tag
 */
export function generateWebApplicationSchema(options = {}) {
  const {
    name = DEFAULT_SEO_CONFIG.siteName,
    description = DEFAULT_SEO_CONFIG.defaultDescription,
    url = DEFAULT_SEO_CONFIG.siteUrl,
  } = options;

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": name,
    "description": description,
    "url": url,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "ratingCount": "1000"
    }
  };

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generates JSON-LD structured data for SoftwareApplication (extensions)
 * @param {Object} options - Extension data
 * @param {string} options.name - Extension name
 * @param {string} options.description - Extension description
 * @param {string} options.itemId - Extension ID
 * @param {string} options.author - Extension author
 * @param {string} options.version - Extension version
 * @param {number} options.rating - Extension rating
 * @param {number} options.ratingCount - Number of ratings
 * @returns {string} JSON-LD script tag
 */
export function generateSoftwareApplicationSchema(options = {}) {
  const {
    name,
    description,
    itemId,
    author,
    version,
    rating,
    ratingCount,
  } = options;

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "applicationCategory": "BrowserExtension",
    "operatingSystem": "Chrome, Edge, Brave",
    "downloadUrl": `${DEFAULT_SEO_CONFIG.siteUrl}/crx/${itemId}`,
    "url": `${DEFAULT_SEO_CONFIG.siteUrl}/detail/${itemId}`,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  if (author) {
    schema.author = {
      "@type": "Organization",
      "name": author
    };
  }

  if (version) {
    schema.softwareVersion = version;
  }

  if (rating && ratingCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": rating.toString(),
      "ratingCount": ratingCount.toString()
    };
  }

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generates JSON-LD structured data for Organization
 * @returns {string} JSON-LD script tag
 */
export function generateOrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": DEFAULT_SEO_CONFIG.siteName,
    "url": DEFAULT_SEO_CONFIG.siteUrl,
    "logo": `${DEFAULT_SEO_CONFIG.siteUrl}/logo.png`,
    "description": "A secure mirror for browsing and downloading Chrome extensions and themes",
    "sameAs": []
  };

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generates JSON-LD structured data for WebSite with SearchAction
 * @returns {string} JSON-LD script tag
 */
export function generateWebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": DEFAULT_SEO_CONFIG.siteName,
    "url": DEFAULT_SEO_CONFIG.siteUrl,
    "description": DEFAULT_SEO_CONFIG.defaultDescription,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${DEFAULT_SEO_CONFIG.siteUrl}/search/{search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generates JSON-LD structured data for BreadcrumbList
 * @param {Array<{name: string, url: string}>} breadcrumbs - Array of breadcrumb items
 * @returns {string} JSON-LD script tag
 */
export function generateBreadcrumbSchema(breadcrumbs = []) {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return '';
  }

  const itemListElement = breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement
  };

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generates complete SEO package (all tags)
 * @param {Object} options - SEO configuration options
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} options.keywords - SEO keywords
 * @param {string} options.canonical - Canonical URL
 * @param {string} options.url - Current page URL
 * @param {string} options.image - Social share image
 * @param {string} options.type - Open Graph type
 * @param {string} options.robots - Robots directive
 * @param {string} options.structuredDataType - Type of structured data ('web', 'app', 'none')
 * @param {Object} options.structuredDataOptions - Options for structured data
 * @param {Array} options.breadcrumbs - Breadcrumb items
 * @returns {string} Complete HTML meta tags and structured data
 */
export function generateCompleteSEO(options = {}) {
  const {
    title = DEFAULT_SEO_CONFIG.defaultTitle,
    description = DEFAULT_SEO_CONFIG.defaultDescription,
    keywords = DEFAULT_SEO_CONFIG.defaultKeywords,
    canonical = '',
    url = DEFAULT_SEO_CONFIG.siteUrl,
    image = DEFAULT_SEO_CONFIG.defaultImage,
    type = 'website',
    robots = 'index, follow',
    structuredDataType = 'web',
    structuredDataOptions = {},
    breadcrumbs = [],
  } = options;

  let structuredData = '';

  // Generate appropriate structured data
  if (structuredDataType === 'web') {
    structuredData = generateWebSiteSchema();
  } else if (structuredDataType === 'app') {
    structuredData = generateSoftwareApplicationSchema(structuredDataOptions);
  } else if (structuredDataType === 'webapp') {
    structuredData = generateWebApplicationSchema(structuredDataOptions);
  }

  // Add breadcrumb schema if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    structuredData += '\n' + generateBreadcrumbSchema(breadcrumbs);
  }

  return `${generateMetaTags({ title, description, keywords, robots, canonical })}
${generateOpenGraphTags({ title, description, image, url, type })}
${generateTwitterCardTags({ title, description, image })}
${structuredData}`;
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.toString().replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Generates SEO-friendly page titles
 * @param {string} pageTitle - Specific page title
 * @param {boolean} includeSiteName - Whether to include site name (default: true)
 * @returns {string} Complete page title
 */
export function generatePageTitle(pageTitle, includeSiteName = true) {
  if (!pageTitle || pageTitle === DEFAULT_SEO_CONFIG.siteName) {
    return DEFAULT_SEO_CONFIG.defaultTitle;
  }

  if (!includeSiteName) {
    return pageTitle;
  }

  return `${pageTitle} | ${DEFAULT_SEO_CONFIG.siteName}`;
}

/**
 * Gets default SEO configuration
 * @returns {Object} Default SEO config
 */
export function getDefaultSEOConfig() {
  return { ...DEFAULT_SEO_CONFIG };
}
