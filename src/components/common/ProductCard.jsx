
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';

import '../../styles/product-card.css';

// =========================================
// Price Formatter
// =========================================

const priceFormatter = new Intl.NumberFormat('en-BD', {
  maximumFractionDigits: 2,
});

const numberOrZero = (value) => {
  const parsed = Number(
    String(value ?? '').replace(/[^\d.]/g, '')
  );

  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value) =>
  `৳ ${priceFormatter.format(numberOrZero(value))}`;

// =========================================
// Product Image URL
// =========================================

function imageUrl(path) {
  if (typeof path !== 'string' || !path.trim()) {
    return '';
  }

  const src = path.trim();

  if (/^(https?:\/\/|\/\/|data:image\/|blob:)/i.test(src)) {
    return src;
  }

  const apiBase =
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000/api/';

  const fallbackOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://127.0.0.1:8000';

  let origin;

  try {
    origin = new URL(apiBase, fallbackOrigin).origin;
  } catch {
    origin = fallbackOrigin;
  }

  if (src.startsWith('/')) {
    return `${origin}${src}`;
  }

  const cleanPath = src.replace(/^\/+/, '');

  return `${origin}/${
    cleanPath.startsWith('storage/')
      ? cleanPath
      : `storage/${cleanPath}`
  }`;
}

// =========================================
// Shared Product Card
// =========================================

export default function ProductCard({ product }) {
  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
  } = useStoreUI();

  if (!product || typeof product !== 'object') {
    return null;
  }

  // Product ID
  const id = product.id ?? product.slug ?? null;

  const slug =
    typeof product.slug === 'string'
      ? product.slug
      : '';

  // Product Name
  const name =
    product.name ||
    product.title ||
    'Product';

  // Product Brand
  const brand =
    typeof product.brand === 'string'
      ? product.brand.trim()
      : '';

  // Product Image
  const image = imageUrl(
    product.image_url ||
    product.image ||
    product.thumbnail
  );

  // Product Price
  const price = numberOrZero(
    product.sale_price ??
    product.selling_price ??
    product.price
  );

  // Original Price
  const oldPrice = numberOrZero(
    product.oldPrice ??
    product.original_price ??
    product.compare_at_price ??
    product.regular_price
  );

  // Discount
  const discountValue = numberOrZero(
    product.discount_percentage ??
    product.discount
  );

  const discount =
    discountValue > 0
      ? Math.round(discountValue)
      : oldPrice > price && price > 0
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : 0;

  // Product Rating
  const rating = numberOrZero(
    product.rating ??
    product.average_rating
  );

  const reviews = numberOrZero(
    product.review_count ??
    product.reviews_count
  );

  // Product Labels
  const newArrival = Boolean(
    product.newArrival ??
    product.new_arrival ??
    product.is_new_arrival
  );

  const bestSelling = Boolean(
    product.bestSelling ??
    product.best_selling ??
    product.is_best_selling
  );

  const badgeLabel = newArrival
    ? 'New Arrival'
    : bestSelling
      ? 'Best Selling'
      : '';

  // Wishlist Status
  const wishlisted =
    id != null && isWishlisted(id);

  // Product URL
  const href = slug
    ? `/product/${encodeURIComponent(slug)}`
    : '/shop';

  // Cart Product
  const cartProduct = {
    ...product,
    id,
    slug,
    name,
    price,
    image,
  };

  // =========================================
  // Add To Cart
  // =========================================

  const handleAddToCart = () => {
    if (id == null) return;

    addToCart(cartProduct);
  };

  // =========================================
  // Wishlist
  // =========================================

  const handleWishlist = () => {
    if (id == null) return;

    toggleWishlist(cartProduct);
  };

  // =========================================
  // Render
  // =========================================

  return (
    <article className="jnr-product-card">

      {/* Product Image */}
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

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="jnr-product-discount">
            -{discount}%
          </span>
        )}

        {/* New Arrival / Best Selling */}
        {badgeLabel && (
          <span
            className={`jnr-product-tag ${
              newArrival ? 'is-new' : ''
            }`}
          >
            {badgeLabel}
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          className={`jnr-product-wishlist ${
            wishlisted ? 'is-active' : ''
          }`}
          onClick={handleWishlist}
          disabled={id == null}
          aria-label={
            wishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          aria-pressed={wishlisted}
        >
          <Heart
            size={17}
            fill={wishlisted ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>

      </div>

      {/* Product Information */}
      <div className="jnr-product-info">

        {/* Product Name */}
        <Link
          to={href}
          className="jnr-product-name"
          title={name}
        >
          {name}
        </Link>

        {/* Brand */}
        {brand && (
          <p className="jnr-product-brand">
            {brand}
          </p>
        )}

        {/* Rating */}
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

        {/* Price */}
        <div className="jnr-product-price-row">

          <strong className="jnr-product-price">
            {money(price)}
          </strong>

          {oldPrice > price && (
            <del className="jnr-product-old-price">
              {money(oldPrice)}
            </del>
          )}

        </div>

        {/* Add To Cart */}
        <button
          type="button"
          className="jnr-product-add-cart"
          onClick={handleAddToCart}
          disabled={id == null}
        >
          <ShoppingCart
            size={15}
            aria-hidden="true"
          />

          <span>Add to Cart</span>
        </button>

      </div>

    </article>
  );
}
