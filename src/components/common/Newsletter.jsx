
import { useState } from 'react';
import { Mail } from 'lucide-react';
import '../../styles/newsletter-section.css';

export default function Newsletter({ onSubscribe }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const value = email.trim();

    if (!value || submitting) return;

    if (typeof onSubscribe !== 'function') {
      setNotice({
        type: 'info',
        text: 'Newsletter signup is coming soon.',
      });
      return;
    }
    setSubmitting(true);
    setNotice(null);

    try {
      await onSubscribe(value);
      setEmail('');

      setNotice({
        type: 'success',
        text: 'Successfully subscribed!',
      });
    } catch {
      setNotice({
        type: 'error',
        text: 'Subscription failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="jnr-newsletter-section"
      aria-labelledby="jnr-newsletter-title"
    >
      <div className="container jnr-newsletter-inner">

        {/* Newsletter Content */}
        <div className="jnr-newsletter-intro">

          <span className="jnr-newsletter-icon">
            <Mail size={23} strokeWidth={1.8} />
          </span>

          <div className="jnr-newsletter-copy">
            <h2 id="jnr-newsletter-title">
              Stay in Style with JNRmart
            </h2>

            <p>
              Get new arrivals, exclusive offers and fashion
              updates directly in your inbox.
            </p>
          </div>

        </div>

        {/* Newsletter Form */}
        <div className="jnr-newsletter-signup">

          <form
            className="jnr-newsletter-form"
            onSubmit={handleSubmit}
          >
            <label
              className="jnr-newsletter-sr-only"
              htmlFor="jnr-newsletter-email"
            >
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
                setNotice(null);
              }}
              required
              disabled={submitting}
            />

            <button type="submit" disabled={submitting}>
              {submitting ? 'Please wait...' : 'Subscribe'}
            </button>
          </form>

          {notice && (
            <p
              className={`jnr-newsletter-notice jnr-newsletter-notice--${notice.type}`}
              role="status"
            >
              {notice.text}
            </p>
          )}

        </div>

      </div>
    </section>
  );
}
