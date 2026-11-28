import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Gift, Package, RefreshCw, ShoppingCart } from "lucide-react";
import { getPublicComboById } from "../services/publicComboServices";
import { useStoreUI } from "../context/StoreUIContext";
import ComboReviews from "../components/combo/ComboReviews";
import { comboImageUrl, comboPriceValues, formatComboPrice } from "../utils/comboPresentation";
import "../styles/product-details.css";
import "../styles/combo-product-details.css";

/** Product Details-style page for a bundle. No regular product API/cart IDs are reused. */
export default function ComboDetailsPage() {
  const { comboId } = useParams();
  const navigate = useNavigate();
  const { addToCart, openPanel } = useStoreUI();
  const [quantity, setQuantity] = useState(1);
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    setCombo(null);
    window.scrollTo({ top: 0, behavior: "auto" });

    getPublicComboById(comboId, { signal: controller.signal })
      .then((data) => { if (active) setCombo(data); })
      .catch((err) => {
        if (!active || controller.signal.aborted) return;
        setError(err?.response?.data?.message || err?.message || "Unable to load combo details.");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; controller.abort(); };
  }, [comboId, retry]);

  useEffect(() => {
    if (!combo) return undefined;
    const previousTitle = document.title;
    document.title = `${combo.name || "Combo Deal"} | JNRmart`;
    return () => { document.title = previousTitle; };
  }, [combo]);

  if (loading || error || !combo) {
    return (
      <main className="jnr-pd-page">
        <div className="container jnr-pd-not-found" role={error ? "alert" : "status"}>
          {error ? (
            <>
              <Package size={40} aria-hidden="true" />
              <h1>Unable to load combo</h1>
              <p>{error}</p>
              <button type="button" onClick={() => setRetry((v) => v + 1)}>
                <RefreshCw size={15} aria-hidden="true" /> Retry
              </button>
              <Link to="/shop?category=combo"><ArrowLeft size={15} /> Back to combos</Link>
            </>
          ) : <p>Loading combo details...</p>}
        </div>
      </main>
    );
  }

  const image = comboImageUrl(combo.image_url);
  const pricing = comboPriceValues(combo);
  const items = Array.isArray(combo.items) ? combo.items : [];
  const addCombo = (showCart = false) => {
    if (!pricing.hasPrice) return;
    const added = addToCart({
      id: combo.id,
      item_type: "combo",
      company_id: combo.company_id,
      currency_id: combo.currency_id,
      currency_code: combo.currency?.code || "BDT",
      currency_symbol: combo.currency?.symbol || "৳",
      name: combo.name || "Combo deal",
      price: pricing.finalPrice,
      image,
      slug: `/product/combo/${combo.id}`,
    }, quantity);
    if (added && showCart) openPanel("cart");
  };

  return (
    <main className="jnr-pd-page jnr-combo-pd-page">
      <div className="container">
        <nav className="jnr-pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true" />
          <Link to="/shop">Shop</Link><ChevronRight size={14} aria-hidden="true" />
          <Link to="/shop?category=combo">Combo</Link><ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">{combo.name || "Combo Deal"}</span>
        </nav>

        <section className="jnr-pd-main" aria-label="Combo details">
          <div className="jnr-pd-gallery">
            <div className="jnr-pd-gallery__stage jnr-combo-pd-page__stage">
              {pricing.discount > 0 && <span className="jnr-pd-gallery__discount">{pricing.discount}% OFF</span>}
              {image ? (
                <img className="jnr-combo-pd-page__image" src={image} alt={combo.name || "Combo bundle"} />
              ) : (
                <div className="jnr-pd-gallery__empty"><Gift size={46} aria-hidden="true" /><span>No combo image available</span></div>
              )}
            </div>
          </div>

          <div className="jnr-pd-purchase">
            <span className="jnr-pd-purchase__eyebrow">Combo Deal</span>
            <h1>{combo.name || "Combo Deal"}</h1>
            <div className="jnr-pd-purchase__meta"><span><strong>{items.length}</strong> included products</span></div>
            <div className="jnr-pd-purchase__divider" />
            <div className="jnr-pd-purchase__price-row">
              <strong className="jnr-pd-purchase__price">
                {pricing.hasPrice ? formatComboPrice(pricing.finalPrice, combo.currency) : "Price unavailable"}
              </strong>
              {pricing.hasOriginal && <del>{formatComboPrice(pricing.actualPrice, combo.currency)}</del>}
              {pricing.hasOriginal && (
                <span className="jnr-pd-purchase__save">
                  Save {formatComboPrice(pricing.actualPrice - pricing.finalPrice, combo.currency)}
                </span>
              )}
            </div>
            <div className="jnr-pd-purchase__divider" />
            {combo.description && <p className="jnr-pd-purchase__intro jnr-combo-pd-page__description">{combo.description}</p>}
            <div className="jnr-pd-purchase__availability">
              <Package size={17} aria-hidden="true" />
              This combo contains {items.length} {items.length === 1 ? "product" : "products"}. See the included items below.
            </div>
            <div className="jnr-combo-quantity">
              <label htmlFor="combo-quantity">Quantity</label>
              <input id="combo-quantity" type="number" min="1" max="20" step="1"
                value={quantity} onChange={event => setQuantity(Math.max(1, Math.min(20, Math.floor(Number(event.target.value) || 1))))} />
            </div>
            <div className="jnr-combo-pd-page__actions">
              <button type="button" className="jnr-pd-purchase__add" disabled={!pricing.hasPrice} onClick={() => addCombo(true)}>
                <ShoppingCart size={17} aria-hidden="true" /> Add to Cart
              </button>
              <button type="button" className="jnr-pd-purchase__buy" disabled={!pricing.hasPrice}
                onClick={() => { if (pricing.hasPrice) { addCombo(false); navigate("/checkout"); } }}>Buy Combo</button>
            </div>
            <p className="jnr-combo-pd-page__notice">Pickup checkout creates a pending, unpaid order. Price and stock are checked again on the server.</p>
          </div>
        </section>

        <section className="jnr-pd-tabs" id="jnr-combo-included" aria-labelledby="jnr-combo-included-title">
          <div className="jnr-pd-tabs__panel">
            <h2 id="jnr-combo-included-title">Included Products</h2>
            <ul className="jnr-combo-pd-page__items">
              {items.map((item, index) => {
                const href = item.parent_product_id != null
                  ? `/product/${encodeURIComponent(String(item.parent_product_id))}`
                  : null;
                const content = <>
                  <span className="jnr-combo-pd-page__item-name">{item.name || "Product"}</span>
                  {item.sku && <small>Variant: {item.sku}</small>}
                </>;
                return (
                  <li key={`${item.product_id ?? "item"}-${index}`}>
                    <div>{href ? <Link to={href}>{content}</Link> : content}</div>
                    <strong>× {Number(item.quantity || 0).toLocaleString("en-BD", { maximumFractionDigits: 3 })}</strong>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
        <ComboReviews comboId={combo.id} summary={combo.reviews} />
      </div>
    </main>
  );
}
