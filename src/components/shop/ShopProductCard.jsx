import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingCart } from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';
import { moneyBDT } from '../../data/shopDemoData';

/** Reusable product card: can also be rendered in SectionCarousel on the homepage. */
export default function ShopProductCard({ product }) {
  const { addToCart } = useStoreUI();
  const [added, setAdded] = useState(false);
  const saving = product.oldPrice && product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <article className="jnr-shop-card">
      <div className="jnr-shop-card__image-wrap">
        {(product.bestSelling || product.newArrival) && (
          <span className={`jnr-shop-card__badge ${product.newArrival ? 'is-new' : ''}`}>
            {product.newArrival ? 'New Arrival' : 'Best Selling'}
          </span>
        )}
        {saving > 0 && <span className="jnr-shop-card__saving">Save {saving}%</span>}
        <Link className="jnr-shop-card__image-link" to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
        </Link>
      </div>
      <div className="jnr-shop-card__body">
        <Link to={`/product/${product.slug}`} className="jnr-shop-card__name">{product.name}</Link>
        <p className="jnr-shop-card__brand">{product.brand}</p>
        <div className="jnr-shop-card__price">
          <strong>{moneyBDT(product.price)}</strong>
          {saving > 0 && <del>{moneyBDT(product.oldPrice)}</del>}
        </div>
        <button type="button" className={`jnr-shop-card__add ${added ? 'is-added' : ''}`} onClick={handleAdd}>
          {added ? <Check size={16} aria-hidden="true" /> : <ShoppingCart size={16} aria-hidden="true" />}
          <span>{added ? 'Add Another' : 'Add to Cart'}</span>
        </button>
      </div>
    </article>
  );
}
