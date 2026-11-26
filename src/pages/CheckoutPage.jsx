import { Link } from "react-router-dom";
import { useStoreUI } from "../context/StoreUIContext";

/**
 * Safe storefront checkout placeholder. The uploaded app routes here but did
 * not contain a CheckoutPage implementation. This does not place orders or
 * accept payments. Before real checkout, integrate a backend quote/revalidate
 * endpoint for product variant, currency and offer expiration.
 */
export default function CheckoutPage() {
  const {
    selectedCartItems,
    selectedTotal,
    hasMixedCurrencies,
    selectedCurrencySymbol,
    formatMoney,
  } = useStoreUI();

  return (
    <main className="container" style={{ paddingBlock: "36px 64px", minHeight: "60vh" }}>
      <h1>Checkout summary</h1>
      {selectedCartItems.length === 0 ? (
        <p>No items selected. <Link to="/shop">Continue shopping</Link></p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0, marginBlock: 20 }}>
            {selectedCartItems.map((item) => (
              <li key={item.cart_key ?? item.id} style={{ paddingBlock: 10, borderBottom: "1px solid #ddd" }}>
                {item.name} {item.variant_id ? `(Variant ${item.variant_id})` : ""}
                {" × "}{item.quantity} — {formatMoney(item.price * item.quantity, item.currency_symbol || "৳")}
              </li>
            ))}
          </ul>
          <p>
            <strong>
              {hasMixedCurrencies
                ? "Items use different currencies. Select a single currency."
                : `Displayed subtotal: ${formatMoney(selectedTotal, selectedCurrencySymbol)}`}
            </strong>
          </p>
        </>
      )}
      <p role="status" style={{ marginBlock: 18 }}>
        Order placement is not yet connected. Prices shown here are previews;
        your backend must recalculate current offers and totals before accepting an order.
      </p>
      <Link to="/shop">Back to shop</Link>
    </main>
  );
}
