import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingCart, Star } from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';
import '../../styles/featured-products.css';

const FILTERS = ['All', 'Women', 'Men', 'Shoes', 'Cosmetics', 'Accessories'];
const CATEGORY_MATCHERS = {
  Women: /\b(women|woman|ladies|female)\b/i,
  Men: /\b(men|man|male)\b/i,
  Shoes: /shoe|footwear|sneaker|boot|sandal/i,
  Cosmetics: /cosmetic|beauty|makeup|skin.?care|lipstick|foundation/i,
  Accessories: /accessor|bag|jewel|watch|sunglass|belt/i,
};
const priceFormatter = new Intl.NumberFormat('en-BD');

const numberOrZero = (value) => Number(String(value ?? '').replace(/[^\d.]/g, '')) || 0;
const money = (value) => `৳ ${priceFormatter.format(value)}`;

function imageUrl(path) {
  if (typeof path !== 'string' || !path.trim()) return '';
  const src = path.trim();
  if (/^(https?:\/\/|data:image\/|blob:)/i.test(src)) return src;

  const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';
  const origin = new URL(apiBase, window.location.origin).origin;
  if (src.startsWith('/')) return `${origin}${src}`;
  return `${origin}/${src.startsWith('storage/') ? src : `storage/${src}`}`;
}

function ProductCard({ product, addToCart, toggleWishlist, isWishlisted }) {
  const { id, slug = '' } = product;
  const productId = id ?? slug;
  const name = product.name || product.title || 'Product';
  const image = imageUrl(product.image_url || product.image || product.thumbnail);
  const price = numberOrZero(product.sale_price ?? product.selling_price ?? product.price);
  const oldPrice = numberOrZero(product.original_price ?? product.compare_at_price ?? product.regular_price);
  const discount = numberOrZero(product.discount_percentage ?? product.discount) ||
    (oldPrice > price && price > 0 ? Math.round((oldPrice - price) / oldPrice * 100) : 0);
  const rating = numberOrZero(product.rating ?? product.average_rating);
  const reviews = numberOrZero(product.review_count ?? product.reviews_count);
  const href = slug ? `/product/${encodeURIComponent(slug)}` : '/shop';
  const cartProduct = { ...product, id: productId, slug, name, price, image };

  return (
    <article className="jnr-product-card">
      <div className="jnr-product-image-wrap">
        <Link to={href} className="jnr-product-image-link" aria-label={`View ${name}`}>
          {image ? (
            <img src={image} alt={name} className="jnr-product-image" loading="lazy" decoding="async" />
          ) : (
            <div className="jnr-product-image-placeholder">{name.charAt(0)}</div>
          )}
        </Link>
        {discount > 0 && <span className="jnr-product-discount">-{discount}%</span>}
        <button
          type="button"
          className={`jnr-product-wishlist${isWishlisted ? ' is-active' : ''}`}
          onClick={() => toggleWishlist(cartProduct)}
          disabled={productId == null}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
        >
          <Heart size={17} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="jnr-product-info">
        <Link to={href} className="jnr-product-name" title={name}>{name}</Link>
        <div className="jnr-product-rating">
          {rating > 0 ? (
            <><Star size={13} fill="currentColor" /> {rating.toFixed(1)} <span className="jnr-product-reviews">({reviews})</span></>
          ) : (
            <span className="jnr-product-reviews">No reviews yet</span>
          )}
        </div>
        <div className="jnr-product-price-row">
          <strong className="jnr-product-price">{money(price)}</strong>
          {oldPrice > price && <del className="jnr-product-old-price">{money(oldPrice)}</del>}
        </div>
        <button
          type="button"
          className="jnr-product-add-cart"
          onClick={() => addToCart(cartProduct)}
          disabled={productId == null}
        >
          <ShoppingCart size={15} aria-hidden="true" /> Add to Cart
        </button>
      </div>
    </article>
  );
}

export default function FeaturedProductsSection({
  products = [],
  className = '',
  initialVisible = 10,
  loadStep = 10,
}) {
  const [filter, setFilter] = useState('All');
  const [limit, setLimit] = useState(initialVisible);
  const { addToCart, toggleWishlist, isWishlisted } = useStoreUI();

  const filtered = useMemo(() => (Array.isArray(products) ? products : []).filter((product) => {
    if (filter === 'All') return true;
    const category = product.category?.name ?? product.category_name ?? product.category ?? '';
    return CATEGORY_MATCHERS[filter].test(String(category));
  }), [products, filter]);

  return (
    <section className={`container jnr-featured-products ${className}`.trim()} aria-label="Featured products">
      <div className="jnr-featured-header">
        <div className="jnr-featured-filters" role="group" aria-label="Filter products">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              className={`jnr-featured-filter${filter === item ? ' is-active' : ''}`}
              onClick={() => { setFilter(item); setLimit(initialVisible); }}
              aria-pressed={filter === item}
            >
              {item}
            </button>
          ))}
        </div>
        <Link to="/shop" className="jnr-featured-view-all">
          View All <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {filtered.length > 0 ? (
        <div className="jnr-featured-grid">
          {filtered.slice(0, limit).map((product, index) => {
            const id = product.id ?? product.slug;
            return (
              <ProductCard
                key={id ?? index}
                product={product}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                isWishlisted={id != null && isWishlisted(id)}
              />
            );
          })}
        </div>
      ) : (
        <p className="jnr-featured-empty">No products available in this category.</p>
      )}

      {limit < filtered.length && (
        <div className="jnr-featured-load-more">
          <button type="button" onClick={() => setLimit((current) => current + loadStep)}>
            Load More Products <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
