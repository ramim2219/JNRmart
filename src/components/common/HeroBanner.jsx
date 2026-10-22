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

/** Image-first main carousel + two fixed promo banners + sliding quick-offer rail. */
export default function HeroBanner({
  items = demoMainBanners,
  sideBanners = demoSideBanners,
  offers = demoQuickOffers,
  interval = 4500,
  offersInterval = 3800,
}) {
  const banners = Array.isArray(items) ? items : [];
  const promos = Array.isArray(sideBanners) ? sideBanners : [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const carouselRef = useRef(null);
  const dragRef = useRef(null);
  const ignoreClickRef = useRef(false);
  const count = banners.length;

  const goTo = useCallback((n) => {
    if (count) setIndex(((n % count) + count) % count);
  }, [count]);

  useEffect(() => {
    if (count && index >= count) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (count < 2 || interval <= 0 || paused || dragging) return undefined;
    const timer = window.setInterval(() => setIndex((n) => (n + 1) % count), interval);
    return () => window.clearInterval(timer);
  }, [count, interval, paused, dragging]);

  const pointerDown = (e) => {
    if (count < 2 || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (e.target.closest('button')) return;
    ignoreClickRef.current = false;
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, active: false };
  };
  const pointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dx) < 9 || Math.abs(dx) <= Math.abs(dy)) return;
      drag.active = true;
      ignoreClickRef.current = true;
      setDragging(true);
      try { carouselRef.current?.setPointerCapture(e.pointerId); } catch { /* pointer ended */ }
    }
    drag.dx = dx;
    setDragX(dx);
    if (e.cancelable) e.preventDefault();
  };
  const pointerUp = (e, cancelled = false) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    if (!cancelled && drag.active) {
      const threshold = Math.max(45, Math.min((carouselRef.current?.clientWidth || 500) * 0.14, 105));
      if (Math.abs(drag.dx) >= threshold) goTo(index + (drag.dx < 0 ? 1 : -1));
    }
    dragRef.current = null;
    setDragX(0);
    setDragging(false);
    try {
      if (carouselRef.current?.hasPointerCapture?.(e.pointerId)) carouselRef.current.releasePointerCapture(e.pointerId);
    } catch { /* already released */ }
  };

  if (!count && !promos.length && !offers.length) return null;

  return (
    <section className="container jnr-hero-section" aria-label="JNRmart promotional offers">
      <div className="jnr-hero-grid">
        <div
          ref={carouselRef}
          className={`jnr-hero-slider${dragging ? ' is-dragging' : ''}`}
          aria-label="Main promotional banners"
          aria-roledescription="carousel"
          role="region"
          tabIndex={0}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { if (!dragRef.current) setPaused(false); }}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}
          onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); } }}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={(e) => pointerUp(e, true)}
          onDragStart={(e) => e.preventDefault()}
          onClickCapture={(e) => { if (ignoreClickRef.current && e.detail !== 0) { e.preventDefault(); e.stopPropagation(); ignoreClickRef.current = false; } }}
        >
          <div
            className="jnr-hero-track"
            style={{ transform: `translate3d(calc(-${index * 100}% + ${dragX}px),0,0)` }}
          >
            {banners.map((banner, i) => (
              <div className="jnr-hero-slide" key={banner.id ?? i} role="group" aria-label={`Offer ${i + 1} of ${count}`} aria-roledescription="slide" aria-hidden={i !== index} inert={i !== index ? '' : undefined}>
                <Link className="jnr-hero-image-link" to={banner.href || '/shop'} tabIndex={i === index ? 0 : -1} aria-label={banner.alt || banner.title || 'Explore this offer'} draggable="false">
                  {banner.image ? (
                    <img className="jnr-hero-banner-img" src={banner.image} alt={banner.alt || ''} loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} draggable="false" />
                  ) : (
                    <span className="jnr-hero-image-fallback">
                      <span>{banner.tag || 'JNRMART EXCLUSIVE'}</span>
                      <strong>{banner.title || 'Discover great offers'}</strong>
                      <small>{banner.description || 'Shop today'}</small>
                      <i aria-hidden="true">{banner.emoji || '🛍️'}</i>
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </div>
          {count > 1 && (
            <>
              <button type="button" className="jnr-hero-arrow jnr-hero-arrow--prev" aria-label="Previous banner" onClick={() => goTo(index - 1)}><ChevronLeft size={22} aria-hidden="true" /></button>
              <button type="button" className="jnr-hero-arrow jnr-hero-arrow--next" aria-label="Next banner" onClick={() => goTo(index + 1)}><ChevronRight size={22} aria-hidden="true" /></button>
              <div className="jnr-hero-dots" aria-label="Choose promotional banner">
                {banners.map((banner, i) => <button key={banner.id ?? i} type="button" aria-label={`Show banner ${i + 1}`} aria-current={i === index ? 'true' : undefined} className={`jnr-hero-dot${i === index ? ' is-active' : ''}`} onClick={() => goTo(i)} />)}
              </div>
            </>
          )}
        </div>
        <aside className="jnr-hero-side" aria-label="Special promotions">
          {promos.slice(0, 2).map((banner) => (
            <Link key={banner.id} className="jnr-hero-side-card" to={banner.href || '/shop'} aria-label={banner.alt || 'View offer'} draggable="false">
              <img src={banner.image} alt={banner.alt || ''} draggable="false" />
            </Link>
          ))}
        </aside>
      </div>
      <QuickOfferSlider items={Array.isArray(offers) ? offers : []} interval={offersInterval} />
    </section>
  );
}
