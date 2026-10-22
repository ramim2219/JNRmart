import { categories } from '../data/navigation';
import SectionHeading from '../components/common/SectionHeading';
import HeroBanner from '../components/common/HeroBanner';
import CategorySlider from '../components/common/CategorySlider';
import ProductDealsSection from '../components/common/ProductDealsSection';
import {
  applianceDeals,
  electronicsDeals
} from '../data/dealsDemoData';
export default function HomePage() {
  return (
    <>
      {/* MainLayout already renders Header above this page. */}
      <HeroBanner />
      <CategorySlider title="Featured Categories" items={categories} />
      <section className='container section'>
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
