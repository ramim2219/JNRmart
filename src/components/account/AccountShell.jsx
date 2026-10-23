import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, MapPin, Heart, UserRound, SlidersHorizontal,
  ChevronRight, LogIn, ShieldCheck,
} from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';

const sections = [
  { href: '/account', name: 'Overview', icon: LayoutDashboard, end: true },
  { href: '/account/orders', name: 'My Orders', icon: Package },
  { href: '/account/addresses', name: 'Address Book', icon: MapPin },
  { href: '/account/wishlist', name: 'Saved Products', icon: Heart },
  { href: '/account/profile', name: 'Personal Details', icon: UserRound },
  { href: '/account/settings', name: 'Preferences', icon: SlidersHorizontal },
];

const initials = name => String(name || 'Guest').trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();

export default function AccountShell({ profile, title, subtitle, children }) {
  const { wishlistCount } = useStoreUI();

  const menu = sections.map(({ href, name, icon: Icon, end }) => (
    <NavLink
      key={href} to={href} end={end}
      className={({ isActive }) => `jnr-account-navlink${isActive ? ' is-active' : ''}`}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{name}</span>
      {name === 'Saved Products' && wishlistCount > 0 && <em>{wishlistCount}</em>}
    </NavLink>
  ));

  return (
    <div className="jnr-account-page">
      <div className="container jnr-account-wrap">
        <nav className="jnr-account-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" /><span>My Account</span>
        </nav>
        <div className="jnr-account-layout">
          <aside className="jnr-account-sidebar" aria-label="Account navigation">
            <div className="jnr-account-person">
              <div className="jnr-account-avatar" aria-hidden="true">{initials(profile.name)}</div>
              <div className="jnr-account-person-copy">
                <span>Welcome</span>
                <strong>{profile.name || 'Demo Customer'}</strong>
                <small>Account UI preview</small>
              </div>
            </div>
            <div className="jnr-account-side-nav">{menu}</div>
            <div className="jnr-account-sidebar-bottom">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Your information will be secured when authentication is connected.</span>
            </div>
            <Link className="jnr-account-signin-link" to="/account/sign-in">
              <LogIn size={17} /> Sign-in UI preview
            </Link>
          </aside>
          <div className="jnr-account-main" id="account-main">
            <div className="jnr-account-head">
              <div><p className="jnr-account-kicker">MY ACCOUNT</p><h1>{title}</h1><p>{subtitle}</p></div>
              <span className="jnr-account-demo-pill">UI DEMO</span>
            </div>
            <nav className="jnr-account-mobile-nav" aria-label="Account sections">{menu}</nav>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
