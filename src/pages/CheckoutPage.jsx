import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';

import { useStoreUI } from '../context/StoreUIContext';
import { useToast } from '../components/common/ToastProvider';
import '../styles/cart-checkout.css';

const INITIAL_DETAILS = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  note: '',
};

const DELIVERY_FIELDS = [
  {
    name: 'name',
    label: 'Full name',
    type: 'text',
    placeholder: 'Enter your full name',
    autoComplete: 'name',
    required: true,
  },
  {
    name: 'phone',
    label: 'Phone number',
    type: 'tel',
    placeholder: '01XXXXXXXXX',
    autoComplete: 'tel',
    required: true,
  },
  {
    name: 'email',
    label: 'Email address',
    type: 'email',
    placeholder: 'you@example.com',
    autoComplete: 'email',
    required: true,
  },
  {
    name: 'city',
    label: 'City / District',
    type: 'text',
    placeholder: 'Enter your city or district',
    autoComplete: 'address-level2',
    required: true,
  },
  {
    name: 'address',
    label: 'Delivery address',
    placeholder: 'House, road, area and nearby landmark',
    autoComplete: 'street-address',
    required: true,
    multiline: true,
    rows: 3,
    fullWidth: true,
  },
  {
    name: 'note',
    label: 'Order note',
    placeholder: 'Add any special delivery instructions (optional)',
    multiline: true,
    rows: 2,
    fullWidth: true,
  },
];

function CheckoutField({ field, value, onChange }) {
  const id = `jnr-checkout-${field.name}`;
  const className = field.fullWidth ? 'jnr-checkout-field jnr-checkout-full' : 'jnr-checkout-field';

  return (
    <div className={className}>
      <label htmlFor={id}>
        {field.label}
        {field.required && <span className="jnr-checkout-required" aria-hidden="true">*</span>}
      </label>

      {field.multiline ? (
        <textarea
          id={id}
          name={field.name}
          value={value}
          onChange={onChange}
          required={field.required}
          rows={field.rows}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          id={id}
          name={field.name}
          type={field.type}
          value={value}
          onChange={onChange}
          required={field.required}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
}

function CheckoutBreadcrumb() {
  return (
    <nav className="jnr-checkout-breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <ChevronRight size={15} aria-hidden="true" />
      <span aria-current="page">Checkout</span>
    </nav>
  );
}

function CheckoutEmptyState({ hasCartItems, onOpenCart }) {
  return (
    <section className="jnr-checkout-empty" aria-labelledby="jnr-checkout-empty-title">
      <span className="jnr-checkout-empty__icon">
        <ShoppingBag size={34} strokeWidth={1.5} aria-hidden="true" />
      </span>

      <h2 id="jnr-checkout-empty-title">No products selected</h2>
      <p>
        {hasCartItems
          ? 'Select the products you want to purchase from your cart to continue.'
          : 'Your cart is currently empty. Explore our collection and add products to get started.'}
      </p>

      <div className="jnr-checkout-empty-actions">
        {hasCartItems && (
          <button type="button" onClick={onOpenCart}>
            Select cart items
          </button>
        )}
        <Link to="/shop">
          Continue shopping <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function DeliveryInformation({ details, onChange }) {
  return (
    <section className="jnr-checkout-card" aria-labelledby="jnr-delivery-title">
      <div className="jnr-checkout-card-heading">
        <span className="jnr-checkout-heading-icon">
          <MapPin size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 id="jnr-delivery-title">Delivery information</h2>
          <p>Enter the address where you want your order delivered.</p>
        </div>
      </div>

      <div className="jnr-checkout-fields">
        {DELIVERY_FIELDS.map((field) => (
          <CheckoutField
            key={field.name}
            field={field}
            value={details[field.name]}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function PaymentMethod() {
  return (
    <section className="jnr-checkout-card" aria-labelledby="jnr-payment-title">
      <div className="jnr-checkout-card-heading">
        <span className="jnr-checkout-heading-icon">
          <ShieldCheck size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 id="jnr-payment-title">Payment method</h2>
          <p>Choose how you would like to pay for your order.</p>
        </div>
      </div>

      <fieldset className="jnr-checkout-payment">
        <legend className="jnr-checkout-visually-hidden">Available payment methods</legend>
        <label className="jnr-checkout-payment-option">
          <input type="radio" name="payment-method" value="cod" defaultChecked />
          <span className="jnr-checkout-payment-text">
            <strong>Cash on Delivery</strong>
            <small>Pay when your order is delivered.</small>
          </span>
          <CheckCircle2 size={20} aria-hidden="true" />
        </label>
        <p className="jnr-checkout-payment-note">
          Payment processing will be enabled after the backend integration is complete.
        </p>
      </fieldset>
    </section>
  );
}

function OrderSummary({
  items,
  selectedCount,
  selectedTotal,
  formatMoney,
  onEditSelection,
}) {
  return (
    <aside className="jnr-checkout-right" aria-label="Order summary">
      <div className="jnr-checkout-card jnr-checkout-summary">
        <div className="jnr-checkout-summary-header">
          <div>
            <span className="jnr-checkout-summary-eyebrow">YOUR ORDER</span>
            <h2>Order summary</h2>
          </div>
          <button type="button" onClick={onEditSelection}>
            Edit selection
          </button>
        </div>

        <p className="jnr-checkout-items-count" aria-live="polite">
          {selectedCount} {selectedCount === 1 ? 'unit' : 'units'} across{' '}
          {items.length} {items.length === 1 ? 'product' : 'products'}
        </p>

        <div className="jnr-checkout-products">
          {items.map((item, index) => {
            const itemKey = item.id ?? item.slug ?? `${item.name}-${index}`;
            const quantity = Number(item.quantity) || 1;
            const lineTotal = (Number(item.price) || 0) * quantity;

            return (
              <div className="jnr-checkout-product" key={itemKey}>
                <span className="jnr-checkout-product-image">
                  {item.image ? (
                    <img src={item.image} alt="" loading="lazy" />
                  ) : (
                    <ShoppingBag size={20} aria-hidden="true" />
                  )}
                  <small>{quantity}</small>
                </span>

                <div className="jnr-checkout-product-info">
                  {item.slug ? (
                    <Link to={`/product/${encodeURIComponent(item.slug)}`}>
                      {item.name}
                    </Link>
                  ) : (
                    <strong>{item.name}</strong>
                  )}
                  <span>
                    {formatMoney(item.price)} × {quantity}
                  </span>
                </div>

                <strong className="jnr-checkout-product-total">
                  {formatMoney(lineTotal)}
                </strong>
              </div>
            );
          })}
        </div>

        <div className="jnr-checkout-totals">
          <div>
            <span>Items subtotal</span>
            <strong>{formatMoney(selectedTotal)}</strong>
          </div>
          <div>
            <span>Delivery fee</span>
            <small>Calculated at checkout</small>
          </div>
          <div className="jnr-checkout-grand">
            <strong>Selected items total</strong>
            <strong>{formatMoney(selectedTotal)}</strong>
          </div>
        </div>

        <button type="submit" form="jnr-checkout-form" className="jnr-checkout-submit">
          Place order (Demo) <ArrowRight size={17} aria-hidden="true" />
        </button>

        <p className="jnr-checkout-disclaimer">
          Demo checkout only. No order or payment will be processed until the
          backend is connected. Final prices, delivery fees and availability
          must be confirmed by the server.
        </p>
      </div>

      <p className="jnr-checkout-help">
        <Truck size={17} aria-hidden="true" />
        Unselected products will remain in your cart.
      </p>
    </aside>
  );
}

export default function CheckoutPage() {
  const {
    cart,
    selectedCartItems,
    selectedCount,
    selectedTotal,
    formatMoney,
    openPanel,
  } = useStoreUI();

  const [details, setDetails] = useState(INITIAL_DETAILS);
  const toast = useToast();

  useEffect(() => {
    document.title = 'Checkout | JNRmart';
    window.scrollTo({ top: 0, behavior: 'auto' });

    return () => {
      document.title = 'JNRmart';
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDetails((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (selectedCartItems.length === 0) return;

    toast.info(
      'Order placement is not available until the Laravel API is connected.',
      {
        id: 'checkout-demo',
        title: 'Checkout preview',
        duration: 5500,
      },
    );
  };

  const hasSelectedItems = selectedCartItems.length > 0;

  return (
    <main className="jnr-checkout-page">
      <div className="container">
        <CheckoutBreadcrumb />

        <header className="jnr-checkout-heading">
          <div>
            <p className="jnr-checkout-eyebrow">SECURE SHOPPING</p>
            <h1>Checkout</h1>
            <p>Confirm your selected products and provide your delivery details.</p>
          </div>
          <span className="jnr-checkout-preview-pill">Preview mode</span>
        </header>

        {!hasSelectedItems ? (
          <CheckoutEmptyState
            hasCartItems={cart.length > 0}
            onOpenCart={() => openPanel('cart')}
          />
        ) : (
          <form
            id="jnr-checkout-form"
            className="jnr-checkout-layout"
            onSubmit={handleSubmit}
          >
            <div className="jnr-checkout-left">
              <DeliveryInformation details={details} onChange={handleChange} />
              <PaymentMethod />

              <Link to="/shop" className="jnr-checkout-back">
                <ArrowLeft size={16} aria-hidden="true" />
                Continue shopping
              </Link>
            </div>

            <OrderSummary
              items={selectedCartItems}
              selectedCount={selectedCount}
              selectedTotal={selectedTotal}
              formatMoney={formatMoney}
              onEditSelection={() => openPanel('cart')}
            />
          </form>
        )}
      </div>
    </main>
  );
}
