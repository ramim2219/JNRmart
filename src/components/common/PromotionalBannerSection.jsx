import { Link } from 'react-router-dom';

import {
  sideBanners as defaultBanners,
} from '../../data/heroShowcaseData';

import '../../styles/promotional-banner.css';

export default function PromotionalBannerSection({
  banners = defaultBanners,
  className = '',
}) {
  const items = (Array.isArray(banners) ? banners : [])
    .filter((banner) => banner?.image)
    .slice(0, 2);

  if (items.length === 0) return null;

  return (
    <section
      className={`container jnr-promo-section ${className}`.trim()}
      aria-label="Promotional offers"
    >
      <div className="jnr-promo-grid">
        {items.map((banner, index) => (
          <Link
            key={banner.id ?? index}
            to={banner.href || '/shop'}
            className="jnr-promo-card"
            aria-label={banner.alt || 'Explore promotional offer'}
            draggable={false}
          >
            <img
              className="jnr-promo-image"
              src={banner.image}
              alt={banner.alt || ''}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}