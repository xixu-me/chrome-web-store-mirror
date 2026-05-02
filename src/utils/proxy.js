/**
 * Proxy utilities for handling requests to Chrome Web Store
 *
 * Handles proxying requests to the original Chrome Web Store while
 * applying necessary URL rewrites and replacing install buttons with CRX downloads.
 */

import { handleRedirect, rewriteUrls } from "./url.js";

/**
 * Proxies and processes a request to the original Chrome Web Store
 * @param {Request} request - The incoming request
 * @param {string} targetUrl - The URL to proxy to
 * @param {string} itemId - The item ID (optional, only for detail pages)
 * @returns {Promise<Response>} A promise that resolves to the processed response
 */
export async function proxyRequest(request, targetUrl, itemId = null) {
  const response = await fetch(targetUrl, {
    headers: {
      "User-Agent": request.headers.get("User-Agent") || "Cloudflare Worker",
      Accept: request.headers.get("Accept") || "*/*",
      "Accept-Language":
        request.headers.get("Accept-Language") || "en-US,en;q=0.9",
      Referer: new URL(targetUrl).origin,
    },
    redirect: "manual",
  });

  if ([301, 302, 307, 308].includes(response.status)) {
    return handleRedirect(response, request);
  }

  if (!response.ok) {
    return new Response(
      `Failed to fetch from Chrome Web Store: ${response.status}`,
      {
        status: response.status,
      },
    );
  }

  const contentType = response.headers.get("Content-Type") || "";
  const workerUrl = new URL(request.url);

  if (contentType.includes("text/html")) {
    let html = await response.text();
    html = rewriteUrls(html, workerUrl.origin);
    html = injectHeaderActionRemovalScript(html);
    if (itemId) {
      html = injectDownloadButtonScript(html, itemId, workerUrl.origin);
    }
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  } else if (contentType.includes("text/css")) {
    let css = await response.text();
    css = rewriteUrls(css, workerUrl.origin);
    return new Response(css, {
      status: 200,
      headers: { "Content-Type": "text/css; charset=UTF-8" },
    });
  } else if (
    contentType.includes("javascript") ||
    contentType.includes("json")
  ) {
    let js = await response.text();
    js = rewriteUrls(js, workerUrl.origin);
    return new Response(js, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } else {
    return new Response(response.body, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  }
}

function injectHeaderActionRemovalScript(html) {
  const style = `
  <style id="mirror-header-action-style">
  header[role="banner"] [role="search"],
  header[role="banner"] .keVMg,
  header[role="banner"] .BW8iFc {
    display: none !important;
  }
  </style>
  `;
  const script = `
  <script id="mirror-header-action-removal-script">
  (() => {
    const selectors = [
      'header[role="banner"] [role="search"]',
      'header[role="banner"] .keVMg',
      'header[role="banner"] .BW8iFc',
    ];

    const removeHeaderActions = () => {
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          element.remove();
        });
      });
    };

    const observe = () => {
      removeHeaderActions();
      if (!document.body) {
        return;
      }
      new MutationObserver(removeHeaderActions).observe(document.body, {
        childList: true,
        subtree: true,
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", observe, { once: true });
    } else {
      observe();
    }
  })();
  </script>
  `;

  const withStyle = html.includes("</head>")
    ? html.replace("</head>", `${style}</head>`)
    : `${style}${html}`;

  return withStyle.includes("</body>")
    ? withStyle.replace("</body>", `${script}</body>`)
    : `${withStyle}${script}`;
}

/**
 * Injects a script that replaces the upstream Add to Chrome button with a CRX download link.
 * @param {string} html - The HTML content
 * @param {string} itemId - The item ID for the CRX download
 * @param {string} origin - The origin of the worker
 * @returns {string} The HTML with the replacement script added
 */
function injectDownloadButtonScript(html, itemId, origin) {
  const downloadUrl = `${origin}/crx/${itemId}`;
  const script = `
  <script id="mirror-download-button-script">
  (() => {
    const downloadUrl = ${scriptString(downloadUrl)};
    const downloadText = "Download CRX";
    const addButtonLabels = new Set([
      "Add to Chrome",
      "Add to Desktop",
      "添加到 Chrome",
      "添加至 Chrome",
    ]);
    const installButtonSelector = "button.UywwFc-LgbsSe";
    const installButtonTextSelector = ".UywwFc-vQzf8d";

    const normalize = (value) => value.trim().replace(/\\s+/g, " ");

    const isInstallButton = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }
      if (element.dataset.mirrorDownloadButton === "true") {
        return false;
      }

      if (
        element.matches(installButtonSelector) &&
        element.querySelector(installButtonTextSelector)
      ) {
        return true;
      }

      const text = normalize(
        element.innerText ||
          element.textContent ||
          element.getAttribute("aria-label") ||
          "",
      );
      return addButtonLabels.has(text);
    };

    const replaceButton = (button) => {
      if (!button.parentNode) {
        return;
      }

      const buttonStyle = getComputedStyle(button);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.className = button.className;
      link.textContent = downloadText;
      link.setAttribute("role", "button");
      link.setAttribute("aria-label", downloadText);
      link.setAttribute("data-mirror-download-button", "true");
      [
        "fontFamily",
        "fontSize",
        "fontWeight",
        "lineHeight",
        "letterSpacing",
      ].forEach((property) => {
        link.style[property] = buttonStyle[property];
      });
      link.style.color = "white";
      link.style.setProperty("color", "white", "important");
      link.style.setProperty("font-weight", "700", "important");
      link.style.textDecoration = "none";
      button.replaceWith(link);
    };

    const scan = () => {
      document
        .querySelectorAll('button, [role="button"]')
        .forEach((element) => {
          if (isInstallButton(element)) {
            replaceButton(element);
          }
        });
    };

    const observe = () => {
      if (!document.body) {
        return;
      }
      scan();
      new MutationObserver(scan).observe(document.body, {
        childList: true,
        subtree: true,
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", observe, { once: true });
    } else {
      observe();
    }
  })();
  </script>
  `;

  return html.includes("</body>")
    ? html.replace("</body>", `${script}</body>`)
    : `${html}${script}`;
}

function scriptString(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
