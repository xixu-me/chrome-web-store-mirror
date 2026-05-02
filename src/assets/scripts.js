/**
 * Client-side JavaScript utilities for Chrome Web Store Mirror
 *
 * This module contains all client-side JavaScript functionality,
 * providing interactive features for the mirror application.
 */

/**
 * Search functionality for the search page
 * @param {string} dataUrl - URL for the item catalog JSON
 * @param {string} initialQuery - Initial search query from URL
 * @param {number} maxResults - Maximum number of results to display
 * @returns {string} JavaScript code for search functionality
 */
export function getSearchScript(
  dataUrl = "/data.json",
  initialQuery = "",
  maxResults = 100,
) {
  return `
    const dataUrl = ${JSON.stringify(dataUrl)};
    const searchInput = document.getElementById('search-input');
    const resultsDiv = document.getElementById('results');
    let itemsPromise;
    
    // Get initial query from URL
    const initialQuery = ${JSON.stringify(initialQuery)};
    if (initialQuery) {
      searchInput.value = initialQuery;
      performSearch(initialQuery);
    }

    function loadItems() {
      if (!itemsPromise) {
        itemsPromise = fetch(dataUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to load extension catalog');
            }
            return response.json();
          });
      }
      return itemsPromise;
    }

    function clearResults() {
      resultsDiv.replaceChildren();
    }

    function setStatus(className, icon, message) {
      clearResults();
      const status = document.createElement('div');
      status.className = className;

      if (icon) {
        const iconElement = document.createElement('div');
        iconElement.className = className + '-icon';
        iconElement.textContent = icon;
        status.appendChild(iconElement);
      }

      const text = document.createElement('p');
      text.textContent = message;
      status.appendChild(text);
      resultsDiv.appendChild(status);
    }

    function setLoading() {
      clearResults();
      const loading = document.createElement('div');
      loading.className = 'loading';
      const spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      loading.appendChild(spinner);
      loading.appendChild(document.createTextNode('Searching...'));
      resultsDiv.appendChild(loading);
    }

    function createResultItem(item, index) {
      const id = typeof item.id === 'string' ? item.id : '';
      const name = typeof item.name === 'string' ? item.name : id;
      const detailPath = '/detail/' + encodeURIComponent(id);

      const itemElement = document.createElement('div');
      itemElement.className = 'item';
      itemElement.style.setProperty('--index', index);
      itemElement.addEventListener('click', () => {
        window.open(detailPath, '_blank');
      });

      const link = document.createElement('a');
      link.href = detailPath;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = name;
      link.addEventListener('click', (event) => event.stopPropagation());

      const idElement = document.createElement('div');
      idElement.className = 'id';
      idElement.textContent = id;

      itemElement.append(link, idElement);
      return itemElement;
    }

    /**
     * Performs search and updates the results display
     * @param {string} query - Search query
     */
    async function performSearch(query) {
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.length < 1) {
        clearResults();
        return;
      }

      // Show loading state
      setLoading();
      
      // Simulate brief delay for better UX
      setTimeout(async () => {
        let items;
        try {
          items = await loadItems();
        } catch (error) {
          setStatus('empty-state', '!', 'Unable to load the extension catalog. Please try again later.');
          return;
        }

        const filteredItems = items.filter(item => 
          (typeof item.name === 'string' && item.name.toLowerCase().includes(lowerQuery)) ||
          (typeof item.id === 'string' && item.id.toLowerCase() === lowerQuery)
        );
        
        if (filteredItems.length === 0) {
          setStatus('empty-state', '📦', \`No extensions or themes found matching "\${query}"\`);
          return;
        }

        clearResults();
        const fragment = document.createDocumentFragment();
        filteredItems.slice(0, ${maxResults}).forEach((item, index) => {
          fragment.appendChild(createResultItem(item, index));
        });
        resultsDiv.appendChild(fragment);
        
        // Trigger animation
        resultsDiv.style.opacity = '0';
        setTimeout(() => {
          resultsDiv.style.opacity = '1';
        }, 10);
      }, 150);
    }

    // Event listeners for search functionality
    searchInput.addEventListener('input', () => {
      const query = searchInput.value;
      
      // Update URL without page reload
      let newUrl;
      
      if (query) {
        // If there's a query, use /search/{query}
        newUrl = \`/search/\${encodeURIComponent(query)}\`;
      } else {
        // If no query, go back to home page
        newUrl = '/';
      }
      
      window.history.pushState({}, '', newUrl);
      performSearch(query);
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value;
        if (query) {
          window.location.href = \`/search/\${encodeURIComponent(query)}\`;
        } else {
          window.location.href = '/';
        }
      }
    });
  `;
}

/**
 * Generic utility functions that can be used across different pages
 * @returns {string} JavaScript code for utility functions
 */
export function getUtilityScript() {
  return `
    /**
     * Debounce function to limit the rate of function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Execute immediately on first call
     * @returns {Function} Debounced function
     */
    function debounce(func, wait, immediate) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          timeout = null;
          if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
      };
    }

    /**
     * Throttle function to limit the rate of function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    function throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }

    /**
     * Smooth scroll to element
     * @param {string} elementId - ID of element to scroll to
     */
    function smoothScrollTo(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async function copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          return true;
        } catch (fallbackErr) {
          return false;
        } finally {
          document.body.removeChild(textArea);
        }
      }
    }
  `;
}
