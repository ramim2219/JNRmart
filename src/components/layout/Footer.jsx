import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { footerLinks } from '../../data/navigation';

// Footer contains only footer content. Newsletter is rendered separately by MainLayout.
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <Link className="brand brand-logo" to="/" aria-label="JNRmart home">
            <img src="/jnrmart-logo.png" alt="JNRmart" />
          </Link>
          <p>Your everyday essentials in one convenient place. This is a frontend UI demonstration.</p>
          <div className="socials">
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <Facebook />
            </a>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <Instagram />
            </a>
            <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
              <Youtube />
            </a>
          </div>
        </div>

        {footerLinks.map((section) => (
          <div key={section.title}>
            <h3>{section.title}</h3>
            {section.links.map(([label, to]) => (
              <Link key={to} to={to}>{label}</Link>
            ))}
          </div>
        ))}

        <div>
          <h3>Get in Touch</h3>
          <p><MapPin size={17} aria-hidden="true" /> Bangladesh</p>
          <p><Phone size={17} aria-hidden="true" /> Add your support number</p>
          <p><Mail size={17} aria-hidden="true" /> hello@example.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          © {new Date().getFullYear()} JNRmart. All rights reserved.
          <span>Frontend starter template</span>
        </div>
      </div>
    </footer>
  );
}
