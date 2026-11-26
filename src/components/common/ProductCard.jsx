import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { useStoreUI } from "../../context/StoreUIContext";

import {
  getDefaultVariant,
  getProductImages,
  getVariantPricing,
  normalizePublicProduct,
  priceBDT,
  priceWithCurrency,
} from "../../utils/productHelpers";

import "../../styles/product-card.css";

// ------------------------------------------------------
// Resolve Laravel product image paths for Local + LAN.
// Vite proxies /storage to http://127.0.0.1:8000.
// ------------------------------------------------------

const normalizeStoragePath = (pathname) => {
  let path = String(pathname || "").replace(/\\/g, "/");

  // Laravel may expose either /storage/... or /public/storage/...
  path = path.replace(/^\/public(?=\/storage(?:\/|$))/i, "");

  // Convert an internal disk path to its public storage URL.
  path = path.replace(
    /^\/?storage\/app\/public(?=\/|$)/i,
    "/storage"
  );

  if (!path.startsWith("/")) path = `/${path}`;
  return path;
};

const resolveProductImageUrl = (value) => {
  if (value == null) return "";

  const raw = String(value).trim().replace(/\\/g, "/");
  if (!raw) return "";

  // Keep data/blob URLs unchanged.
  if (/^(data:|blob:)/i.test(raw)) return raw;

  // Handle absolute and protocol-relative URLs, including localhost URLs
  // returned by Laravel's asset() or Storage::url().
  if (/^(https?:)?\/\//i.test(raw)) {
    try {
      const url = new URL(raw, window.location.origin);
      const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
      const currentHostname = window.location.hostname
        .toLowerCase()
        .replace(/^\[|\]$/g, "");

      const isLoopback = ["localhost", "127.0.0.1", "::1"].includes(
        hostname
      );
      const isCurrentHost = hostname === currentHostname;
      const isLaravelDevPort = url.port === "8000";
      const isLocalBackend =
        isLoopback || isCurrentHost || isLaravelDevPort;

      if (isLocalBackend) {
        const path = normalizeStoragePath(url.pathname);

        // Only rewrite Laravel storage paths. Keep remote/CDN URLs intact.
        if (/^\/storage(?:\/|$)/i.test(path)) {
          return `${path}${url.search}${url.hash}`;
        }
      }

      return raw;
    } catch (error) {
      console.warn("[ProductCard] Could not parse image URL:", raw, error);
      return raw;
    }
  }

  // Normalize relative paths returned by the Product API.
  let path = raw.replace(/^\/+/, "");
  path = path.replace(/^public\//i, "");
  path = path.replace(/^storage\/app\/public\//i, "storage/");

  if (/^storage\//i.test(path)) return `/${path}`;
  if (/^images\//i.test(path) || /^assets\//i.test(path)) {
    return `/${path}`;
  }

  // Keep already-rooted frontend/API paths unchanged.
  if (raw.startsWith("/api/")) return raw;
  if (raw.startsWith("/")) {
    const normalized = normalizeStoragePath(raw);
    return normalized;
  }

  // Product image paths stored on Laravel's public disk are relative to
  // storage/app/public, e.g. products/item.webp.
  return `/storage/${path}`;
};

const numberOrZero = (value) => {
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStoreUI();

  if (!product || typeof product !== "object") return null;

  const normalized = normalizePublicProduct(product) || product;

  const id = normalized.id ?? normalized.slug ?? null;
  const slug = normalized.slug ?? "";
  const name = normalized.name || normalized.title || "Product";

  const brand =
    typeof normalized.brand === "string"
      ? normalized.brand.trim()
      : normalized.brand?.name ?? "";

  const images = getProductImages(normalized);
  const originalImage = images[0]?.src ?? "";
  const image = resolveProductImageUrl(originalImage);

  const variants = Array.isArray(normalized.variants)
    ? normalized.variants
    : [];

  const defaultVariant = variants.find((variant) =>
    String(variant.id) === String(normalized.defaultVariantId)
  ) || getDefaultVariant(variants);
  const pricing = getVariantPricing(defaultVariant);

  const price = numberOrZero(pricing.price || normalized.price);
  const oldPrice = numberOrZero(pricing.oldPrice || normalized.oldPrice);

  const appliedOffer = pricing.appliedOffer;

  const discount =
    oldPrice > price && price > 0
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  const rating = numberOrZero(normalized.rating ?? normalized.average_rating);
  const reviews = numberOrZero(
    normalized.review_count ?? normalized.reviews_count
  );

  const newArrival = Boolean(
    normalized.newArrival ??
      normalized.new_arrival ??
      normalized.is_new_arrival
  );

  const bestSelling = Boolean(
    normalized.bestSelling ??
      normalized.best_selling ??
      normalized.is_best_selling
  );

  const badgeLabel = newArrival
    ? "New Arrival"
    : bestSelling
      ? "Best Selling"
      : "";

  const wishlisted = id != null && isWishlisted(id);

  const href = id != null
    ? `/product/${encodeURIComponent(String(id))}${
        normalized.offer_listing && defaultVariant?.id != null
          ? `?variant=${encodeURIComponent(String(defaultVariant.id))}`
          : ""
      }`
    : "/shop";

  const cartProduct = {
    ...normalized,
    id,
    slug,
    name,
    price,
    oldPrice,
    image,
    variant_id: defaultVariant?.id ?? null,
    sku: defaultVariant?.sku ?? null,
    selectedVariant: defaultVariant,
    currency_code: pricing.currency?.code ?? "BDT",
    currency_symbol: pricing.currency?.symbol ?? "৳",
  };

  const handleAddToCart = () => {
    if (id == null || price <= 0) return;
    addToCart(cartProduct);
  };

  const handleWishlist = () => {
    if (id == null) return;
    toggleWishlist(cartProduct);
  };

  return (
    <article className="jnr-product-card">
      <div className="jnr-product-image-wrap">
        <Link
          to={href}
          className="jnr-product-image-link"
          aria-label={`View ${name}`}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="jnr-product-image"
              loading="lazy"
              decoding="async"
              onError={(event) => {
                console.error("[ProductCard] Product image failed:", {
                  productId: id,
                  originalImage,
                  resolvedImage: image,
                  requestedImage: event.currentTarget.currentSrc,
                });
              }}
            />
          ) : (
            <div className="jnr-product-image-placeholder">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        {discount > 0 && (
          <span className="jnr-product-discount">-{discount}%</span>
        )}

        {appliedOffer && (
          <span className="jnr-product-tag is-offer" title={appliedOffer.name}>
            Offer
          </span>
        )}
        {!appliedOffer && badgeLabel && (
          <span
            className={`jnr-product-tag ${newArrival ? "is-new" : ""}`}
          >
            {badgeLabel}
          </span>
        )}

        <button
          type="button"
          className={`jnr-product-wishlist ${wishlisted ? "is-active" : ""}`}
          onClick={handleWishlist}
          disabled={id == null}
          aria-label={
            wishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          aria-pressed={wishlisted}
        >
          <Heart
            size={17}
            fill={wishlisted ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="jnr-product-info">
        <Link to={href} className="jnr-product-name" title={name}>
          {name}
        </Link>

        {brand && <p className="jnr-product-brand">{brand}</p>}

        <div className="jnr-product-rating">
          {rating > 0 ? (
            <>
              <Star size={13} fill="currentColor" aria-hidden="true" />
              <span>{rating.toFixed(1)}</span>
              <span className="jnr-product-reviews">({reviews})</span>
            </>
          ) : (
            <span className="jnr-product-reviews">No reviews yet</span>
          )}
        </div>

        <div className="jnr-product-price-row">
          <strong className="jnr-product-price">
            {price > 0 ? priceWithCurrency(price, pricing.currency) : "Price unavailable"}
          </strong>

          {oldPrice > price && (
            <del className="jnr-product-old-price">{priceWithCurrency(oldPrice, pricing.currency)}</del>
          )}
        </div>

        <button
          type="button"
          className="jnr-product-add-cart"
          onClick={handleAddToCart}
          disabled={id == null || price <= 0}
        >
          <ShoppingCart size={15} aria-hidden="true" />
          <span>Add to Cart</span>
        </button>
      </div>
    </article>
  );
}
