import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { useStoreUI } from "../../context/StoreUIContext";

import {
  getDefaultVariant,
  getProductImages,
  getVariantPricing,
  normalizePublicProduct,
  priceBDT,
} from "../../utils/productHelpers";

import "../../styles/product-card.css";

const numberOrZero = (value) => {
  const parsed = Number(
    String(value ?? "").replace(/[^\d.]/g, "")
  );

  return Number.isFinite(parsed) ? parsed : 0;
};

export default function ProductCard({ product }) {
  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
  } = useStoreUI();

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
  const image = images[0]?.src ?? "";

  const variants = Array.isArray(normalized.variants)
    ? normalized.variants
    : [];

  const defaultVariant = getDefaultVariant(variants);
  const pricing = getVariantPricing(defaultVariant);

  const price = numberOrZero(
    pricing.price || normalized.price
  );

  const oldPrice = numberOrZero(
    pricing.oldPrice || normalized.oldPrice
  );

  const discount =
    oldPrice > price && price > 0
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  const rating = numberOrZero(
    normalized.rating ?? normalized.average_rating
  );

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

  // Public product endpoint currently returns a numeric parent product ID.
  const href =
    id != null
      ? `/product/${encodeURIComponent(String(id))}`
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
            />
          ) : (
            <div className="jnr-product-image-placeholder">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        {discount > 0 && (
          <span className="jnr-product-discount">
            -{discount}%
          </span>
        )}

        {badgeLabel && (
          <span
            className={`jnr-product-tag ${
              newArrival ? "is-new" : ""
            }`}
          >
            {badgeLabel}
          </span>
        )}

        <button
          type="button"
          className={`jnr-product-wishlist ${
            wishlisted ? "is-active" : ""
          }`}
          onClick={handleWishlist}
          disabled={id == null}
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
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
        <Link
          to={href}
          className="jnr-product-name"
          title={name}
        >
          {name}
        </Link>

        {brand && (
          <p className="jnr-product-brand">{brand}</p>
        )}

        <div className="jnr-product-rating">
          {rating > 0 ? (
            <>
              <Star
                size={13}
                fill="currentColor"
                aria-hidden="true"
              />
              <span>{rating.toFixed(1)}</span>
              <span className="jnr-product-reviews">
                ({reviews})
              </span>
            </>
          ) : (
            <span className="jnr-product-reviews">
              No reviews yet
            </span>
          )}
        </div>

        <div className="jnr-product-price-row">
          <strong className="jnr-product-price">
            {price > 0 ? priceBDT(price) : "Price unavailable"}
          </strong>

          {oldPrice > price && (
            <del className="jnr-product-old-price">
              {priceBDT(oldPrice)}
            </del>
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
