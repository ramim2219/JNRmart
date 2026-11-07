
import { Link } from 'react-router-dom';

import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Apple,
  Play,
} from 'lucide-react';

import { categories, footerLinks } from '../../data/navigation';
import '../../styles/footer.css';

export default function Footer() {
  const helpLinks =
    footerLinks.find(section => section.title === 'Customer Care')?.links || [];

  const aboutLinks =
    footerLinks.find(section => section.title === 'Information')?.links || [];

  return (
    <footer className="site-footer">

      <div className="container footer-grid">

        {/* 1. Brand Information */}
        <div className="footer-about footer-column">

          <Link
            className="footer-logo"
            to="/"
            aria-label="JNRmart home"
          >
            <img src="/jnrmart-logo.png" alt="JNRmart" />
          </Link>

          <p className="footer-description">
            Your one-stop destination for fashion, beauty and
            lifestyle essentials. Discover trendy styles,
            genuine products and a seamless shopping experience.
          </p>

          <div className="footer-socials">

            <a href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook">
              <Facebook />
            </a>

            <a href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram">
              <Instagram />
            </a>

            <a href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube">
              <Youtube />
            </a>

          </div>
        </div>

        {/* 2. Shop */}
        <div className="footer-column footer-shop">

          <h3>Shop</h3>

          <ul>
            {categories.slice(0, 6).map(category => (
              <li key={category.slug}>
                <Link to={`/category/${category.slug}`}>
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>

        </div>

        {/* 3. Help & Support */}
        <div className="footer-column footer-help">

          <h3>Help & Support</h3>

          <ul>
            {helpLinks.map(([label, to]) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}

            <li>
              <Link to="/returns">Returns & Exchanges</Link>
            </li>

            <li>
              <Link to="/size-guide">Size Guide</Link>
            </li>
          </ul>

        </div>

        {/* 4. About JNRmart */}
        <div className="footer-column footer-information">

          <h3>About JNRmart</h3>

          <ul>
            {aboutLinks.map(([label, to]) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}

            <li>
              <Link to="/careers">Careers</Link>
            </li>

            <li>
              <Link to="/sustainability">Sustainability</Link>
            </li>
          </ul>

        </div>

        {/* 5. Get in Touch */}
        <div className="footer-column footer-contact">

          <h3>Get in Touch</h3>

          <p>
            <MapPin />
            <span>Bangladesh</span>
          </p>

          <p>
            <Phone />
            <span>Add your support number</span>
          </p>

          <p>
            <Mail />
            <span>hello@example.com</span>
          </p>

          {/* App Badges */}
          <div className="footer-apps">

            <div className="footer-app-badge">
              <Apple size={23} />
              <span>
                <small>Download on the</small>
                <strong>App Store</strong>
              </span>
            </div>

            <div className="footer-app-badge">
              <Play size={21} />
              <span>
                <small>GET IT ON</small>
                <strong>Google Play</strong>
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">

        <div className="container footer-bottom-inner">

          <p>
            © {new Date().getFullYear()} JNRmart. All rights reserved.
          </p>

          <div className="footer-payments" aria-label="Payment methods">
            <span className="payment-visa">VISA</span>
            <span className="payment-mastercard">Mastercard</span>
            <span className="payment-bkash">bKash</span>
            <span className="payment-nagad">নগদ</span>
            <span className="payment-dbbl">DBBL</span>
          </div>

        </div>

      </div>

    </footer>
  );
}
