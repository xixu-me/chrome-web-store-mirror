/**
 * Tests for request routing that must avoid loading the full catalog in memory.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Router", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("streams data.json from the fixed catalog URL", async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("[]"));
        controller.close();
      },
    });

    fetch.mockResolvedValueOnce(
      new Response(body, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Cache-Control": "public, max-age=1800",
        },
      }),
    );

    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request("https://example.com/data.json"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/json;charset=UTF-8",
    );
    expect(await response.text()).toBe("[]");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("proxies detail pages from the item id without fetching data.json", async () => {
    fetch.mockResolvedValueOnce(
      new Response("<html><body>detail</body></html>", {
        headers: { "Content-Type": "text/html" },
      }),
    );

    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request(
        "https://example.com/detail/abcdefghijklmnopabcdefghijklmnop",
      ),
    );

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(
      "https://chromewebstore.google.com/detail/abcdefghijklmnopabcdefghijklmnop",
    );
  });

  it("proxies redirected Chrome Web Store detail paths using the final item id", async () => {
    fetch.mockResolvedValueOnce(
      new Response("<html><body>detail</body></html>", {
        headers: { "Content-Type": "text/html" },
      }),
    );

    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request(
        "https://example.com/detail/example-extension/abcdefghijklmnopabcdefghijklmnop",
      ),
    );

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(
      "https://chromewebstore.google.com/detail/example-extension/abcdefghijklmnopabcdefghijklmnop",
    );
  });

  it("streams CRX downloads from the item id without fetching data.json", async () => {
    fetch.mockResolvedValueOnce(new Response("crx", { status: 302 }));

    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request("https://example.com/crx/abcdefghijklmnopabcdefghijklmnop"),
    );

    expect(response.status).toBe(302);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toContain(
      "https://clients2.google.com/service/update2/crx",
    );
    expect(fetch.mock.calls[0][0]).toContain(
      "id%3Dabcdefghijklmnopabcdefghijklmnop",
    );
    expect(fetch.mock.calls[0][0]).toContain("prodversion=147.0.0.0");
  });

  it("uses the request Chrome version for CRX download requests", async () => {
    fetch.mockResolvedValueOnce(new Response("crx", { status: 302 }));

    const { handleRequest } = await import("../src/router.js");
    await handleRequest(
      new Request("https://example.com/crx/abcdefghijklmnopabcdefghijklmnop", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 AppleWebKit/537.36 Chrome/149.2.3.4 Safari/537.36",
        },
      }),
    );

    expect(fetch.mock.calls[0][0]).toContain("prodversion=149.2.3.4");
  });
});
