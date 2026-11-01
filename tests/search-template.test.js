/**
 * Tests for the search page template.
 */

import { describe, expect, it } from "vitest";
import { DATA_JSON_PATH } from "../src/config/constants.js";
import { getSearchPageTemplate } from "../src/templates/search.js";

describe("Search template", () => {
  it("references the streaming data endpoint instead of embedding catalog data", () => {
    const html = getSearchPageTemplate(
      "quoted ' query",
      100,
      "https://example.com/search",
    );

    expect(html).toContain(DATA_JSON_PATH);
    expect(html).toContain("quoted ' query");
    expect(html).not.toContain("JSON.stringify");
    expect(html).not.toContain("const items = [");
  });

  it("does not let the search query break out of the inline script or title", () => {
    const payload = "</script><script>alert(document.domain)</script>";
    const html = getSearchPageTemplate(
      payload,
      100,
      "https://example.com/search",
    );

    expect(html).not.toContain(payload);
    expect(html).not.toContain("<script>alert(document.domain)");
    expect(html).toContain(
      'const initialQuery = "\\u003C/script\\u003E\\u003Cscript\\u003Ealert(document.domain)\\u003C/script\\u003E";',
    );
    expect(html).toContain(
      "<title>Search: &lt;/script&gt;&lt;script&gt;alert(document.domain)&lt;/script&gt; | Chrome Web Store Mirror</title>",
    );
    // Only the page script and JSON-LD block should open script elements.
    expect(html.match(/<script[\s>]/g)).toHaveLength(2);
  });
});
