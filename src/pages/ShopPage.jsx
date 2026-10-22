import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ListFilter, SlidersHorizontal, X } from 'lucide-react';
import { shopProducts, shopProductGroups } from '../data/shopDemoData';
import ShopProductCard from '../components/shop/ShopProductCard';
import ShopFilters from '../components/shop/ShopFilters';
import '../styles/shop-page.css';

const PAGE_SIZES = [12, 24, 36];
const emptyFlags = { bestSelling: false, newArrival: false };
const countOptions = (items, key) => Array.from(
  items.reduce((map, item) => map.set(item[key], (map.get(item[key]) || 0) + 1), new Map()),
  ([name, count]) => ({ name, count })
).sort((a, b) => a.name.localeCompare(b.name));

const matchesQuery = (product, query) => (
  [product.name, product.brand, product.subCategory, product.category]
    .join(' ').toLowerCase().includes(query.toLowerCase())
);

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const possible = new Set([1, pages, page - 1, page, page + 1]);
  const numbers = Array.from(possible).filter(n => n > 0 && n <= pages).sort((a, b) => a - b);
  let previous = 0;
  return (
    <nav className="jnr-shop-pagination" aria-label="Product pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={18}/></button>
      {numbers.map(n => {
        const gap = n - previous > 1;
        previous = n;
        return (
          <span className="jnr-shop-pagination__part" key={n}>
            {gap && <span className="jnr-shop-pagination__ellipsis">…</span>}
            <button type="button" onClick={() => onChange(n)} aria-current={page === n ? 'page' : undefined} className={page === n ? 'is-active' : ''}>{n}</button>
          </span>
        );
      })}
      <button disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={18}/></button>
    </nav>
  );
}

export default function ShopPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchText = (searchParams.get('q') || '').trim();
  const isSearch = location.pathname === '/search';
  const isOffer = slug === 'offer-zone';
  const matchingCategory = shopProductGroups.find(group => group.slug === slug);
  const title = isSearch ? 'Search Results' : slug && !isOffer
    ? (matchingCategory?.name || slug.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' '))
    : isOffer ? 'Offer Zone' : 'Shop All Products';

  const baseProducts = useMemo(() => {
    if (isSearch) return searchText ? shopProducts.filter(item => matchesQuery(item, searchText)) : shopProducts;
    if (isOffer) return shopProducts.filter(item => item.oldPrice > item.price);
    if (slug) return shopProducts.filter(item => item.category === slug);
    return shopProducts;
  }, [slug, isSearch, searchText, isOffer]);

  const ceiling = useMemo(() => {
    const max = Math.max(...baseProducts.map(p => p.price), 500);
    return Math.ceil(max / 500) * 500;
  }, [baseProducts]);

  const [selectedSubCategories, setSelectedSubCategories] = useState(new Set());
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [flags, setFlags] = useState(emptyFlags);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(ceiling);
  const [sort, setSort] = useState('default');
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const drawerRef = useRef(null);
  const triggerRef = useRef(null);
  const resultsRef = useRef(null);

  const clearFilters = () => {
    setSelectedSubCategories(new Set());
    setSelectedBrands(new Set());
    setFlags({ ...emptyFlags });
    setPriceMin(0);
    setPriceMax(ceiling);
  };

  useEffect(() => {
    setSelectedSubCategories(new Set());
    setSelectedBrands(new Set());
    setFlags({ ...emptyFlags });
    setPriceMin(0);
    setPriceMax(ceiling);
    setSort('default');
    setPage(1);
    setMobileFiltersOpen(false);
  }, [slug, isSearch, searchText, ceiling]);

  useEffect(() => {
    if (!mobileFiltersOpen) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileFiltersOpen(false);
      if (event.key !== 'Tab') return;
      const focusable = drawerRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    drawerRef.current?.querySelector('.jnr-shop-mobile-drawer__close')?.focus();
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [mobileFiltersOpen]);

  const subCategories = useMemo(() => countOptions(baseProducts, 'subCategory'), [baseProducts]);
  const brands = useMemo(() => countOptions(baseProducts, 'brand'), [baseProducts]);

  const filteredProducts = useMemo(() => {
    const filtered = baseProducts.filter(item => {
      if (selectedSubCategories.size && !selectedSubCategories.has(item.subCategory)) return false;
      if (selectedBrands.size && !selectedBrands.has(item.brand)) return false;
      if (item.price < priceMin || item.price > priceMax) return false;
      if (flags.bestSelling || flags.newArrival) {
        if (!((flags.bestSelling && item.bestSelling) || (flags.newArrival && item.newArrival))) return false;
      }
      return true;
    });
    if (sort === 'low-price') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'high-price') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'az') filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'newest') filtered.sort((a, b) => b.createdAt - a.createdAt);
    if (sort === 'popular') filtered.sort((a, b) => Number(b.bestSelling) - Number(a.bestSelling));
    return filtered;
  }, [baseProducts, selectedSubCategories, selectedBrands, priceMin, priceMax, flags, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const currentProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize);
  const start = filteredProducts.length ? (safePage - 1) * pageSize + 1 : 0;
  const end = Math.min(safePage * pageSize, filteredProducts.length);
  const hasFilters = selectedSubCategories.size > 0 || selectedBrands.size > 0 || flags.bestSelling || flags.newArrival || priceMin > 0 || priceMax < ceiling;

  useEffect(() => { setPage(1); }, [selectedSubCategories, selectedBrands, flags, priceMin, priceMax, sort, pageSize]);

  const changePage = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
    resultsRef.current?.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  const filterProps = {
    subCategories, brands, selectedSubCategories, selectedBrands,
    onSubCategoryChange: setSelectedSubCategories, onBrandChange: setSelectedBrands,
    flags, onFlagsChange: setFlags, priceMin, priceMax, ceiling,
    onPriceChange: (min, max) => { setPriceMin(min); setPriceMax(max); },
    onClear: clearFilters,
  };

  return (
    <section className="jnr-shop-page">
      <div className="container jnr-shop-container">
        <div className="jnr-shop-heading">
          <div><h1>{title}</h1>{isSearch && searchText && <p>Results for “{searchText}”</p>}</div>
          <nav className="jnr-shop-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={14} aria-hidden="true"/><span aria-current="page">{title}</span></nav>
        </div>

        {/* The sidebar sticks only inside this grid, never into the footer. */}
        <div className="jnr-shop-layout">
          <aside className="jnr-shop-aside" aria-label="Product filters">
            <ShopFilters {...filterProps}/>
          </aside>

          <div className="jnr-shop-content" ref={resultsRef}>
            <div className="jnr-shop-toolbar">
              <button type="button" className="jnr-shop-mobile-filter-btn" ref={triggerRef} onClick={() => setMobileFiltersOpen(true)} aria-haspopup="dialog">
                <ListFilter size={17}/> Filters {hasFilters && <span className="jnr-shop-active-dot"/>}
              </button>
              <label className="jnr-shop-sort"><span>Sort By:</span>
                <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort products">
                  <option value="default">Default Sorting</option>
                  <option value="popular">Best Selling</option>
                  <option value="newest">Newest First</option>
                  <option value="low-price">Price: Low to High</option>
                  <option value="high-price">Price: High to Low</option>
                  <option value="az">Name: A to Z</option>
                </select>
              </label>
              <span className="jnr-shop-count">Showing {start}–{end} of {filteredProducts.length}</span>
              <label className="jnr-shop-per-page"><span>Show:</span><select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} aria-label="Products per page">
                {PAGE_SIZES.map(size => <option value={size} key={size}>{size}</option>)}
              </select></label>
            </div>

            {hasFilters && <div className="jnr-shop-filter-notice"><SlidersHorizontal size={14}/><span>Filters applied</span><button type="button" onClick={clearFilters}>Clear all <X size={13}/></button></div>}

            {currentProducts.length ? (
              <div className="jnr-shop-products">
                {currentProducts.map(product => <ShopProductCard product={product} key={product.id}/>)}
              </div>
            ) : (
              <div className="jnr-shop-no-products">
                <SlidersHorizontal size={40} strokeWidth={1.3}/>
                <h2>No products found</h2>
                <p>{isSearch ? 'Try another search or remove a filter.' : 'Try changing your filters to see more products.'}</p>
                {hasFilters && <button type="button" onClick={clearFilters}>Clear Filters</button>}
                {!hasFilters && <Link to="/shop">Browse All Products</Link>}
              </div>
            )}
            <Pagination page={safePage} pages={totalPages} onChange={changePage}/>
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="jnr-shop-mobile-filter-layer">
          <div className="jnr-shop-mobile-backdrop" onClick={() => setMobileFiltersOpen(false)} aria-hidden="true" />
          <aside ref={drawerRef} className="jnr-shop-mobile-drawer" role="dialog" aria-modal="true" aria-labelledby="jnr-mobile-filter-title">
            <div className="jnr-shop-mobile-drawer__header"><h2 id="jnr-mobile-filter-title">Filter Products</h2><button type="button" className="jnr-shop-mobile-drawer__close" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters"><X size={22}/></button></div>
            <div className="jnr-shop-mobile-drawer__body"><ShopFilters {...filterProps} showClear={false}/></div>
            <div className="jnr-shop-mobile-drawer__footer"><button type="button" className="jnr-shop-mobile-drawer__reset" onClick={clearFilters}>Reset</button><button type="button" className="jnr-shop-mobile-drawer__apply" onClick={() => setMobileFiltersOpen(false)}>Show {filteredProducts.length} Products</button></div>
          </aside>
        </div>
      )}
    </section>
  );
}
