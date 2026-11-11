
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionCarousel from './SectionCarousel';
import { fetchPublicCategories } from '../../services/categoryServices';
import '../../styles/category-slider.css';

const isEnabled = (value) =>
  value === true ||
  value === 1 ||
  value === '1' ||
  value === 'true';

const sortByOrder = (a, b) => {
  const order = (item) => {
    if (item.order == null || item.order === '') {
      return Infinity;
    }

    const number = Number(item.order);

    return Number.isFinite(number) ? number : Infinity;
  };

  return (
    order(a) - order(b) ||
    String(a.name || '').localeCompare(String(b.name || ''))
  );
};

// Preserve Admin Panel parent-child ordering.
function orderCategories(categories) {
  const nodes = new Map(
    categories.map((item) => [
      String(item.id),
      { ...item, children: [] },
    ])
  );

  const roots = [];

  nodes.forEach((item) => {
    const parent = nodes.get(String(item.parent_id));

    if (parent && parent !== item) {
      parent.children.push(item);
    } else {
      roots.push(item);
    }
  });

  const result = [];
  const visited = new Set();

  const visit = (item) => {
    const id = String(item.id);

    if (visited.has(id)) return;

    visited.add(id);
    result.push(item);

    item.children.sort(sortByOrder).forEach(visit);
  };

  roots.sort(sortByOrder).forEach(visit);

  // Include orphaned or legacy records without duplicates.
  [...nodes.values()].sort(sortByOrder).forEach(visit);

  return result;
}

// ======================================================
// UNIVERSAL IMAGE URL HANDLER
// Supports:
// 1. Laravel absolute URLs
// 2. Relative storage URLs
// 3. External image URLs
// 4. Base64 images
// 5. Blob images
// ======================================================

const LOCAL_BACKEND_HOSTS = [
  'localhost',
  '127.0.0.1',
  '192.168.0.174',
];

function imageUrl(path) {
  if (typeof path !== 'string' || !path.trim()) {
    return null;
  }

  const value = path.trim();

  // Preserve Base64 and Blob URLs.
  if (/^(data:image\/|blob:)/i.test(value)) {
    return value;
  }

  // Handle absolute URLs.
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);

      const isLocalBackend =
        LOCAL_BACKEND_HOSTS.includes(url.hostname) ||
        url.port === '8000';

      // Convert local Laravel storage URL
      // into a relative URL for Vite proxy.
      if (
        isLocalBackend &&
        url.pathname.startsWith('/storage/')
      ) {
        return `${url.pathname}${url.search}${url.hash}`;
      }

      // Preserve external URLs.
      return value;
    } catch {
      return value;
    }
  }

  // Already a relative Laravel storage URL.
  if (value.startsWith('/storage/')) {
    return value;
  }

  // Storage path without leading slash.
  if (value.startsWith('storage/')) {
    return `/${value}`;
  }

  // Other absolute paths.
  if (value.startsWith('/')) {
    return value;
  }

  // Filename or relative storage path.
  return `/storage/${value.replace(/^\/+/, '')}`;
}

// ======================================================
// CATEGORY CARD
// Design remains unchanged.
// ======================================================

function CategoryCard({ category }) {
  const image = imageUrl(
    category.image_url || category.image
  );

  const [failedSrc, setFailedSrc] = useState(null);

  const title = String(category.name || '').trim();

  const showImage = Boolean(
    image && image !== failedSrc
  );

  return (
    <Link
      className="jnr-cat-card"
      to={`/category/${encodeURIComponent(category.slug)}`}
      title={`Shop ${title}`}
      draggable={false}
    >
      <span className="jnr-cat-tile">
        {showImage ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={(e) => {
              console.error('Category image failed:', {
                category: title,
                originalUrl:
                  category.image_url || category.image,
                resolvedUrl: e.currentTarget.src,
              });

              setFailedSrc(image);
            }}
          />
        ) : (
          <span
            className="jnr-cat-fallback"
            aria-hidden="true"
          >
            {title.charAt(0).toUpperCase()}
          </span>
        )}
      </span>

      <span className="jnr-cat-label">
        <span className="jnr-cat-label-text">
          {title}
        </span>

        <span
          className="jnr-cat-label-arrow"
          aria-hidden="true"
        >
          →
        </span>
      </span>
    </Link>
  );
}

// ======================================================
// CATEGORY SLIDER
// ======================================================

export default function CategorySlider({
  title = 'Featured Categories',
  subtitle,
  viewAllHref,
  viewAllLabel = 'View All Categories',

  columns = {
    desktop: 7,
    laptop: 7,
    tablet: 6,
    small: 5,
    mobile: 3.2,
  },

  titleAlign = 'left',
  className = '',
}) {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetchPublicCategories();

        const rows = Array.isArray(response?.data)
          ? response.data
          : [];

        const active = rows.filter(
          (item) =>
            item.id != null &&
            item.name &&
            isEnabled(item.status)
        );

        const selected = orderCategories(active)
          .filter((item) => isEnabled(item.is_featured))
          .map((item) => ({
            ...item,

            slug:
              item.slug ||
              item.url_slug ||
              String(item.name)
                .trim()
                .toLowerCase()
                .replace(/[^\p{L}\p{N}]+/gu, '-')
                .replace(/^-|-$/g, ''),
          }));

        if (!cancelled) {
          setFeatured(selected);
        }
      } catch (error) {
        console.error(
          'Unable to fetch featured categories:',
          error
        );

        if (!cancelled) {
          setFeatured([]);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (featured.length === 0) {
    return null;
  }

  return (
    <SectionCarousel
      title={title}
      subtitle={subtitle}
      items={featured}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
      columns={columns}
      gap={12}
      titleAlign={titleAlign}
      arrowLabel="categories"
      arrowsOnHover={true}
      getItemKey={(category) => category.id}
      renderItem={(category) => (
        <CategoryCard category={category} />
      )}
      className={`jnr-cat-section ${className}`.trim()}
    />
  );
}
