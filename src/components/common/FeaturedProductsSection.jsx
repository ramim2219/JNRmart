
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import ProductCard from '../common/ProductCard';

import '../../styles/featured-products.css';

// =========================================
// Featured Product Filters
// =========================================

const FILTERS = [
  'All',
  'Women',
  'Men',
  'Shoes',
  'Cosmetics',
  'Accessories',
];

const CATEGORY_MATCHERS = {
  Women: /\b(women|woman|ladies|female)\b/i,
  Men: /\b(men|man|male)\b/i,
  Shoes: /shoe|footwear|sneaker|boot|sandal/i,
  Cosmetics: /cosmetic|beauty|makeup|skin.?care|lipstick|foundation/i,
  Accessories: /accessor|bag|jewel|watch|sunglass|belt/i,
};

// =========================================
// Featured Products Section
// =========================================

export default function FeaturedProductsSection({
  products = [],
  className = '',
  initialVisible = 10,
  loadStep = 10,
}) {
  const [filter, setFilter] = useState('All');

  const [limit, setLimit] = useState(
    Math.max(1, Number(initialVisible) || 10)
  );

  // =========================================
  // Filter Products
  // =========================================

  const filtered = useMemo(() => {
    const productList = Array.isArray(products)
      ? products
      : [];

    return productList.filter((product) => {
      if (filter === 'All') return true;

      const category = [
        product.category?.name,
        typeof product.category === 'string'
          ? product.category
          : '',
        product.category_name,
        product.subCategory,
        product.sub_category,
      ]
        .filter(Boolean)
        .join(' ');

      return CATEGORY_MATCHERS[filter].test(
        String(category)
      );
    });
  }, [products, filter]);

  // =========================================
  // Filter Change
  // =========================================

  const handleFilterChange = (item) => {
    setFilter(item);

    setLimit(
      Math.max(1, Number(initialVisible) || 10)
    );
  };

  // =========================================
  // Load More
  // =========================================

  const handleLoadMore = () => {
    const step = Math.max(1, Number(loadStep) || 10);

    setLimit((current) => current + step);
  };

  // =========================================
  // Render
  // =========================================

  return (
    <section
      className={`container jnr-featured-products ${className}`.trim()}
      aria-label="Featured products"
    >

      {/* Section Header */}
      <div className="jnr-featured-header">

        {/* Category Filters */}
        <div
          className="jnr-featured-filters"
          role="group"
          aria-label="Filter products"
        >
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              className={`jnr-featured-filter ${
                filter === item ? 'is-active' : ''
              }`}
              onClick={() => handleFilterChange(item)}
              aria-pressed={filter === item}
            >
              {item}
            </button>
          ))}
        </div>

        {/* View All */}
        <Link
          to="/shop"
          className="jnr-featured-view-all"
        >
          View All

          <ArrowRight
            size={16}
            aria-hidden="true"
          />
        </Link>

      </div>

      {/* Product Grid */}
      {filtered.length > 0 ? (

        <div className="jnr-featured-grid">

          {filtered.slice(0, limit).map((product, index) => (
            <ProductCard
              key={
                product.id ??
                product.slug ??
                index
              }
              product={product}
            />
          ))}

        </div>

      ) : (

        /* Empty State */
        <div className="jnr-featured-empty">
          No products available in this category.
        </div>

      )}

      {/* Load More */}
      {limit < filtered.length && (

        <div className="jnr-featured-load-more">

          <button
            type="button"
            onClick={handleLoadMore}
          >
            Load More Products

            <ArrowRight
              size={16}
              aria-hidden="true"
            />
          </button>

        </div>

      )}

    </section>
  );
}
