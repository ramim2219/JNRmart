// src/utilities/bannerImageUrl.js
// VITE_API_URL=/api + Vite /storage proxy: use same-origin storage URLs.
// This works on localhost:5173 and LAN_HOST:5173 without exposing port 8000.
const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function resolveBannerImageUrl(image) {
  if (!image) return "";

  const raw = String(image).trim().replace(/\\/g, "/");
  if (!raw) return "";

  // Browser-created previews and embedded images.
  if (/^(data:|blob:)/i.test(raw)) return raw;

  // Full URLs returned by Laravel asset('storage/...').
  if (/^https?:\/\//i.test(raw) || raw.startsWith("//")) {
    try {
      const parsed = new URL(raw, window.location.origin);
      // Backend-generated local/LAN storage URL -> Vite same-origin proxy.
      // Preserve external/CDN images exactly as received.
      const backendOnThisHost =
        LOOPBACK.has(parsed.hostname.toLowerCase()) ||
        parsed.hostname === window.location.hostname;

      if (backendOnThisHost && parsed.pathname.startsWith("/storage/")) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      return parsed.href;
    } catch {
      return "";
    }
  }

  // Keep browser-served public images on Vite.
  if (/^\/?(?:images|assets)\//i.test(raw)) {
    return `/${raw.replace(/^\/+/, "")}`;
  }

  // Existing Laravel disk path: offer-banners/file.jpg
  // Also accept storage/offer-banners, /storage/offer-banners, public/storage/... .
  const clean = raw.replace(/^\/+/, "").replace(/^public\//i, "");
  if (/^storage\//i.test(clean)) return `/${clean}`;
  if (/^offer-banners\//i.test(clean)) return `/storage/${clean}`;

  // Other root-relative paths retain their original routing.
  if (raw.startsWith("/")) return raw;

  return `/storage/${clean}`;
}
