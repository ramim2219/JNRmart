import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, UserRound, ShoppingBag } from 'lucide-react';
import CategoryNavigation from './CategoryNavigation';
import AnnouncementBar from './AnnouncementBar';

export default function Header() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

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
              <Link to="/cart" aria-label="Shopping cart" className="cart-link">
                <ShoppingBag size={22} /><span>Cart</span><b>0</b>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <CategoryNavigation />
    </>
  );
}
