/**
 * Consolidated CSS styles for the Chrome Web Store Mirror
 *
 * This module contains all CSS styles used throughout the application,
 * providing a consistent design system and eliminating style duplication.
 */

/**
 * Base CSS variables and common styles
 */
export const baseStyles = `
  :root {
    --primary-color: #0052d9;
    --primary-hover: #1557b0;
    --background: #fafbfc;
    --surface: #ffffff;
    --surface-hover: #f8f9fa;
    --text-primary: #202124;
    --text-secondary: #5f6368;
    --text-tertiary: #9aa0a6;
    --border: #e8eaed;
    --border-hover: #dadce0;
    --shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    --shadow-hover: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    --radius: 8px;
    --radius-large: 12px;
    --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
  }

  * {
    box-sizing: border-box;
  }

  body { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6; 
    margin: 0;
    padding: var(--spacing-lg);
    color: var(--text-primary); 
    background: var(--background);
    min-height: 100vh;
  }

  .container { 
    max-width: 900px; 
    margin: 0 auto;
    animation: fadeInUp 0.6s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  .header h1 {
    font-size: 2.5rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-sm) 0;
    background: linear-gradient(135deg, var(--primary-color), #4285f4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header .subtitle {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin: 0;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-large);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow);
    transition: var(--transition);
  }

  .card:hover {
    box-shadow: var(--shadow-hover);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    text-decoration: none;
    border-radius: var(--radius);
    font-weight: 600;
    font-size: 0.875rem;
    transition: var(--transition);
    cursor: pointer;
    border: none;
    outline: none;
    min-width: 120px;
    justify-content: center;
    gap: var(--spacing-xs);
  }

  .btn-primary {
    background: var(--primary-color);
    color: white;
    box-shadow: var(--shadow);
  }

  .btn-primary:hover {
    background: var(--primary-hover);
    box-shadow: var(--shadow-hover);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: var(--surface);
    color: var(--text-primary);
    border: 1px solid var(--border);
  }

  .btn-secondary:hover {
    background: var(--surface-hover);
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-1px);
  }

  .actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    flex-wrap: wrap;
    margin-top: var(--spacing-xl);
  }

  .site-footer {
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border);
    color: var(--text-secondary);
    font-size: 0.875rem;
    text-align: center;
  }

  .site-footer a {
    color: var(--primary-color);
    font-weight: 600;
    text-decoration: none;
  }

  .site-footer a:hover {
    color: var(--primary-hover);
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    body {
      padding: var(--spacing-md);
    }

    .header h1 {
      font-size: 2rem;
    }

    .card {
      padding: var(--spacing-lg);
    }

    .actions {
      flex-direction: column;
      align-items: center;
    }

    .btn {
      width: 100%;
      max-width: 200px;
    }
  }
`;

/**
 * Search page specific styles
 */
export const searchStyles = `
  .search-container {
    position: relative;
    margin-bottom: var(--spacing-xl);
  }

  #search-input { 
    width: 100%; 
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 16px; 
    border: 2px solid var(--border);
    border-radius: var(--radius-large);
    background: var(--surface);
    color: var(--text-primary);
    transition: var(--transition);
    outline: none;
    box-shadow: var(--shadow);
  }

  #search-input:focus {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-hover), 0 0 0 3px rgba(26, 115, 232, 0.1);
    transform: translateY(-1px);
  }

  #search-input::placeholder {
    color: var(--text-tertiary);
  }

  .search-icon {
    position: absolute;
    right: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
    pointer-events: none;
    transition: var(--transition);
  }

  #search-input:focus + .search-icon {
    color: var(--primary-color);
  }

  .loading {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-secondary);
  }

  .loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--border);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s ease-in-out infinite;
    margin-right: var(--spacing-sm);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  #results {
    display: grid;
    gap: var(--spacing-md);
    opacity: 0;
    animation: fadeIn 0.4s ease-out 0.1s forwards;
  }

  @keyframes fadeIn {
    to { opacity: 1; }
  }

  .item { 
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: var(--spacing-lg);
    transition: var(--transition);
    cursor: pointer;
    box-shadow: var(--shadow);
    animation: slideInUp 0.3s ease-out;
    animation-fill-mode: both;
  }

  .item:nth-child(n) { animation-delay: calc(var(--index, 0) * 0.05s); }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .item:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
    background: var(--surface-hover);
  }

  .item a { 
    text-decoration: none; 
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1.1rem;
    display: block;
    margin-bottom: var(--spacing-xs);
    transition: var(--transition);
  }

  .item a:hover {
    color: var(--primary-hover);
  }

  .item .id { 
    color: var(--text-tertiary);
    font-size: 0.875rem;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    background: var(--background);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--spacing-xs);
    display: inline-block;
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-secondary);
  }

  .empty-state-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    #search-input {
      padding: var(--spacing-md);
    }

    .item {
      padding: var(--spacing-md);
    }
  }
`;

/**
 * Error page specific styles
 */
export const errorStyles = `
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  .error-icon {
    font-size: 6rem;
    margin-bottom: var(--spacing-lg);
    animation: bounce 2s ease-in-out infinite;
  }

  .error-code {
    font-size: 4rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--primary-color), #4285f4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    line-height: 1;
  }

  .error-title {
    font-size: 1.5rem;
    margin: var(--spacing-lg) 0;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .error-description {
    font-size: 1rem;
    margin: var(--spacing-lg) 0;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .error-path {
    background: var(--surface);
    padding: var(--spacing-md);
    border-radius: var(--radius);
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    margin: var(--spacing-lg) 0;
    word-break: break-all;
    border: 1px solid var(--border);
    color: var(--text-tertiary);
    font-size: 0.875rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
`;

/**
 * Gets the complete CSS for a specific page type
 * @param {string} pageType - Type of page (search, error, base)
 * @returns {string} Combined CSS styles
 */
export function getStyles(pageType = "base") {
  let styles = baseStyles;

  switch (pageType) {
    case "search":
      styles += searchStyles;
      break;
    case "error":
      styles += errorStyles;
      break;
  }

  return styles;
}

/**
 * Legacy compatibility - maintain backwards compatibility
 * @deprecated Use getStyles() instead
 */
export const getSharedCSS = () => baseStyles;
