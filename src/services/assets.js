const ALLOWED_IMAGE_ASSET_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
]);

const IMAGE_ASSET_URL_PATTERN =
  /https:\/\/(?:lh3|lh4|lh5|lh6)\.googleusercontent\.com\/[^\s"'<>\\)]+/g;

const ESCAPED_IMAGE_ASSET_URL_PATTERN =
  /https:\\\/\\\/(?:lh3|lh4|lh5|lh6)\.googleusercontent\.com\\\/[^\s"'<>)]*/g;

function decodeEscapedImageAssetUrl(assetUrl) {
  return assetUrl
    .replace(/\\\//g, "/")
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    )
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
}

function buildProxiedImageAssetUrl(assetUrl, origin) {
  const validation = validateImageAssetUrl(assetUrl);
  if (validation.error) {
    return assetUrl;
  }

  return `${origin}/asset?url=${encodeURIComponent(validation.url.toString())}`;
}

export function validateImageAssetUrl(rawUrl) {
  if (!rawUrl) {
    return {
      error: "Missing asset URL",
      status: 400,
    };
  }

  let assetUrl;
  try {
    assetUrl = new URL(rawUrl);
  } catch {
    return {
      error: "Invalid asset URL",
      status: 400,
    };
  }

  if (assetUrl.protocol !== "https:") {
    return {
      error: "Asset URL must use HTTPS",
      status: 400,
    };
  }

  if (!ALLOWED_IMAGE_ASSET_HOSTS.has(assetUrl.hostname)) {
    return {
      error: "Asset host is not allowed",
      status: 403,
    };
  }

  return {
    url: assetUrl,
    status: 200,
  };
}

export function rewriteImageAssetUrls(content, origin) {
  content = content.replace(ESCAPED_IMAGE_ASSET_URL_PATTERN, (assetUrl) =>
    buildProxiedImageAssetUrl(decodeEscapedImageAssetUrl(assetUrl), origin),
  );

  return content.replace(IMAGE_ASSET_URL_PATTERN, (assetUrl) =>
    buildProxiedImageAssetUrl(assetUrl, origin),
  );
}
