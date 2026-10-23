import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import WishlistToggle from './WishlistToggle';

const money = (value) => `৳ ${Number(value).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;

/**
 * Presentational card for deal sliders. Supports your existing ShopPage product
 * fields: name, slug, image, price, oldPrice, rating. Optional deal-specific
 * fields: badge, badgeTone, discountPercent, reviewCount, deliveryText.
 */
export default function DealProductCard({ product, linkTo, imageFit = 'contain' }) {
  if (!product) return null;

  const name = product.name || product.title || 'Product';
  const currentPrice = Number(product.price) || 0;
  const oldPrice = Number(product.oldPrice ?? product.originalPrice) || 0;
  const computedDiscount = oldPrice > currentPrice && currentPrice > 0
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    : 0;
  const discount = product.discountPercent ?? computedDiscount;
  const rating = Number(product.rating);
  const reviews = Number(product.reviewCount ?? product.ratingCount ?? 0);
  const hasRating = Number.isFinite(rating) && rating > 0 && reviews > 0;
  const ratingPercent = hasRating ? Math.max(0, Math.min(100, (rating / 5) * 100)) : 0;
  const href = linkTo || product.href || (product.slug ? `/product/${product.slug}` : '/shop');
  const image = product.image || product.thumbnail;

  return (
    <article className="jnr-deal-card">
      <Link className="jnr-deal-card__link" to={href} aria-label={`View ${name}`}>
        <div className="jnr-deal-card__image-wrap">
          {product.badge && (
            <span className={`jnr-deal-card__badge jnr-deal-card__badge--${product.badgeTone === 'navy' ? 'navy' : 'sky'}`}>
              {product.badge}
            </span>
          )}
          {Number(discount) > 0 && (
            <span className="jnr-deal-card__discount">-{Math.round(Number(discount))}%</span>
          )}
          {image ? (
            <img
              className="jnr-deal-card__image"
              src={image}
              alt={name}
              loading="lazy"
              decoding="async"
              draggable="false"
              style={{ objectFit: imageFit }}
            />
          ) : (
            <div className="jnr-deal-card__image-empty" aria-hidden="true">🛍️</div>
          )}
        </div>
        <div className="jnr-deal-card__details">
          <h3 className="jnr-deal-card__title" title={name}>{name}</h3>
          <div className="jnr-deal-card__prices">
            <strong className="jnr-deal-card__price">{money(currentPrice)}</strong>
            {oldPrice > currentPrice && (
              <del className="jnr-deal-card__old-price">{money(oldPrice)}</del>
            )}
          </div>
          <div className="jnr-deal-card__rating-row">
            {hasRating ? (
              <>
                <span
                  className="jnr-deal-card__stars"
                  aria-label={`${rating.toFixed(1)} out of 5 stars`}
                  role="img"
                >
                  <span className="jnr-deal-card__stars-base">★★★★★</span>
                  <span className="jnr-deal-card__stars-filled" style={{ width: `${ratingPercent}%` }} aria-hidden="true">★★★★★</span>
                </span>
                <strong className="jnr-deal-card__rating">{rating.toFixed(1)}</strong>
                <span className="jnr-deal-card__reviews">({reviews.toLocaleString('en-BD')})</span>
              </>
            ) : <span className="jnr-deal-card__no-rating">&nbsp;</span>}
          </div>
        </div>
      </Link>
      <WishlistToggle product={product} />
      <div className="jnr-deal-card__delivery" title={product.deliveryText || 'Delivery details at checkout'}>
        <Truck size={15} aria-hidden="true" />
        <span>{product.deliveryText || 'Delivery details at checkout'}</span>
      </div>
    </article>
  );
}
