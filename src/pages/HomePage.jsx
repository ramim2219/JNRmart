import { categories } from '../data/navigation';
import HeroBanner from '../components/common/HeroBanner';
import CategorySlider from '../components/common/CategorySlider';
import ProductDealsSection from '../components/common/ProductDealsSection';
import WelcomePopup from '../components/common/WelcomePopup';
import { applianceDeals, electronicsDeals } from '../data/dealsDemoData';

export default function HomePage() {
  return (
    <>
      {/* Only on the home page; dismissed once per browsing session. */}
      <WelcomePopup variant="offer" campaignId="jnrmart-welcome-v1" />

      <HeroBanner />
      <CategorySlider title="Featured Categories" items={categories} />

      <section className="container section">
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
      </section>
    </>
  );
}
