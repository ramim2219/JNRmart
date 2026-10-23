import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Mail, Sparkles, X } from 'lucide-react';
import '../../styles/welcome-popup.css';

/**
 * Reusable first-visit popup for JNRmart.
 *
 * variant: 'offer' | 'newsletter'
 * storage: 'session' (once per tab session) | 'local' (once per browser/campaign)
 * campaignId: change it to show a new campaign even if the old one was dismissed
 * onSubscribe(email): optional async callback; no success is reported without it
 *
 * Render inside HomePage so the popup never appears on other routes.
 */
export default function WelcomePopup({
  variant = 'offer',
  campaignId = 'jnrmart-welcome-v1',
  storage = 'session',
  delay = 0,
  eyebrow = 'WELCOME TO JNRMART',
  title,
  description,
  ctaLabel = 'Explore Products',
  ctaTo = '/shop',
  onSubscribe,
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);
  const headingId = useId();
  const descriptionId = useId();

  const getStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      return storage === 'local' ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }, [storage]);

  const dismiss = useCallback(() => {
    try {
      getStorage()?.setItem(`jnrmart-popup:${campaignId}`, 'dismissed');
    } catch {
      // Privacy/storage restrictions shouldn't prevent closing the popup.
    }
    setOpen(false);
  }, [campaignId, getStorage]);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = getStorage()?.getItem(`jnrmart-popup:${campaignId}`) === 'dismissed';
    } catch {
      // Fall back to showing this visit if storage isn't accessible.
    }
    if (dismissed) return undefined;

    const timer = window.setTimeout(() => setOpen(true), Math.max(0, delay));
    return () => window.clearTimeout(timer);
  }, [campaignId, delay, getStorage]);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((node) => !node.hasAttribute('hidden') && node.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = oldOverflow;
      returnFocusRef.current?.focus?.();
    };
  }, [open, dismiss]);

  const submitNewsletter = async (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!value || submitting) return;
    if (typeof onSubscribe !== 'function') {
      setNotice({ type: 'info', message: 'Newsletter signup is coming soon.' });
      return;
    }
    setSubmitting(true);
    setNotice(null);
    try {
      await onSubscribe(value);
      setNotice({ type: 'success', message: 'Thanks! You have successfully subscribed.' });
      setEmail('');
    } catch {
      setNotice({ type: 'error', message: 'Subscription failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const isNewsletter = variant === 'newsletter';
  const modalTitle = title ?? (isNewsletter ? 'Get the good stuff first.' : 'Discover something great.');
  const modalDescription = description ?? (isNewsletter
    ? 'Be the first to hear about new products, fresh arrivals and JNRmart offers.'
    : 'Browse our favourite finds, fresh arrivals and everyday essentials.');

  return (
    <div
      className="jnr-welcome-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <section
        ref={panelRef}
        className={`jnr-welcome-modal jnr-welcome-modal--${isNewsletter ? 'newsletter' : 'offer'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
      >
        <button
          ref={closeRef}
          className="jnr-welcome-close"
          type="button"
          aria-label="Close welcome popup"
          onClick={dismiss}
        >
          <X size={20} strokeWidth={2} />
        </button>

        <div className="jnr-welcome-content">
          <span className="jnr-welcome-eyebrow">
            {isNewsletter ? <Mail size={15} /> : <Sparkles size={15} />}
            {eyebrow}
          </span>
          <h2 id={headingId}>{modalTitle}</h2>
          <p id={descriptionId}>{modalDescription}</p>

          {isNewsletter ? (
            <>
              <form className="jnr-welcome-form" onSubmit={submitNewsletter}>
                <label className="jnr-welcome-visually-hidden" htmlFor="jnr-welcome-email">
                  Email address
                </label>
                <input
                  id="jnr-welcome-email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  value={email}
                  disabled={submitting}
                  required
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setNotice(null);
                  }}
                />
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {notice && (
                <p className={`jnr-welcome-notice jnr-welcome-notice--${notice.type}`} role="status">
                  {notice.message}
                </p>
              )}
            </>
          ) : (
            <Link className="jnr-welcome-primary" to={ctaTo} onClick={dismiss}>
              {ctaLabel} <ArrowRight size={17} aria-hidden="true" />
            </Link>
          )}
          <button className="jnr-welcome-secondary" type="button" onClick={dismiss}>
            {isNewsletter ? 'Maybe later' : 'Continue browsing'}
          </button>
        </div>

        <div className="jnr-welcome-visual" aria-hidden="true">
          <div className="jnr-welcome-visual-ring jnr-welcome-ring-one" />
          <div className="jnr-welcome-visual-ring jnr-welcome-ring-two" />
          <div className="jnr-welcome-visual-icon"><Gift size={44} strokeWidth={1.45} /></div>
          <div className="jnr-welcome-visual-label">JNR<span>mart</span></div>
          <div className="jnr-welcome-visual-caption">Find more to love.</div>
          <span className="jnr-welcome-spark jnr-welcome-spark-one">✦</span>
          <span className="jnr-welcome-spark jnr-welcome-spark-two">✦</span>
        </div>
      </section>
    </div>
  );
}
