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

  it("streams allowed detail image assets through the asset proxy", async () => {
    fetch.mockResolvedValueOnce(
      new Response("image", {
        headers: {
          "Content-Type": "image/png",
          "Set-Cookie": "secret=value",
        },
      }),
    );

    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request(
        "https://example.com/asset?url=https%3A%2F%2Flh3.googleusercontent.com%2Ficon%3Ds128",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.has("Set-Cookie")).toBe(false);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=86400");
    expect(await response.text()).toBe("image");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(
      "https://lh3.googleusercontent.com/icon=s128",
    );
  });

  it("rejects asset proxy requests for disallowed hosts", async () => {
    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request(
        "https://example.com/asset?url=https%3A%2F%2Fexample.com%2Fimage.png",
      ),
    );

    expect(response.status).toBe(403);
    expect(await response.text()).toBe("Asset host is not allowed");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects asset proxy requests for non-HTTPS URLs", async () => {
    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request(
        "https://example.com/asset?url=http%3A%2F%2Flh3.googleusercontent.com%2Fimage.png",
      ),
    );

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Asset URL must use HTTPS");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reverse proxies CRX downloads from the item id without fetching data.json", async () => {
    fetch
      .mockResolvedValueOnce(
        new Response(
          '<html><head><meta property="og:title" content="Test Extension - Chrome Web Store"></head></html>',
          {
            headers: {
              "Content-Type": "text/html; charset=UTF-8",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          '<?xml version="1.0" encoding="UTF-8"?><gupdate><app appid="abcdefghijklmnopabcdefghijklmnop" status="ok"><updatecheck status="ok" version="1.2.3" size="12345" hash_sha256="abc123" fp="1.abc123"/></app></gupdate>',
          {
            headers: {
              "Content-Type": "text/xml; charset=UTF-8",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response("crx", {
          status: 200,
          headers: {
            "Content-Type": "application/x-chrome-extension",
          },
        }),
      );

    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request("https://example.com/crx/abcdefghijklmnopabcdefghijklmnop"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toBe(
      "attachment; filename=\"Test Extension 1.2.3.crx\"; filename*=UTF-8''Test%20Extension%201.2.3.crx",
    );
    expect(await response.text()).toBe("crx");
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[0][0]).toBe(
      "https://chromewebstore.google.com/detail/abcdefghijklmnopabcdefghijklmnop",
    );
    expect(fetch.mock.calls[0][1]).toMatchObject({
      redirect: "follow",
    });
    expect(fetch.mock.calls[1][0]).toContain("response=updatecheck");
    expect(fetch.mock.calls[2][0]).toContain(
      "https://clients2.google.com/service/update2/crx",
    );
    expect(fetch.mock.calls[2][1]).toMatchObject({
      redirect: "follow",
    });
    expect(fetch.mock.calls[2][0]).toContain(
      "id%3Dabcdefghijklmnopabcdefghijklmnop",
    );
    expect(fetch.mock.calls[2][0]).toContain("prodversion=147.0.0.0");
  });

  it("sanitizes CRX filenames while preserving name and version", async () => {
    fetch
      .mockResolvedValueOnce(
        new Response(
          "<html><head><title>Bad/File:Name*? - Chrome Web Store</title></head></html>",
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          '<gupdate><app status="ok"><updatecheck status="ok" version="2.0.0" size="1"/></app></gupdate>',
        ),
      )
      .mockResolvedValueOnce(new Response("crx"));

    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request("https://example.com/crx/abcdefghijklmnopabcdefghijklmnop"),
    );

    expect(response.headers.get("Content-Disposition")).toBe(
      "attachment; filename=\"Bad_File_Name__ 2.0.0.crx\"; filename*=UTF-8''Bad_File_Name__%202.0.0.crx",
    );
  });

  it("falls back to the item id when CRX filename metadata is unavailable", async () => {
    fetch
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(
        new Response("crx", {
          status: 200,
          headers: {
            "Content-Type": "application/x-chrome-extension",
          },
        }),
      );

    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request("https://example.com/crx/abcdefghijklmnopabcdefghijklmnop"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toBe(
      "attachment; filename=\"abcdefghijklmnopabcdefghijklmnop.crx\"; filename*=UTF-8''abcdefghijklmnopabcdefghijklmnop.crx",
    );
    expect(await response.text()).toBe("crx");
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[2][0]).toContain(
      "https://clients2.google.com/service/update2/crx",
    );
    expect(fetch.mock.calls[2][1]).toMatchObject({
      redirect: "follow",
    });
    expect(fetch.mock.calls[2][0]).toContain(
      "id%3Dabcdefghijklmnopabcdefghijklmnop",
    );
    expect(fetch.mock.calls[2][0]).toContain("prodversion=147.0.0.0");
  });

  it("uses the request Chrome version for CRX download requests", async () => {
    fetch
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(new Response("crx"));

    const { handleRequest } = await import("../src/router.js");
    await handleRequest(
      new Request("https://example.com/crx/abcdefghijklmnopabcdefghijklmnop", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 AppleWebKit/537.36 Chrome/149.2.3.4 Safari/537.36",
        },
      }),
    );

    expect(fetch.mock.calls[1][0]).toContain("prodversion=149.2.3.4");
    expect(fetch.mock.calls[2][0]).toContain("prodversion=149.2.3.4");
  });

  it("does not expose unresolved upstream CRX redirects to clients", async () => {
    fetch
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: {
            Location: "https://clients2.googleusercontent.com/crx/download",
          },
        }),
      );

    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request("https://example.com/crx/abcdefghijklmnopabcdefghijklmnop"),
    );

    expect(response.status).toBe(502);
    expect(response.headers.has("Location")).toBe(false);
  });

  it("returns live CRX metadata from updatecheck without downloading the CRX", async () => {
    fetch.mockResolvedValueOnce(
      new Response(
        '<?xml version="1.0" encoding="UTF-8"?><gupdate><app appid="abcdefghijklmnopabcdefghijklmnop" status="ok"><updatecheck status="ok" version="1.2.3" size="12345" hash_sha256="abc123" fp="1.abc123" codebase="https://clients2.googleusercontent.com/crx/example.crx"/></app></gupdate>',
        {
          headers: {
            "Content-Type": "text/xml; charset=UTF-8",
          },
        },
      ),
    );

    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request("https://example.com/meta/abcdefghijklmnopabcdefghijklmnop"),
    );
    const metadata = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/json; charset=UTF-8",
    );
    expect(metadata).toEqual({
      id: "abcdefghijklmnopabcdefghijklmnop",
      version: "1.2.3",
      size: 12345,
      hashSha256: "abc123",
      fingerprint: "1.abc123",
      downloadUrl: "/crx/abcdefghijklmnopabcdefghijklmnop",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toContain(
      "https://clients2.google.com/service/update2/crx",
    );
    expect(fetch.mock.calls[0][0]).toContain("response=updatecheck");
    expect(fetch.mock.calls[0][0]).toContain(
      "id%3Dabcdefghijklmnopabcdefghijklmnop",
    );
    expect(fetch.mock.calls[0][1]).toMatchObject({
      redirect: "manual",
    });
  });

  it("rejects invalid CRX metadata ids without fetching upstream", async () => {
    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request("https://example.com/meta/not-valid"),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe(
      "application/json; charset=UTF-8",
    );
    expect(body).toEqual({ error: "Invalid extension id" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not expose unresolved upstream metadata redirects to clients", async () => {
    fetch.mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: {
          Location: "https://example.invalid/updatecheck",
        },
      }),
    );

    const { handleRequest } = await import("../src/router.js");
    const response = await handleRequest(
      new Request("https://example.com/meta/abcdefghijklmnopabcdefghijklmnop"),
    );
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(response.headers.has("Location")).toBe(false);
    expect(body).toEqual({ error: "Failed to resolve CRX metadata redirect" });
  });
});
