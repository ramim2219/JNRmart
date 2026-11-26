import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import { getPublicProducts } from "../../services/productServices";
import ProductDealsSection from "./ProductDealsSection";
import "../../styles/offer-products.css";

/** Homepage: only current published offer participants, paginated on server. */
export default function OfferProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getPublicProducts(
          { offer_filter: "only", page: 1, per_page: 12 },
          { signal: controller.signal }
        );
        if (active) setProducts(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setError(err?.message || "Unable to load offer products.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, [retry]);

  if (!loading && !error && products.length === 0) return null;

  return (
    <section className="jnr-offer-products-section" aria-label="Special offer products">
      {loading ? (
        <div className="container jnr-offer-state" role="status">Loading offer products...</div>
      ) : error ? (
        <div className="container jnr-offer-state" role="alert">
          {error}{" "}
          <button type="button" onClick={() => setRetry((v) => v + 1)}>
            <RefreshCw size={15} aria-hidden="true" /> Retry
          </button>
        </div>
      ) : (
        <ProductDealsSection
          title="Special Offer Products"
          subtitle="Products participating in current offers"
          products={products}
          viewAllHref="/offers"
          viewAllLabel="See All Offers"
          withContainer
        />
      )}
    </section>
  );
}
