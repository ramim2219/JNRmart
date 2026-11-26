import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getPublicProducts, getPublicOfferProducts } from "../services/productServices";
import ProductCard from "../components/common/ProductCard";
import "../styles/featured-products.css";
import "../styles/offer-products.css";

const PAGE_SIZE = 12;

/** Reuses public product DTO and card; no hardcoded offer/product records. */
export default function OfferProductsPage() {
  const { offerId } = useParams();
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [offer, setOffer] = useState(null);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => { setPage(1); setData([]); setOffer(null); }, [offerId]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = { page, per_page: PAGE_SIZE, sort: "latest" };
        const response = offerId
          ? await getPublicOfferProducts(offerId, params, { signal: controller.signal })
          : await getPublicProducts({ ...params, offer_filter: "only" }, { signal: controller.signal });
        if (!active) return;
        setData(Array.isArray(response?.data) ? response.data : []);
        setMeta(response?.meta ?? {});
        setOffer(response?.offer ?? null);
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setError(err?.message || "Unable to load offer products.");
        setData([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, [offerId, page, retry]);

  const pages = Math.max(1, Number(meta.last_page) || 1);
  const total = Number(meta.total) || 0;

  return (
    <main className="container jnr-offer-page">
      <Link className="jnr-offer-back" to={offerId ? "/offers" : "/"}>
        <ArrowLeft size={16} aria-hidden="true" /> {offerId ? "All Offers" : "Home"}
      </Link>
      <header className="jnr-offer-page__header">
        <h1>{offer?.name || (offerId ? "Offer Products" : "Special Offer Products")}</h1>
        <p>{offer?.description || "Browse products participating in currently active offers."}</p>
        {!loading && !error && <small>{total} product{total === 1 ? "" : "s"}</small>}
      </header>
      {loading ? (
        <div className="jnr-offer-state" role="status">Loading products...</div>
      ) : error ? (
        <div className="jnr-offer-state" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetry((v) => v + 1)}>Try Again</button>
        </div>
      ) : data.length === 0 ? (
        <div className="jnr-offer-state">
          <p>No products are currently available for this offer.</p>
          <Link to="/shop">Browse shop</Link>
        </div>
      ) : (
        <>
          <div className="jnr-featured-grid">
            {data.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          {pages > 1 && (
            <nav className="jnr-offer-pagination" aria-label="Offer product pages">
              <button type="button" disabled={page === 1} onClick={() => {setPage((v) => v - 1); window.scrollTo(0, 0);}}>Previous</button>
              <span>Page {page} of {pages}</span>
              <button type="button" disabled={page >= pages} onClick={() => {setPage((v) => v + 1); window.scrollTo(0, 0);}}>Next</button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
