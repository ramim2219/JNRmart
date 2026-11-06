
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import QuickOfferSlider from './QuickOfferSlider';

import {
  mainBanners as demoMainBanners,
  sideBanners as demoSideBanners,
  quickOffers as demoQuickOffers,
} from '../../data/heroShowcaseData';

import '../../styles/hero-showcase.css';

/**
 * JNRmart Premium Hero Showcase
 *
 * Main promotional carousel
 * Two side promotional banners
 * Quick offer slider
 *
 * Theme: Navy + Coral + Soft Peach
 */

export default function HeroBanner({
  items = demoMainBanners,
  sideBanners = demoSideBanners,
  offers = demoQuickOffers,
  interval = 4500,
  offersInterval = 3800,
}) {
  const banners = Array.isArray(items) ? items : [];
  const promos = Array.isArray(sideBanners) ? sideBanners : [];
  const offerItems = Array.isArray(offers) ? offers : [];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const carouselRef = useRef(null);
  const dragRef = useRef(null);
  const ignoreClickRef = useRef(false);

  const count = banners.length;

  // Navigate between banners
  const goTo = useCallback(
    (n) => {
      if (count) {
        setIndex(((n % count) + count) % count);
      }
    },
    [count]
  );

  // Reset index when banner count changes
  useEffect(() => {
    if (count && index >= count) {
      setIndex(0);
    }
  }, [count, index]);

  // Automatic banner sliding
  useEffect(() => {
    if (count < 2 || interval <= 0 || paused || dragging) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIndex((n) => (n + 1) % count);
    }, interval);

    return () => window.clearInterval(timer);
  }, [count, interval, paused, dragging]);

  // Pointer down
  const pointerDown = (event) => {
    if (
      count < 2 ||
      (event.pointerType === 'mouse' && event.button !== 0)
    ) {
      return;
    }

    if (event.target.closest?.('button')) {
      return;
    }

    ignoreClickRef.current = false;

    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dx: 0,
      active: false,
    };
  };

  // Pointer move
  const pointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.id !== event.pointerId) {
      return;
    }

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;

    if (!drag.active) {
      if (Math.abs(dx) < 9 || Math.abs(dx) <= Math.abs(dy)) {
        return;
      }

      drag.active = true;

      ignoreClickRef.current = true;

      setDragging(true);

      try {
        carouselRef.current?.setPointerCapture(event.pointerId);
      } catch {
        // Pointer may already have ended.
      }
    }

    drag.dx = dx;

    setDragX(dx);

    if (event.cancelable) {
      event.preventDefault();
    }
  };

  // Pointer up / cancel
  const pointerUp = (event, cancelled = false) => {
    const drag = dragRef.current;

    if (!drag || drag.id !== event.pointerId) {
      return;
    }

    if (!cancelled && drag.active) {
      const threshold = Math.max(
        45,
        Math.min(
          (carouselRef.current?.clientWidth || 500) * 0.14,
          105
        )
      );

      if (Math.abs(drag.dx) >= threshold) {
        goTo(index + (drag.dx < 0 ? 1 : -1));
      }
    }

    dragRef.current = null;

    setDragX(0);
    setDragging(false);

    try {
      if (
        carouselRef.current?.hasPointerCapture?.(event.pointerId)
      ) {
        carouselRef.current.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer capture may already have been released.
    }
  };

  // Empty state
  if (!count && !promos.length && !offerItems.length) {
    return null;
  }

  return (
    <section
      className="container jnr-hero-section"
      aria-label="JNRmart promotional offers"
    >
      {/* Main Hero Grid */}

      <div className="jnr-hero-grid">

        {/* Main Banner Carousel */}

        <div
          ref={carouselRef}
          className={`jnr-hero-slider${dragging ? ' is-dragging' : ''}`}
          aria-label="Main promotional banners"
          aria-roledescription="carousel"
          role="region"
          tabIndex={0}

          onMouseEnter={() => setPaused(true)}

          onMouseLeave={() => {
            if (!dragRef.current) {
              setPaused(false);
            }
          }}

          onFocusCapture={() => setPaused(true)}

          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget)
            ) {
              setPaused(false);
            }
          }}

          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;

            if (event.key === 'ArrowRight') {
              event.preventDefault();
              goTo(index + 1);
            }

            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              goTo(index - 1);
            }
          }}

          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}

          onPointerCancel={(event) => {
            pointerUp(event, true);
          }}

          onDragStart={(event) => {
            event.preventDefault();
          }}

          onClickCapture={(event) => {
            if (
              ignoreClickRef.current &&
              event.detail !== 0
            ) {
              event.preventDefault();
              event.stopPropagation();

              ignoreClickRef.current = false;
            }
          }}
        >

          {/* Carousel Track */}

          <div
            className="jnr-hero-track"
            style={{
              transform: `translate3d(calc(-${index * 100}% + ${dragX}px), 0, 0)`,
            }}
          >
            {banners.map((banner, i) => (
              <div
                className="jnr-hero-slide"
                key={banner.id ?? i}
                role="group"
                aria-label={`Offer ${i + 1} of ${count}`}
                aria-roledescription="slide"
                aria-hidden={i !== index}
                inert={i !== index ? '' : undefined}
              >
                <Link
                  className="jnr-hero-image-link"
                  to={banner.href || '/shop'}
                  tabIndex={i === index ? 0 : -1}
                  aria-label={
                    banner.alt ||
                    banner.title ||
                    'Explore this offer'
                  }
                  draggable="false"
                >
                  {banner.image ? (
                    <img
                      className="jnr-hero-banner-img"
                      src={banner.image}
                      alt={banner.alt || ''}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      fetchPriority={i === 0 ? 'high' : 'auto'}
                      draggable="false"
                    />
                  ) : (
                    <span className="jnr-hero-image-fallback">
                      <span>
                        {banner.tag || 'JNRMART EXCLUSIVE'}
                      </span>

                      <strong>
                        {banner.title || 'Discover great offers'}
                      </strong>

                      <small>
                        {banner.description || 'Shop today'}
                      </small>

                      <i aria-hidden="true">
                        {banner.emoji || '🛍️'}
                      </i>
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </div>

          {/* Navigation Buttons & Dots */}

          {count > 1 && (
            <>
              <button
                type="button"
                className="jnr-hero-arrow jnr-hero-arrow--prev"
                aria-label="Previous banner"
                onClick={() => goTo(index - 1)}
              >
                <ChevronLeft size={22} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="jnr-hero-arrow jnr-hero-arrow--next"
                aria-label="Next banner"
                onClick={() => goTo(index + 1)}
              >
                <ChevronRight size={22} aria-hidden="true" />
              </button>

              <div
                className="jnr-hero-dots"
                aria-label="Choose promotional banner"
              >
                {banners.map((banner, i) => (
                  <button
                    key={banner.id ?? i}
                    type="button"
                    aria-label={`Show banner ${i + 1}`}
                    aria-current={i === index ? 'true' : undefined}
                    className={`jnr-hero-dot${
                      i === index ? ' is-active' : ''
                    }`}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Side Promotional Banners */}

        <aside
          className="jnr-hero-side"
          aria-label="Special promotions"
        >
          {promos.slice(0, 2).map((banner, index) => (
            <Link
              key={banner.id ?? index}
              className="jnr-hero-side-card"
              to={banner.href || '/shop'}
              aria-label={banner.alt || 'View offer'}
              draggable="false"
            >
              <img
                src={banner.image}
                alt={banner.alt || ''}
                loading="lazy"
                draggable="false"
              />
            </Link>
          ))}
        </aside>

      </div>

      {/* Quick Offer Slider */}

      <QuickOfferSlider
        items={offerItems}
        interval={offersInterval}
      />

    </section>
  );
}
