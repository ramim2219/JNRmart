import { useState } from 'react';
import { Mail } from 'lucide-react';
import '../../styles/newsletter-section.css';

/**
 * Simple reusable newsletter section.
 * Provide an async `onSubscribe(email)` function when the API is ready.
 */
export default function Newsletter({ onSubscribe }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!value || submitting) return;

    // No backend is connected yet; never pretend the email was saved.
    if (typeof onSubscribe !== 'function') {
      setNotice({ type: 'info', text: 'Newsletter signup is coming soon.' });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      await onSubscribe(value);
      setEmail('');
      setNotice({ type: 'success', text: 'You have subscribed successfully.' });
    } catch {
      setNotice({ type: 'error', text: 'Could not subscribe. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="jnr-newsletter-section" aria-labelledby="jnr-newsletter-title">
      <div className="container jnr-newsletter-inner">
        <div className="jnr-newsletter-intro">
          <span className="jnr-newsletter-icon" aria-hidden="true">
            <Mail size={20} strokeWidth={1.8} />
          </span>
          <div className="jnr-newsletter-copy">
            <h2 id="jnr-newsletter-title">Get updates &amp; exclusive offers</h2>
            <p>New arrivals, special deals and more from JNRmart.</p>
          </div>
        </div>

        <div className="jnr-newsletter-signup">
          <form className="jnr-newsletter-form" onSubmit={handleSubmit}>
            <label className="jnr-newsletter-sr-only" htmlFor="jnr-newsletter-email">
              Email address
            </label>
            <input
              id="jnr-newsletter-email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (notice) setNotice(null);
              }}
              required
              disabled={submitting}
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Please wait…' : 'Subscribe'}
            </button>
          </form>
          {notice && (
            <p
              className={`jnr-newsletter-notice jnr-newsletter-notice--${notice.type}`}
              role="status"
              aria-live="polite"
            >
              {notice.text}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
