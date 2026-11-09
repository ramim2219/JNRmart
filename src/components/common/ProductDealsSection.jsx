
import SectionCarousel from './SectionCarousel';
import ProductCard from '../common/ProductCard';

import '../../styles/product-deals.css';

const DEFAULT_COLUMNS = {
  desktop: 7.3,
  laptop: 5.5,
  tablet: 4.3,
  small: 3.1,
  mobile: 2.1,
};

/**
 * Reusable promotional product section.
 *
 * Uses the shared ProductCard component.
 * Product card styling is managed by product-card.css.
 *
 * Example:
 *
 * <ProductDealsSection
 *   title="Top Deals on Home Appliances!"
 *   products={products}
 *   viewAllHref="/category/home-appliances"
 * />
 */

export default function ProductDealsSection({
  title = 'Top Deals',
  subtitle,
  products = [],
  items,
  viewAllHref = '/shop',
  viewAllLabel = 'View All',
  columns = DEFAULT_COLUMNS,
  gap = 9,
  className = '',
  showArrows = true,
  arrowsOnHover = false,
  withContainer = true,
}) {
  const carouselItems = items ?? products;

  return (
    <SectionCarousel
      title={title}
      subtitle={subtitle}
      items={carouselItems}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
      columns={columns}
      gap={gap}
      withContainer={withContainer}
      showArrows={showArrows}
      arrowsOnHover={arrowsOnHover}
      arrowLabel="deal products"
      className={`jnr-deals-section ${className}`.trim()}
      getItemKey={(product, index) =>
        product?.id ?? product?.slug ?? index
      }
      renderItem={(product) => (
        <ProductCard product={product} />
      )}
    />
  );
}
