import { describe, expect, it } from "vitest";

import { getPageTemplate } from "../src/templates/base.js";

describe("Base template", () => {
  it("mentions the source repository with a safe external link", () => {
    const html = getPageTemplate("Test page", "<p>content</p>");

    expect(html).toContain("Source repository");
    expect(html).toContain(
      'href="https://github.com/xixu-me/chrome-web-store-mirror"',
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
