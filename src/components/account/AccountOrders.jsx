import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Package, Search, Truck, CheckCircle2, Check } from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';
import { dateLabel, demoOrders, money, orderAmount } from '../../data/accountDemoData';

const statusClass = status => status.toLowerCase().replace(/\s+/g, '-');
const tabs = ['All orders', 'Processing', 'On the way', 'Delivered', 'Cancelled'];

export default function AccountOrders({ orderId }) {
  const [filter, setFilter] = useState('All orders');
  const [query, setQuery] = useState('');
  const { addToCart, openPanel } = useStoreUI();
  const order = orderId ? demoOrders.find(item => item.id === orderId) : null;

  const filtered = useMemo(() => demoOrders.filter(item =>
    (filter === 'All orders' || item.status === filter)
    && (!query.trim() || `${item.id} ${item.items.map(product => product.name).join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()))
  ), [filter, query]);

  const buyAgain = item => {
    item.items.forEach(product => addToCart(product, product.quantity));
    openPanel('cart');
  };

  if (orderId) {
    if (!order) return <section className="jnr-account-panel jnr-account-empty"><Package size={35}/><h2>Order not found</h2><p>This sample order does not exist.</p><Link to="/account/orders" className="jnr-account-primary">Back to orders</Link></section>;
    const steps = ['Processing', 'On the way', 'Delivered'];
    const activeStep = order.status === 'Cancelled' ? -1 : steps.indexOf(order.status);
    return (
      <div className="jnr-account-stack">
        <Link to="/account/orders" className="jnr-account-back"><ArrowLeft size={16}/> All orders</Link>
        <section className="jnr-account-panel">
          <div className="jnr-account-detail-title">
            <div><span className="jnr-account-kicker">SAMPLE ORDER</span><h2>{order.id}</h2><p>Placed {dateLabel(order.date)} · {order.payment}</p></div>
            <span className={`jnr-account-status status-${statusClass(order.status)}`}>{order.status}</span>
          </div>
          <div className="jnr-account-steps">
            {steps.map((step, index) => <div className={`jnr-account-step${activeStep >= index ? ' is-complete' : ''}`} key={step}>
              <span>{activeStep >= index ? <Check size={15}/> : index + 1}</span><small>{step}</small>
            </div>)}
          </div>
          <p className="jnr-account-tracking"><Truck size={17}/> {order.tracking} · Illustration only, not live tracking.</p>
        </section>
        <section className="jnr-account-panel">
          <div className="jnr-account-panel-heading"><div><h2>Items in this order</h2><p>Sample order details</p></div></div>
          {order.items.map(product => (
            <div className="jnr-account-detail-item" key={product.id}>
              <Link to={`/product/${product.slug}`} className="jnr-account-order-thumb">
                <img src={product.image} alt="" loading="lazy"/>
              </Link>
              <div><Link to={`/product/${product.slug}`}><strong>{product.name}</strong></Link><small>Quantity: {product.quantity}</small></div>
              <strong>{money(product.price * product.quantity)}</strong>
            </div>
          ))}
          <div className="jnr-account-invoice">
            <div><span>Items subtotal</span><strong>{money(orderAmount(order) - order.deliveryFee)}</strong></div>
            <div><span>Sample delivery fee</span><strong>{money(order.deliveryFee)}</strong></div>
            <div className="jnr-account-invoice-total"><span>Order total</span><strong>{money(orderAmount(order))}</strong></div>
          </div>
          <button type="button" className="jnr-account-primary" onClick={() => buyAgain(order)}>Add items to cart <ArrowRight size={17}/></button>
        </section>
      </div>
    );
  }

  return <section className="jnr-account-panel">
    <div className="jnr-account-panel-heading"><div><h2>Order history</h2><p>Demo orders shown for design preview only.</p></div></div>
    <div className="jnr-account-order-toolbar">
      <div className="jnr-account-order-tabs" role="group" aria-label="Filter orders">
        {tabs.map(tab => <button key={tab} type="button" className={tab === filter ? 'is-current' : ''} onClick={() => setFilter(tab)}>{tab}</button>)}
      </div>
      <label className="jnr-account-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search orders..." aria-label="Search sample orders"/></label>
    </div>
    {filtered.length ? filtered.map(item => (
      <article className="jnr-account-order-card" key={item.id}>
        <div className="jnr-account-order-top">
          <div><strong>{item.id}</strong><span>Placed {dateLabel(item.date)}</span></div>
          <span className={`jnr-account-status status-${statusClass(item.status)}`}>{item.status}</span>
        </div>
        <div className="jnr-account-order-products">
          {item.items.slice(0, 3).map(product => <img key={product.id} src={product.image} alt="" loading="lazy" />)}
          <div><strong>{item.items[0].name}</strong><small>{item.items.length} product type(s) · {item.items.reduce((sum, product) => sum + product.quantity, 0)} total items</small></div>
          <strong className="jnr-account-order-price">{money(orderAmount(item))}</strong>
        </div>
        <div className="jnr-account-order-actions">
          <button type="button" className="jnr-account-secondary" onClick={() => buyAgain(item)}>Buy again</button>
          <Link to={`/account/orders/${item.id}`} className="jnr-account-text-button">View details <ArrowRight size={15}/></Link>
        </div>
      </article>
    )) : <div className="jnr-account-empty"><Package size={30}/><h3>No sample orders found</h3><p>Try a different status or search term.</p></div>}
  </section>;
}
