import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Package, Search, Truck } from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';
import { dateLabel, demoOrders, money, orderAmount } from '../../data/accountDemoData';

const TABS = ['All orders', 'Processing', 'On the way', 'Delivered', 'Cancelled'];
const statusClass = (status = '') => status.toLowerCase().replace(/\s+/g, '-');

export default function AccountOrders({ orderId }) {
  const [filter, setFilter] = useState('All orders');
  const [query, setQuery] = useState('');
  const { addToCart, openPanel } = useStoreUI();

  const order = orderId ? demoOrders.find((item) => item.id === orderId) : null;

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase();
    return demoOrders.filter((item) => {
      const matchesStatus = filter === 'All orders' || item.status === filter;
      const searchable = [item.id, ...item.items.map((product) => product.name)]
        .join(' ').toLowerCase();
      return matchesStatus && (!term || searchable.includes(term));
    });
  }, [filter, query]);

  const buyAgain = (selectedOrder) => {
    selectedOrder.items.forEach((product) => addToCart(product, product.quantity));
    openPanel('cart');
  };

  if (orderId) {
    if (!order) {
      return (
        <section className="jnr-account-panel jnr-account-empty">
          <Package size={35} aria-hidden="true" />
          <h2>Order not found</h2>
          <p>This sample order does not exist.</p>
          <Link to="/account/orders" className="jnr-account-primary">
            <ArrowLeft size={16} aria-hidden="true" /> Back to orders
          </Link>
        </section>
      );
    }

    const steps = ['Processing', 'On the way', 'Delivered'];
    const isCancelled = order.status === 'Cancelled';
    const activeStep = isCancelled ? -1 : steps.indexOf(order.status);

    return (
      <div className="jnr-account-stack">
        <Link to="/account/orders" className="jnr-account-back">
          <ArrowLeft size={16} aria-hidden="true" /> All orders
        </Link>

        <section className="jnr-account-panel">
          <div className="jnr-account-detail-title">
            <div>
              <span className="jnr-account-kicker">SAMPLE ORDER</span>
              <h2>{order.id}</h2>
              <p>Placed {dateLabel(order.date)} · {order.payment}</p>
            </div>
            <span className={`jnr-account-status status-${statusClass(order.status)}`}>
              {order.status}
            </span>
          </div>

          {isCancelled ? (
            <p className="jnr-account-cancelled-note">
              This sample order has been cancelled. Live cancellation information will be available after order API integration.
            </p>
          ) : (
            <div className="jnr-account-steps" aria-label={`Order progress: ${order.status}`}>
              {steps.map((step, index) => (
                <div className={`jnr-account-step${activeStep >= index ? ' is-complete' : ''}`} key={step}>
                  <span>
                    {activeStep >= index ? <Check size={15} aria-hidden="true" /> : index + 1}
                  </span>
                  <small>{step}</small>
                </div>
              ))}
            </div>
          )}

          <p className="jnr-account-tracking">
            <Truck size={17} aria-hidden="true" />
            {order.tracking || 'Tracking information will be available when the order API is connected.'}
            <span className="jnr-account-demo-caption">Sample information only.</span>
          </p>
        </section>

        <section className="jnr-account-panel">
          <div className="jnr-account-panel-heading">
            <div><h2>Items in this order</h2><p>Products included in this sample order.</p></div>
          </div>

          {order.items.map((product) => (
            <div className="jnr-account-detail-item" key={product.id}>
              <Link
                to={product.slug ? `/product/${product.slug}` : '/shop'}
                className="jnr-account-order-thumb"
                aria-label={`View ${product.name}`}
              >
                {product.image
                  ? <img src={product.image} alt="" loading="lazy" />
                  : <Package size={22} aria-hidden="true" />}
              </Link>
              <div>
                <Link to={product.slug ? `/product/${product.slug}` : '/shop'}>
                  <strong>{product.name}</strong>
                </Link>
                <small>Quantity: {product.quantity}</small>
              </div>
              <strong>{money(product.price * product.quantity)}</strong>
            </div>
          ))}

          <div className="jnr-account-invoice">
            <div><span>Items subtotal</span><strong>{money(orderAmount(order) - order.deliveryFee)}</strong></div>
            <div><span>Delivery fee</span><strong>{money(order.deliveryFee)}</strong></div>
            <div className="jnr-account-invoice-total">
              <span>Order total</span><strong>{money(orderAmount(order))}</strong>
            </div>
          </div>

          <button type="button" className="jnr-account-primary" onClick={() => buyAgain(order)}>
            Add items to cart <ArrowRight size={17} aria-hidden="true" />
          </button>
        </section>
      </div>
    );
  }

  return (
    <section className="jnr-account-panel">
      <div className="jnr-account-panel-heading">
        <div><h2>Order history</h2><p>Review your previous orders and their sample statuses.</p></div>
        <span className="jnr-account-count-pill">{filteredOrders.length} orders</span>
      </div>

      <div className="jnr-account-order-toolbar">
        <div className="jnr-account-order-tabs" role="group" aria-label="Filter orders by status">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={tab === filter ? 'is-current' : ''}
              onClick={() => setFilter(tab)}
              aria-pressed={tab === filter}
            >
              {tab}
            </button>
          ))}
        </div>

        <label className="jnr-account-search">
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search orders..."
            aria-label="Search orders"
          />
        </label>
      </div>

      {filteredOrders.length ? filteredOrders.map((item) => (
        <article className="jnr-account-order-card" key={item.id}>
          <div className="jnr-account-order-top">
            <div><strong>{item.id}</strong><span>Placed {dateLabel(item.date)}</span></div>
            <span className={`jnr-account-status status-${statusClass(item.status)}`}>{item.status}</span>
          </div>

          <div className="jnr-account-order-products">
            {item.items.slice(0, 3).map((product) => (
              <span className="jnr-account-order-product-image" key={product.id}>
                {product.image
                  ? <img src={product.image} alt="" loading="lazy" />
                  : <Package size={18} aria-hidden="true" />}
              </span>
            ))}
            <div>
              <strong>{item.items[0]?.name || 'Order items'}</strong>
              <small>
                {item.items.length} product type(s) ·{' '}
                {item.items.reduce((sum, product) => sum + product.quantity, 0)} total items
              </small>
            </div>
            <strong className="jnr-account-order-price">{money(orderAmount(item))}</strong>
          </div>

          <div className="jnr-account-order-actions">
            <button type="button" className="jnr-account-secondary" onClick={() => buyAgain(item)}>
              Buy again
            </button>
            <Link to={`/account/orders/${item.id}`} className="jnr-account-text-button">
              View details <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </article>
      )) : (
        <div className="jnr-account-empty jnr-account-empty-compact">
          <Package size={30} aria-hidden="true" />
          <h3>No orders found</h3>
          <p>Try another status filter or change your search keywords.</p>
          {(query || filter !== 'All orders') && (
            <button
              type="button"
              className="jnr-account-secondary"
              onClick={() => { setQuery(''); setFilter('All orders'); }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}
