// Reusable helpers for public product data.
// No API requests or hard-coded product records belong in this file.

const FALLBACK_ORIGIN = "http://127.0.0.1:8000";

function getAssetOrigin() {
  const configuredUrl =
    import.meta.env.VITE_ASSET_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    FALLBACK_ORIGIN;

  try {
    return new URL(configuredUrl, FALLBACK_ORIGIN).origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

const ASSET_ORIGIN = getAssetOrigin();

export function resolveProductImageUrl(path) {
  if (typeof path !== "string" || !path.trim()) return "";

  const src = path.trim();

  if (/^(https?:\/\/|\/\/|data:image\/|blob:)/i.test(src)) {
    return src;
  }

  if (src.startsWith("/storage/")) {
    return `${ASSET_ORIGIN}${src}`;
  }

  if (src.startsWith("/")) {
    return `${ASSET_ORIGIN}${src}`;
  }

  const cleanPath = src.replace(/^\/+/, "");
  const storagePath = cleanPath.startsWith("storage/")
    ? cleanPath
    : `storage/${cleanPath}`;

  return `${ASSET_ORIGIN}/${storagePath}`;
}

export function getProductImages(product) {
  if (!product || typeof product !== "object") return [];

  const parentImages = Array.isArray(product.images)
    ? product.images
    : [];

  const variants = Array.isArray(product.variants)
    ? product.variants
    : [];

  const variantImages = variants.flatMap((variant) =>
    Array.isArray(variant.images) ? variant.images : []
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
            image?.path;

      const src = resolveProductImageUrl(path);

      if (!src || seen.has(src)) return null;

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

function isTrue(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function getVariantPricing(variant) {
  const prices = Array.isArray(variant?.prices)
    ? variant.prices
    : [];

  const activePrices = prices.filter(
    (price) => price?.is_active == null || isTrue(price.is_active)
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

  const effectivePrice =
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
  };
}

export function getDefaultVariant(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) return null;

  return (
    variants.find((variant) => {
      const pricing = getVariantPricing(variant);
      return (
        pricing.price > 0 &&
        isTrue(pricing.priceRecord?.is_default)
      );
    }) ||
    variants.find((variant) => getVariantPricing(variant).price > 0) ||
    variants[0]
  );
}

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

  return values.join(" / ") || variant.sku || `Variant ${index + 1}`;
}

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
    const prefix = variants.length > 1 ? `Variant ${index + 1} ` : "";

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

    const variantSpecifications = htmlToText(variant.specifications);

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
      if (value !== null && value !== undefined && value !== "") {
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

export function normalizePublicProduct(raw) {
  if (!raw || typeof raw !== "object") return null;

  const variants = Array.isArray(raw.variants) ? raw.variants : [];

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

  const defaultVariant = getDefaultVariant(variants);
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

export function priceBDT(value) {
  return `৳ ${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)}`;
}
