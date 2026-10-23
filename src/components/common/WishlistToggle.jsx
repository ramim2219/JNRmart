import { Heart } from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';
import '../../styles/wishlist-ui.css';

/** Overlay button for product cards. Keep outside Link elements. */
export default function WishlistToggle({ product, className = '' }) {
  const { toggleWishlist, isWishlisted } = useStoreUI();
  if (!product || product.id == null) return null;
  const active = isWishlisted(product.id);
  return (
    <button
      type="button"
      className={`jnr-card-wish-button ${active ? 'is-saved' : ''} ${className}`.trim()}
      aria-label={active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      aria-pressed={active}
      title={active ? 'Remove from Wishlist' : 'Add to Wishlist'}
      onClick={event => { event.preventDefault(); event.stopPropagation(); toggleWishlist(product); }}
    >
      <Heart size={17} fill={active ? 'currentColor' : 'none'} aria-hidden="true"/>
    </button>
  );
}
