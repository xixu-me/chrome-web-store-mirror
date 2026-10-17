import { afterEach, describe, expect, it, vi } from "vitest";
import { handleRequest } from "../src/router.js";

const id = "abcdefghijklmnopabcdefghijklmnop";
afterEach(() => vi.unstubAllGlobals());

describe("detail route validation", () => {
  it.each([
    `/detail/${id}`,
    `/detail/extension-name/${id}`,
    `/detail/extension-name/${id}/`,
    `/detail/${id}/reviews`,
    `/detail/extension-name/${id}/support`,
    `/detail/${id}/report`,
  ])("preserves supported route %s", async (path) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response("<html><body>detail</body></html>", {
          headers: { "Content-Type": "text/html" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const response = await handleRequest(
      new Request(`https://mirror.example.com${path}`),
    );
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      `https://chromewebstore.google.com${path}`,
    );
  });

  it.each([
    `/detail/first/detail/second/${id}`,
    `/detail/detail/${id}`,
    `/detail/%64etail/${id}`,
    `/detail/first/second/${id}`,
    `/detail/first%2Fsecond/${id}`,
    `/detail/first%5Csecond/${id}`,
    `/detail/%ZZ/${id}`,
    `/detail//${id}`,
    `/detail/${id}/unknown`,
    `/detail/not-an-id`,
  ])("rejects malformed route without upstream access: %s", async (path) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await handleRequest(
      new Request(`https://mirror.example.com${path}`),
    );
    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("publishes a dedicated Applebot disallow group", async () => {
    const response = await handleRequest(
      new Request("https://mirror.example.com/robots.txt"),
    );
    expect(await response.text()).toContain(
      "User-agent: Applebot\nDisallow: /",
    );
  });
});
