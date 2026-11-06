import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  UserRound,
  ShoppingCart,
} from 'lucide-react';

import { useStoreUI } from '../../context/StoreUIContext';
import CategoryNavigation from './CategoryNavigation';
import AnnouncementBar from './AnnouncementBar';

import '../../styles/header-cart.css';

export default function Header() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { count, wishlistCount, panel, openPanel } = useStoreUI();

  const submitSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      <header className="site-header">
        <AnnouncementBar />

        <div className="main-header">
          <div className="container header-inner">
            <Link
              className="brand brand-logo"
              to="/"
              aria-label="JNRmart home"
            >
              <img src="/jnrmart-logo.png" alt="JNRmart" />
            </Link>

            <form
              className="search-form"
              onSubmit={submitSearch}
              role="search"
            >
              <input
                type="search"
                aria-label="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for clothes, shoes, beauty, bags and more..."
              />

              <button type="submit" aria-label="Search">
                <Search size={19} aria-hidden="true" />
              </button>
            </form>

            <div className="header-actions">
              <button
                type="button"
                className="wishlist-link header-cart-button header-wishlist-button"
                onClick={() => openPanel('wishlist')}
                aria-label={`Open wishlist (${wishlistCount} ${
                  wishlistCount === 1 ? 'item' : 'items'
                })`}
                aria-haspopup="dialog"
                aria-expanded={panel === 'wishlist'}
              >
                <Heart size={23} aria-hidden="true" />
                <span>Wishlist</span>

                {wishlistCount > 0 && (
                  <b aria-hidden="true">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </b>
                )}
              </button>

              <Link to="/account" className="account-link" aria-label="My account">
                <UserRound size={23} aria-hidden="true" />
                <span>Account</span>
              </Link>

              <button
                type="button"
                className="cart-link header-cart-button"
                onClick={() => openPanel('cart')}
                aria-label={`Open shopping cart (${count} ${
                  count === 1 ? 'item' : 'items'
                })`}
                aria-haspopup="dialog"
                aria-expanded={panel === 'cart'}
              >
                <ShoppingCart size={23} aria-hidden="true" />
                <span>Cart</span>

                <b aria-hidden="true">
                  {count > 99 ? '99+' : count}
                </b>
              </button>
            </div>
          </div>
        </div>
      </header>

      <CategoryNavigation />
    </>
  );
}
