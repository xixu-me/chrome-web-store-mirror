/**
 * Tests for URL utilities
 */

import { describe, expect, it } from "vitest";
import { rewriteUrls } from "../src/utils/url.js";

describe("URL Utils", () => {
  it("should rewrite Chrome Web Store URLs", () => {
    const content = "Visit https://chromewebstore.google.com/detail/test";
    const origin = "https://mirror.example.com";

    const result = rewriteUrls(content, origin);

    expect(result).toBe("Visit https://mirror.example.com/detail/test");
  });

  it("should rewrite HTML attributes", () => {
    const content = '<a href="/category/extensions">Extensions</a>';
    const origin = "https://mirror.example.com";

    const result = rewriteUrls(content, origin);

    expect(result).toBe(
      '<a href="https://mirror.example.com/category/extensions">Extensions</a>',
    );
  });

  it("should handle multiple URL replacements", () => {
    const content = `
      <link href="/styles.css" rel="stylesheet">
      <script src="/script.js"></script>
      Visit https://chromewebstore.google.com
    `;
    const origin = "https://mirror.example.com";

    const result = rewriteUrls(content, origin);

    expect(result).toContain('href="https://mirror.example.com/styles.css"');
    expect(result).toContain('src="https://mirror.example.com/script.js"');
    expect(result).toContain("Visit https://mirror.example.com");
  });

  it("should rewrite allowed Chrome Web Store image CDN URLs through the asset proxy", () => {
    const content = `
      <img src="https://lh3.googleusercontent.com/icon=s128-rj-sc0x00ffffff">
      <meta property="og:image" content="https://lh5.googleusercontent.com/screenshot=w640-h400">
    `;
    const origin = "https://mirror.example.com";

    const result = rewriteUrls(content, origin);

    expect(result).toContain(
      'src="https://mirror.example.com/asset?url=https%3A%2F%2Flh3.googleusercontent.com%2Ficon%3Ds128-rj-sc0x00ffffff"',
    );
    expect(result).toContain(
      'content="https://mirror.example.com/asset?url=https%3A%2F%2Flh5.googleusercontent.com%2Fscreenshot%3Dw640-h400"',
    );
  });

  it("should not rewrite non-image Google asset hosts through the asset proxy", () => {
    const content = '<script src="https://www.gstatic.com/script.js"></script>';
    const origin = "https://mirror.example.com";

    const result = rewriteUrls(content, origin);

    expect(result).toBe(content);
  });
});
