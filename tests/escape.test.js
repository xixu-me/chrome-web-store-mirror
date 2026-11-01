/**
 * Tests for output escaping helpers.
 */

import { describe, expect, it } from "vitest";
import { escapeHtml, serializeForScript } from "../src/utils/escape.js";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#039;s&lt;/a&gt;",
    );
  });

  it("handles empty and non-string values", () => {
    expect(escapeHtml(undefined)).toBe("");
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(404)).toBe("404");
  });
});

describe("serializeForScript", () => {
  it("prevents closing the surrounding script element", () => {
    const payload = "</script><script>alert(document.domain)</script>";
    const serialized = serializeForScript(payload);

    expect(serialized).not.toMatch(/[<>&]/);
    expect(serialized).toContain("\\u003C/script\\u003E");
    expect(JSON.parse(serialized)).toBe(payload);
  });

  it("escapes ampersands and line/paragraph separators", () => {
    const value = "a&b\u2028c\u2029d<!--";
    const serialized = serializeForScript(value);

    expect(serialized).toBe('"a\\u0026b\\u2028c\\u2029d\\u003C!--"');
    expect(JSON.parse(serialized)).toBe(value);
  });

  it("supports indentation for structured data", () => {
    expect(serializeForScript({ a: "<b>" }, 2)).toBe(
      '{\n  "a": "\\u003Cb\\u003E"\n}',
    );
  });
});
