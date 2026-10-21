import { Link } from 'react-router-dom';
import { categories } from '../data/navigation';
import SectionHeading from '../components/common/SectionHeading';
import HeroBanner from '../components/common/HeroBanner';

export default function HomePage() {
  return (
    <>
      {/* MainLayout already renders Header above this page. */}
      <HeroBanner />
      <section className="container section">
        <SectionHeading title="Shop by category" subtitle="Find just what you need" />
        <div className="category-grid">
          {categories.slice(0, 8).map((category, index) => (
            <Link className="category-card" to={`/category/${category.slug}`} key={category.slug}>
              <div className="category-emoji">{['🎁','🍯','🧈','🌴','🌶️','🥜','☕','🍚'][index]}</div>
              <h3>{category.label}</h3>
              <span>Explore →</span>
            </Link>
          ))}
        </div>
      </section>
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
