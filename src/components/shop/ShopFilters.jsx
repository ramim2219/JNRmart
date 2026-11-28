import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";

function formatBDT(value) {
  return `৳ ${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)}`;
}

function FilterGroup({ title, children, initialOpen = true }) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <section className="jnr-shop-filter-group">
      <button
        type="button"
        className="jnr-shop-filter-group__toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown
          size={17}
          className={open ? "is-open" : ""}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="jnr-shop-filter-group__content">
          {children}
        </div>
      )}
    </section>
  );
}

/**
 * Controlled filters; desktop and mobile use the exact same state.
 * No demo-data dependency: options and counts come from the API products.
 */
export default function ShopFilters({
  categories = [],
  comboMode = false,
  runningOffers = [],
  selectedOfferId = "",
  onlyRunningOffers = false,
  offersLoading = false,
  offersError = "",
  onOfferChange,
  onRetryOffers,
  selectedCategoryKey = "",
  onCategoryChange,
  subCategories = [],
  brands = [],
  selectedSubCategories = new Set(),
  selectedBrands = new Set(),
  onSubCategoryChange,
  onBrandChange,
  flags = { bestSelling: false, newArrival: false },
  onFlagsChange,
  priceMin = 0,
  priceMax = 500,
  ceiling = 500,
  onPriceChange,
  onClear,
  showClear = true,
}) {
  const toggleInSet = (current, name, callback) => {
    const next = new Set(current || []);

    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }

    callback?.(next);
  };

  const safeCeiling = Math.max(1, Number(ceiling) || 1);
  const safeMin = Math.min(
    safeCeiling,
    Math.max(0, Number(priceMin) || 0)
  );
  const safeMax = Math.min(
    safeCeiling,
    Math.max(safeMin, Number(priceMax) || 0)
  );

  const trackStart = (safeMin / safeCeiling) * 100;
  const trackEnd = (safeMax / safeCeiling) * 100;

  return (
    <div className="jnr-shop-filters">
      {showClear && (
        <div className="jnr-shop-filter-summary">
          <strong>Filter Products</strong>
          <button type="button" onClick={onClear}>
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      )}

      {!comboMode && <FilterGroup title="Offer Zone">
        <label className="jnr-shop-filter-choice">
          <input
            type="radio"
            name="jnr-shop-offer-zone"
            checked={!selectedOfferId && !onlyRunningOffers}
            onChange={() => onOfferChange?.("")}
          />
          <span>All Products</span>
        </label>
        <label className="jnr-shop-filter-choice">
          <input
            type="radio"
            name="jnr-shop-offer-zone"
            checked={onlyRunningOffers}
            onChange={() => onOfferChange?.("all-running")}
          />
          <span>All Running Offers</span>
        </label>

        {offersLoading ? (
          <p className="jnr-shop-filter-empty" role="status">
            Loading running offers...
          </p>
        ) : offersError ? (
          <div className="jnr-shop-filter-empty" role="alert">
            <p>{offersError}</p>
            <button type="button" onClick={onRetryOffers}>
              Try again
            </button>
          </div>
        ) : runningOffers.length ? (
          runningOffers.map((offer) => (
            <label className="jnr-shop-filter-choice" key={offer.id}>
              <input
                type="radio"
                name="jnr-shop-offer-zone"
                checked={String(selectedOfferId) === String(offer.id)}
                onChange={() => onOfferChange?.(String(offer.id))}
              />
              <span>{offer.name}</span>
            </label>
          ))
        ) : (
          <p className="jnr-shop-filter-empty">
            No running offers available
          </p>
        )}
      </FilterGroup>}

      <FilterGroup title="Filter by Category">
        <label className="jnr-shop-filter-choice">
          <input
            type="radio"
            name="jnr-shop-category-filter"
            checked={!selectedCategoryKey}
            onChange={() => onCategoryChange?.("")}
          />
          <span>All Categories</span>
        </label>

        {categories.length ? (
          categories.map((category) => (
            <label
              className="jnr-shop-filter-choice"
              key={category.key}
            >
              <input
                type="radio"
                name="jnr-shop-category-filter"
                checked={selectedCategoryKey === category.key}
                onChange={() => onCategoryChange?.(category.key)}
              />
              <span>{category.name}</span>
              {category.count != null && <small>{category.count}</small>}
            </label>
          ))
        ) : (
          <p className="jnr-shop-filter-empty">
            No categories with products
          </p>
        )}
      </FilterGroup>

      {!comboMode && <FilterGroup title="Subcategories">
        {subCategories.length ? (
          subCategories.map((sub) => (
            <label
              className="jnr-shop-filter-choice"
              key={sub.name}
            >
              <input
                type="checkbox"
                checked={selectedSubCategories.has(sub.name)}
                onChange={() =>
                  toggleInSet(
                    selectedSubCategories,
                    sub.name,
                    onSubCategoryChange
                  )
                }
              />
              <span>{sub.name}</span>
              <small>{sub.count}</small>
            </label>
          ))
        ) : (
          <p className="jnr-shop-filter-empty">
            No subcategories available
          </p>
        )}
      </FilterGroup>}

      {!comboMode && <FilterGroup title="Price Range">
        <div className="jnr-shop-price-labels">
          <span>{formatBDT(safeMin)}</span>
          <span>{formatBDT(safeMax)}</span>
        </div>

        <div
          className="jnr-shop-price-range"
          style={{
            "--range-from": `${trackStart}%`,
            "--range-to": `${trackEnd}%`,
          }}
        >
          <div className="jnr-shop-price-range__track" />

          <input
            type="range"
            min="0"
            max={safeCeiling}
            step="10"
            value={safeMin}
            onChange={(event) =>
              onPriceChange?.(
                Math.min(Number(event.target.value), safeMax),
                safeMax
              )
            }
            aria-label="Minimum price"
          />

          <input
            type="range"
            min="0"
            max={safeCeiling}
            step="10"
            value={safeMax}
            onChange={(event) =>
              onPriceChange?.(
                safeMin,
                Math.max(Number(event.target.value), safeMin)
              )
            }
            aria-label="Maximum price"
          />
        </div>
      </FilterGroup>}

      {!comboMode && <FilterGroup title="Brands">
        {brands.length ? (
          brands.map((brand) => (
            <label
              className="jnr-shop-filter-choice"
              key={brand.name}
            >
              <input
                type="checkbox"
                checked={selectedBrands.has(brand.name)}
                onChange={() =>
                  toggleInSet(
                    selectedBrands,
                    brand.name,
                    onBrandChange
                  )
                }
              />
              <span>{brand.name}</span>
              <small>{brand.count}</small>
            </label>
          ))
        ) : (
          <p className="jnr-shop-filter-empty">
            No brands available
          </p>
        )}
      </FilterGroup>}

      {!comboMode && <FilterGroup title="Product Flag">
        <label className="jnr-shop-filter-choice">
          <input
            type="checkbox"
            checked={Boolean(flags.bestSelling)}
            onChange={(event) =>
              onFlagsChange?.({
                ...flags,
                bestSelling: event.target.checked,
              })
            }
          />
          <span>Best Selling</span>
        </label>

        <label className="jnr-shop-filter-choice">
          <input
            type="checkbox"
            checked={Boolean(flags.newArrival)}
            onChange={(event) =>
              onFlagsChange?.({
                ...flags,
                newArrival: event.target.checked,
              })
            }
          />
          <span>New Arrival</span>
        </label>
      </FilterGroup>}
    </div>
  );
}
