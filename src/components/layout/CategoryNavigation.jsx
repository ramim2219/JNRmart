import { useEffect, useMemo, useRef, useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

import {
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Heart,
  ClipboardList,
  UserRound,
} from 'lucide-react';
import { useStoreUI } from '../../context/StoreUIContext';

import { fetchPublicCategories } from '../../services/categoryServices';

import '../../styles/category-navigation.css';

const makeSlug = (name) =>

  String(name || '')

    .trim()

    .toLowerCase()

    .replace(/[^\p{L}\p{N}]+/gu, '-')

    .replace(/^-|-$/g, '');

const isRoot = (parentId) =>

  parentId == null || parentId === '' || Number(parentId) === 0;

// Same ordering logic used by the Admin Category page.

const compareByOrder = (a, b) => {

  const orderA =

    a.order == null || a.order === '' ? Infinity : Number(a.order);

  const orderB =

    b.order == null || b.order === '' ? Infinity : Number(b.order);

  if (orderA !== orderB) return orderA - orderB;

  return String(a.name || '').localeCompare(String(b.name || ''));

};

// Build a nested category tree and preserve order within every sibling group.

function buildCategoryTree(rows) {

  const nodes = new Map(

    rows.map((item) => [String(item.id), { ...item, children: [] }])

  );

  const roots = [];

  nodes.forEach((node) => {

    const parent = nodes.get(String(node.parent_id));

    if (

      !isRoot(node.parent_id) &&

      parent &&

      String(node.id) !== String(node.parent_id)

    ) {

      parent.children.push(node);

    } else {

      roots.push(node);

    }

  });

  const result = [];

  const visited = new Set();

  const visit = (node, level = 0) => {

    const id = String(node.id);

    if (visited.has(id)) return;

    visited.add(id);

    result.push({ ...node, level });

    node.children.sort(compareByOrder);

    node.children.forEach((child) => visit(child, level + 1));

  };

  roots.sort(compareByOrder).forEach((node) => visit(node));

  // Keep legacy records with missing or cyclic parent relationships visible.

  nodes.forEach((node) => {

    if (!visited.has(String(node.id))) visit(node);

  });

  return result;

}

function CategoryBranch({ category, depth = 1 }) {

  const children = category.children || [];

  return (

    <div

      className={`jnr-mega-menu__branch jnr-mega-menu__branch--depth-${Math.min(depth, 3)}`}

    >

      <Link to={`/category/${category.slug}`} className="jnr-mega-menu__link">

        <span>{category.name}</span>

        {children.length > 0 && <ChevronRight size={14} />}

      </Link>

      {children.length > 0 && (

        <div className="jnr-mega-menu__children">

          {children.map((child) => (

            <CategoryBranch

              key={child.id}

              category={child}

              depth={depth + 1}

            />

          ))}

        </div>

      )}

    </div>

  );

}

export default function CategoryNavigation() {

  const [categories, setCategories] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);

  const [query, setQuery] = useState('');

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [reloadKey, setReloadKey] = useState(0);

  const [menuPosition, setMenuPosition] = useState({ left: 0, width: 300 });

  const navInnerRef = useRef(null);

  const searchRef = useRef(null);

  const openButtonRef = useRef(null);

  const sidebarRef = useRef(null);

  const location = useLocation();
  const { panel, openPanel, closePanel, wishlistCount } = useStoreUI();

  useEffect(() => {

    let cancelled = false;

    const loadCategories = async () => {

      setLoading(true);

      setError('');

      try {

        // Keep the API response flat; buildCategoryTree handles hierarchy

        // and sorts every parent/child group using the Admin order field.

        const response = await fetchPublicCategories();

        const rows = Array.isArray(response?.data) ? response.data : [];

        const activeRows = rows

          .filter((item) => item.status == null || Number(item.status) === 1)

          .map((item) => ({

            ...item,

            name: item.name || '',

            slug: item.slug || item.url_slug || makeSlug(item.name),

          }))

          .filter((item) => item.id != null && item.name);

        if (!cancelled) setCategories(buildCategoryTree(activeRows));

      } catch (err) {

        console.error('Category loading failed:', err);

        if (!cancelled) setError(err.message || 'Unable to load categories.');

      } finally {

        if (!cancelled) setLoading(false);

      }

    };

    loadCategories();

    return () => {

      cancelled = true;

    };

  }, [reloadKey]);

  const rootCategories = useMemo(

    () => categories.filter((item) => item.level === 0),

    [categories]

  );

  const activeCategory = useMemo(

    () =>

      rootCategories.find(

        (item) => String(item.id) === String(hoveredCategoryId)

      ),

    [rootCategories, hoveredCategoryId]

  );

  const filteredCategories = useMemo(() => {

    const term = query.trim().toLocaleLowerCase();

    // categories is already flattened in hierarchy/order sequence.

    return term

      ? categories.filter((item) =>

          item.name.toLocaleLowerCase().includes(term)

        )

      : categories;

  }, [categories, query]);

  useEffect(() => {

    setSidebarOpen(false);

    setQuery('');

    setHoveredCategoryId(null);

  }, [location.pathname, location.search]);

  

  // The mobile bottom Menu button opens this same All Categories sidebar.
  useEffect(() => {
    if (panel === 'menu') {
      setQuery('');
      setHoveredCategoryId(null);
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [panel]);
// Lock page scrolling and keep keyboard focus inside the open sidebar.

  useEffect(() => {

    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    searchRef.current?.focus();

    const onKeyDown = (event) => {

      if (event.key === 'Escape') {
        event.preventDefault();
        setSidebarOpen(false);
        if (panel === 'menu') closePanel();
        return;
      }

      if (event.key !== 'Tab' || !sidebarRef.current) return;

      const focusable = sidebarRef.current.querySelectorAll(

        'button:not(:disabled), input, a[href]'

      );

      if (!focusable.length) return;

      const first = focusable[0];

      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {

        event.preventDefault();

        last.focus();

      } else if (!event.shiftKey && document.activeElement === last) {

        event.preventDefault();

        first.focus();

      }

    };

    document.addEventListener('keydown', onKeyDown);

    return () => {

      document.body.style.overflow = previousOverflow;

      document.removeEventListener('keydown', onKeyDown);

      if (openButtonRef.current?.getClientRects().length) {
        openButtonRef.current.focus();
      } else {
        document.querySelector('[data-mobile-menu-trigger="true"]')?.focus();
      }

    };

  }, [sidebarOpen, panel, closePanel]);

  const handleCategoryHover = (category, event) => {

    if (!category.children?.length) {

      setHoveredCategoryId(null);

      return;

    }

    const nav = navInnerRef.current;

    if (!nav || !event.currentTarget) return;

    const navRect = nav.getBoundingClientRect();

    const itemRect = event.currentTarget.getBoundingClientRect();

    const width = Math.min(300, navRect.width, window.innerWidth - 32);

    const left = Math.max(

      0,

      Math.min(itemRect.left - navRect.left, navRect.width - width)

    );

    setMenuPosition({ left, width });

    setHoveredCategoryId(String(category.id));

  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    if (panel === 'menu') closePanel();
  };

  const openWishlistFromSidebar = () => {
    closeSidebar();
    openPanel('wishlist');
  };

  return (

    <>

      <nav className="category-nav jnr-scroll-nav" aria-label="Product categories">

        <div

          ref={navInnerRef}

          className="container jnr-scroll-nav__inner"

          onMouseLeave={() => setHoveredCategoryId(null)}

          onBlur={(event) => {

            if (!event.currentTarget.contains(event.relatedTarget)) {

              setHoveredCategoryId(null);

            }

          }}

          onKeyDown={(event) => {

            if (event.key === 'Escape') setHoveredCategoryId(null);

          }}

        >

          <div className="jnr-scroll-nav__viewport">

            <div className="jnr-scroll-nav__list">

              <Link to="/" className="jnr-scroll-nav__home">

                Home

              </Link>

              {rootCategories.map((category) => {

                const hasChildren = category.children?.length > 0;

                const isActive =

                  hoveredCategoryId === String(category.id);

                return (

                  <Link

                    key={category.id}

                    to={`/category/${category.slug}`}

                    className={`jnr-scroll-nav__category ${

                      isActive ? 'jnr-scroll-nav__category--active' : ''

                    }`}

                    onMouseEnter={(event) =>

                      handleCategoryHover(category, event)

                    }

                    onFocus={(event) =>

                      handleCategoryHover(category, event)

                    }

                    aria-haspopup={hasChildren ? 'true' : undefined}

                    aria-expanded={hasChildren ? isActive : undefined}

                  >

                    <span>{category.name}</span>

                    {hasChildren && (

                      <ChevronDown

                        size={13}

                        className="jnr-scroll-nav__chevron"

                      />

                    )}

                  </Link>

                );

              })}

            </div>

          </div>

          {activeCategory?.children?.length > 0 && (

            <div

              className="jnr-mega-menu"

              style={{

                left: `${menuPosition.left}px`,

                width: `${menuPosition.width}px`,

              }}

              role="region"

              aria-label={`${activeCategory.name} subcategories`}

              onMouseEnter={() =>

                setHoveredCategoryId(String(activeCategory.id))

              }

            >

              <div className="jnr-mega-menu__header">

                <div>

                  <h3>{activeCategory.name}</h3>

                  <p>Explore categories</p>

                </div>

                <Link

                  to={`/category/${activeCategory.slug}`}

                  className="jnr-mega-menu__view-all"

                >

                  View all <ChevronRight size={14} />

                </Link>

              </div>

              <div className="jnr-mega-menu__grid">

                {activeCategory.children.map((child) => (

                  <CategoryBranch key={child.id} category={child} />

                ))}

              </div>

            </div>

          )}

          <button

            ref={openButtonRef}

            className="jnr-scroll-nav__sidebar-trigger"

            type="button"

            onClick={() => {

              setHoveredCategoryId(null);

              setSidebarOpen(true);

            }}

            aria-label="Open all categories sidebar"

            aria-haspopup="dialog"

            aria-expanded={sidebarOpen}

          >

            <ChevronRight size={22} />

          </button>

        </div>

      </nav>

      {sidebarOpen && (

        <div

          className="jnr-cat-overlay"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) closeSidebar();

          }}

        >

          <aside

            ref={sidebarRef}

            className="jnr-cat-sidebar"

            role="dialog"

            aria-modal="true"

            aria-label="All product categories"

          >

            <div className="jnr-cat-sidebar__head">

              <div>

                <strong>All Categories</strong>

                <span>Explore JNRmart</span>

              </div>

              <button

                type="button"

                onClick={closeSidebar}

                aria-label="Close categories"

              >

                <X size={22} />

              </button>

            </div>

            <label className="jnr-cat-sidebar__search">

              <Search size={19} />

              <input

                ref={searchRef}

                type="search"

                placeholder="Search categories..."

                value={query}

                onChange={(event) => setQuery(event.target.value)}

                aria-label="Search all categories"

              />

            </label>

            <div className="jnr-cat-sidebar__items">

              <Link to="/" onClick={closeSidebar}>

                Home <ChevronRight size={16} />

              </Link>

              {loading && <p role="status">Loading categories...</p>}

              {!loading && error && (

                <div className="jnr-cat-sidebar__empty">

                  <p role="alert">{error}</p>

                  <button

                    type="button"

                    onClick={() => setReloadKey((key) => key + 1)}

                  >

                    Try Again

                  </button>

                </div>

              )}

              {!loading &&

                !error &&

                filteredCategories.map((category) => (

                  <Link

                    key={category.id}

                    to={`/category/${category.slug}`}

                    onClick={closeSidebar}

                    style={{

                      paddingLeft: `${12 + category.level * 18}px`,

                    }}

                  >

                    <span>{category.name}</span>

                    <ChevronRight size={16} />

                  </Link>

                ))}

              {!loading && !error && filteredCategories.length === 0 && (

                <p className="jnr-cat-sidebar__empty">

                  No matching categories.

                </p>

              )}

              <div className="jnr-cat-sidebar__quick-links">
                <h3>Quick Links</h3>

                <button type="button" onClick={openWishlistFromSidebar}>
                  <span>
                    <Heart size={17} aria-hidden="true" />
                    Wishlist
                    {wishlistCount > 0 && <small>{wishlistCount}</small>}
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>

                <Link to="/track-order" onClick={closeSidebar}>
                  <span>
                    <ClipboardList size={17} aria-hidden="true" />
                    Track Order
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>

                <Link to="/account" onClick={closeSidebar}>
                  <span>
                    <UserRound size={17} aria-hidden="true" />
                    My Account
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </div>

            </div>

            <div className="jnr-cat-sidebar__foot">

              {loading

                ? 'Loading...'

                : `${filteredCategories.length} categories`}

            </div>

          </aside>

        </div>

      )}

    </>

  );

}
