
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Star,
  ArrowRight,
} from 'lucide-react';

import { useStoreUI } from '../../context/StoreUIContext';
import '../../styles/featured-products.css';

const FILTERS = [
  'All',
  'Women',
  'Men',
  'Shoes',
  'Cosmetics',
  'Accessories',
];

function getCategory(product) {
  const category =
    product.category?.name ??
    product.category_name ??
    product.category ??
    '';

  return String(category).toLowerCase();
}

function matchesCategory(product, filter) {
  if (filter === 'All') return true;

  const category = getCategory(product);

  const patterns = {
    Women: /(^|\W)(women|woman|ladies|female)(\W|$)/,
    Men: /(^|\W)(men|man|male)(\W|$)/,
    Shoes: /shoe|footwear|sneaker|boot|sandal/,
    Cosmetics: /cosmetic|beauty|makeup|skin.?care|lipstick|foundation/,
    Accessories: /accessor|bag|jewel|watch|sunglass|belt/,
  };

  return patterns[filter]?.test(category) ?? false;
}

function toNumber(value) {
  if (typeof value === 'number') return value;

  return Number(String(value ?? '').replace(/[^\d.]/g, '')) || 0;
}

function formatPrice(value) {
  return `৳ ${new Intl.NumberFormat('en-BD').format(toNumber(value))}`;
}

function getImage(product) {
  const image =
    product.image_url ||
    product.image ||
    product.thumbnail ||
    '';

  if (!image || typeof image !== 'string') return '';

  if (/^(https?:\/\/|data:image\/|blob:)/i.test(image)) {
    return image;
  }

  const base =
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000/api/';

  const origin = new URL(base, window.location.origin).origin;

  if (image.startsWith('/')) return `${origin}${image}`;

  if (image.startsWith('storage/')) {
    return `${origin}/${image}`;
  }

  return `${origin}/storage/${image}`;
}

// Product Card
function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) {
  const name = product.name || product.title || 'Product';

  const productId = product.id ?? product.slug;

  const image = getImage(product);

  const price = toNumber(
    product.sale_price ??
    product.selling_price ??
    product.price
  );

  const oldPrice = toNumber(
    product.original_price ??
    product.compare_at_price ??
    product.regular_price
  );

  const explicitDiscount = toNumber(
    product.discount_percentage ?? product.discount
  );

  const discount =
    explicitDiscount ||
    (oldPrice > price && oldPrice > 0
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0);

  const rating = toNumber(
    product.rating ?? product.average_rating
  );

  const reviews = toNumber(
    product.review_count ?? product.reviews_count
  );

  // Normalize product for the existing cart context.
  const cartProduct = {
    ...product,
    id: productId,
    name,
    slug: product.slug || '',
    price,
    image,
    thumbnail: image,
  };

  const productHref =
    product.href ||
    (product.slug
      ? `/product/${product.slug}`
      : productId != null
        ? `/product/${productId}`
        : '/shop');

  return (
    <article className="jnr-product-card">

      {/* Product Image */}
      <div className="jnr-product-image-wrap">

        <Link
          to={productHref}
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
              {name.charAt(0)}
            </div>
          )}
        </Link>

        {discount > 0 && (
          <span className="jnr-product-discount">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          className={`jnr-product-wishlist ${
            isWishlisted ? 'is-active' : ''
          }`}
          onClick={() => onToggleWishlist(cartProduct)}
          disabled={productId == null}
          aria-label={
            isWishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          aria-pressed={isWishlisted}
        >
          <Heart
            size={17}
            fill={isWishlisted ? 'currentColor' : 'none'}
          />
        </button>

      </div>

      {/* Product Details */}
      <div className="jnr-product-info">

        <Link
          to={productHref}
          className="jnr-product-name"
          title={name}
        >
          {name}
        </Link>

        {/* Rating */}
        <div className="jnr-product-rating">
          {rating > 0 ? (
            <>
              <Star size={13} fill="currentColor" />
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

          <span className="jnr-product-price">
            {formatPrice(price)}
          </span>

          {oldPrice > price && (
            <span className="jnr-product-old-price">
              {formatPrice(oldPrice)}
            </span>
          )}

        </div>

        {/* Add to Cart */}
        <button
          type="button"
          className="jnr-product-add-cart"
          onClick={() => onAddToCart(cartProduct)}
          disabled={productId == null}
        >
          <ShoppingCart size={15} />
          <span>Add to Cart</span>
        </button>

      </div>
    </article>
  );
}

// Featured Products Section
export default function FeaturedProductsSection({
  products = [],
  viewAllHref = '/shop',
  className = '',
  initialVisible = 10,
  loadStep = 10,
}) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(initialVisible);

  // Existing shared cart and wishlist functionality.
  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
  } = useStoreUI();

  const filteredProducts = useMemo(() => {
    const items = Array.isArray(products) ? products : [];

    return items.filter(product =>
      matchesCategory(product, activeFilter)
    );
  }, [products, activeFilter]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const changeFilter = (filter) => {
    setActiveFilter(filter);
    setVisibleCount(initialVisible);
  };

  return (
    <section
      className={`container jnr-featured-products ${className}`.trim()}
      aria-label="Product recommendations"
    >

      {/* Section Header - No Title */}
      <div className="jnr-featured-header">

        <div className="jnr-featured-filters">
          {FILTERS.map(filter => (
            <button
              key={filter}
              type="button"
              className={`jnr-featured-filter ${
                activeFilter === filter ? 'is-active' : ''
              }`}
              onClick={() => changeFilter(filter)}
              aria-pressed={activeFilter === filter}
            >
              {filter}
            </button>
          ))}
        </div>

        <Link
          to="/shop"
          className="jnr-featured-view-all"
        >
          View All
          <ArrowRight size={16} />
        </Link>

      </div>

      {/* Products Grid */}
      {visibleProducts.length > 0 ? (
        <div className="jnr-featured-grid">

          {visibleProducts.map((product, index) => {
            const productId = product.id ?? product.slug;

            return (
              <ProductCard
                key={productId ?? index}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={
                  productId != null && isWishlisted(productId)
                }
              />
            );
          })}

        </div>
      ) : (
        <p className="jnr-featured-empty">
          No products available in this category.
        </p>
      )}

      {/* Load More */}
      {visibleCount < filteredProducts.length && (
        <div className="jnr-featured-load-more">
          <button
            type="button"
            onClick={() =>
              setVisibleCount(count => count + loadStep)
            }
          >
            Load More Products
            <ArrowRight size={16} />
          </button>
        </div>
      )}

    </section>
  );
}
