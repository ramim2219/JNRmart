
// Reusable helpers for public product data.
// No API requests or hard-coded product records belong in this file.

// Optional production asset origin.
// Example: http://192.168.0.174:8000
// Leave empty during Vite development to use the Vite proxy.
function getAssetBaseUrl() {
  const configuredUrl = import.meta.env.VITE_ASSET_BASE_URL?.trim();

  if (!configuredUrl) return "";

  try {
    const url = new URL(configuredUrl);

    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }

    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    console.warn("[Product Images] Invalid VITE_ASSET_BASE_URL");
    return "";
  }
}

const ASSET_BASE_URL = getAssetBaseUrl();

const isLocalhost = (hostname) => {
  const host = String(hostname || "").toLowerCase();

  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]"
  );
};

// Add the optional asset base URL.
function buildAssetUrl(path) {
  if (!path) return "";

  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${ASSET_BASE_URL}${normalizedPath}`;
}

// ======================================================
// IMAGE URL RESOLVER
// ======================================================

export function resolveProductImageUrl(path) {
  if (typeof path !== "string" || !path.trim()) {
    return "";
  }

  const src = path.trim();

  // Base64 and Blob images.
  if (/^(data:image\/|blob:)/i.test(src)) {
    return src;
  }

  // Absolute HTTP/HTTPS URLs.
  if (/^https?:\/\//i.test(src)) {
    try {
      const url = new URL(src);

      // Rewrite localhost URLs.
      // This is essential when opening the website
      // from another device on the same network.
      if (isLocalhost(url.hostname)) {
        return buildAssetUrl(
          `${url.pathname}${url.search}${url.hash}`
        );
      }

      // Keep valid external or public backend URLs.
      return src;
    } catch {
      return "";
    }
  }

  // Protocol-relative URLs.
  if (src.startsWith("//")) {
    try {
      const url = new URL(`http:${src}`);

      if (isLocalhost(url.hostname)) {
        return buildAssetUrl(
          `${url.pathname}${url.search}${url.hash}`
        );
      }

      return src;
    } catch {
      return "";
    }
  }

  // Normalize Windows-style paths.
  let cleanPath = src.replace(/\\/g, "/");

  cleanPath = cleanPath.replace(/^\/+/, "");

  // Laravel public storage path normalization.
  if (cleanPath.startsWith("public/storage/")) {
    cleanPath = cleanPath.replace(/^public\//, "");
  }

  if (cleanPath.startsWith("storage/app/public/")) {
    cleanPath = cleanPath.replace(
      "storage/app/public/",
      "storage/"
    );
  }

  // Already a Laravel storage path.
  if (cleanPath.startsWith("storage/")) {
    return buildAssetUrl(`/${cleanPath}`);
  }

  // Other root-relative paths.
  if (src.startsWith("/")) {
    return buildAssetUrl(`/${cleanPath}`);
  }

  // Relative image paths are assumed to belong to Laravel storage.
  return buildAssetUrl(`/storage/${cleanPath}`);
}

// ======================================================
// PRODUCT IMAGE COLLECTION
// ======================================================

export function getProductImages(product) {
  if (!product || typeof product !== "object") {
    return [];
  }

  const parentImages = Array.isArray(product.images)
    ? product.images
    : [];

  const variants = Array.isArray(product.variants)
    ? product.variants
    : [];

  const variantImages = variants.flatMap((variant) =>
    Array.isArray(variant.images)
      ? variant.images
      : []
  );

  const directImages = [
    product.image_url,
    product.image,
    product.thumbnail,
  ];

  const allImages = [
    ...directImages,
    ...parentImages,
    ...variantImages,
  ];

  const seen = new Set();

  return allImages
    .map((image, index) => {
      const path =
        typeof image === "string"
          ? image
          : image?.src ??
            image?.url ??
            image?.images ??
            image?.path ??
            image?.image_url ??
            image?.image ??
            image?.image_path ??
            image?.file_path ??
            "";

      const src = resolveProductImageUrl(path);

      if (!src || seen.has(src)) {
        return null;
      }

      seen.add(src);

      return {
        id: image?.id ?? index,
        src,
        alt:
          image?.alt ||
          `${product.name || "Product"} image ${index + 1}`,
      };
    })
    .filter(Boolean);
}

// ======================================================
// HTML DESCRIPTION
// ======================================================

export function htmlToText(value) {
  if (typeof value !== "string") return "";

  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function getDescription(product) {
  const description = htmlToText(product?.description);

  return description || "No description available for this product.";
}

// ======================================================
// COMMON BOOLEAN HELPER
// ======================================================

function isTrue(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}

// ======================================================
// VARIANT PRICING
// ======================================================

export function getVariantPricing(variant) {
  const prices = Array.isArray(variant?.prices)
    ? variant.prices
    : [];

  const activePrices = prices.filter(
    (price) =>
      price?.is_active == null || isTrue(price.is_active)
  );

  const selectedPrice =
    activePrices.find((price) => isTrue(price.is_default)) ||
    activePrices[0] ||
    null;

  if (!selectedPrice) {
    return {
      price: 0,
      oldPrice: 0,
      priceRecord: null,
    };
  }

  // Storefront's offer calculation is authoritative. The old effective_price
  // stays available for management / POS compatibility.
  const effectivePrice =
    selectedPrice.final_price ??
    selectedPrice.effective_price ??
    (isTrue(selectedPrice.is_flash_active) &&
    selectedPrice.flash_sale_price != null
      ? selectedPrice.flash_sale_price
      : selectedPrice.current_price ?? selectedPrice.actual_price);

  return {
    price: Number(effectivePrice) || 0,
    oldPrice:
      Number(
        selectedPrice.actual_price ??
          selectedPrice.original_price ??
          0
      ) || 0,
    priceRecord: selectedPrice,
    appliedOffer: selectedPrice.applied_offer ?? null,
    offerDiscount: Number(selectedPrice.offer_discount) || 0,
    currency: selectedPrice.currency ?? null,
  };
}

// ======================================================
// DEFAULT VARIANT
// ======================================================

export function getDefaultVariant(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return null;
  }

  // If only one specific variant is covered by an offer, prefer it as the
  // initial storefront selection so the offer landing page opens on the
  // discounted variant instead of an unrelated default variant.
  return (
    variants.find((variant) => {
      const pricing = getVariantPricing(variant);
      return pricing.price > 0 && Boolean(pricing.appliedOffer);
    }) ||
    variants.find((variant) => {
      const pricing = getVariantPricing(variant);
      return pricing.price > 0 && isTrue(pricing.priceRecord?.is_default);
    }) ||
    variants.find(
      (variant) => getVariantPricing(variant).price > 0
    ) ||
    variants[0]
  );
}

// ======================================================
// VARIANT LABEL
// ======================================================

export function getVariantLabel(variant, index = 0) {
  if (!variant) return `Variant ${index + 1}`;

  const attributes = Array.isArray(variant.attributes)
    ? variant.attributes
    : [];

  const values = attributes
    .map((item) => {
      const attributeValue = item?.attribute_value;
      const attribute = attributeValue?.attribute;

      const name =
        attribute?.display_name ||
        attribute?.name ||
        "";

      const value =
        attributeValue?.display_name ||
        attributeValue?.value ||
        "";

      return name && value ? `${name}: ${value}` : value;
    })
    .filter(Boolean);

  return (
    values.join(" / ") ||
    variant.sku ||
    `Variant ${index + 1}`
  );
}

// ======================================================
// PRODUCT SPECIFICATIONS
// ======================================================

export function getSpecifications(product) {
  if (!product) return [];

  const specifications = [];

  if (product.categoryLabel || product.category) {
    specifications.push({
      label: "Category",
      value:
        product.categoryLabel ||
        (typeof product.category === "string"
          ? product.category
          : product.category?.name),
    });
  }

  if (product.brand) {
    specifications.push({
      label: "Brand",
      value:
        typeof product.brand === "string"
          ? product.brand
          : product.brand?.name,
    });
  }

  if (product.unit) {
    specifications.push({
      label: "Unit",
      value:
        typeof product.unit === "string"
          ? product.unit
          : product.unit?.name,
    });
  }

  const variants = Array.isArray(product.variants)
    ? product.variants
    : [];

  variants.forEach((variant, index) => {
    const prefix =
      variants.length > 1 ? `Variant ${index + 1} ` : "";

    if (variant.sku) {
      specifications.push({
        label: `${prefix}SKU`,
        value: variant.sku,
      });
    }

    const attributes = Array.isArray(variant.attributes)
      ? variant.attributes
      : [];

    attributes.forEach((item) => {
      const attributeValue = item?.attribute_value;
      const attribute = attributeValue?.attribute;

      const label =
        attribute?.display_name ||
        attribute?.name ||
        "Attribute";

      const value =
        attributeValue?.display_name ||
        attributeValue?.value ||
        "";

      if (value) {
        specifications.push({
          label: `${prefix}${label}`,
          value,
        });
      }
    });

    const variantSpecifications = htmlToText(
      variant.specifications
    );

    if (variantSpecifications) {
      specifications.push({
        label: `${prefix}Specifications`,
        value: variantSpecifications,
      });
    }

    const packageInfo = variant.package || {};

    [
      ["Weight", packageInfo.weight],
      ["Length", packageInfo.length],
      ["Width", packageInfo.width],
      ["Height", packageInfo.height],
    ].forEach(([label, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        specifications.push({
          label: `${prefix}${label}`,
          value: String(value),
        });
      }
    });

    if (variant.sales_channel) {
      specifications.push({
        label: `${prefix}Sales Channel`,
        value: variant.sales_channel,
      });
    }
  });

  return specifications;
}

// ======================================================
// NORMALIZE PUBLIC PRODUCT
// ======================================================

export function normalizePublicProduct(raw) {
  if (!raw || typeof raw !== "object") return null;

  const variants = Array.isArray(raw.variants)
    ? raw.variants
    : [];

  const categoryName =
    typeof raw.category === "string"
      ? raw.category
      : raw.category?.name ?? raw.category_name ?? "";

  const brandName =
    typeof raw.brand === "string"
      ? raw.brand
      : raw.brand?.name ?? raw.brand?.display_name ?? "";

  const unitName =
    typeof raw.unit === "string"
      ? raw.unit
      : raw.unit?.name ?? "";

  // An offer listing may show a parent product with several variants.
  // Select an actually participating variant, not an unrelated default size.
  const offerContextId = raw.offer_context_id ?? null;
  const matchedVariant = raw.offer_listing
    ? variants.find((variant) => {
        if (raw.preferred_offer_variant_id != null &&
            String(variant.id) !== String(raw.preferred_offer_variant_id)) {
          return false;
        }
        const ids = Array.isArray(variant.active_offer_ids)
          ? variant.active_offer_ids
          : [];
        const matches = offerContextId == null
          ? ids.length > 0
          : ids.some((id) => String(id) === String(offerContextId));
        return matches && getVariantPricing(variant).price > 0;
      })
    : null;
  const defaultVariant = matchedVariant || getDefaultVariant(variants);
  const pricing = getVariantPricing(defaultVariant);
  const images = getProductImages(raw);

  return {
    ...raw,
    id: raw.id,
    slug: String(raw.id),
    name: raw.name ?? "Product",
    description: raw.description ?? "",
    category: categoryName,
    categoryLabel: categoryName,
    categoryId: raw.category?.id ?? raw.category_id ?? null,
    brand: brandName,
    unit: unitName,
    variants,
    variant_count: raw.variant_count ?? variants.length,
    defaultVariantId: defaultVariant?.id ?? null,
    price: pricing.price,
    oldPrice: pricing.oldPrice,
    image: images[0]?.src ?? "",
    image_url: images[0]?.src ?? "",
  };
}

// ======================================================
// PRICE FORMATTER
// ======================================================

export function priceBDT(value) {
  return `৳ ${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)}`;
}

/** Formats selected variant currency; falls back to the old BDT display. */
export function priceWithCurrency(value, currency) {
  const number = new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
  const symbol = currency?.symbol || (currency?.code === "BDT" ? "৳" : "");
  if (symbol) return `${symbol} ${number}`;
  return currency?.code ? `${number} ${currency.code}` : `৳ ${number}`;
}
