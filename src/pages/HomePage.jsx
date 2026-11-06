
import { categories } from '../data/navigation';

import {
  applianceDeals,
  electronicsDeals,
} from '../data/dealsDemoData';

import { featuredProducts } from '../data/featuredProductsDemoData';

import HeroBanner from '../components/common/HeroBanner';
import CategorySlider from '../components/common/CategorySlider';
import ProductDealsSection from '../components/common/ProductDealsSection';
import WelcomePopup from '../components/common/WelcomePopup';
import PromotionalBannerSection from '../components/common/PromotionalBannerSection';
import FeaturedProductsSection from '../components/common/FeaturedProductsSection';

export default function HomePage() {

  // Temporary demo Add to Cart handler
  const handleAddToCart = (product) => {
    console.log('Demo Cart Product:', product.name);
  };

  // Temporary demo Wishlist handler
  const handleWishlist = (product, isWishlisted) => {
    console.log(
      `${product.name}: ${isWishlisted ? 'Added to' : 'Removed from'} Wishlist`
    );
  };

  return (
    <>
      <WelcomePopup
        variant="offer"
        campaignId="jnrmart-welcome-v1"
      />

      <HeroBanner />

      <CategorySlider
        title="Featured Categories"
        items={categories}
      />

      <PromotionalBannerSection />

      {/* Featured Products - Dummy Data */}
      <FeaturedProductsSection
        products={featuredProducts}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleWishlist}
      />

      {/* <section className="container section">

        <ProductDealsSection
          title="Top Deals on Home Appliances!"
          products={applianceDeals}
          viewAllHref="/category/home-appliances"
        />

        <ProductDealsSection
          title="Trending Electronics Deals"
          products={electronicsDeals}
          viewAllHref="/category/electronics"
        />

      </section> */}
    </>
  );
}
