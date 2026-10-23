import { useLocation } from 'react-router-dom';
import AccountShell from '../components/account/AccountShell';
import AccountOverview from '../components/account/AccountOverview';
import AccountOrders from '../components/account/AccountOrders';
import AccountAddresses from '../components/account/AccountAddresses';
import AccountWishlist from '../components/account/AccountWishlist';
import AccountProfile from '../components/account/AccountProfile';
import AccountAuth from '../components/account/AccountAuth';
import { useAccountDemo } from '../hooks/useAccountDemo';
import '../styles/account-page.css';

const pages = {
  orders: ['My orders', 'See your order history and status.'],
  addresses: ['Address book', 'Keep your delivery addresses in one place.'],
  wishlist: ['Saved products', 'Find the products you love.'],
  profile: ['Personal details', 'Manage your profile information.'],
  settings: ['Preferences & security', 'Set up your account experience.'],
};

/** Handles /account and /account/* without changing existing StoreUIProvider or header. */
export default function AccountPage() {
  const { pathname } = useLocation();
  const parts = pathname.replace(/^\/account\/?/, '').split('/').filter(Boolean);
  const section = parts[0] || 'overview';
  const account = useAccountDemo();

  if (['sign-in', 'register', 'forgot-password'].includes(section)) return <AccountAuth mode={section}/>;

  const [title, subtitle] = pages[section] || ['My account', 'All your shopping essentials, in one place.'];
  let content;
  switch (section) {
    case 'orders': content = <AccountOrders orderId={parts[1]}/>; break;
    case 'addresses': content = <AccountAddresses {...account}/>; break;
    case 'wishlist': content = <AccountWishlist/>; break;
    case 'profile': content = <AccountProfile profile={account.profile} saveProfile={account.saveProfile}/>; break;
    case 'settings': content = <AccountProfile preferences={account.preferences} savePreferences={account.savePreferences} isSettings/>; break;
    default: content = <AccountOverview profile={account.profile} addresses={account.addresses}/>;
  }

  return <AccountShell profile={account.profile} title={section === 'orders' && parts[1] ? 'Order details' : title} subtitle={subtitle}>{content}</AccountShell>;
}
