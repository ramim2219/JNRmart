import { Link } from "react-router-dom";
import { ShoppingCart, Gift, Package, Star } from "lucide-react";
import { comboImageUrl, comboPriceValues, formatComboPrice } from "../../utils/comboPresentation";
import { useStoreUI } from "../../context/StoreUIContext";
import "../../styles/product-card.css";
import "../../styles/combo-product-card.css";

/** The same card design as a normal product, with a combo-aware details link.
 * Never pass a combo ID to a regular product route or add a single variant to cart.
 */
export default function ShopComboCard({ combo }) {
  const { addToCart } = useStoreUI();
  if (!combo || combo.id == null) return null;
  const name = combo.name || "Combo deal";
  const image = comboImageUrl(combo.image_url);
  const href = `/product/combo/${encodeURIComponent(String(combo.id))}`;
  const pricing = comboPriceValues(combo);
  const items = Array.isArray(combo.items) ? combo.items : [];
  const itemCount = items.length;

  const addCombo = () => {
    if (!pricing.hasPrice) return;
    addToCart({
      id: combo.id,
      item_type: "combo",
      company_id: combo.company_id,
      currency_id: combo.currency_id,
      currency_code: combo.currency?.code || "BDT",
      currency_symbol: combo.currency?.symbol || "৳",
      name,
      price: pricing.finalPrice,
      image,
      slug: href,
    });
  };

  return (
    <article className="jnr-product-card jnr-combo-product-card">
      <Link to={href} aria-label={`View ${name} combo details`} className="jnr-combo-card-link">
      <div className="jnr-product-image-wrap">
        {image ? (
          <img className="jnr-product-image" src={image} alt={name} loading="lazy" decoding="async" />
        ) : (
          <div className="jnr-product-image-placeholder" aria-hidden="true"><Gift size={39} /></div>
        )}
        {pricing.discount > 0 && (
          <span className="jnr-product-discount">-{pricing.discount}%</span>
        )}
        <span className="jnr-product-tag is-new">Combo Deal</span>
      </div>

      <div className="jnr-product-info">
        <span className="jnr-product-name" title={name}>{name}</span>
        <p className="jnr-product-brand">Bundle offer</p>
        <div className="jnr-product-rating jnr-combo-product-card__contents">
          <Package size={13} aria-hidden="true" />
          <span className="jnr-product-reviews">
            {itemCount} {itemCount === 1 ? "product" : "products"} included
          </span>
        </div>
        <div className="jnr-product-price-row">
          <strong className="jnr-product-price">
            {pricing.hasPrice ? formatComboPrice(pricing.finalPrice, combo.currency) : "Price unavailable"}
          </strong>
          {pricing.hasOriginal && (
            <del className="jnr-product-old-price">{formatComboPrice(pricing.actualPrice, combo.currency)}</del>
          )}
        </div>
        <span className="jnr-combo-card-rating">
          <Star size={13} aria-hidden="true" />
          {Number(combo.reviews?.average_rating || 0).toFixed(1)}
          <small>({Number(combo.reviews?.count || 0)})</small>
        </span>
      </div>
      </Link>
      <button className="jnr-product-add-cart jnr-combo-card-add" type="button"
        onClick={addCombo} disabled={!pricing.hasPrice}>
        <ShoppingCart size={15} aria-hidden="true" /> Add to Cart
      </button>
    </article>
  );
}
