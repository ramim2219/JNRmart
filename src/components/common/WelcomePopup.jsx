import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Mail, Sparkles, X } from 'lucide-react';
import '../../styles/welcome-popup.css';

/**
 * Reusable first-visit popup for JNRmart.
 *
 * variant: 'offer' | 'newsletter'
 * storage: 'session' (once per tab session) | 'local' (once per browser/campaign)
 * campaignId: change this value to show a new campaign after a previous dismissal
 * delay: time in milliseconds before the popup appears
 * onSubscribe(email): optional async callback for newsletter signup
 *
 * Render this component inside HomePage if it should appear only on the homepage.
 */
export default function WelcomePopup({
  variant = 'offer',
  campaignId = 'jnrmart-welcome-v1',
  storage = 'session',
  delay = 0,
  eyebrow = 'WELCOME TO JNRMART',
  title,
  description,
  ctaLabel = 'Explore products',
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
  const emailId = useId();

  const isNewsletter = variant === 'newsletter';

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
      // Storage restrictions should never prevent the popup from closing.
    }

    setOpen(false);
  }, [campaignId, getStorage]);

  // Show the popup only if this campaign has not already been dismissed.
  useEffect(() => {
    let wasDismissed = false;

    try {
      wasDismissed =
        getStorage()?.getItem(`jnrmart-popup:${campaignId}`) === 'dismissed';
    } catch {
      // If storage is unavailable, show the popup for this visit.
    }

    if (wasDismissed) {
      setOpen(false);
      return undefined;
    }

    const safeDelay = Number.isFinite(Number(delay))
      ? Math.max(0, Number(delay))
      : 0;

    const timer = window.setTimeout(() => setOpen(true), safeDelay);

    return () => window.clearTimeout(timer);
  }, [campaignId, delay, getStorage]);

  // Lock background scrolling and keep keyboard focus inside the dialog.
  useEffect(() => {
    if (!open) return undefined;

    returnFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const getFocusableElements = () => {
      if (!panelRef.current) return [];

      return Array.from(
        panelRef.current.querySelectorAll(
          [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
          ].join(','),
        ),
      ).filter((element) => (
        !element.hasAttribute('hidden')
        && element.getAttribute('aria-hidden') !== 'true'
        && element.getClientRects().length > 0
      ));
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements();

      if (!focusable.length) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focusIsOutside = !panelRef.current?.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === first || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || focusIsOutside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;

      if (returnFocusRef.current?.isConnected) {
        returnFocusRef.current.focus?.();
      }
    };
  }, [open, dismiss]);

  const submitNewsletter = async (event) => {
    event.preventDefault();

    const value = email.trim();

    if (!value || submitting) return;

    if (typeof onSubscribe !== 'function') {
      setNotice({
        type: 'info',
        message: 'Newsletter signup will be available soon.',
      });
      return;
    }

    setSubmitting(true);
    setNotice(null);

    try {
      await onSubscribe(value);

      setNotice({
        type: 'success',
        message: 'Thank you! You have successfully subscribed.',
      });
      setEmail('');
    } catch {
      setNotice({
        type: 'error',
        message: 'Subscription failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const modalTitle =
    title ?? (isNewsletter ? 'Get the good stuff first.' : 'Discover something great.');

  const modalDescription =
    description
    ?? (isNewsletter
      ? 'Be the first to hear about new products, fresh arrivals and exclusive JNRmart offers.'
      : 'Explore our latest arrivals, customer favourites and everyday essentials.');

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
        tabIndex={-1}
      >
        <button
          ref={closeRef}
          className="jnr-welcome-close"
          type="button"
          aria-label="Close welcome popup"
          onClick={dismiss}
        >
          <X size={19} strokeWidth={2} aria-hidden="true" />
        </button>

        <div className="jnr-welcome-content">
          <span className="jnr-welcome-eyebrow">
            {isNewsletter
              ? <Mail size={15} aria-hidden="true" />
              : <Sparkles size={15} aria-hidden="true" />}
            {eyebrow}
          </span>

          <h2 id={headingId}>{modalTitle}</h2>
          <p id={descriptionId}>{modalDescription}</p>

          {isNewsletter ? (
            <>
              <form className="jnr-welcome-form" onSubmit={submitNewsletter}>
                <label className="jnr-welcome-visually-hidden" htmlFor={emailId}>
                  Email address
                </label>

                <input
                  id={emailId}
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  value={email}
                  disabled={submitting}
                  required
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setNotice(null);
                  }}
                />

                <button type="submit" disabled={submitting} aria-busy={submitting}>
                  {submitting ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>

              {notice && (
                <p
                  className={`jnr-welcome-notice jnr-welcome-notice--${notice.type}`}
                  role={notice.type === 'error' ? 'alert' : 'status'}
                  aria-live="polite"
                >
                  {notice.message}
                </p>
              )}
            </>
          ) : (
            <Link className="jnr-welcome-primary" to={ctaTo} onClick={dismiss}>
              {ctaLabel}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          )}

          <button
            className="jnr-welcome-secondary"
            type="button"
            onClick={dismiss}
          >
            {isNewsletter ? 'Maybe later' : 'Continue browsing'}
          </button>
        </div>

        <div className="jnr-welcome-visual" aria-hidden="true">
          <div className="jnr-welcome-visual-orb jnr-welcome-orb-one" />
          <div className="jnr-welcome-visual-orb jnr-welcome-orb-two" />

          <div className="jnr-welcome-visual-icon">
            {isNewsletter
              ? <Mail size={42} strokeWidth={1.5} />
              : <Gift size={44} strokeWidth={1.45} />}
          </div>

          <div className="jnr-welcome-visual-label">
            JNR<span>mart</span>
          </div>
          <div className="jnr-welcome-visual-caption">
            Find more to love.
          </div>

          <span className="jnr-welcome-spark jnr-welcome-spark-one">✦</span>
          <span className="jnr-welcome-spark jnr-welcome-spark-two">✦</span>
          <span className="jnr-welcome-spark jnr-welcome-spark-three">✧</span>
        </div>
      </section>
    </div>
  );
}
