import SectionCarousel from './SectionCarousel';
import DealProductCard from './DealProductCard';
import '../../styles/product-deals.css';

const DEFAULT_COLUMNS = { desktop: 7.3, laptop: 5.5, tablet: 4.3, small: 3.1, mobile: 2.1 };

/**
 * Reusable promotional product strip. Uses the existing SectionCarousel for
 * accessibility, scrolling, dragging, responsive columns and arrow states.
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
  imageFit = 'contain',
  withContainer = true,
}) {
  return (
    <SectionCarousel
      title={title}
      subtitle={subtitle}
      items={items || products}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
      columns={columns}
      gap={gap}
      withContainer={withContainer}
      showArrows={showArrows}
      arrowsOnHover={arrowsOnHover}
      arrowLabel="deal products"
      className={`jnr-deals-section ${className}`.trim()}
      getItemKey={(product, index) => product.id ?? product.slug ?? index}
      renderItem={(product) => <DealProductCard product={product} imageFit={imageFit} />}
    />
  );
}
