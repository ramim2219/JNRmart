
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchPublicOfferBanners } from "../../services/offerBannerServices";

import "../../styles/promotional-banner.css";

// Extract banner rows using the same response handling as HeroBanner.
const extractBannerRows = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.data?.data,
    response?.data?.data?.data,
  ];

  return candidates.find(Array.isArray) || [];
};

// Normalize backend image fields using HeroBanner's logic.
const toPromotionalBanner = (banner) => ({
  id: banner?.id,

  image:
    banner?.banner_image_url ||
    banner?.image_url ||
    banner?.banner_image ||
    banner?.image ||
    "",

  href: banner?.href || "/category/offer-zone",

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

// Remove duplicate records using ID and image path.
const removeDuplicateBanners = (banners) => {
  const seenIds = new Set();
  const seenImages = new Set();

  return banners.filter((banner) => {
    const idKey =
      banner.id !== undefined && banner.id !== null
        ? String(banner.id)
        : null;

    const imageKey = banner.image || null;

    if (
      (idKey !== null && seenIds.has(idKey)) ||
      (imageKey !== null && seenImages.has(imageKey))
    ) {
      return false;
    }

    if (idKey !== null) seenIds.add(idKey);
    if (imageKey !== null) seenImages.add(imageKey);

    return true;
  });
};

// Prepare only active promotion_2 banners.
const preparePromotionalBanners = (rows) => {
  const prepared = rows
    .filter((banner) => Number(banner?.status ?? 1) === 1)
    .filter(
      (banner) =>
        String(banner?.banner_type || "").toLowerCase() ===
        "promotion_2"
    )
    .map(toPromotionalBanner)
    .filter((banner) => Boolean(banner.image))
    .sort(
      (a, b) =>
        (Number(b.priority) || 0) -
          (Number(a.priority) || 0) ||
        (Number(b.id) || 0) - (Number(a.id) || 0)
    );

  return removeDuplicateBanners(prepared).slice(0, 2);
};

export default function PromotionalBannerSection({
  banners,
  className = "",
}) {
  const [publicBanners, setPublicBanners] = useState([]);

  // Fetch banners only when the parent does not provide them.
  useEffect(() => {
    if (Array.isArray(banners)) return;

    let active = true;

    const loadBanners = async () => {
      try {
        const response = await fetchPublicOfferBanners();

        if (!active) return;

        const rows = extractBannerRows(response);

        setPublicBanners(preparePromotionalBanners(rows));
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

    loadBanners();

    return () => {
      active = false;
    };
  }, [banners]);

  // Use parent data if provided; otherwise use backend data.
  const sourceBanners = Array.isArray(banners)
    ? banners
    : publicBanners;

  const items = Array.isArray(banners)
    ? preparePromotionalBanners(sourceBanners)
    : publicBanners;

  // Hide section if no promotion_2 banner exists.
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
                  "[PromotionalBannerSection] Image failed to load:",
                  banner.image
                );
              }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
