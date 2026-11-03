/**
 * Tests for error page templates.
 */

import { describe, expect, it } from "vitest";
import {
  get404PageTemplate,
  getErrorPageTemplate,
} from "../src/templates/error.js";

describe("Error templates", () => {
  it("escapes the requested path on the 404 page", () => {
    const html = get404PageTemplate(
      "/<img src=x onerror=alert(1)>",
      "https://example.com/",
    );

    expect(html).toContain(
      '<div class="error-path">/&lt;img src=x onerror=alert(1)&gt;</div>',
    );
    expect(html).not.toContain("<img src=x");
  });

  it("escapes status text, message and details on generic error pages", () => {
    const html = getErrorPageTemplate(
      500,
      "<b>Oops</b>",
      "<script>alert(1)</script>",
      '"><svg onload=alert(1)>',
      "https://example.com/",
    );

    expect(html).toContain("&lt;b&gt;Oops&lt;/b&gt;");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("&quot;&gt;&lt;svg onload=alert(1)&gt;");
    expect(html).not.toContain("<script>alert(1)");
    expect(html).not.toContain("<svg");
  });
});
