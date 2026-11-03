/**
 * Tests for search page rendering.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Search handler", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders the root search page without fetching the full data catalog", async () => {
    const { handleSearch } = await import("../src/handlers/search.js");

    const response = await handleSearch(new Request("https://example.com/"));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
    expect(html).toContain("/data.json");
    expect(html).not.toContain("const items = [");
  });

  it("escapes a reflected XSS payload from the search path", async () => {
    const { handleSearch } = await import("../src/handlers/search.js");
    const payload = "</script><script>alert(document.domain)</script>";

    const response = await handleSearch(
      new Request(`https://example.com/search/${encodeURIComponent(payload)}`),
    );
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).not.toContain(payload);
    expect(html).not.toContain("<script>alert(document.domain)");
    expect(html).toContain("\\u003C/script\\u003E");
  });
});
