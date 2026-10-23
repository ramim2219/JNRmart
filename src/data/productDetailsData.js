/**
 * Frontend demo catalog adapter for JNRmart.
 * Uses the same data sources as ShopPage and ProductDealsSection so cards and
 * /product/:slug always agree. Replace getProductBySlug/getRelatedProducts with
 * your API calls later; do not treat demo ratings/reviews as real customers.
 */
import { shopProducts, shopProductGroups } from './shopDemoData';
import { applianceDeals, electronicsDeals } from './dealsDemoData';

const groupNames = Object.fromEntries(shopProductGroups.map(group => [group.slug, group.name]));
const dealProduct = (product, category, categoryLabel) => ({
  ...product,
  category,
  categoryLabel,
  brand: product.brand || '',
  subCategory: product.subCategory || categoryLabel,
});

const all = [
  ...shopProducts.map(product => ({
    ...product,
    categoryLabel: groupNames[product.category] || product.category,
  })),
  ...applianceDeals.map(product => dealProduct(product, 'home-appliances', 'Home Appliances')),
  ...electronicsDeals.map(product => dealProduct(product, 'electronics', 'Electronics')),
];

export const productCatalog = Array.from(new Map(all.map(product => [product.slug, product])).values());

export function getProductBySlug(slug) {
  return productCatalog.find(product => product.slug === slug) ?? null;
}

export function getRelatedProducts(product, limit = 10) {
  if (!product) return [];
  return productCatalog
    .filter(item => item.slug !== product.slug)
    .sort((a, b) => {
      const score = (item) => (item.category === product.category ? 5 : 0)
        + (item.subCategory === product.subCategory ? 2 : 0)
        + (item.brand && item.brand === product.brand ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, limit);
}

export const priceBDT = (value) => `৳${Number(value || 0).toLocaleString('en-BD', {
  maximumFractionDigits: 0,
})}`;

/** Optional images, description and specifications can be supplied by API. */
export function getProductImages(product) {
  const pictures = [
    ...(Array.isArray(product.images) ? product.images : []),
    ...(product.image ? [product.image] : []),
  ];
  return Array.from(new Set(pictures.filter(Boolean))).map((entry, index) => (
    typeof entry === 'string'
      ? { src: entry, alt: `${product.name} — image ${index + 1}` }
      : { src: entry.src || entry.url, alt: entry.alt || product.name }
  )).filter(entry => entry.src);
}

export function getSpecifications(product) {
  if (Array.isArray(product.specifications) && product.specifications.length) {
    return product.specifications;
  }
  // Demo fallback: only facts actually present in the supplied catalog.
  const rows = [
    { label: 'Product name', value: product.name },
    product.brand && { label: 'Brand', value: product.brand },
    { label: 'Category', value: product.categoryLabel || product.category || 'General' },
    product.subCategory && { label: 'Type', value: product.subCategory },
  ].filter(Boolean);
  const size = product.name.match(/\b\d+(?:\.\d+)?\s?(?:kg|g|gm|ml|l|ltr|liter|litre|inch|ton)\b/i);
  if (size) rows.push({ label: 'Size / Capacity (in title)', value: size[0] });
  return rows;
}

export function getDescription(product) {
  return product.description || `${product.name} is listed in our ${product.categoryLabel || 'shop'} collection. Browse the images, compare the price and review the available specifications before adding it to your cart.`;
}

/** Explicitly DEMO review records; not verified buyer testimonials. */
export const demoReviews = [
  { id: 'demo-1', name: 'Demo Reviewer', rating: 5, date: 'Sample review', title: 'Example review layout', comment: 'This is sample review text to demonstrate how customer feedback will appear after backend integration.' },
  { id: 'demo-2', name: 'Demo Reviewer', rating: 4, date: 'Sample review', title: 'Example customer feedback', comment: 'The review cards, ratings and submission form are working as frontend UI examples.' },
];
