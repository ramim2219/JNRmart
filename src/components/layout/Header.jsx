import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, UserRound, ShoppingBag } from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';
import CategoryNavigation from './CategoryNavigation';
import AnnouncementBar from './AnnouncementBar';
import '../../styles/header-cart.css';

export default function Header() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { count, panel, openPanel } = useStoreUI();

  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <header className="site-header">
        <AnnouncementBar />
        <div className="main-header">
          <div className="container header-inner">
            <Link className="brand brand-logo" to="/" aria-label="JNRmart home">
              <img src="/jnrmart-logo.png" alt="JNRmart" />
            </Link>

            <form className="search-form" onSubmit={submitSearch} role="search">
              <input
                aria-label="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for products, categories..."
              />
              <button aria-label="Search" type="submit"><Search size={20} /></button>
            </form>

            <div className="header-actions">
              <Link to="/wishlist" className="wishlist-link" aria-label="Wishlist">
                <Heart size={22} /><span>Wishlist</span>
              </Link>
              <Link to="/account" aria-label="My account">
                <UserRound size={22} /><span>Account</span>
              </Link>
              <button
                type="button"
                className="cart-link header-cart-button"
                onClick={() => openPanel('cart')}
                aria-label={`Open shopping cart (${count} ${count === 1 ? 'item' : 'items'})`}
                aria-haspopup="dialog"
                aria-expanded={panel === 'cart'}
              >
                <ShoppingBag size={22} aria-hidden="true" />
                <span>Cart</span>
                <b aria-hidden="true">{count > 99 ? '99+' : count}</b>
              </button>
            </div>
          </div>
        </div>
      </header>

      <CategoryNavigation />
    </>
  );
}
