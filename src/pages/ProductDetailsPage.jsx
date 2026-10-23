import { useEffect, useState } from 'react';
import { ChevronRight, ArrowLeft, SearchX } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ProductDealsSection from '../components/common/ProductDealsSection';
import ProductGallery from '../components/product/ProductGallery';
import ProductPurchasePanel from '../components/product/ProductPurchasePanel';
import ProductDetailsTabs from '../components/product/ProductDetailsTabs';
import { getProductBySlug, getRelatedProducts } from '../data/productDetailsData';
import '../styles/product-details.css';

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const [tab, setTab] = useState('description');
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (product) document.title = `${product.name} | JNRmart`;
    return () => { document.title = 'JNRmart'; };
  }, [pathname, product]);

  if (!product) return <div className="jnr-pd-page"><div className="container jnr-pd-not-found"><SearchX size={44}/><h1>Product not found</h1><p>This product may have been removed or the link may be incorrect.</p><Link to="/shop"><ArrowLeft size={16}/> Back to shop</Link></div></div>;

  const related = getRelatedProducts(product);
  // The existing ShopPage currently filters the grocery catalog only.
  // Appliance/electronics demo deals do not have a dedicated category shop yet.
  const categoryBrowseHref = ['home-appliances', 'electronics'].includes(product.category)
    ? '/shop' : `/category/${product.category}`;
  const showReviews = () => {
    setTab('reviews');
    requestAnimationFrame(() => document.getElementById('jnr-product-info')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }));
  };

  return (
    <div className="jnr-pd-page">
      <div className="container">
        <nav className="jnr-pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><ChevronRight size={14}/><Link to="/shop">Shop</Link><ChevronRight size={14}/>
          <Link to={categoryBrowseHref}>{product.categoryLabel || product.category}</Link><ChevronRight size={14}/>
          <span aria-current="page">{product.name}</span>
        </nav>
        <div className="jnr-pd-main" key={product.slug}>
          <ProductGallery product={product} />
          <ProductPurchasePanel product={product} onShowReviews={showReviews}/>
        </div>
        <ProductDetailsTabs product={product} tab={tab} onTabChange={setTab}/>
        {related.length > 0 && (
          <div className="jnr-pd-related">
            <ProductDealsSection
              key={product.slug}
              title="Related Products"
              subtitle="More products you might like"
              products={related}
              viewAllHref={categoryBrowseHref}
              viewAllLabel="View All"
              withContainer={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
