import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { banners as defaultBanners } from '../../data/banners';
import '../../styles/hero-showcase.css';

// Static promotional banners on the right; can be replaced with API data later.
const defaultSideBanners = [
  {
    id: 'honey-promo',
    image: '/banners/side-honey.svg',
    alt: 'Discover pure honey at JNRmart',
    href: '/category/honey',
  },
  {
    id: 'dates-promo',
    image: '/banners/side-dates.svg',
    alt: 'Shop premium dates at JNRmart',
    href: '/category/dates',
  },
];

const DRAG_START_DISTANCE = 8;

export default function HeroBanner({
  items = defaultBanners,
  interval = 4000,
  sideBanners = defaultSideBanners,
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const count = Array.isArray(items) ? items.length : 0;

  const goTo = useCallback((next) => {
    if (count > 0) setIndex(((next % count) + count) % count);
  }, [count]);

  useEffect(() => {
    if (count < 2 || paused || isDragging || interval <= 0) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, interval);
    return () => window.clearInterval(timer);
  }, [count, paused, isDragging, interval]);

  useEffect(() => {
    if (count > 0 && index >= count) setIndex(0);
  }, [count, index]);

  const handlePointerDown = (event) => {
    if (count < 2 || (event.pointerType === 'mouse' && event.button !== 0)) return;
    // Arrow and pagination controls are clicks, not drag handles.
    if (event.target.closest('.jnr-hero-arrow, .jnr-hero-dot')) return;

    suppressClickRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      deltaX: 0,
      started: false,
    };
    setPaused(true);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.started) {
      // Ignore tiny movements and let vertical page scrolling work normally.
      if (Math.abs(dx) < DRAG_START_DISTANCE || Math.abs(dx) <= Math.abs(dy)) return;
      drag.started = true;
      suppressClickRef.current = true;
      setIsDragging(true);
      try {
        sliderRef.current?.setPointerCapture(event.pointerId);
      } catch {
        // Pointer may have already ended; the next interaction still works.
      }
    }

    drag.deltaX = dx;
    setDragOffset(dx);
    if (event.cancelable) event.preventDefault();
  };

  const finishDrag = (event, cancelled = false) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    if (drag.started && !cancelled) {
      const width = sliderRef.current?.clientWidth || 0;
      const threshold = Math.max(45, Math.min(width * 0.12, 100));
      if (Math.abs(drag.deltaX) >= threshold) {
        // Drag left = next slide; drag right = previous slide.
        setIndex((current) => (current + (drag.deltaX < 0 ? 1 : -1) + count) % count);
      }
    }

    dragRef.current = null;
    setDragOffset(0);
    setIsDragging(false);
    if (event.pointerType !== 'mouse') {
      setPaused(false);
    } else if (!sliderRef.current?.matches(':hover') &&
               !sliderRef.current?.matches(':focus-visible') &&
               !sliderRef.current?.querySelector(':focus-visible')) {
      setPaused(false);
    }
    if (sliderRef.current?.hasPointerCapture?.(event.pointerId)) {
      sliderRef.current.releasePointerCapture(event.pointerId);
    }
  };

  if (count === 0) return null;

  return (
    <section className="container jnr-hero-section" aria-label="JNRmart offers">
      <div className="jnr-hero-grid">
        <div
          ref={sliderRef}
          className={`jnr-hero-slider${isDragging ? ' is-dragging' : ''}`}
          role="region"
          aria-label="Featured offer slider"
          aria-roledescription="carousel"
          tabIndex={0}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { if (!dragRef.current) setPaused(false); }}
          onFocus={() => setPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget) && !dragRef.current) setPaused(false);
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(index - 1); }
            if (event.key === 'ArrowRight') { event.preventDefault(); goTo(index + 1); }
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(event) => finishDrag(event)}
          onPointerCancel={(event) => finishDrag(event, true)}
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={(event) => {
            // A swipe starting on the Shop Now link must not navigate.
            if (suppressClickRef.current && event.detail !== 0) {
              event.preventDefault();
              event.stopPropagation();
              suppressClickRef.current = false;
            }
          }}
        >
          <div
            className="jnr-hero-track"
            style={{ transform: `translate3d(calc(-${index * 100}% + ${dragOffset}px), 0, 0)` }}
          >
            {items.map((banner, position) => (
              <article
                key={banner.id ?? position}
                className={`jnr-hero-slide jnr-hero-slide--${banner.background || 'navy'}`}
                aria-label={`Offer ${position + 1} of ${count}: ${banner.title}`}
                aria-hidden={position !== index}
                inert={position !== index}
              >
                <div className="jnr-hero-copy">
                  {banner.tag && <span className="jnr-hero-tag">{banner.tag}</span>}
                  <h1>{banner.title}</h1>
                  {banner.description && <p>{banner.description}</p>}
                  <Link
                    className="jnr-hero-cta"
                    to={banner.href || '/'}
                    tabIndex={position === index ? 0 : -1}
                  >
                    {banner.action || 'Shop Now'} <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </div>
                <div className="jnr-hero-art" aria-hidden="true">
                  <span className="jnr-hero-art-blob" />
                  <span className="jnr-hero-emoji">{banner.emoji || '🛍️'}</span>
                  {banner.discount && <span className="jnr-hero-discount">{banner.discount}</span>}
                </div>
              </article>
            ))}
          </div>

          {count > 1 && (
            <>
              <button
                className="jnr-hero-arrow jnr-hero-arrow--prev"
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Previous offer"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="jnr-hero-arrow jnr-hero-arrow--next"
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Next offer"
              >
                <ChevronRight size={20} />
              </button>
              <div className="jnr-hero-dots" aria-label="Choose an offer">
                {items.map((banner, position) => (
                  <button
                    type="button"
                    key={banner.id ?? position}
                    className={`jnr-hero-dot${position === index ? ' is-active' : ''}`}
                    aria-label={`Show offer ${position + 1}`}
                    aria-current={position === index ? 'true' : undefined}
                    onClick={() => goTo(position)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="jnr-hero-side" aria-label="More offers">
          {sideBanners.slice(0, 2).map((promo) => (
            <Link
              className="jnr-hero-side-card"
              to={promo.href || '/'}
              key={promo.id ?? promo.image}
              aria-label={promo.alt || 'See promotion'}
            >
              <img src={promo.image} alt={promo.alt || ''} decoding="async" />
            </Link>
          ))}
        </aside>
      </div>
    </section>
  );
}
