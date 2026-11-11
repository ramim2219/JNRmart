import { useEffect, useState } from "react";
import {
  Heart,
  Minus,
  PackageCheck,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";

import { useStoreUI } from "../../context/StoreUIContext";
import { useToast } from "../common/ToastProvider";

import {
  getDefaultVariant,
  getProductImages,
  getVariantLabel,
  getVariantPricing,
  getDescription,
  priceBDT,
} from "../../utils/productHelpers";

import "../../styles/product-details-api.css";

const MAX_QUANTITY = 99;

export default function ProductPurchasePanel({
  product,
  onShowReviews,
}) {
  const {
    addToCart,
    openPanel,
    toggleWishlist,
    isWishlisted,
  } = useStoreUI();

  const toast = useToast();

  const variants = Array.isArray(product?.variants)
    ? product.variants
    : [];

  const defaultVariant = getDefaultVariant(variants);

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.defaultVariantId ?? defaultVariant?.id ?? ""
  );

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSelectedVariantId(
      product.defaultVariantId ?? defaultVariant?.id ?? ""
    );
    setQuantity(1);
  }, [product.id]);

  const selectedVariant =
    variants.find(
      (variant) =>
        String(variant.id) === String(selectedVariantId)
    ) ||
    defaultVariant ||
    null;

  const pricing = selectedVariant
    ? getVariantPricing(selectedVariant)
    : {
        price: Number(product.price) || 0,
        oldPrice: Number(product.oldPrice) || 0,
      };

  const price = pricing.price;
  const oldPrice = pricing.oldPrice;
  const priceAvailable = price > 0;
  const savings = oldPrice > price ? oldPrice - price : 0;

  const wishlisted = Boolean(isWishlisted(product.id));

  const selectedAttributes = Array.isArray(
    selectedVariant?.attributes
  )
    ? selectedVariant.attributes
    : [];

  const handleAddToCart = (openCart = false) => {
    if (!priceAvailable) {
      toast.warning("Price is currently unavailable.");
      return;
    }

    const images = getProductImages(product);

    const cartProduct = {
      ...product,
      id: product.id,
      name: product.name,
      price,
      oldPrice,
      image: images[0]?.src ?? "",
      variant_id: selectedVariant?.id ?? null,
      sku: selectedVariant?.sku ?? null,
      selectedVariant,
      attributes: selectedVariant?.attributes ?? [],
    };

    addToCart(cartProduct, quantity);

    if (openCart) {
      openPanel("cart");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          url,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);

        toast.success("Product link copied to clipboard.", {
          id: "product-share",
          title: "Link copied",
        });
        return;
      }

      toast.warning("Sharing is unavailable in this browser.");
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error("Could not share this product.");
      }
    }
  };

  return (
    <section
      className="jnr-pd-purchase"
      aria-label="Purchase product"
    >
      <p className="jnr-pd-purchase__eyebrow">
        {product.categoryLabel || "JNRmart Collection"}
      </p>

      <h1>{product.name}</h1>

      <div className="jnr-pd-purchase__meta">
        {product.brand && (
          <span>
            Brand: <strong>{product.brand}</strong>
          </span>
        )}
      </div>

      <div className="jnr-pd-purchase__divider" />

      {variants.length > 0 && (
        <div className="jnr-pd-api-variant">
          <label htmlFor={`variant-${product.id}`}>
            Select variant
          </label>

          {variants.length > 1 ? (
            <select
              id={`variant-${product.id}`}
              className="jnr-pd-api-variant__select"
              value={selectedVariantId ?? ""}
              onChange={(event) =>
                setSelectedVariantId(event.target.value)
              }
            >
              {variants.map((variant, index) => {
                const variantPricing = getVariantPricing(variant);

                return (
                  <option
                    key={variant.id}
                    value={variant.id}
                  >
                    {getVariantLabel(variant, index)}
                    {" — "}
                    {variantPricing.price > 0
                      ? priceBDT(variantPricing.price)
                      : "Price unavailable"}
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="jnr-pd-api-variant__single">
              {getVariantLabel(selectedVariant, 0)}
            </div>
          )}

          {selectedAttributes.length > 0 && (
            <div className="jnr-pd-api-variant__attributes">
              {selectedAttributes.map((item, index) => {
                const attribute =
                  item.attribute_value?.attribute;

                const value =
                  item.attribute_value?.display_name ||
                  item.attribute_value?.value;

                if (!value) return null;

                return (
                  <span key={item.id ?? index}>
                    {attribute?.display_name ||
                      attribute?.name ||
                      "Option"}
                    : <strong>{value}</strong>
                  </span>
                );
              })}
            </div>
          )}

          {selectedVariant?.sku && (
            <p className="jnr-pd-api-variant__sku">
              SKU: {selectedVariant.sku}
            </p>
          )}
        </div>
      )}

      <div className="jnr-pd-purchase__price-row">
        <strong className="jnr-pd-purchase__price">
          {priceAvailable ? priceBDT(price) : "Price unavailable"}
        </strong>

        {oldPrice > price && (
          <>
            <del>{priceBDT(oldPrice)}</del>
            <span className="jnr-pd-purchase__save">
              Save {priceBDT(savings)}
            </span>
          </>
        )}
      </div>

      <p className="jnr-pd-purchase__intro">
        {getDescription(product)}
      </p>

      <div className="jnr-pd-purchase__availability">
        <PackageCheck size={18} aria-hidden="true" />
        <span>
          Product information and pricing are provided by JNRmart.
        </span>
      </div>

      <div className="jnr-pd-purchase__buy-area">
        <span className="jnr-pd-purchase__quantity-label">
          Quantity
        </span>

        <div className="jnr-pd-purchase__buy-row">
          <div
            className="jnr-pd-quantity"
            role="group"
            aria-label="Select quantity"
          >
            <button
              type="button"
              onClick={() =>
                setQuantity((value) => Math.max(1, value - 1))
              }
              disabled={quantity === 1}
              aria-label="Decrease quantity"
            >
              <Minus size={17} />
            </button>

            <output aria-live="polite">{quantity}</output>

            <button
              type="button"
              onClick={() =>
                setQuantity((value) =>
                  Math.min(MAX_QUANTITY, value + 1)
                )
              }
              disabled={quantity === MAX_QUANTITY}
              aria-label="Increase quantity"
            >
              <Plus size={17} />
            </button>
          </div>

          <button
            type="button"
            className="jnr-pd-purchase__add"
            onClick={() => handleAddToCart(false)}
            disabled={!priceAvailable}
          >
            <ShoppingCart size={19} />
            Add to Cart
          </button>

          <button
            type="button"
            className="jnr-pd-purchase__buy"
            onClick={() => handleAddToCart(true)}
            disabled={!priceAvailable}
          >
            View Cart
          </button>
        </div>
      </div>

      <div className="jnr-pd-purchase__actions">
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-pressed={wishlisted}
          className={wishlisted ? "is-selected" : ""}
        >
          <Heart
            size={18}
            fill={wishlisted ? "currentColor" : "none"}
          />
          {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
        </button>

        <button type="button" onClick={handleShare}>
          <Share2 size={17} />
          Share Product
        </button>

        {typeof onShowReviews === "function" && (
          <button type="button" onClick={onShowReviews}>
            View Reviews
          </button>
        )}
      </div>

      <div className="jnr-pd-purchase__benefits">
        <span>
          <Truck size={20} aria-hidden="true" />
          <span>Delivery fee calculated at checkout</span>
        </span>

        <span>
          <ShieldCheck size={20} aria-hidden="true" />
          <span>Review product details before ordering</span>
        </span>
      </div>
    </section>
  );
}
