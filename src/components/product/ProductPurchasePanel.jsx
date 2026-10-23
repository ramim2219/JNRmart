import { useEffect, useState } from 'react';
import { Heart, Minus, Plus, ShoppingCart, Truck, ShieldCheck, Share2, PackageCheck } from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';
import { useToast } from '../common/ToastProvider';
import { priceBDT } from '../../data/productDetailsData';

const MAX_QTY = 99; // frontend safety limit, not a stock claim

export default function ProductPurchasePanel({ product, onShowReviews }) {
  const { addToCart, openPanel, toggleWishlist, isWishlisted } = useStoreUI();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const wishlisted = isWishlisted(product.id);
  const rating = Number(product.rating);
  const reviews = Number(product.reviewCount || 0);
  const saving = product.oldPrice > product.price ? product.oldPrice - product.price : 0;

  useEffect(() => { setQuantity(1); }, [product.slug]);

  const handleAdd = (open = false) => {
    addToCart(product, quantity);
    // addToCart already shows the shared success toast.
    if (open) openPanel('cart');
  };


  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard.', { id: 'product-share', title: 'Link Copied' });
      } else toast.warning('Sharing is unavailable in this browser.', { id: 'product-share' });
    } catch (error) {
      if (error.name !== 'AbortError') toast.error('Could not share this product.', { id: 'product-share' });
    }
  };

  return (
    <div className="jnr-pd-purchase">
      <p className="jnr-pd-purchase__eyebrow">{product.categoryLabel || 'JNRmart Collection'}</p>
      <h1>{product.name}</h1>
      <div className="jnr-pd-purchase__meta">
        {product.brand && <span>Brand: <strong>{product.brand}</strong></span>}
        {Number.isFinite(rating) && rating > 0 && (
          <button type="button" className="jnr-pd-purchase__rating" onClick={onShowReviews}>
            <span aria-hidden="true">★★★★★</span>
            <strong>{rating.toFixed(1)}</strong>
            <span>{reviews > 0 ? `(${reviews} demo ratings)` : '(demo rating)'}</span>
          </button>
        )}
      </div>
      <div className="jnr-pd-purchase__divider" />
      <div className="jnr-pd-purchase__price-row">
        <strong className="jnr-pd-purchase__price">{priceBDT(product.price)}</strong>
        {saving > 0 && <><del>{priceBDT(product.oldPrice)}</del><span className="jnr-pd-purchase__save">Save {priceBDT(saving)}</span></>}
      </div>
      <p className="jnr-pd-purchase__tax-note">Demo price · final price and availability will be confirmed at checkout after backend integration.</p>
      <p className="jnr-pd-purchase__intro">{product.description || `Explore ${product.name} from the JNRmart ${product.categoryLabel || 'product'} collection.`}</p>
      <div className="jnr-pd-purchase__availability"><PackageCheck size={18}/><span>Availability and delivery options: confirm before ordering</span></div>
      <div className="jnr-pd-purchase__buy-area">
        <span className="jnr-pd-purchase__quantity-label">Quantity</span>
        <div className="jnr-pd-purchase__buy-row">
          <div className="jnr-pd-quantity" role="group" aria-label="Select quantity">
            <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity === 1} aria-label="Decrease quantity"><Minus size={17}/></button>
            <output aria-live="polite">{quantity}</output>
            <button type="button" onClick={() => setQuantity(q => Math.min(MAX_QTY, q + 1))} disabled={quantity === MAX_QTY} aria-label="Increase quantity"><Plus size={17}/></button>
          </div>
          <button type="button" className="jnr-pd-purchase__add" onClick={() => handleAdd(false)}><ShoppingCart size={19}/> Add to Cart</button>
          <button type="button" className="jnr-pd-purchase__buy" onClick={() => handleAdd(true)}>View Cart</button>
        </div>
      </div>
      <div className="jnr-pd-purchase__actions">
        <button type="button" onClick={() => toggleWishlist(product)} aria-pressed={wishlisted} className={wishlisted ? 'is-selected' : ''}><Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />{wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}</button>
        <button type="button" onClick={share}><Share2 size={17}/> Share Product</button>
      </div>
      <div className="jnr-pd-purchase__benefits">
        <span><Truck size={20}/><span>Delivery fee calculated at checkout</span></span>
        <span><ShieldCheck size={20}/><span>Review product details before ordering</span></span>
      </div>
    </div>
  );
}
