import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Search, X } from 'lucide-react';
import { categories } from '../../data/navigation';
import '../../styles/category-navigation.css';

export default function CategoryNavigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const scrollerRef = useRef(null);
  const searchRef = useRef(null);
  const openButtonRef = useRef(null);
  const sidebarRef = useRef(null);
  const location = useLocation();

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return term ? categories.filter((item) => item.label.toLocaleLowerCase().includes(term)) : categories;
  }, [query]);

  useEffect(() => {
    setSidebarOpen(false);
    setQuery('');
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    searchRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
      if (event.key === 'Tab' && sidebarRef.current) {
        const focusables = [...sidebarRef.current.querySelectorAll('button:not(:disabled), input, a[href]')];
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener('keydown', onKeyDown);
      openButtonRef.current?.focus();
    };
  }, [sidebarOpen]);

  return (
    <>
      <nav className="category-nav jnr-scroll-nav" aria-label="Product categories">
        <div className="container jnr-scroll-nav__inner">
          <div className="jnr-scroll-nav__viewport">
            <div className="jnr-scroll-nav__list" ref={scrollerRef}>
              <Link to="/">Home</Link>
              {categories.map((category) => <Link key={category.slug} to={`/category/${category.slug}`}>{category.label}</Link>)}
            </div>
          </div>
          <button
            ref={openButtonRef}
            className="jnr-scroll-nav__sidebar-trigger"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open all categories sidebar"
            aria-haspopup="dialog"
            aria-expanded={sidebarOpen}
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>
      </nav>
      {sidebarOpen && (
        <div className="jnr-cat-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSidebarOpen(false); }}>
          <aside className="jnr-cat-sidebar" role="dialog" aria-modal="true" aria-label="All product categories" ref={sidebarRef}>
            <div className="jnr-cat-sidebar__head">
              <div><strong>All Categories</strong><span>Explore JNRmart</span></div>
              <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close categories"><X size={22} /></button>
            </div>
            <label className="jnr-cat-sidebar__search">
              <Search size={19} aria-hidden="true" />
              <input ref={searchRef} type="search" placeholder="Search categories..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search all categories" />
            </label>
            <div className="jnr-cat-sidebar__items">
              <Link to="/" onClick={() => setSidebarOpen(false)}>Home <ChevronRight size={16} /></Link>
              {filtered.map((category) => (
                <Link key={category.slug} to={`/category/${category.slug}`} onClick={() => setSidebarOpen(false)}>{category.label}<ChevronRight size={16} /></Link>
              ))}
              {!filtered.length && <p className="jnr-cat-sidebar__empty">No matching categories.</p>}
            </div>
            <div className="jnr-cat-sidebar__foot">{filtered.length} categories</div>
          </aside>
        </div>
      )}
    </>
  );
}
