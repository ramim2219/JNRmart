import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, MapPin, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useStoreUI } from '../context/StoreUIContext';
import { useToast } from '../components/common/ToastProvider';
import '../styles/cart-checkout.css';

const initialDetails = { name: '', email: '', phone: '', address: '', city: '', note: '' };

export default function CheckoutPage() {
  const { cart, selectedCartItems, selectedCount, selectedTotal, formatMoney, openPanel } = useStoreUI();
  const [details, setDetails] = useState(initialDetails);
  const toast = useToast();

  useEffect(() => {
    document.title = 'Checkout | JNRmart';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => { document.title = 'JNRmart'; };
  }, []);

  const update = (event) => {
    setDetails(previous => ({ ...previous, [event.target.name]: event.target.value }));
  };

  // This is a UI-only checkout preview. Never claim an actual order was placed.
  const submit = (event) => {
    event.preventDefault();
    if (selectedCartItems.length === 0) return;
    toast.info('Order placement is not available until the Laravel API is connected.', {
      id: 'checkout-demo', title: 'Checkout Preview', duration: 5500,
    });
  };

  return (
    <div className="jnr-checkout-page">
      <div className="container">
        <nav className="jnr-checkout-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><ChevronRight size={15} aria-hidden="true" />
          <span aria-current="page">Checkout</span>
        </nav>
        <div className="jnr-checkout-heading">
          <div>
            <p className="jnr-checkout-eyebrow">SECURE SHOPPING</p>
            <h1>Checkout</h1>
            <p>Review your selected items and enter delivery information.</p>
          </div>
          <span className="jnr-checkout-preview-pill">Frontend preview</span>
        </div>

        {selectedCartItems.length === 0 ? (
          <div className="jnr-checkout-empty">
            <ShoppingBag size={46} strokeWidth={1.4} aria-hidden="true" />
            <h2>No products selected</h2>
            <p>{cart.length ? 'Select at least one item from your cart to continue.' : 'Your cart is empty. Add products to get started.'}</p>
            <div className="jnr-checkout-empty-actions">
              {cart.length > 0 && <button type="button" onClick={() => openPanel('cart')}>Select Cart Items</button>}
              <Link to="/shop">Continue Shopping <ArrowRight size={16}/></Link>
            </div>
          </div>
        ) : (
          <form id="jnr-checkout-form" className="jnr-checkout-layout" onSubmit={submit}>
            <div className="jnr-checkout-left">
              <section className="jnr-checkout-card" aria-labelledby="jnr-delivery-title">
                <div className="jnr-checkout-card-heading">
                  <span className="jnr-checkout-heading-icon"><MapPin size={19} /></span>
                  <div><h2 id="jnr-delivery-title">Delivery Information</h2><p>Where should we send your order?</p></div>
                </div>
                <div className="jnr-checkout-fields">
                  <label>Full Name <span>*</span>
                    <input name="name" type="text" value={details.name} onChange={update} required autoComplete="name" placeholder="Your full name" />
                  </label>
                  <label>Phone Number <span>*</span>
                    <input name="phone" type="tel" value={details.phone} onChange={update} required autoComplete="tel" placeholder="01XXXXXXXXX" />
                  </label>
                  <label>Email Address <span>*</span>
                    <input name="email" type="email" value={details.email} onChange={update} required autoComplete="email" placeholder="you@example.com" />
                  </label>
                  <label>City / District <span>*</span>
                    <input name="city" type="text" value={details.city} onChange={update} required autoComplete="address-level2" placeholder="City or district" />
                  </label>
                  <label className="jnr-checkout-full">Delivery Address <span>*</span>
                    <textarea name="address" value={details.address} onChange={update} required rows={3} autoComplete="street-address" placeholder="House, road, area, and landmarks" />
                  </label>
                  <label className="jnr-checkout-full">Order Note (optional)
                    <textarea name="note" value={details.note} onChange={update} rows={2} placeholder="Special delivery instructions" />
                  </label>
                </div>
              </section>

              <section className="jnr-checkout-card" aria-labelledby="jnr-payment-title">
                <div className="jnr-checkout-card-heading">
                  <span className="jnr-checkout-heading-icon"><ShieldCheck size={19} /></span>
                  <div><h2 id="jnr-payment-title">Payment Method</h2><p>Payment selection is for preview only.</p></div>
                </div>
                <label className="jnr-checkout-payment-option">
                  <input type="radio" name="payment-method" value="cod" defaultChecked />
                  <span className="jnr-checkout-payment-text"><strong>Cash on Delivery</strong><small>Pay when your items are delivered. Available after backend integration.</small></span>
                  <CheckCircle2 size={19} aria-hidden="true" />
                </label>
              </section>
              <Link to="/shop" className="jnr-checkout-back"><ArrowLeft size={16} /> Continue Shopping</Link>
            </div>

            <aside className="jnr-checkout-right" aria-label="Order summary">
              <div className="jnr-checkout-card jnr-checkout-summary">
                <div className="jnr-checkout-summary-header">
                  <h2>Order Summary</h2>
                  <button type="button" onClick={() => openPanel('cart')}>Edit Selection</button>
                </div>
                <p className="jnr-checkout-items-count">{selectedCount} {selectedCount === 1 ? 'item' : 'items'} from {selectedCartItems.length} selected {selectedCartItems.length === 1 ? 'product' : 'products'}</p>
                <div className="jnr-checkout-products">
                  {selectedCartItems.map(item => (
                    <div className="jnr-checkout-product" key={item.id}>
                      <span className="jnr-checkout-product-image">
                        {item.image ? <img src={item.image} alt=""/> : <ShoppingBag size={20} aria-hidden="true"/>}
                        <small>{item.quantity}</small>
                      </span>
                      <div className="jnr-checkout-product-info">
                        {item.slug ? <Link to={`/product/${item.slug}`}>{item.name}</Link> : <strong>{item.name}</strong>}
                        <span>{formatMoney(item.price)} × {item.quantity}</span>
                      </div>
                      <strong className="jnr-checkout-product-total">{formatMoney(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
                <div className="jnr-checkout-totals">
                  <div><span>Items subtotal</span><strong>{formatMoney(selectedTotal)}</strong></div>
                  <div><span>Delivery fee</span><small>Calculated after API integration</small></div>
                  <div className="jnr-checkout-grand"><strong>Selected items total</strong><strong>{formatMoney(selectedTotal)}</strong></div>
                </div>
                <button type="submit" className="jnr-checkout-submit">Place Order (Demo) <ArrowRight size={17}/></button>
                <p className="jnr-checkout-disclaimer">No payment or order will be processed yet. Final prices, delivery fees and availability must be verified by your backend.</p>
              </div>
              <p className="jnr-checkout-help"><Truck size={17}/> Unselected products will remain in your cart.</p>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
