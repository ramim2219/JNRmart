/**
 * JNRmart frontend demo catalog for /product/:slug pages.
 * Uses the same source records as the Shop, Deals, and Featured Products UI.
 * All demo product ratings and reviews are placeholders, not customer feedback.
 */
import { shopProducts, shopProductGroups } from './shopDemoData';
import { applianceDeals, electronicsDeals } from './dealsDemoData';
import { featuredProducts } from './featuredProductsDemoData';

const groupNames = Object.fromEntries(
  shopProductGroups.map((group) => [group.slug, group.name])
);

const dealProduct = (product, category, categoryLabel) => ({
  ...product,
  category,
  categoryLabel,
  brand: product.brand || '',
  subCategory: product.subCategory || categoryLabel,
});

// Featured cards use sale_price/original_price/category_name, but the existing
// ProductPurchasePanel and DealProductCard use price/oldPrice/category.
// Normalize without changing featuredProductsDemoData.js.
const featuredProduct = (product) => {
  const categoryLabel = product.category_name || 'Featured Products';
  const category = categoryLabel.toLowerCase().trim().replace(/\s+/g, '-');
  const price = Number(product.sale_price ?? product.selling_price ?? product.price ?? 0);
  const oldPrice = Number(product.original_price ?? product.oldPrice ?? price);
  const discountPercent = Number(product.discount_percentage ?? 0);
  const reviewCount = Number(product.review_count ?? 0);

  return {
    ...product,
    category,
    categoryLabel,
    subCategory: product.subCategory || categoryLabel,
    brand: product.brand || '',
    price,
    oldPrice,
    originalPrice: oldPrice,
    discountPercent,
    reviewCount,
    ratingCount: reviewCount,
    description: product.description ||
      `${product.name} is a sample product in the ${categoryLabel} collection. ` +
      'Images, prices and ratings are demonstration data for the JNRmart storefront.',
  };
};

const all = [
  ...shopProducts.map((product) => ({
    ...product,
    categoryLabel: groupNames[product.category] || product.category,
  })),
  ...applianceDeals.map((product) =>
    dealProduct(product, 'home-appliances', 'Home Appliances')
  ),
  ...electronicsDeals.map((product) =>
    dealProduct(product, 'electronics', 'Electronics')
  ),
  ...featuredProducts.map(featuredProduct),
];

// The final record wins if a slug appears in more than one demo data source.
export const productCatalog = Array.from(
  new Map(
    all
      .filter((product) => typeof product.slug === 'string' && product.slug.trim())
      .map((product) => [product.slug, product])
  ).values()
);

export function getProductBySlug(slug) {
  return productCatalog.find((product) => product.slug === slug) ?? null;
}

export function getRelatedProducts(product, limit = 10) {
  if (!product) return [];

  const score = (item) =>
    (item.category === product.category ? 5 : 0) +
    (item.subCategory === product.subCategory ? 2 : 0) +
    (item.brand && item.brand === product.brand ? 1 : 0);

  return productCatalog
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

export const priceBDT = (value) =>
  `৳${Number(value || 0).toLocaleString('en-BD', {
    maximumFractionDigits: 0,
  })}`;

export function getProductImages(product) {
  if (!product) return [];

  const entries = [
    ...(Array.isArray(product.images) ? product.images : []),
    ...(product.image ? [product.image] : []),
  ];

  const images = entries
    .map((entry, index) =>
      typeof entry === 'string'
        ? { src: entry, alt: `${product.name} — image ${index + 1}` }
        : { src: entry?.src || entry?.url, alt: entry?.alt || product.name }
    )
    .filter((entry) => entry.src);

  return Array.from(new Map(images.map((item) => [item.src, item])).values());
}

export function getSpecifications(product) {
  if (!product) return [];
  if (Array.isArray(product.specifications) && product.specifications.length) {
    return product.specifications;
  }

  // Only show information that exists in the demo records.
  const rows = [
    { label: 'Product name', value: product.name },
    product.brand && { label: 'Brand', value: product.brand },
    { label: 'Category', value: product.categoryLabel || product.category || 'General' },
    product.subCategory && { label: 'Type', value: product.subCategory },
  ].filter(Boolean);

  const size = String(product.name || '').match(
    /\b\d+(?:\.\d+)?\s?(?:kg|g|gm|ml|l|ltr|liter|litre|inch|ton)\b/i
  );
  if (size) rows.push({ label: 'Size / Capacity (in title)', value: size[0] });

  return rows;
}

export function getDescription(product) {
  if (!product) return '';
  return product.description ||
    `${product.name} is listed in our ${product.categoryLabel || 'shop'} collection. ` +
    'Browse the images, compare the price and review the available specifications before adding it to your cart.';
}

/** Sample UI testimonials only; not verified buyer reviews. */
export const demoReviews = [
  {
    id: 'demo-1',
    name: 'Demo Reviewer',
    rating: 5,
    date: 'Sample review',
    title: 'Example review layout',
    comment: 'This is sample review text to demonstrate how customer feedback will appear after backend integration.',
  },
  {
    id: 'demo-2',
    name: 'Demo Reviewer',
    rating: 4,
    date: 'Sample review',
    title: 'Example customer feedback',
    comment: 'The review cards, ratings and submission form are working as frontend UI examples.',
  },
];
