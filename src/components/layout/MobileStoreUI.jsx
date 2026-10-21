import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Menu, ShoppingCart, Search, UserRound, X, ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { categories } from '../../data/navigation';
import { useStoreUI } from '../../context/StoreUIContext';

const navigation = [
  { label: 'Home', icon: Home, to: '/' },
  { label: 'Menu', icon: Menu, panel: 'menu' },
  { label: 'Cart', icon: ShoppingCart, panel: 'cart' },
  { label: 'Search', icon: Search, panel: 'search' },
  { label: 'Account', icon: UserRound, to: '/account' },
];

export default function MobileStoreUI() {
  const { panel, openPanel, closePanel, cart, count, total, changeQuantity, removeItem, formatMoney } = useStoreUI();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const panelRef = useRef(null);

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
          <div className="store-menu-links"><Link to="/" onClick={closePanel}>Home</Link>{categories.map(category => <Link key={category.slug} to={`/category/${category.slug}`} onClick={closePanel}>{category.label}<span>›</span></Link>)}<Link to="/wishlist" onClick={closePanel}>Wishlist</Link><Link to="/track-order" onClick={closePanel}>Track Order</Link></div>
        </aside>
      )}
      {panel === 'cart' && (
        <aside ref={panelRef} tabIndex={-1} className="store-drawer store-drawer-right" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <div className="store-drawer-heading"><strong>Shopping Cart ({count})</strong><button aria-label="Close cart" onClick={closePanel}><X size={22}/></button></div>
          {cart.length === 0 ? <div className="store-cart-empty"><ShoppingBag size={54} strokeWidth={1.2}/><h3>Your cart is empty</h3><p>Add products to see them here.</p><button type="button" className="store-primary-btn" onClick={closePanel}>Continue Shopping</button></div> : (
            <><div className="store-cart-items">{cart.map(item => <div className="store-cart-item" key={item.id}>
              {item.image ? <img src={item.image} alt=""/> : <div className="store-cart-image-fallback"><ShoppingBag size={24}/></div>}
              <div className="store-cart-info"><strong>{item.name}</strong><span>{formatMoney(item.price)}</span><div className="store-cart-controls"><button aria-label={`Reduce ${item.name}`} onClick={() => changeQuantity(item.id, -1)}><Minus size={15}/></button><span>{item.quantity}</span><button aria-label={`Increase ${item.name}`} onClick={() => changeQuantity(item.id, 1)}><Plus size={15}/></button><button className="remove" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)}><Trash2 size={16}/></button></div></div>
            </div>)}</div><div className="store-cart-footer"><p><span>Subtotal</span><strong>{formatMoney(total)}</strong></p><Link to="/cart" onClick={closePanel} className="store-primary-btn">View Cart <ArrowLeft size={17} style={{transform:'rotate(180deg)'}}/></Link></div></>
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
