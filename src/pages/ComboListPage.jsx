import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Gift, Package, RefreshCw } from "lucide-react";
import { getPublicCombos } from "../services/publicComboServices";
import "../styles/combo-list-page.css";

const formatMoney = (value, currency) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Price unavailable";
  const formatted = new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
  return currency?.symbol
    ? `${currency.symbol} ${formatted}`
    : currency?.code
      ? `${currency.code} ${formatted}`
      : formatted;
};

const isCanceled = (error) =>
  error?.name === "AbortError" ||
  error?.name === "CanceledError" ||
  error?.code === "ERR_CANCELED";

export default function ComboListPage() {
  const [combos, setCombos] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const retry = useCallback(() => setRetryKey((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getPublicCombos({
          page,
          perPage: 12,
          signal: controller.signal,
        });
        if (!active) return;
        setCombos(response.data);
        setLastPage(Math.max(1, Number(response?.meta?.last_page) || 1));
      } catch (err) {
        if (!active || controller.signal.aborted || isCanceled(err)) return;
        setError(err?.message || "Unable to load combo deals.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [page, retryKey]);

  return (
    <div className="jnr-combos-page">
      <div className="container">
        <header className="jnr-combos-page__header">
          <Link to="/shop" className="jnr-combos-page__back">
            <ArrowLeft size={16} aria-hidden="true" /> Back to Shop
          </Link>
          <h1>Combo Deals</h1>
          <p>Explore currently available product bundles and their combined prices.</p>
        </header>

        {loading ? (
          <div className="jnr-combos-page__state" role="status">Loading combo deals...</div>
        ) : error ? (
          <div className="jnr-combos-page__state" role="alert">
            <p>{error}</p>
            <button type="button" onClick={retry}>
              <RefreshCw size={16} aria-hidden="true" /> Try again
            </button>
          </div>
        ) : combos.length === 0 ? (
          <div className="jnr-combos-page__state">
            <Package size={32} aria-hidden="true" />
            <p>No online combo deals are available at the moment.</p>
            <Link to="/shop">Explore products</Link>
          </div>
        ) : (
          <>
            <div className="jnr-combos-page__grid">
              {combos.map((combo) => {
                const currency = combo.currency;
                const actual = Number(combo?.pricing?.actual_price);
                const current = Number(combo?.pricing?.final_price);
                const savings = Number.isFinite(actual) && Number.isFinite(current)
                  ? Math.max(0, actual - current)
                  : 0;
                return (
                  <article key={combo.id} className="jnr-combo-card">
                    <div className="jnr-combo-card__media">
                      {combo.image_url ? (
                        <img src={combo.image_url} alt={combo.name || "Combo deal"} loading="lazy" />
                      ) : (
                        <Gift size={48} aria-hidden="true" />
                      )}
                    </div>
                    <div className="jnr-combo-card__body">
                      <h2>{combo.name}</h2>
                      {combo.description && <p className="jnr-combo-card__description">{combo.description}</p>}
                      <div className="jnr-combo-card__prices">
                        <strong>{formatMoney(combo?.pricing?.final_price, currency)}</strong>
                        {Number.isFinite(actual) && actual > current && (
                          <del>{formatMoney(actual, currency)}</del>
                        )}
                      </div>
                      {savings > 0 && (
                        <span className="jnr-combo-card__save">Save {formatMoney(savings, currency)}</span>
                      )}
                      <div className="jnr-combo-card__items-title">Included products</div>
                      <ul className="jnr-combo-card__items">
                        {(combo.items || []).map((item) => (
                          <li key={item.product_id}>
                            <span>{item.name || "Product"}{item.sku ? ` — ${item.sku}` : ""}</span>
                            <span>× {Number(item.quantity).toLocaleString("en-BD")}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
            {lastPage > 1 && (
              <nav className="jnr-combos-page__pagination" aria-label="Combo pages">
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <span>Page {page} of {lastPage}</span>
                <button type="button" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
