import { Link } from 'react-router-dom';
import SectionCarousel from './SectionCarousel';
import '../../styles/category-slider.css';

const ICONS_BY_NAME = [
  ['ghee', '🧈'], ['oil', '🧈'], ['organic', '🌿'], ['honey', '🍯'],
  ['date', '🌴'], ['spice', '🌶️'], ['nut', '🥜'], ['seed', '🥜'],
  ['bever', '☕'], ['tea', '☕'], ['rice', '🍚'], ['gift', '🎁'],
];

function categoryEmoji(category) {
  if (typeof category.icon === 'string' && !/^https?:|^\/|^data:image\/|^blob:/.test(category.icon)) {
    return category.icon;
  }
  const name = String(category.label ?? category.name ?? '').toLowerCase();
  return ICONS_BY_NAME.find(([word]) => name.includes(word))?.[1] ?? '🛍️';
}

function CategoryCard({ category }) {
  const title = category.label || category.name || 'Category';
  const url = category.href || (category.slug ? `/category/${encodeURIComponent(category.slug)}` : '/categories');
  const iconSrc = category.image || (
    typeof category.icon === 'string' && /^(https?:|\/|data:image\/|blob:)/.test(category.icon)
      ? category.icon
      : null
  );

  return (
    <Link to={url} className="jnr-cat-card" draggable={false}>
      <span className="jnr-cat-tile">
        {iconSrc ? (
          <img src={iconSrc} alt="" loading="lazy" decoding="async" draggable={false} />
        ) : (
          <span className="jnr-cat-emoji" aria-hidden="true">{categoryEmoji(category)}</span>
        )}
      </span>
      <span className="jnr-cat-label">{title}</span>
    </Link>
  );
}

/** Same public usage as before: <CategorySlider title="Featured Categories" items={categories} /> */
export default function CategorySlider({
  title = 'Featured Categories',
  subtitle,
  items = [],
  to,
  viewAllHref = to,
  viewAllLabel = 'View All',
  columns = { desktop: 8, laptop: 6, tablet: 5, small: 4, mobile: 3.2 },
  titleAlign = 'left',
  className = '',
  ...rest
}) {
  return (
    <SectionCarousel
      title={title}
      subtitle={subtitle}
      items={items}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
      columns={columns}
      gap={16}
      titleAlign={titleAlign}
      arrowLabel="categories"
      getItemKey={(category, i) => category.id ?? category.slug ?? i}
      renderItem={(category) => <CategoryCard category={category} />}
      className={`jnr-cat-section ${className}`.trim()}
      {...rest}
    />
  );
}
