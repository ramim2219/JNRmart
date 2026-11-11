
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";

import ProductCard from "../common/ProductCard";

import {
  getPublicProducts,
  getPublicCategories,
} from "../../services/productServices";

import "../../styles/featured-products.css";

const PAGE_SIZE = 12;

// =========================================
// Extract API Collections
// =========================================

function extractCollection(response, key) {
  const root = Array.isArray(response?.data)
    ? response
    : response?.data ?? response;

  const candidates = [
    [root?.[key], root],
    [root?.data?.[key], root?.data],
    [root?.result?.[key], root?.result],
    [root?.data, root],
    [root?.result, root],
    [root, root],
  ];

  for (const [value, parent] of candidates) {
    if (Array.isArray(value)) {
      return {
        items: value,
        meta: parent?.meta ?? parent?.pagination ?? parent ?? {},
      };
    }

    if (Array.isArray(value?.data)) {
      return {
        items: value.data,
        meta: value.meta ?? value.pagination ?? value,
      };
    }

    if (Array.isArray(value?.items)) {
      return {
        items: value.items,
        meta: value.meta ?? value.pagination ?? value,
      };
    }
  }

  return { items: [], meta: {} };
}

// =========================================
// Extract Product Category Information
// =========================================

function getProductCategoryInfo(product) {
  const category = product?.category;

  const subCategory =
    product?.sub_category ??
    product?.subCategory ??
    product?.subcategory;

  const ids = [
    category?.id,
    product?.category_id,
    subCategory?.id,
    product?.sub_category_id,
    product?.subcategory_id,
  ].filter((id) => id != null);

  const names = [
    typeof category === "string" ? category : category?.name,
    product?.category_name,
    typeof subCategory === "string"
      ? subCategory
      : subCategory?.name,
    product?.sub_category_name,
  ]
    .filter(Boolean)
    .map((name) => String(name).trim().toLowerCase());

  return { ids, names };
}

// =========================================
// Flatten Nested Categories
// =========================================

function flattenCategories(categories) {
  const result = [];

  function traverse(items) {
    items.forEach((category) => {
      if (!category || typeof category !== "object") {
        return;
      }

      result.push(category);

      const children =
        category.children ??
        category.subcategories ??
        category.sub_categories ??
        category.subCategories;

      if (Array.isArray(children)) {
        traverse(children);
      }
    });
  }

  traverse(categories);

  return result;
}

// =========================================
// Normalize Categories
// Show Only Categories With Products
// =========================================

function normalizeCategories(response, products = []) {
  const { items } = extractCollection(response, "categories");

  const productCategoryIds = new Set();
  const productCategoryNames = new Set();

  // Collect categories actually used by products.
  products.forEach((product) => {
    const { ids, names } = getProductCategoryInfo(product);

    ids.forEach((id) => {
      productCategoryIds.add(String(id));
    });

    names.forEach((name) => {
      productCategoryNames.add(name);
    });
  });

  const seen = new Set();

  return flattenCategories(items)
    .map((category) => {
      const id = category.id ?? category.category_id;

      const name =
        category.name ??
        category.category_name ??
        category.title;

      return {
        ...category,
        id,
        name,
      };
    })
    .filter((category) => {
      if (category.id == null || !category.name) {
        return false;
      }

      const key = String(category.id);

      if (seen.has(key)) {
        return false;
      }

      const rawCount =
        category.public_products_count ??
        category.active_products_count ??
        category.products_count ??
        category.product_count;

      let hasProducts;

      if (rawCount != null && rawCount !== "") {
        const count = Number(rawCount);

        hasProducts = Number.isFinite(count)
          ? count > 0
          : false;
      } else {
        // Fallback: check actual products.
        hasProducts =
          productCategoryIds.has(key) ||
          productCategoryNames.has(
            String(category.name).trim().toLowerCase()
          );
      }

      if (!hasProducts) {
        return false;
      }

      seen.add(key);

      return true;
    });
}

// =========================================
// Pagination
// =========================================

function getPagination(meta, requestedPage, itemCount, pageSize) {
  const source =
    meta?.meta ??
    meta?.pagination ??
    meta ??
    {};

  const currentPage = Number(
    source.current_page ??
    source.currentPage ??
    requestedPage
  );

  const lastPage = Number(
    source.last_page ??
    source.lastPage ??
    0
  );

  const total = Number(source.total ?? 0);

  let hasMore;

  if (typeof source.has_more === "boolean") {
    hasMore = source.has_more;
  } else if (typeof source.hasMore === "boolean") {
    hasMore = source.hasMore;
  } else if ("next_page_url" in source) {
    hasMore = Boolean(source.next_page_url);
  } else if ("nextPageUrl" in source) {
    hasMore = Boolean(source.nextPageUrl);
  } else if (lastPage > 0) {
    hasMore = currentPage < lastPage;
  } else if (total > 0) {
    hasMore = currentPage * pageSize < total;
  } else {
    hasMore = itemCount >= pageSize;
  }

  return {
    currentPage,
    lastPage,
    total,
    hasMore,
  };
}

// =========================================
// Merge Products
// =========================================

function mergeProducts(current, incoming) {
  const seen = new Set(
    current
      .map(
        (product) =>
          product.id ??
          product.product_id ??
          product.slug ??
          product.sku
      )
      .filter((id) => id != null)
      .map(String)
  );

  const uniqueIncoming = incoming.filter((product) => {
    const id =
      product.id ??
      product.product_id ??
      product.slug ??
      product.sku;

    if (id == null) return true;

    const key = String(id);

    if (seen.has(key)) return false;

    seen.add(key);

    return true;
  });

  return [...current, ...uniqueIncoming];
}

// =========================================
// Featured Products Section
// =========================================

export default function FeaturedProductsSection({
  className = "",
  perPage = PAGE_SIZE,
}) {
  const [categoryResponse, setCategoryResponse] = useState(null);

  const [categoryProducts, setCategoryProducts] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");

  const [reloadToken, setReloadToken] = useState(0);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    hasMore: false,
  });

  const requestVersion = useRef(0);

  const pageSize = Math.max(1, Number(perPage) || PAGE_SIZE);

  // =========================================
  // Dynamic Categories
  // =========================================

  const categories = useMemo(
    () => normalizeCategories(categoryResponse, categoryProducts),
    [categoryResponse, categoryProducts]
  );

  // =========================================
  // Fetch Categories
  // =========================================

  useEffect(() => {
    const controller = new AbortController();

    let active = true;

    async function fetchCategories() {
      setCategoryLoading(true);
      setCategoryError("");

      try {
        const response = await getPublicCategories({
          signal: controller.signal,
        });

        if (!active) return;

        setCategoryResponse(response);
      } catch (err) {
        if (!active || controller.signal.aborted) return;

        setCategoryError(
          err.message || "Unable to load categories."
        );
      } finally {
        if (active) {
          setCategoryLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadToken]);

  // =========================================
  // Fetch Products
  // =========================================

  useEffect(() => {
    const controller = new AbortController();

    const version = ++requestVersion.current;

    let active = true;

    async function fetchProducts() {
      setLoading(true);
      setError("");
      setLoadMoreError("");

      setProducts([]);

      if (selectedCategoryId === null) {
        setCategoryProducts([]);
      }

      setPagination({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        hasMore: false,
      });

      const params = {
        page: 1,
        per_page: pageSize,
      };

      if (selectedCategoryId != null) {
        params.category_id = selectedCategoryId;
      }

      try {
        const response = await getPublicProducts(
          params,
          { signal: controller.signal }
        );

        if (!active || version !== requestVersion.current) {
          return;
        }

        const { items, meta } = extractCollection(
          response,
          "products"
        );

        setProducts(items);

        // Keep the unfiltered product categories.
        // They should not disappear when selecting a filter.
        if (selectedCategoryId === null) {
          setCategoryProducts(items);
        }

        setPagination(
          getPagination(meta, 1, items.length, pageSize)
        );
      } catch (err) {
        if (!active || controller.signal.aborted) return;

        setError(
          err.message || "Unable to load products."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      active = false;
      requestVersion.current += 1;
      controller.abort();
    };
  }, [selectedCategoryId, pageSize, reloadToken]);

  // =========================================
  // Category Filter
  // =========================================

  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  // =========================================
  // Load More Products
  // =========================================

  const handleLoadMore = async () => {
    if (!pagination.hasMore || loadingMore) return;

    const version = requestVersion.current;

    const nextPage = pagination.currentPage + 1;

    setLoadingMore(true);
    setLoadMoreError("");

    const params = {
      page: nextPage,
      per_page: pageSize,
    };

    if (selectedCategoryId != null) {
      params.category_id = selectedCategoryId;
    }

    try {
      const response = await getPublicProducts(params);

      if (version !== requestVersion.current) return;

      const { items, meta } = extractCollection(
        response,
        "products"
      );

      setProducts((current) =>
        mergeProducts(current, items)
      );

      // Discover additional categories while loading
      // more products in the All category.
      if (selectedCategoryId === null) {
        setCategoryProducts((current) =>
          mergeProducts(current, items)
        );
      }

      setPagination(
        getPagination(meta, nextPage, items.length, pageSize)
      );
    } catch (err) {
      if (version !== requestVersion.current) return;

      setLoadMoreError(
        err.message || "Unable to load more products."
      );
    } finally {
      if (version === requestVersion.current) {
        setLoadingMore(false);
      }
    }
  };

  // =========================================
  // Retry
  // =========================================

  const handleRetry = () => {
    setReloadToken((current) => current + 1);
  };

  // =========================================
  // Render
  // =========================================

  return (
    <section
      className={`container jnr-featured-products ${className}`.trim()}
      aria-label="Featured products"
    >
      {/* Header */}

      <div className="jnr-featured-header">

        {/* Dynamic Categories */}

        <div
          className="jnr-featured-filters"
          role="group"
          aria-label="Filter products by category"
        >
          <button
            type="button"
            className={`jnr-featured-filter ${
              selectedCategoryId === null ? "is-active" : ""
            }`}
            onClick={() => handleCategoryChange(null)}
            aria-pressed={selectedCategoryId === null}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`jnr-featured-filter ${
                String(selectedCategoryId) === String(category.id)
                  ? "is-active"
                  : ""
              }`}
              onClick={() => handleCategoryChange(category.id)}
              aria-pressed={
                String(selectedCategoryId) === String(category.id)
              }
            >
              {category.name}
            </button>
          ))}

          {categoryLoading && (
            <span className="jnr-featured-category-loading">
              Loading categories...
            </span>
          )}
        </div>

        {/* View All */}

        <Link
          to="/shop"
          className="jnr-featured-view-all"
        >
          View All
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {/* Category Error */}

      {categoryError && (
        <div
          className="jnr-featured-category-error"
          role="status"
        >
          <span>{categoryError}</span>

          <button type="button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}

      {loading ? (
        <div
          className="jnr-featured-grid"
          aria-label="Loading products"
          aria-busy="true"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              className="jnr-featured-skeleton-card"
              key={index}
            >
              <div className="jnr-featured-skeleton-image" />
              <div className="jnr-featured-skeleton-line" />
              <div className="jnr-featured-skeleton-line short" />
              <div className="jnr-featured-skeleton-line price" />
            </div>
          ))}
        </div>
      ) : error ? (

        /* Error */

        <div className="jnr-featured-state" role="alert">
          <RefreshCw size={30} />

          <h3>Unable to load products</h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={handleRetry}
            className="jnr-featured-retry"
          >
            Try Again
          </button>
        </div>

      ) : products.length > 0 ? (

        <>
          {/* Product Count */}

          <p
            className="jnr-featured-result-count"
            aria-live="polite"
          >
            {pagination.total > 0
              ? `${pagination.total} products`
              : `${products.length} products loaded`}
          </p>

          {/* Product Grid */}

          <div className="jnr-featured-grid">
            {products.map((product, index) => (
              <ProductCard
                key={
                  product.id ??
                  product.product_id ??
                  product.slug ??
                  index
                }
                product={product}
              />
            ))}
          </div>

          {/* Load More Error */}

          {loadMoreError && (
            <div
              className="jnr-featured-load-error"
              role="alert"
            >
              <span>{loadMoreError}</span>

              <button
                type="button"
                onClick={handleLoadMore}
              >
                Retry
              </button>
            </div>
          )}

          {/* Load More */}

          {pagination.hasMore && (
            <div className="jnr-featured-load-more">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  "Loading..."
                ) : (
                  <>
                    Load More Products
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </>

      ) : (

        /* Empty State */

        <div className="jnr-featured-state">
          <h3>No products found</h3>

          <p>
            {selectedCategoryId !== null
              ? "There are currently no products in this category."
              : "No products are currently available."}
          </p>

          {selectedCategoryId !== null && (
            <button
              type="button"
              className="jnr-featured-retry"
              onClick={() => handleCategoryChange(null)}
            >
              View All Products
            </button>
          )}
        </div>
      )}
    </section>
  );
}
