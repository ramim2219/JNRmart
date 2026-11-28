import { useEffect, useMemo, useRef, useState } from "react";

import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";

import {

  ChevronLeft,

  ChevronRight,

  ListFilter,

  SlidersHorizontal,

  X,

} from "lucide-react";

import {

  getPublicCategories,

  getPublicProducts,

} from "../services/productServices";
import {
  getPublicOfferShopProducts,
  getRunningPublicOffers,
} from "../services/offerZoneServices";

import ShopProductCard from "../components/shop/ShopProductCard";
import ShopComboCard from "../components/shop/ShopComboCard";
import { getPublicCombos } from "../services/publicComboServices";

import ShopFilters from "../components/shop/ShopFilters";

import {

  extractCategories,

  extractProductRows,

  flattenCategories,

  getPaginationMeta,

  normalizeShopProduct,

  slugify,

} from "../utils/shopApiHelpers";

import "../styles/shop-page.css";
import "../styles/combo-list-page.css";

const PAGE_SIZES = [12, 24, 36];

const API_PAGE_SIZE = 48;

const MAX_API_PAGES = 100;
const COMBO_CATEGORY_KEY = "__combo__";
const COMBO_PAGE_SIZE = 30;

const emptyFlags = {

  bestSelling: false,

  newArrival: false,

};

const countOptions = (items, key) => {

  const counts = new Map();

  items.forEach((item) => {

    const name = String(item?.[key] ?? "").trim();

    if (!name) return;

    counts.set(name, (counts.get(name) || 0) + 1);

  });

  return Array.from(counts, ([name, count]) => ({ name, count }))

    .sort((a, b) => a.name.localeCompare(b.name));

};

const matchesQuery = (product, query) => {

  const searchable = [

    product?.name,

    product?.brand,

    product?.shopSubCategory,

    product?.subCategory,

    product?.category,

    product?.sku,

  ]

    .filter(Boolean)

    .join(" ")

    .toLowerCase();

  return searchable.includes(query.toLowerCase());

};

// Calculate the real discount percentage from the original and current prices.
const getDiscountPercentage = (product) => {
  const oldPrice = Number(product?.oldPrice);
  const currentPrice = Number(product?.price);

  if (
    !Number.isFinite(oldPrice) ||
    !Number.isFinite(currentPrice) ||
    oldPrice <= 0 ||
    currentPrice <= 0 ||
    currentPrice >= oldPrice
  ) {
    return 0;
  }

  return ((oldPrice - currentPrice) / oldPrice) * 100;
};

/**

 * Resolve each product to its top-level category and, when available,

 * its actual child category. Category options are later built from products,

 * so categories without products are never displayed.

 */

function attachCategoryHierarchy(products, categories) {

  const categoryById = new Map(

    categories

      .filter((category) => category?.id != null)

      .map((category) => [String(category.id), category])

  );

  return products.map((product) => {

    const directCategory =

      product.categoryId != null

        ? categoryById.get(String(product.categoryId))

        : null;

    const parentId =

      directCategory?.parentId ??

      product.parentCategoryId ??

      null;

    const parentCategory =

      parentId != null

        ? categoryById.get(String(parentId))

        : null;

    const hasParent = parentId != null;

    const topCategoryName =

      parentCategory?.name ||

      directCategory?.parentName ||

      product.parentCategoryName ||

      product.category ||

      "";

    const topCategoryId =

      parentCategory?.id ??

      parentId ??

      directCategory?.id ??

      product.categoryId ??

      null;

    const topCategorySlug =

      parentCategory?.slug ||

      (topCategoryName ? slugify(topCategoryName) : "");

    const subCategoryName = hasParent

      ? directCategory?.name || product.category || ""

      : product.subCategory || "";

    const categoryKey =

      topCategoryId != null

        ? `id:${topCategoryId}`

        : topCategoryName

          ? `name:${slugify(topCategoryName)}`

          : "";

    return {

      ...product,

      shopCategoryId: topCategoryId,

      shopCategoryName: topCategoryName,

      shopCategorySlug: topCategorySlug,

      shopCategoryKey: categoryKey,

      shopSubCategoryId: hasParent

        ? directCategory?.id ?? product.subCategoryId ?? null

        : product.subCategoryId ?? null,

      shopSubCategory: String(subCategoryName).trim(),

    };

  });

}

/**

 * Read the category IDs and names attached to a normalized product.

 * This follows the same product-driven matching approach used by

 * FeaturedProductsSection: a category is available only when at least

 * one loaded product references that category.

 */

function getProductCategoryInfo(product) {

  const category = product?.category;

  const subCategory =

    product?.sub_category ??

    product?.subCategory ??

    product?.subcategory;

  const ids = [

    category?.id,

    product?.categoryId,

    product?.category_id,

    product?.shopCategoryId,

    product?.parentCategoryId,

    product?.parent_category_id,

    subCategory?.id,

    product?.subCategoryId,

    product?.sub_category_id,

    product?.subcategory_id,

    product?.shopSubCategoryId,

  ]

    .filter((id) => id !== undefined && id !== null && id !== "")

    .map(String);

  const names = [

    typeof category === "string" ? category : category?.name,

    product?.category_name,

    product?.shopCategoryName,

    typeof subCategory === "string"

      ? subCategory

      : subCategory?.name,

    product?.subCategory,

    product?.sub_category_name,

    product?.shopSubCategory,

    product?.parentCategoryName,

    product?.parent_category_name,

  ]

    .map((value) => {

      if (typeof value === "string") return value;

      return value?.name ?? value?.display_name ?? "";

    })

    .filter(Boolean)

    .map((name) => String(name).trim().toLowerCase());

  return { ids, names };

}

/**

 * Build the Filter by Category options from the public category API,

 * then keep only categories actually referenced by the loaded products.

 * Product counts are calculated from the same product collection, rather

 * than showing every category returned by the category endpoint.

 */

function buildAvailableCategories(products, categories) {

  const categoryList = Array.isArray(categories) ? categories : [];

  const productList = Array.isArray(products) ? products : [];

  const matchedCategories = categoryList

    .map((category) => {

      const id = category?.id ?? category?.category_id;

      const name =

        category?.name ??

        category?.category_name ??

        category?.title ??

        "";

      if (id == null || !String(name).trim()) return null;

      const normalizedName = String(name).trim().toLowerCase();

      const count = productList.filter((product) => {

        const info = getProductCategoryInfo(product);

        return (

          info.ids.includes(String(id)) ||

          info.names.includes(normalizedName)

        );

      }).length;

      if (count === 0) return null;

      return {

        key: `id:${id}`,

        id,

        name: String(name).trim(),

        slug: category.slug || category.category_slug || slugify(name),

        parentId:

          category.parentId ??

          category.parent_id ??

          category.parent_category_id ??

          null,

        count,

      };

    })

    .filter(Boolean);

  // Avoid duplicate options if the category endpoint contains duplicate rows.

  const seen = new Set();

  const uniqueCategories = matchedCategories.filter((category) => {

    if (seen.has(String(category.id))) return false;

    seen.add(String(category.id));

    return true;

  });

  // Fallback to product category values if the public category endpoint

  // returned no usable categories.

  if (uniqueCategories.length === 0) {

    const counts = new Map();

    productList.forEach((product) => {

      const productCategoryValues = [

        {

          id: product?.shopCategoryId ?? product?.parentCategoryId ?? product?.categoryId,

          name: product?.shopCategoryName || product?.parentCategoryName || product?.category,

          slug: product?.shopCategorySlug || product?.categorySlug,

        },

        {

          id: product?.shopSubCategoryId ?? product?.subCategoryId ?? null,

          name: product?.shopSubCategory || product?.subCategory || "",

          slug: "",

        },

      ];

      productCategoryValues.forEach(({ id, name, slug }) => {

        const cleanName = String(name ?? "").trim();

        if (!cleanName) return;

        const key = id != null

          ? `id:${id}`

          : `name:${slugify(cleanName)}`;

        const current = counts.get(key);

        if (current) {

          current.count += 1;

        } else {

          counts.set(key, {

            key,

            id,

            name: cleanName,

            slug: slug || slugify(cleanName),

            count: 1,

          });

        }

      });

    });

    return Array.from(counts.values()).sort((a, b) =>

      a.name.localeCompare(b.name)

    );

  }

  return uniqueCategories.sort((a, b) =>

    a.name.localeCompare(b.name)

  );

}

/**

 * Match a product against the selected API category. Both direct category

 * and parent category IDs are supported, so parent and child categories

 * can be selected without losing the other available filter options.

 */

function productMatchesCategory(product, category) {

  if (!category) return false;

  const { ids, names } = getProductCategoryInfo(product);

  return (

    (category.id != null && ids.includes(String(category.id))) ||

    names.includes(String(category.name).trim().toLowerCase())

  );

}

function Pagination({ page, pages, onChange }) {

  if (pages <= 1) return null;

  const possible = new Set([1, pages, page - 1, page, page + 1]);

  const numbers = Array.from(possible)

    .filter((number) => number > 0 && number <= pages)

    .sort((a, b) => a - b);

  let previous = 0;

  return (

    <nav className="jnr-shop-pagination" aria-label="Product pagination">

      <button

        type="button"

        disabled={page === 1}

        onClick={() => onChange(page - 1)}

        aria-label="Previous page"

      >

        <ChevronLeft size={18} />

      </button>

      {numbers.map((number) => {

        const gap = number - previous > 1;

        previous = number;

        return (

          <span className="jnr-shop-pagination__part" key={number}>

            {gap && (

              <span className="jnr-shop-pagination__ellipsis">…</span>

            )}

            <button

              type="button"

              onClick={() => onChange(number)}

              aria-current={page === number ? "page" : undefined}

              className={page === number ? "is-active" : ""}

            >

              {number}

            </button>

          </span>

        );

      })}

      <button

        type="button"

        disabled={page === pages}

        onClick={() => onChange(page + 1)}

        aria-label="Next page"

      >

        <ChevronRight size={18} />

      </button>

    </nav>

  );

}

/**

 * Load the complete public product collection page-by-page.

 *

 * The current public endpoint supports search and pagination, but the supplied

 * service does not expose server-side price, subcategory, or product-flag

 * filters. Loading the pages lets this page keep those filters functional.

 */

async function fetchAllPublicProducts({ search, signal, offerId, offerFilter }) {

  const allRows = [];

  const seenIds = new Set();

  let page = 1;

  let lastPage = 1;

  while (page <= lastPage && page <= MAX_API_PAGES) {

    const params = {
      ...(search ? { search } : {}),
      ...(!offerId && offerFilter === "only" ? { offer_filter: "only" } : {}),
      page,
      per_page: API_PAGE_SIZE,
    };
    const response = offerId
      ? await getPublicOfferShopProducts(offerId, params, { signal })
      : await getPublicProducts(params, { signal });

    const rows = extractProductRows(response);

    rows.forEach((row, index) => {

      const key = row?.id ?? row?.sku ?? `${page}-${index}`;

      if (seenIds.has(String(key))) return;

      seenIds.add(String(key));

      allRows.push(row);

    });

    const pagination = getPaginationMeta(response, API_PAGE_SIZE);

    if (pagination.lastPage) {

      lastPage = pagination.lastPage;

    } else if (rows.length >= API_PAGE_SIZE) {

      // If the API omits pagination metadata, continue while a full page arrives.

      lastPage = page + 1;

    } else {

      lastPage = page;

    }

    if (!rows.length) break;

    page += 1;

  }

  return allRows.map(normalizeShopProduct).filter(Boolean);

}

// Uses the same read-only public combo endpoint as the original /combos page.
// Keep combo IDs separate from product IDs; combo cards do not use ProductCard/cart.
async function fetchAllPublicCombos(signal) {
  const rows = [];
  const seen = new Set();
  let page = 1;
  let lastPage = 1;
  while (page <= lastPage && page <= MAX_API_PAGES) {
    const response = await getPublicCombos({ page, perPage: COMBO_PAGE_SIZE, signal });
    for (const combo of response.data || []) {
      const key = String(combo?.id ?? "");
      if (!key || seen.has(key)) continue;
      seen.add(key);
      rows.push(combo);
    }
    lastPage = Math.max(page, Number(response?.meta?.last_page) || page);
    if (!response.data?.length) break;
    page += 1;
  }
  return rows;
}

export default function ShopPage() {

  const { slug } = useParams();

  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCombo = searchParams.get("category") === "combo";
  // Persistent shareable filter, e.g. /shop?offerId=2.
  const requestedOfferId = searchParams.get("offerId") || "";
  const selectedOfferId = /^[1-9]\d*$/.test(requestedOfferId)
    ? requestedOfferId
    : "";
  // /shop?offerFilter=only displays every product in a currently running offer.
  // A specific offerId takes precedence if both parameters exist in a shared URL.
  const onlyRunningOffers = !selectedOfferId && searchParams.get("offerFilter") === "only";

  const searchText = (searchParams.get("q") || "").trim();

  const isSearch = location.pathname === "/search";

  const isOffer = slug === "offer-zone";

  // minDiscount=10 means products with a discount strictly greater than 10%.
  const rawMinDiscount = searchParams.get("minDiscount");
  const minDiscount = rawMinDiscount === null ? null : Number(rawMinDiscount);
  const isDiscountFilter =
    rawMinDiscount !== null &&
    rawMinDiscount.trim() !== "" &&
    Number.isFinite(minDiscount) &&
    minDiscount >= 0 &&
    minDiscount < 100;

  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [runningOffers, setRunningOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState("");
  const [offersRetry, setOffersRetry] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [retryKey, setRetryKey] = useState(0);

  const [selectedCategoryKey, setSelectedCategoryKey] = useState(
    () => requestedCombo ? COMBO_CATEGORY_KEY : ""
  );
  const isComboMode = selectedCategoryKey === COMBO_CATEGORY_KEY;
  const [combos, setCombos] = useState([]);
  const [comboLoading, setComboLoading] = useState(false);
  const [comboError, setComboError] = useState("");
  const [comboRetry, setComboRetry] = useState(0);

  const [selectedSubCategories, setSelectedSubCategories] = useState(

    () => new Set()

  );

  const [selectedBrands, setSelectedBrands] = useState(() => new Set());

  const [flags, setFlags] = useState(emptyFlags);

  const [priceMin, setPriceMin] = useState(0);

  const [priceMax, setPriceMax] = useState(500);

  const [sort, setSort] = useState("default");

  const [pageSize, setPageSize] = useState(12);

  const [page, setPage] = useState(1);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const drawerRef = useRef(null);

  const triggerRef = useRef(null);

  const resultsRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadOffers() {
      setOffersLoading(true);
      setOffersError("");
      try {
        const activeOffers = await getRunningPublicOffers({ signal: controller.signal });
        if (active) setRunningOffers(activeOffers);
      } catch (requestError) {
        if (!active || controller.signal.aborted) return;
        setRunningOffers([]);
        setOffersError(requestError?.message || "Unable to load offers.");
      } finally {
        if (active) setOffersLoading(false);
      }
    }

    void loadOffers();
    return () => {
      active = false;
      controller.abort();
    };
  }, [offersRetry]);

  useEffect(() => {

    const controller = new AbortController();

    let active = true;

    async function loadShopData() {

      setLoading(true);

      setError("");

      try {

        const [categoryResult, productResult] = await Promise.allSettled([

          getPublicCategories({ signal: controller.signal }),

          fetchAllPublicProducts({

            search: isSearch && searchText ? searchText : "",

            signal: controller.signal,
            offerId: selectedOfferId,
            offerFilter: onlyRunningOffers ? "only" : "all",

          }),

        ]);

        if (!active) return;

        if (categoryResult.status === "fulfilled") {

          setCategories(flattenCategories(extractCategories(categoryResult.value)));

        } else {

          console.warn(

            "[Shop] Category API request failed:",

            categoryResult.reason

          );

          setCategories([]);

        }

        if (productResult.status === "rejected") {

          throw productResult.reason;

        }

        setProducts(productResult.value);

      } catch (requestError) {

        if (!active || controller.signal.aborted) return;

        console.error("[Shop] API request failed:", requestError);

        setError(

          requestError?.message ||

            "Unable to load products. Please try again."

        );

        setProducts([]);

      } finally {

        if (active) setLoading(false);

      }

    }

    loadShopData();

    return () => {

      active = false;

      controller.abort();

    };

  }, [isSearch, searchText, retryKey, selectedOfferId, onlyRunningOffers]);

  // Fetch actual Combo bundles only while the Combo category is selected.
  // Cancellation keeps stale requests from replacing a newer category selection.
  useEffect(() => {
    if (!isComboMode) return undefined;
    const controller = new AbortController();
    let active = true;
    async function loadCombos() {
      setComboLoading(true);
      setComboError("");
      try {
        const results = await fetchAllPublicCombos(controller.signal);
        if (active) setCombos(results);
      } catch (requestError) {
        if (!active || controller.signal.aborted || requestError?.code === "ERR_CANCELED") return;
        setComboError(requestError?.message || "Unable to load combo deals.");
        setCombos([]);
      } finally {
        if (active) setComboLoading(false);
      }
    }
    void loadCombos();
    return () => { active = false; controller.abort(); };
  }, [isComboMode, comboRetry]);

  const comboCatalog = useMemo(() => combos.map((combo) => ({
    id: `combo-${combo.id}`,
    name: combo.name || "Combo deal",
    price: Number(combo.pricing?.final_price ?? combo.pricing?.current_price) || 0,
    oldPrice: Number(combo.pricing?.actual_price) || 0,
    createdAt: Number(combo.id) || 0,
    bestSelling: false,
    newArrival: false,
    rawCombo: combo,
  })), [combos]);

  const catalogProducts = useMemo(

    () => attachCategoryHierarchy(products, categories),

    [products, categories]

  );

  // The route category is an initial filter only. It must not permanently

  // narrow the catalog, otherwise selecting another sidebar category would

  // intersect with the original Home Page category and return no products.

  const baseProducts = useMemo(() => {
    let result = [...catalogProducts];

    if (isSearch && searchText) {
      result = result.filter((item) => matchesQuery(item, searchText));
    }

    // Keep the existing Offer Zone behavior: show every discounted product.
    if (isOffer && !selectedOfferId) {
      result = result.filter(
        (item) =>
          Number(item.oldPrice) > Number(item.price) &&
          Number(item.price) > 0
      );
    }

    // Discount quick cards use a strict threshold:
    // 10% card => discount > 10%, 20% card => discount > 20%, etc.
    if (isDiscountFilter) {
      result = result.filter(
        (item) => getDiscountPercentage(item) > minDiscount
      );
    }

    return result;
  }, [
    catalogProducts,
    isSearch,
    searchText,
    isOffer,
    selectedOfferId,
    isDiscountFilter,
    minDiscount,
  ]);

  // Keep the full catalog as the source for category options, regardless

  // of the currently selected category.

  const categoryProducts = catalogProducts;

  const availableCategories = useMemo(
    () => [
      ...buildAvailableCategories(categoryProducts, categories),
      { key: COMBO_CATEGORY_KEY, name: "Combo", count: combos.length || null },
    ],
    [categoryProducts, categories, combos.length]
  );

  // Resolve a category route (for example /category/mens-shoes) to the

  // corresponding available filter option.

  const routeCategory = useMemo(() => {

    if (!slug || isOffer || isSearch || isDiscountFilter) return null;

    const numericSlug = Number(slug);

    return (

      availableCategories.find(

        (category) =>

          category.slug === slug ||

          slugify(category.name) === slug ||

          String(category.id) === slug ||

          (Number.isSafeInteger(numericSlug) &&

            numericSlug > 0 &&

            Number(category.id) === numericSlug)

      ) || null

    );

  }, [availableCategories, slug, isOffer, isSearch, isDiscountFilter]);

  const selectedCategory = useMemo(

    () =>

      availableCategories.find(

        (category) => category.key === selectedCategoryKey

      ) || null,

    [availableCategories, selectedCategoryKey]

  );

  const title = isComboMode
    ? "Combo Deals"
    : isSearch
    ? "Search Results"
    : isDiscountFilter
      ? `More than ${minDiscount}% Off`
      : selectedOfferId || onlyRunningOffers || isOffer
        ? "Offer Zone"
        : selectedCategory?.name || "Shop All Products";

  const categoryFilteredProducts = useMemo(() => {

    if (isComboMode) return comboCatalog;
    if (!selectedCategory) return baseProducts;

    return baseProducts.filter((product) =>

      productMatchesCategory(product, selectedCategory)

    );

  }, [baseProducts, selectedCategory, isComboMode, comboCatalog]);

  const ceiling = useMemo(() => {

    const maximum = Math.max(

      0,

      ...(isComboMode ? comboCatalog : baseProducts).map((product) => Number(product.price) || 0)

    );

    return Math.max(500, Math.ceil(maximum / 500) * 500);

  }, [baseProducts, isComboMode, comboCatalog]);

  // Category options always come from the full route product collection.

  // Selecting a category must filter the grid, not hide the other categories.

  const subCategories = useMemo(

    () => countOptions(

      categoryFilteredProducts.filter((product) => product.shopSubCategory),

      "shopSubCategory"

    ),

    [categoryFilteredProducts]

  );

  const brands = useMemo(

    () => countOptions(categoryFilteredProducts, "brand"),

    [categoryFilteredProducts]

  );

  const changeSelectedOffer = (offerId) => {
    const next = new URLSearchParams(searchParams);
    next.delete("offerId");
    next.delete("offerFilter");
    // Offer zone and Combo are independent product catalogues.
    next.delete("category");
    if (isComboMode) setSelectedCategoryKey("");
    if (offerId === "all-running") {
      next.set("offerFilter", "only");
    } else if (offerId) {
      next.set("offerId", String(offerId));
    }
    setSearchParams(next);
    setPage(1);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("offerId");
    next.delete("offerFilter");
    next.delete("category");
    setSearchParams(next);
    setSelectedCategoryKey("");

    setSelectedSubCategories(new Set());

    setSelectedBrands(new Set());

    setFlags({ ...emptyFlags });

    setPriceMin(0);

    setPriceMax(ceiling);

  };

  // When entering a category URL from the Home Page, preselect that

  // category in the sidebar. After that, the user can freely choose any

  // other category or All Categories without being locked to the route slug.

  useEffect(() => {

    setSelectedCategoryKey(requestedCombo ? COMBO_CATEGORY_KEY : (routeCategory?.key ?? ""));

    setSelectedSubCategories(new Set());

    setSelectedBrands(new Set());

    setFlags({ ...emptyFlags });

    setPriceMin(0);

    setPriceMax(ceiling);

    setSort("default");

    setPage(1);

    setMobileFiltersOpen(false);

  }, [

    slug,

    isSearch,

    searchText,

    isOffer,

    isDiscountFilter,

    minDiscount,

    routeCategory?.key,

  ]);

  // Header navigation to/from Combo should not clear a regular category
  // explicitly chosen from the sidebar.
  useEffect(() => {
    setSelectedCategoryKey((current) =>
      requestedCombo ? COMBO_CATEGORY_KEY :
      current === COMBO_CATEGORY_KEY ? "" : current
    );
    if (requestedCombo) {
      setSelectedSubCategories(new Set());
      setSelectedBrands(new Set());
      setFlags({ ...emptyFlags });
      setPriceMin(0);
      setSort("default");
      setPage(1);
    }
  }, [requestedCombo]);

  // Keep the price slider ceiling in sync with the loaded catalog without

  // resetting the selected category whenever the maximum price changes.

  useEffect(() => {

    setPriceMax(ceiling);

  }, [ceiling]);

  useEffect(() => {

    if (!mobileFiltersOpen) return undefined;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {

      if (event.key === "Escape") {

        setMobileFiltersOpen(false);

        return;

      }

      if (event.key !== "Tab") return;

      const focusable =

        drawerRef.current?.querySelectorAll(

          'button:not([disabled]), input:not([disabled]), select:not([disabled])'

        );

      if (!focusable?.length) return;

      const first = focusable[0];

      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {

        event.preventDefault();

        last.focus();

      } else if (

        !event.shiftKey &&

        document.activeElement === last

      ) {

        event.preventDefault();

        first.focus();

      }

    };

    document.addEventListener("keydown", onKeyDown);

    drawerRef.current

      ?.querySelector(".jnr-shop-mobile-drawer__close")

      ?.focus();

    return () => {

      document.body.style.overflow = originalOverflow;

      document.removeEventListener("keydown", onKeyDown);

      triggerRef.current?.focus({ preventScroll: true });

    };

  }, [mobileFiltersOpen]);

  const filteredProducts = useMemo(() => {

    const filtered = categoryFilteredProducts.filter((item) => {

      if (

        selectedSubCategories.size &&

        !selectedSubCategories.has(item.shopSubCategory)

      ) {

        return false;

      }

      if (

        selectedBrands.size &&

        !selectedBrands.has(item.brand)

      ) {

        return false;

      }

      const price = Number(item.price) || 0;

      if (!isComboMode && (price < priceMin || price > priceMax)) {

        return false;

      }

      if (flags.bestSelling || flags.newArrival) {

        const matchesFlag =

          (flags.bestSelling && item.bestSelling) ||

          (flags.newArrival && item.newArrival);

        if (!matchesFlag) return false;

      }

      return true;

    });

    if (!isComboMode && sort === "low-price") {

      filtered.sort((a, b) => a.price - b.price);

    }

    if (!isComboMode && sort === "high-price") {

      filtered.sort((a, b) => b.price - a.price);

    }

    if (sort === "az") {

      filtered.sort((a, b) => a.name.localeCompare(b.name));

    }

    if (sort === "newest") {

      filtered.sort((a, b) => b.createdAt - a.createdAt);

    }

    if (sort === "popular") {

      filtered.sort(

        (a, b) => Number(b.bestSelling) - Number(a.bestSelling)

      );

    }

    return filtered;

  }, [

    categoryFilteredProducts,

    selectedSubCategories,

    selectedBrands,

    priceMin,

    priceMax,

    flags,
    isComboMode,

    sort,

  ]);

  const totalPages = Math.max(

    1,

    Math.ceil(filteredProducts.length / pageSize)

  );

  const safePage = Math.min(page, totalPages);

  const currentProducts = filteredProducts.slice(

    (safePage - 1) * pageSize,

    safePage * pageSize

  );

  const start = filteredProducts.length

    ? (safePage - 1) * pageSize + 1

    : 0;

  const end = Math.min(

    safePage * pageSize,

    filteredProducts.length

  );

  const hasFilters =

    Boolean(selectedOfferId) ||
    onlyRunningOffers ||
    Boolean(selectedCategoryKey) ||

    selectedSubCategories.size > 0 ||

    selectedBrands.size > 0 ||

    flags.bestSelling ||

    flags.newArrival ||

    priceMin > 0 ||

    priceMax < ceiling;

  useEffect(() => {

    setPage(1);

  }, [

    selectedOfferId,
    onlyRunningOffers,
    selectedCategoryKey,

    selectedSubCategories,

    selectedBrands,

    flags,

    priceMin,

    priceMax,

    sort,

    pageSize,

  ]);

  const changePage = (newPage) => {

    setPage(Math.max(1, Math.min(totalPages, newPage)));

    resultsRef.current?.scrollIntoView({

      behavior: window.matchMedia?.(

        "(prefers-reduced-motion: reduce)"

      ).matches

        ? "auto"

        : "smooth",

      block: "start",

    });

  };

  const listingLoading = isComboMode ? comboLoading : loading;
  const listingError = isComboMode ? comboError : error;
  const retryListing = () => {
    if (isComboMode) setComboRetry((value) => value + 1);
    else setRetryKey((value) => value + 1);
  };

  const filterProps = {
    comboMode: isComboMode,
    runningOffers,
    selectedOfferId,
    onlyRunningOffers,
    offersLoading,
    offersError,
    onOfferChange: changeSelectedOffer,
    onRetryOffers: () => setOffersRetry((value) => value + 1),

    categories: availableCategories,

    selectedCategoryKey,

    onCategoryChange: (categoryKey) => {
      const next = new URLSearchParams(searchParams);
      next.delete("category");
      if (categoryKey === COMBO_CATEGORY_KEY) {
        next.set("category", "combo");
        next.delete("offerId");
        next.delete("offerFilter");
      }
      setSearchParams(next);
      setSelectedCategoryKey(categoryKey);
      setSelectedSubCategories(new Set());
      setSelectedBrands(new Set());
      setFlags({ ...emptyFlags });
      setPriceMin(0);
      setSort("default");
      setPage(1);
    },

    subCategories,

    brands,

    selectedSubCategories,

    selectedBrands,

    onSubCategoryChange: setSelectedSubCategories,

    onBrandChange: setSelectedBrands,

    flags,

    onFlagsChange: setFlags,

    priceMin,

    priceMax,

    ceiling,

    onPriceChange: (minimum, maximum) => {

      setPriceMin(minimum);

      setPriceMax(maximum);

    },

    onClear: clearFilters,

  };

  return (

    <section className="jnr-shop-page">

      <div className="container jnr-shop-container">

        <div className="jnr-shop-heading">

          <div>

            <h1>{title}</h1>

            {isSearch && searchText && (
              <p>Results for “{searchText}”</p>
            )}
            {isDiscountFilter && (
              <p>Showing products with more than {minDiscount}% discount.</p>
            )}
            {selectedOfferId && (
              <p>
                Offer Zone: {runningOffers.find((offer) => String(offer.id) === selectedOfferId)?.name || "Selected Offer"}
              </p>
            )}
            {onlyRunningOffers && !isComboMode && (
              <p>Products participating in all current offers.</p>
            )}
            {isComboMode && (
              <p>Explore currently available online combo bundles and their included products.</p>
            )}

          </div>

          <nav

            className="jnr-shop-breadcrumb"

            aria-label="Breadcrumb"

          >

            <Link to="/">Home</Link>

            <ChevronRight size={14} aria-hidden="true" />

            <span aria-current="page">{title}</span>

          </nav>

        </div>

        {listingLoading ? (

          <div className="jnr-shop-no-products" role="status">

            <p>{isComboMode ? "Loading combo deals..." : "Loading products..."}</p>

          </div>

        ) : listingError ? (

          <div className="jnr-shop-no-products" role="alert">

            <SlidersHorizontal size={40} strokeWidth={1.3} />

            <h2>{isComboMode ? "Unable to load combo deals" : "Unable to load products"}</h2>

            <p>{listingError}</p>

            <button

              type="button"

              onClick={retryListing}

            >

              Try Again

            </button>

          </div>

        ) : (

          <>

            <div className="jnr-shop-layout">

            <aside

              className="jnr-shop-aside"

              aria-label="Product filters"

            >

              <ShopFilters {...filterProps} />

            </aside>

            <div className="jnr-shop-content" ref={resultsRef}>

              <div className="jnr-shop-toolbar">

                <button

                  type="button"

                  className="jnr-shop-mobile-filter-btn"

                  ref={triggerRef}

                  onClick={() => setMobileFiltersOpen(true)}

                  aria-haspopup="dialog"

                  aria-expanded={mobileFiltersOpen}

                >

                  <ListFilter size={17} />

                  Filters

                  {hasFilters && (

                    <span className="jnr-shop-active-dot" />

                  )}

                </button>

                <label className="jnr-shop-sort">

                  <span>Sort By:</span>

                  <select

                    value={sort}

                    onChange={(event) => setSort(event.target.value)}

                    aria-label="Sort products"

                  >

                    <option value="default">Default Sorting</option>

                    <option value="popular">Best Selling</option>

                    <option value="newest">Newest First</option>

                    {!isComboMode && <option value="low-price">Price: Low to High</option>}

                    {!isComboMode && <option value="high-price">Price: High to Low</option>}

                    <option value="az">Name: A to Z</option>

                  </select>

                </label>

                <span className="jnr-shop-count">

                  Showing {start}–{end} of {filteredProducts.length}

                </span>

                <label className="jnr-shop-per-page">

                  <span>Show:</span>

                  <select

                    value={pageSize}

                    onChange={(event) =>

                      setPageSize(Number(event.target.value))

                    }

                    aria-label="Products per page"

                  >

                    {PAGE_SIZES.map((size) => (

                      <option value={size} key={size}>

                        {size}

                      </option>

                    ))}

                  </select>

                </label>

              </div>

              {hasFilters && (

                <div className="jnr-shop-filter-notice">

                  <SlidersHorizontal size={14} />

                  <span>Filters applied</span>

                  <button type="button" onClick={clearFilters}>

                    Clear all <X size={13} />

                  </button>

                </div>

              )}

              {currentProducts.length ? (
                <div className="jnr-shop-products">
                  {currentProducts.map((product, index) => (
                    isComboMode
                      ? <ShopComboCard key={product.id} combo={product.rawCombo} />
                      : <ShopProductCard key={product.id ?? product.slug ?? index} product={product} />
                  ))}
                </div>

              ) : (

                <div className="jnr-shop-no-products">

                  <SlidersHorizontal size={40} strokeWidth={1.3} />

                  <h2>{isComboMode ? "No combo deals found" : "No products found"}</h2>

                  <p>

                    {isComboMode
                      ? "No available combo bundles match your filters."
                      : isDiscountFilter
                      ? `No products found with more than ${minDiscount}% discount.`
                      : isSearch
                        ? "Try another search or remove a filter."
                        : "Try changing your filters to see more products."}

                  </p>

                  {hasFilters && (

                    <button type="button" onClick={clearFilters}>

                      Clear Filters

                    </button>

                  )}

                  {!hasFilters && (

                    <Link to="/shop">Browse All Products</Link>

                  )}

                </div>

              )}

              <Pagination

                page={safePage}

                pages={totalPages}

                onChange={changePage}

              />

            </div>

            </div>

          </>

        )}

      </div>

      {mobileFiltersOpen && !listingLoading && !listingError && (

        <div className="jnr-shop-mobile-filter-layer">

          <div

            className="jnr-shop-mobile-backdrop"

            onClick={() => setMobileFiltersOpen(false)}

            aria-hidden="true"

          />

          <aside

            ref={drawerRef}

            className="jnr-shop-mobile-drawer"

            role="dialog"

            aria-modal="true"

            aria-labelledby="jnr-mobile-filter-title"

          >

            <div className="jnr-shop-mobile-drawer__header">

              <h2 id="jnr-mobile-filter-title">Filter Products</h2>

              <button

                type="button"

                className="jnr-shop-mobile-drawer__close"

                onClick={() => setMobileFiltersOpen(false)}

                aria-label="Close filters"

              >

                <X size={22} />

              </button>

            </div>

            <div className="jnr-shop-mobile-drawer__body">

              <ShopFilters {...filterProps} showClear={false} />

            </div>

            <div className="jnr-shop-mobile-drawer__footer">

              <button

                type="button"

                className="jnr-shop-mobile-drawer__reset"

                onClick={clearFilters}

              >

                Reset

              </button>

              <button

                type="button"

                className="jnr-shop-mobile-drawer__apply"

                onClick={() => setMobileFiltersOpen(false)}

              >

                Show {filteredProducts.length} Products

              </button>

            </div>

          </aside>

        </div>

      )}

    </section>

  );

}
