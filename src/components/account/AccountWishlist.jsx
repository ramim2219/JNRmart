import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, ImageOff } from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';
import { money } from '../../data/accountDemoData';

export default function AccountWishlist() {
  const { wishlist, removeFromWishlist, addToCart, openPanel } = useStoreUI();
  const moveToCart = item => {
    if (addToCart(item)) openPanel('cart');
  };

  return <section className="jnr-account-panel">
    <div className="jnr-account-panel-heading"><div><h2>Saved products</h2><p>Products you have added to your wishlist.</p></div><span className="jnr-account-count-pill">{wishlist.length} saved</span></div>
    {wishlist.length ? <div className="jnr-account-wishlist-grid">
      {wishlist.map(product => <article className="jnr-account-wish-card" key={product.id}>
        <Link to={product.slug ? `/product/${product.slug}` : '/shop'} className="jnr-account-wish-image">
          {product.image ? <img src={product.image} alt="" loading="lazy"/> : <ImageOff size={30}/>}
        </Link>
        <button type="button" className="jnr-account-wish-remove" aria-label={`Remove ${product.name} from wishlist`} onClick={() => removeFromWishlist(product.id)}><Trash2 size={16}/></button>
        <div className="jnr-account-wish-copy">
          {product.brand && <span>{product.brand}</span>}
          <Link to={product.slug ? `/product/${product.slug}` : '/shop'}>{product.name}</Link>
          <strong>{money(product.price)}</strong>
          <button type="button" className="jnr-account-primary" onClick={() => moveToCart(product)}><ShoppingCart size={16}/> Add to cart</button>
        </div>
      </article>)}
    </div> : <div className="jnr-account-empty"><Heart size={35}/><h3>Your wishlist is empty</h3><p>Explore products and tap the heart icon to save your favourites here.</p><Link to="/shop" className="jnr-account-primary">Explore products <ArrowRight size={17}/></Link></div>}
  </section>;
}
