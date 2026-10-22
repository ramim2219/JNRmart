import { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { moneyBDT } from '../../data/shopDemoData';

function FilterGroup({ title, children, initialOpen = true }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <section className="jnr-shop-filter-group">
      <button type="button" className="jnr-shop-filter-group__toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{title}</span><ChevronDown size={17} className={open ? 'is-open' : ''} aria-hidden="true" />
      </button>
      {open && <div className="jnr-shop-filter-group__content">{children}</div>}
    </section>
  );
}

/** Controlled filters; desktop and mobile use the exact same state. */
export default function ShopFilters({
  subCategories,
  brands,
  selectedSubCategories,
  selectedBrands,
  onSubCategoryChange,
  onBrandChange,
  flags,
  onFlagsChange,
  priceMin,
  priceMax,
  ceiling,
  onPriceChange,
  onClear,
  showClear = true,
}) {
  const toggleInSet = (current, name, callback) => {
    const next = new Set(current);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    callback(next);
  };
  const trackStart = ceiling ? (priceMin / ceiling) * 100 : 0;
  const trackEnd = ceiling ? (priceMax / ceiling) * 100 : 100;

  return (
    <div className="jnr-shop-filters">
      {showClear && (
        <div className="jnr-shop-filter-summary">
          <strong>Filter Products</strong>
          <button type="button" onClick={onClear}><RotateCcw size={14}/> Reset</button>
        </div>
      )}
      <FilterGroup title="Filter by Category">
        {subCategories.length ? subCategories.map((sub) => (
          <label className="jnr-shop-filter-choice" key={sub.name}>
            <input type="checkbox" checked={selectedSubCategories.has(sub.name)} onChange={() => toggleInSet(selectedSubCategories, sub.name, onSubCategoryChange)} />
            <span>{sub.name}</span>
            <small>{sub.count}</small>
          </label>
        )) : <p className="jnr-shop-filter-empty">No subcategories</p>}
      </FilterGroup>
      <FilterGroup title="Price Range">
        <div className="jnr-shop-price-labels"><span>{moneyBDT(priceMin)}</span><span>{moneyBDT(priceMax)}</span></div>
        <div className="jnr-shop-price-range" style={{ '--range-from': `${trackStart}%`, '--range-to': `${trackEnd}%` }}>
          <div className="jnr-shop-price-range__track"/>
          <input type="range" min="0" max={ceiling} step="10" value={priceMin} onChange={e => onPriceChange(Math.min(Number(e.target.value), priceMax), priceMax)} aria-label="Minimum price" />
          <input type="range" min="0" max={ceiling} step="10" value={priceMax} onChange={e => onPriceChange(priceMin, Math.max(Number(e.target.value), priceMin))} aria-label="Maximum price" />
        </div>
      </FilterGroup>
      <FilterGroup title="Brands">
        {brands.map((brand) => (
          <label className="jnr-shop-filter-choice" key={brand.name}>
            <input type="checkbox" checked={selectedBrands.has(brand.name)} onChange={() => toggleInSet(selectedBrands, brand.name, onBrandChange)} />
            <span>{brand.name}</span>
            <small>{brand.count}</small>
          </label>
        ))}
      </FilterGroup>
      <FilterGroup title="Product Flag">
        <label className="jnr-shop-filter-choice">
          <input type="checkbox" checked={flags.bestSelling} onChange={e => onFlagsChange({ ...flags, bestSelling: e.target.checked })}/>
          <span>Best Selling</span>
        </label>
        <label className="jnr-shop-filter-choice">
          <input type="checkbox" checked={flags.newArrival} onChange={e => onFlagsChange({ ...flags, newArrival: e.target.checked })}/>
          <span>New Arrival</span>
        </label>
      </FilterGroup>
    </div>
  );
}
