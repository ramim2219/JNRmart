import { Link } from 'react-router-dom';
import {
  ArrowRight, Package, Truck, Heart, MapPin, ShoppingBag,
  UserRound, BadgeCheck, ChevronRight,
} from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';
import { dateLabel, demoOrders, money, orderAmount } from '../../data/accountDemoData';

const statusClass = (status = '') => status.toLowerCase().replace(/\s+/g, '-');

export default function AccountOverview({ profile = {}, addresses = [] }) {
  const { wishlistCount, count } = useStoreUI();

  const inProgressCount = demoOrders.filter(
    (order) => order.status === 'On the way' || order.status === 'Processing'
  ).length;

  const stats = [
    { label: 'Sample orders', value: demoOrders.length, icon: Package, path: '/account/orders' },
    { label: 'In progress', value: inProgressCount, icon: Truck, path: '/account/orders' },
    { label: 'Wishlist', value: wishlistCount, icon: Heart, path: '/account/wishlist' },
    { label: 'Saved addresses', value: addresses.length, icon: MapPin, path: '/account/addresses' },
  ];

  return (
    <div className="jnr-account-stack">
      <section className="jnr-account-hero-card">
        <div className="jnr-account-hero-copy">
          <span className="jnr-account-hero-eyebrow">
            <BadgeCheck size={15} aria-hidden="true" /> JNRmart customer experience
          </span>
          <h2>Hello, {profile.name?.trim().split(/\s+/)[0] || 'there'}!</h2>
          <p>Manage your orders, saved products and delivery addresses in one convenient place.</p>
          <Link to="/shop" className="jnr-account-light-action">
            Continue shopping <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="jnr-account-hero-mark" aria-hidden="true">
          <ShoppingBag size={82} strokeWidth={1.15} />
        </div>
      </section>

      <div className="jnr-account-metrics">
        {stats.map(({ label, value, icon: Icon, path }) => (
          <Link to={path} className="jnr-account-metric" key={label}>
            <span className="jnr-account-metric-icon"><Icon size={20} aria-hidden="true" /></span>
            <strong>{value}</strong>
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <section className="jnr-account-panel">
        <div className="jnr-account-panel-heading">
          <div><h2>Recent orders</h2><p>Quick access to your latest sample orders.</p></div>
          <Link to="/account/orders" className="jnr-account-inline-link">
            View all <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="jnr-account-recent-orders">
          {demoOrders.slice(0, 3).map((order) => (
            <Link
              className="jnr-account-recent-order"
              to={`/account/orders/${order.id}`}
              key={order.id}
            >
              <span className="jnr-account-order-thumb">
                {order.items[0]?.image
                  ? <img src={order.items[0].image} alt="" loading="lazy" />
                  : <Package size={23} aria-hidden="true" />}
              </span>
              <span className="jnr-account-order-main">
                <strong>{order.id}</strong>
                <small>{dateLabel(order.date)} · {order.items.length} product(s)</small>
              </span>
              <span className={`jnr-account-status status-${statusClass(order.status)}`}>
                {order.status}
              </span>
              <strong className="jnr-account-order-price">{money(orderAmount(order))}</strong>
              <ChevronRight size={17} className="jnr-account-chevron" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <div className="jnr-account-quick-grid">
        <Link className="jnr-account-quick-card" to="/account/profile">
          <span className="jnr-account-quick-icon"><UserRound size={21} aria-hidden="true" /></span>
          <span><strong>Personal details</strong><small>Update your profile information</small></span>
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
        <Link className="jnr-account-quick-card" to="/account/addresses">
          <span className="jnr-account-quick-icon"><MapPin size={21} aria-hidden="true" /></span>
          <span><strong>Delivery addresses</strong><small>Add or manage saved addresses</small></span>
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>

      {count > 0 && (
        <p className="jnr-account-preview-caption">
          You currently have {count} item(s) in your shopping cart.
        </p>
      )}
    </div>
  );
}
