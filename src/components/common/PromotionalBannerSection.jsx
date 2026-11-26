import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchPublicOfferBanners } from "../../services/offerBannerServices";

import "../../styles/promotional-banner.css";

// VITE_API_URL=/api + Vite /storage proxy:
// Browser requests must use /storage/... rather than 127.0.0.1:8000.
// External CDN links are intentionally kept as-is.
const resolveBannerImageUrl = (value) => {
  if (!value) return "";

  const raw = String(value).trim().replace(/\\/g, "/");
  if (!raw) return "";
  if (/^(data:|blob:)/i.test(raw)) return raw;

  if (/^https?:\/\//i.test(raw) || raw.startsWith("//")) {
    try {
      const url = new URL(raw, window.location.origin);
      const host = url.hostname.toLowerCase();
      const browserHost = window.location.hostname.toLowerCase();
      const isLocalBackend =
        ["localhost", "127.0.0.1", "::1", "[::1]"].includes(host) ||
        host === browserHost;

      if (isLocalBackend && /^\/(?:public\/)?storage(?:\/|$)/i.test(url.pathname)) {
        const path = url.pathname.replace(/^\/public(?=\/storage(?:\/|$))/i, "");
        return `${path}${url.search}${url.hash}`;
      }

      return raw;
    } catch {
      return raw;
    }
  }

  const path = raw.replace(/^\/+/, "").replace(/^public\//i, "");

  if (/^storage\//i.test(path)) return `/${path}`;
  if (/^(images|assets)\//i.test(path)) return `/${path}`;
  if (/^api\//i.test(path)) return `/${path}`;

  return `/storage/${path}`;
};

// Works with both standard {messageCode, data} and public {success, data}.
const extractBannerRows = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.data?.data,
    response?.data?.data?.data,
  ];
  return candidates.find(Array.isArray) || [];
};

const toPromotionalBanner = (banner) => ({
  id: banner?.id,
  image: resolveBannerImageUrl(
    banner?.banner_image_url ||
      banner?.image_url ||
      banner?.banner_image ||
      banner?.image ||
      ""
  ),
  href: banner?.offer_id
    ? `/offers/${encodeURIComponent(String(banner.offer_id))}`
    : (banner?.href || "/category/offer-zone"),
  alt:
    banner?.alt ||
    banner?.offer?.name ||
    banner?.combo?.name ||
    "Explore this offer",
  title:
    banner?.title ||
    banner?.offer?.name ||
    banner?.combo?.name ||
    "Special offer",
  banner_type: banner?.banner_type,
  priority: banner?.priority,
});

const removeDuplicateBanners = (banners) => {
  const seenIds = new Set();
  const seenFallbackImages = new Set();

  return banners.filter((banner) => {
    if (banner.id !== undefined && banner.id !== null) {
      const key = String(banner.id);
      if (seenIds.has(key)) return false;
      seenIds.add(key);
      return true;
    }

    const key = String(banner.image || '');
    if (!key || seenFallbackImages.has(key)) return false;
    seenFallbackImages.add(key);
    return true;
  });
};

const preparePromotionalBanners = (rows) => {
  const prepared = rows
    .filter((banner) => Number(banner?.status ?? 1) === 1)
    .filter(
      (banner) =>
        String(banner?.banner_type || "").trim().toLowerCase() ===
        "promotion_2"
    )
    .map(toPromotionalBanner)
    .filter((banner) => Boolean(banner.image))
    .sort(
      (a, b) =>
        (Number(b.priority) || 0) - (Number(a.priority) || 0) ||
        (Number(b.id) || 0) - (Number(a.id) || 0)
    );

  return removeDuplicateBanners(prepared);
};

export default function PromotionalBannerSection({
  banners,
  className = "",
}) {
  const [publicBanners, setPublicBanners] = useState([]);

  useEffect(() => {
    if (Array.isArray(banners)) return undefined;

    let active = true;

    const loadBanners = async () => {
      try {
        const response = await fetchPublicOfferBanners();
        if (!active) return;

        const rows = extractBannerRows(response);
        const matched = preparePromotionalBanners(rows);
        if (import.meta.env.DEV) {
          console.info('[JNRmart promotion_2]', {
            apiTotal: rows.length,
            apiPromotion2: rows.filter(
              (row) => String(row?.banner_type || '').trim().toLowerCase() === 'promotion_2'
            ).length,
            rendered: matched.length,
          });
        }
        setPublicBanners(matched);
      } catch (error) {
        if (!active) return;
        if (
          error?.code === "ERR_CANCELED" ||
          error?.name === "CanceledError"
        ) {
          return;
        }

        console.error(
          "[PromotionalBannerSection] Unable to load promotion_2 banners:",
          error
        );
        setPublicBanners([]);
      }
    };

    void loadBanners();
    return () => {
      active = false;
    };
  }, [banners]);

  // Parent-provided banners take precedence over API-fetched banners.
  const items = Array.isArray(banners)
    ? preparePromotionalBanners(banners)
    : publicBanners;

  if (items.length === 0) return null;

  return (
    <section
      className={`container jnr-promo-section ${className}`.trim()}
      aria-label="Promotional offers"
    >
      <div
        className={`jnr-promo-grid ${
          items.length === 1 ? "jnr-promo-grid--single" : ""
        }`}
      >
        {items.map((banner, index) => (
          <Link
            key={banner.id ?? banner.image ?? index}
            to={banner.href}
            className="jnr-promo-card"
            aria-label={banner.alt}
            title={banner.title}
            draggable={false}
          >
            <img
              className="jnr-promo-image"
              src={banner.image}
              alt={banner.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={(event) => {
                console.error(
                  "[PromotionalBannerSection] Failed image URL:",
                  event.currentTarget.currentSrc || banner.image
                );
              }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
