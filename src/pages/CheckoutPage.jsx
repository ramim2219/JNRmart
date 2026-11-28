import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Package, RefreshCw, ShieldCheck } from "lucide-react";
import { useStoreUI } from "../context/StoreUIContext";
import { quoteComboCheckout, placeComboPickupOrder } from "../services/publicComboServices";
import "../styles/combo-checkout.css";

function createRequestUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // crypto.getRandomValues works on LAN HTTP in browsers that lack randomUUID.
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(x => x.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }
  throw new Error("Secure browser random numbers are unavailable. Use HTTPS or localhost for checkout.");
}

/**
 * Combo-only guest PICKUP checkout. Uses backend's original OrderCheckoutService.
 * Non-combo products keep their current summary-only behavior; never fake order success.
 */
export default function CheckoutPage() {
  const { selectedCartItems, selectedTotal, selectedCurrencySymbol, hasMixedCurrencies,
    canCheckoutCombosOnly, clearSelectedCartItems, formatMoney } = useStoreUI();
  const items = useMemo(() => selectedCartItems.filter(item => item.item_type === "combo")
    .map(item => ({ combo_id: Number(item.id), quantity: Number(item.quantity) })), [selectedCartItems]);
  const signature = JSON.stringify(items);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ customer_name: "", customer_contact: "", customer_email: "", website: "" });
  const requestKey = useRef(null);

  useEffect(() => {
    if (!canCheckoutCombosOnly || items.length === 0 || result) {
      setQuote(null);
      return undefined;
    }
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    setQuote(null);
    quoteComboCheckout(JSON.parse(signature), { signal: controller.signal })
      .then(data => { if (active) setQuote(data); })
      .catch(err => {
        if (active && !controller.signal.aborted) {
          setError(err?.response?.data?.message || err?.message || "Unable to check combo stock and prices.");
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [canCheckoutCombosOnly, signature, result]);

  const placeOrder = async event => {
    event.preventDefault();
    if (submitting || !quote) return;
    setError("");
    setSubmitting(true);
    try {
      if (!requestKey.current) requestKey.current = createRequestUuid();
      const response = await placeComboPickupOrder({
        items: JSON.parse(signature),
        customer_name: form.customer_name.trim(),
        customer_contact: form.customer_contact.trim(),
        customer_email: form.customer_email.trim() || null,
        website: form.website,
        request_key: requestKey.current,
      });
      setResult(response);
      clearSelectedCartItems();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Could not place the pickup order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) return (
    <main className="container jnr-combo-checkout">
      <div className="jnr-combo-checkout__success" role="status">
        <CheckCircle2 size={44} aria-hidden="true" />
        <h1>Pickup order request received</h1>
        <p><strong>Order number:</strong> {result.order_number}</p>
        <p><strong>Total:</strong> {formatMoney(result.total, quote?.currency?.symbol || selectedCurrencySymbol)}</p>
        <p><strong>Status:</strong> Pending · Unpaid</p>
        <p>The seller must confirm the order and pickup arrangements. No online payment has been charged.</p>
        <Link to="/shop?category=combo" className="jnr-combo-checkout__link">Continue shopping</Link>
      </div>
    </main>
  );

  return (
    <main className="container jnr-combo-checkout">
      <h1>Checkout</h1>
      {selectedCartItems.length === 0 ? (
        <p>No items selected. <Link to="/shop">Continue shopping</Link></p>
      ) : <>
        <section className="jnr-combo-checkout__card" aria-label="Cart summary">
          <h2>Order summary</h2>
          <ul className="jnr-combo-checkout__items">
            {selectedCartItems.map(item => (
              <li key={item.cart_key ?? item.id}>
                <div>
                  <strong>{item.name}</strong>
                  {item.item_type === "combo" ? <small>Combo bundle</small> : <small>Product variant</small>}
                </div>
                <span>{item.quantity} × {formatMoney(item.price, item.currency_symbol || "৳")}</span>
              </li>
            ))}
          </ul>
          <p>Cart estimate: <strong>{hasMixedCurrencies ? "Mixed currencies" : formatMoney(selectedTotal, selectedCurrencySymbol)}</strong></p>
        </section>

        {!canCheckoutCombosOnly ? (
          <div className="jnr-combo-checkout__notice" role="status">
            This checkout currently accepts selected combos from one seller and currency only.
            Product-only and mixed Product/Combo order submission are not connected yet.
            Deselect other items in your cart to place a combo pickup request.
          </div>
        ) : <>
          <section className="jnr-combo-checkout__card" aria-label="Verified combo quote">
            <h2>Server-verified combo price</h2>
            {loading && <p><RefreshCw size={15} aria-hidden="true" /> Checking latest price and pickup stock...</p>}
            {quote && <>
              <ul className="jnr-combo-checkout__items">
                {quote.items.map(item => <li key={item.combo_id}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>{formatMoney(item.line_total, quote.currency?.symbol || selectedCurrencySymbol)}</strong>
                </li>)}
              </ul>
              <p className="jnr-combo-checkout__total">Pickup order total: <strong>{formatMoney(quote.total, quote.currency?.symbol || selectedCurrencySymbol)}</strong></p>
              <p className="jnr-combo-checkout__hint"><ShieldCheck size={15} /> Stock and current prices are checked again before the order is recorded.</p>
            </>}
          </section>
          <form className="jnr-combo-checkout__card jnr-combo-checkout__form" onSubmit={placeOrder}>
            <h2>Pickup contact details</h2>
            <label>Full name<input required minLength={2} maxLength={180} value={form.customer_name} autoComplete="name"
              onChange={event => setForm(old => ({ ...old, customer_name: event.target.value }))} /></label>
            <label>Phone number<input required type="tel" maxLength={30} value={form.customer_contact} autoComplete="tel"
              onChange={event => setForm(old => ({ ...old, customer_contact: event.target.value }))} /></label>
            <label>Email (optional)<input type="email" maxLength={200} value={form.customer_email} autoComplete="email"
              onChange={event => setForm(old => ({ ...old, customer_email: event.target.value }))} /></label>
            <input className="jnr-checkout-honeypot" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
              value={form.website} onChange={event => setForm(old => ({ ...old, website: event.target.value }))} />
            <p><Package size={16} aria-hidden="true" /> Pickup request only. No payment is collected online.</p>
            <button type="submit" disabled={!quote || loading || submitting}>
              {submitting ? "Submitting..." : "Place Pending Pickup Order"}
            </button>
          </form>
        </>}
        {error && <div className="jnr-combo-checkout__error" role="alert">{error}</div>}
      </>}
    </main>
  );
}
