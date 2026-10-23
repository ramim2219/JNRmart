import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Menu, ShoppingCart, Search, UserRound, X, ArrowRight, Minus, Plus, Trash2, ShoppingBag, Heart } from 'lucide-react';
import { categories } from '../../data/navigation';
import { useStoreUI } from '../../context/StoreUIContext';
import '../../styles/wishlist-ui.css';
import '../../styles/cart-checkout.css';

const navigation = [
  { label: 'Home', icon: Home, to: '/' },
  { label: 'Menu', icon: Menu, panel: 'menu' },
  { label: 'Cart', icon: ShoppingCart, panel: 'cart' },
  { label: 'Search', icon: Search, panel: 'search' },
  { label: 'Account', icon: UserRound, to: '/account' },
];

export default function MobileStoreUI() {
  const { panel, openPanel, closePanel, cart, count, total, changeQuantity, removeItem, formatMoney, wishlist, wishlistCount, removeFromWishlist, addToCart, selectedCartItems, selectedCount, selectedTotal, allCartSelected, toggleCartSelection, selectAllCartItems } = useStoreUI();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const panelRef = useRef(null);
  const selectAllRef = useRef(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedCartItems.length > 0 && !allCartSelected;
    }
  }, [selectedCartItems.length, allCartSelected, panel]);

  useEffect(() => { closePanel(); }, [location.pathname, location.search, closePanel]);
  useEffect(() => {
    if (!panel) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = event => { if (event.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', onKey);
    const focus = window.setTimeout(() => (panel === 'search' ? searchRef.current : panelRef.current)?.focus(), 50);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); window.clearTimeout(focus); };
  }, [panel, closePanel]);
  const submitSearch = event => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    closePanel();
  };
  return (
    <>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navigation.map(({ label, icon: Icon, to, panel: target }) => to ? (
          <NavLink key={label} to={to} end={to === '/'} className={({ isActive }) => `mobile-bottom-item ${isActive ? 'is-active' : ''}`} onClick={closePanel}>
            <Icon size={22}/><span>{label}</span>
          </NavLink>
        ) : (
          <button key={label} type="button" className={`mobile-bottom-item ${panel === target ? 'is-active' : ''}`} onClick={() => panel === target ? closePanel() : openPanel(target)} aria-expanded={panel === target}>
            <span className="mobile-nav-icon"><Icon size={22}/>{target === 'cart' && count > 0 && <b className="mobile-cart-count">{count}</b>}</span><span>{label}</span>
          </button>
        ))}
      </nav>

      <button className="floating-cart-summary" type="button" onClick={() => openPanel('cart')} aria-label={`Open cart, ${count} items, total ${formatMoney(total)}`}>
        <span className="floating-cart-top"><ShoppingBag size={21}/><strong>{count} {count === 1 ? 'Item' : 'Items'}</strong></span>
        <span className="floating-cart-amount">{formatMoney(total)}</span>
      </button>

      {panel && <div className="store-overlay" onClick={closePanel} aria-hidden="true" />}
      {panel === 'menu' && (
        <aside ref={panelRef} tabIndex={-1} className="store-drawer store-drawer-left" role="dialog" aria-modal="true" aria-label="Categories menu">
          <div className="store-drawer-heading"><strong>Shop Categories</strong><button aria-label="Close menu" onClick={closePanel}><X size={22}/></button></div>
          <div className="store-menu-links"><Link to="/" onClick={closePanel}>Home</Link>{categories.map(category => <Link key={category.slug} to={`/category/${category.slug}`} onClick={closePanel}>{category.label}<span>›</span></Link>)}<button type="button" onClick={() => openPanel('wishlist')}>Wishlist <Heart size={17}/></button><Link to="/track-order" onClick={closePanel}>Track Order</Link></div>
        </aside>
      )}
      {panel === 'cart' && (
        <aside ref={panelRef} tabIndex={-1} className="store-drawer store-drawer-right" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <div className="store-drawer-heading">
            <strong>Shopping Cart ({count})</strong>
            <button type="button" aria-label="Close cart" onClick={closePanel}><X size={22}/></button>
          </div>
          {cart.length === 0 ? (
            <div className="store-cart-empty">
              <ShoppingBag size={54} strokeWidth={1.2}/>
              <h3>Your cart is empty</h3>
              <p>Add products to see them here.</p>
              <button type="button" className="store-primary-btn" onClick={closePanel}>Continue Shopping</button>
            </div>
          ) : (
            <>
              <div className="jnr-cart-select-all">
                <label className="jnr-cart-checkbox-label">
                  <input ref={selectAllRef} type="checkbox" checked={allCartSelected}
                    onChange={event => selectAllCartItems(event.target.checked)} />
                  <span>Select All</span>
                </label>
                <span>{selectedCartItems.length} of {cart.length} selected</span>
              </div>
              <div className="store-cart-items jnr-cart-selectable-items">
                {cart.map(item => (
                  <article className={`store-cart-item jnr-cart-selectable-item${item.selected === false ? ' is-unselected' : ''}`} key={item.id}>
                    <label className="jnr-cart-item-check" title={`Select ${item.name} for checkout`}>
                      <input type="checkbox" checked={item.selected !== false}
                        onChange={() => toggleCartSelection(item.id)} aria-label={`Include ${item.name} in checkout`} />
                    </label>
                    {item.image ? <img src={item.image} alt=""/> : <div className="store-cart-image-fallback"><ShoppingBag size={24}/></div>}
                    <div className="store-cart-info">
                      <strong>{item.name}</strong>
                      <span>{formatMoney(item.price)}</span>
                      <div className="store-cart-controls">
                        <button type="button" aria-label={`Reduce ${item.name}`} onClick={() => changeQuantity(item.id, -1)}><Minus size={15}/></button>
                        <span>{item.quantity}</span>
                        <button type="button" aria-label={`Increase ${item.name}`} onClick={() => changeQuantity(item.id, 1)}><Plus size={15}/></button>
                        <button type="button" className="remove" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)}><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="store-cart-footer jnr-cart-checkout-footer">
                <div className="jnr-cart-summary-label">
                  <span>Selected subtotal <small>({selectedCount} {selectedCount === 1 ? 'item' : 'items'})</small></span>
                  <strong>{formatMoney(selectedTotal)}</strong>
                </div>
                {selectedCartItems.length === 0 && <p className="jnr-cart-select-warning" role="status">Select at least one product to checkout.</p>}
                <button type="button" className="store-primary-btn jnr-cart-checkout-button"
                  disabled={selectedCartItems.length === 0}
                  onClick={() => { closePanel(); navigate('/checkout'); }}>
                  Checkout <ArrowRight size={18} aria-hidden="true" />
                </button>
                <small className="jnr-cart-unselected-note">Unselected products stay in your cart.</small>
              </div>
            </>
          )}
        </aside>
      )}
      {panel === 'wishlist' && (
        <aside ref={panelRef} tabIndex={-1} className="store-drawer store-drawer-right jnr-wishlist-drawer" role="dialog" aria-modal="true" aria-label="Your wishlist">
          <div className="store-drawer-heading">
            <strong><Heart size={19} aria-hidden="true"/> My Wishlist ({wishlistCount})</strong>
            <button type="button" aria-label="Close wishlist" onClick={closePanel}><X size={22}/></button>
          </div>
          {wishlistCount === 0 ? (
            <div className="store-cart-empty jnr-wishlist-empty">
              <Heart size={54} strokeWidth={1.25} aria-hidden="true"/>
              <h3>Your wishlist is empty</h3>
              <p>Save your favourite products to find them here later.</p>
              <Link to="/shop" className="store-primary-btn" onClick={closePanel}>Explore Products</Link>
            </div>
          ) : (
            <>
              <div className="store-cart-items jnr-wishlist-items">
                {wishlist.map(item => (
                  <article className="store-cart-item jnr-wishlist-item" key={item.id}>
                    {item.slug ? (
                      <Link className="jnr-wishlist-item__image" to={`/product/${item.slug}`} onClick={closePanel} aria-label={`View ${item.name}`}>
                        {item.image ? <img src={item.image} alt="" loading="lazy"/> : <ShoppingBag size={24}/>}
                      </Link>
                    ) : (
                      <span className="jnr-wishlist-item__image">{item.image ? <img src={item.image} alt="" loading="lazy"/> : <ShoppingBag size={24}/>}</span>
                    )}
                    <div className="store-cart-info jnr-wishlist-item__info">
                      {item.slug ? <Link to={`/product/${item.slug}`} onClick={closePanel} className="jnr-wishlist-item__name">{item.name}</Link> : <strong>{item.name}</strong>}
                      {item.brand && <small>{item.brand}</small>}
                      <span>{formatMoney(item.price)}</span>
                      <div className="jnr-wishlist-item__buttons">
                        <button type="button" className="jnr-wishlist-add" onClick={() => { if (addToCart(item)) openPanel('cart'); }}>
                          <ShoppingBag size={15}/> Add to Cart
                        </button>
                        <button type="button" className="jnr-wishlist-remove" onClick={() => removeFromWishlist(item.id)} aria-label={`Remove ${item.name} from wishlist`} title="Remove from wishlist">
                          <Trash2 size={17}/>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="store-cart-footer jnr-wishlist-footer">
                <p><span>Saved Products</span><strong>{wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}</strong></p>
                <button type="button" className="store-primary-btn" onClick={closePanel}>Continue Shopping</button>
              </div>
            </>
          )}
        </aside>
      )}
      {panel === 'search' && (
        <section className="store-search-panel" role="dialog" aria-modal="true" aria-label="Search products">
          <div className="container store-search-inner"><form onSubmit={submitSearch}><Search size={21}/><input ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products, categories..." aria-label="Search products"/><button type="submit">Search</button></form><button className="store-search-close" type="button" aria-label="Close search" onClick={closePanel}><X size={23}/></button></div>
        </section>
      )}
    </>
  );
}
