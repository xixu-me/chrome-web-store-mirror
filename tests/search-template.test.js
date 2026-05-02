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
});
