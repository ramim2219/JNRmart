import { categories } from '../data/navigation';
import SectionHeading from '../components/common/SectionHeading';
import HeroBanner from '../components/common/HeroBanner';
import CategorySlider from '../components/common/CategorySlider';

export default function HomePage() {
  return (
    <>
      {/* MainLayout already renders Header above this page. */}
      <HeroBanner />
      <CategorySlider title="Featured Categories" items={categories} />
      <section className="container section">
        <SectionHeading title="Featured products" subtitle="Your product cards will go here later" to="/category/offer-zone" />
        <div className="placeholder-grid">
          {[1, 2, 3, 4].map(number => (
            <div className="placeholder-card" key={number}>
              <div className="skeleton-picture" /><div className="skeleton-line" />
              <div className="skeleton-line short" /><div className="skeleton-button" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
