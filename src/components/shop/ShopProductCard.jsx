import ProductCard from "../common/ProductCard";

/**
 * Shop Product Card
 * Uses the shared API-backed ProductCard component.
 */
export default function ShopProductCard({ product }) {
  return <ProductCard product={product} />;
}
