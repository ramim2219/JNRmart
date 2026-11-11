import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  SearchX,
} from "lucide-react";

import ProductDealsSection from "../components/common/ProductDealsSection";
import ProductGallery from "../components/product/ProductGallery";
import ProductPurchasePanel from "../components/product/ProductPurchasePanel";
import ProductDetailsTabs from "../components/product/ProductDetailsTabs";

import {
  getPublicProductById,
  getPublicProducts,
} from "../services/productServices";

import { normalizePublicProduct } from "../utils/productHelpers";

import "../styles/product-details.css";

// The existing route may still be /product/:slug.
// This backend integration expects that route parameter to contain the product ID.
function extractSingleProduct(response) {
  const candidates = [
    response?.product,
    response?.data?.product,
    response?.data?.data?.product,
    response?.result?.product,
    response?.data?.data,
    response?.data,
    response?.result,
    response,
  ];

  return (
    candidates.find(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        item.id != null
    ) || null
  );
}

function extractProducts(response) {
  const candidates = [
    response?.products,
    response?.data?.products,
    response?.data?.data?.products,
    response?.result?.products,
    response?.data?.data,
    response?.data,
    response?.result,
    response,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) return item;
    if (Array.isArray(item?.data)) return item.data;
    if (Array.isArray(item?.items)) return item.items;
  }

  return [];
}

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const productId = Number(slug);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function fetchProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setRelatedProducts([]);

      window.scrollTo({ top: 0, behavior: "auto" });

      if (!Number.isSafeInteger(productId) || productId <= 0) {
        setError("Invalid product ID.");
        setLoading(false);
        return;
      }

      try {
        console.log("[ProductDetails] Fetching product:", productId);

        const response = await getPublicProductById(productId, {
          signal: controller.signal,
        });

        console.log("[ProductDetails] API response:", response);

        if (!active) return;

        const rawProduct = extractSingleProduct(response);

        if (!rawProduct) {
          throw new Error("Product not found.");
        }

        const normalizedProduct = normalizePublicProduct(rawProduct);

        if (!normalizedProduct) {
          throw new Error("Unable to process product data.");
        }

        console.log(
          "[ProductDetails] Normalized product:",
          normalizedProduct
        );

        setProduct(normalizedProduct);
        setActiveTab("description");
      } catch (err) {
        if (!active || controller.signal.aborted) return;

        console.error("[ProductDetails] Fetch error:", err);
        setError(err.message || "Unable to load product details.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      active = false;
      controller.abort();
    };
  }, [productId, retryToken]);

  useEffect(() => {
    if (!product) return undefined;

    const previousTitle = document.title;
    document.title = `${product.name} | JNRmart`;

    return () => {
      document.title = previousTitle || "JNRmart";
    };
  }, [product]);

  useEffect(() => {
    if (!product?.categoryId) {
      setRelatedProducts([]);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    async function fetchRelatedProducts() {
      try {
        const response = await getPublicProducts(
          {
            category_id: product.categoryId,
            page: 1,
            per_page: 6,
          },
          { signal: controller.signal }
        );

        if (!active) return;

        const items = extractProducts(response);

        const related = items
          .filter(
            (item) => String(item.id) !== String(product.id)
          )
          .map(normalizePublicProduct)
          .filter(Boolean);

        setRelatedProducts(related);
      } catch (err) {
        if (!active || controller.signal.aborted) return;

        console.error("[ProductDetails] Related products error:", err);
        setRelatedProducts([]);
      }
    }

    fetchRelatedProducts();

    return () => {
      active = false;
      controller.abort();
    };
  }, [product?.id, product?.categoryId]);

  const showReviews = () => {
    setActiveTab("reviews");

    window.requestAnimationFrame(() => {
      const section = document.getElementById("jnr-product-info");
      if (!section) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      section.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  if (loading) {
    return (
      <main className="jnr-pd-page">
        <div className="container jnr-pd-not-found">
          <p>Loading product details...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="jnr-pd-page">
        <div className="container jnr-pd-not-found">
          <SearchX size={44} aria-hidden="true" />
          <h1>{error ? "Unable to load product" : "Product not found"}</h1>
          <p>
            {error ||
              "This product may have been removed or the link may be incorrect."}
          </p>

          {error && (
            <button
              type="button"
              onClick={() => setRetryToken((current) => current + 1)}
            >
              Try Again
            </button>
          )}

          <Link to="/shop">
            <ArrowLeft size={16} />
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  const categoryBrowseHref = product.categoryId
    ? `/shop?category_id=${encodeURIComponent(product.categoryId)}`
    : "/shop";

  return (
    <main className="jnr-pd-page">
      <div className="container">
        <nav className="jnr-pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link to="/shop">Shop</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link to={categoryBrowseHref}>
            {product.categoryLabel || "Products"}
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">{product.name}</span>
        </nav>

        <section className="jnr-pd-main" key={product.id}>
          <ProductGallery product={product} />
          <ProductPurchasePanel
            product={product}
            onShowReviews={showReviews}
          />
        </section>

        <ProductDetailsTabs
          product={product}
          tab={activeTab}
          onTabChange={setActiveTab}
        />

        {relatedProducts.length > 0 && (
          <section
            className="jnr-pd-related"
            aria-label="Related products"
          >
            <ProductDealsSection
              key={product.id}
              title="Related Products"
              subtitle="More products you might like"
              products={relatedProducts}
              viewAllHref={categoryBrowseHref}
              viewAllLabel="View All"
              withContainer={false}
            />
          </section>
        )}
      </div>
    </main>
  );
}
