
import { categories } from '../data/navigation';

import {
  applianceDeals,
  electronicsDeals,
} from '../data/dealsDemoData';


import HeroBanner from '../components/common/HeroBanner';
import CategorySlider from '../components/common/CategorySlider';
import ProductDealsSection from '../components/common/ProductDealsSection';
import WelcomePopup from '../components/common/WelcomePopup';
import PromotionalBannerSection from '../components/common/PromotionalBannerSection';
import FeaturedProductsSection from '../components/common/FeaturedProductsSection';
import OfferProductsSection from '../components/common/OfferProductsSection';

export default function HomePage() {

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
      {/* Offer participants appear only in their separate home section. */}
      <OfferProductsSection />
      {/* Regular products exclude active offer participants at the API level. */}
      <FeaturedProductsSection />
      

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
