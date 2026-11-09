import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, SearchX } from 'lucide-react';

import ProductDealsSection from '../components/common/ProductDealsSection';
import ProductGallery from '../components/product/ProductGallery';
import ProductPurchasePanel from '../components/product/ProductPurchasePanel';
import ProductDetailsTabs from '../components/product/ProductDetailsTabs';
import { getProductBySlug, getRelatedProducts } from '../data/productDetailsData';

import '../styles/product-details.css';

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState('description');
  const product = getProductBySlug(slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (product) document.title = `${product.name} | JNRmart`;

    return () => {
      document.title = 'JNRmart';
    };
  }, [pathname, product?.name]);

  const showReviews = () => {
    setActiveTab('reviews');

    window.requestAnimationFrame(() => {
      const section = document.getElementById('jnr-product-info');
      if (!section) return;

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      section.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  if (!product) {
    return (
      <main className="jnr-pd-page">
        <div className="container jnr-pd-not-found">
          <SearchX size={44} aria-hidden="true" />
          <h1>Product not found</h1>
          <p>This product may have been removed or the link may be incorrect.</p>
          <Link to="/shop">
            <ArrowLeft size={16} />
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  const relatedProducts = getRelatedProducts(product);
  const categoryBrowseHref = ['home-appliances', 'electronics'].includes(
    product.category,
  )
    ? '/shop'
    : `/category/${product.category}`;

  return (
    <main className="jnr-pd-page">
      <div className="container">
        <nav className="jnr-pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link to="/shop">Shop</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link to={categoryBrowseHref}>
            {product.categoryLabel || product.category}
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">{product.name}</span>
        </nav>

        <section className="jnr-pd-main" key={product.slug}>
          <ProductGallery product={product} />
          <ProductPurchasePanel product={product} onShowReviews={showReviews} />
        </section>

        <ProductDetailsTabs
          product={product}
          tab={activeTab}
          onTabChange={setActiveTab}
        />

        {relatedProducts.length > 0 && (
          <section className="jnr-pd-related" aria-label="Related products">
            <ProductDealsSection
              key={product.slug}
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
