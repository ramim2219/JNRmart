import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Reusable, scroll-snap campaign strip. No extra slider library required. */
export default function QuickOfferSlider({ items = [], interval = 3800 }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const ignoreClickRef = useRef(false);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 3);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 3);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    updateEdges();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateEdges) : null;
    observer?.observe(el);
    el.addEventListener('scroll', updateEdges, { passive: true });
    return () => {
      observer?.disconnect();
      el.removeEventListener('scroll', updateEdges);
    };
  }, [items.length, updateEdges]);

  const step = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('.jnr-quick-card');
    if (!card) return;
    const gap = parseFloat(window.getComputedStyle(el).columnGap) || 8;
    const distance = card.getBoundingClientRect().width + gap;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: distance * direction, behavior: reduced ? 'instant' : 'smooth' });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el || items.length < 2 || paused || dragging || interval <= 0) return undefined;
    const timer = window.setInterval(() => {
      const card = el.querySelector('.jnr-quick-card');
      if (!card) return;
      const gap = parseFloat(window.getComputedStyle(el).columnGap) || 8;
      const distance = card.getBoundingClientRect().width + gap;
      const max = el.scrollWidth - el.clientWidth;
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      el.scrollTo({
        left: el.scrollLeft >= max - distance / 2 ? 0 : el.scrollLeft + distance,
        behavior: reduced ? 'instant' : 'smooth',
      });
    }, interval);
    return () => window.clearInterval(timer);
  }, [interval, items.length, paused, dragging]);

  if (!items.length) return null;

  const pointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    ignoreClickRef.current = false;
    dragRef.current = { x: e.clientX, start: trackRef.current?.scrollLeft || 0, pointerId: e.pointerId, moved: false };
  };
  const pointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 7) return;
    if (!drag.moved) {
      drag.moved = true;
      ignoreClickRef.current = true;
      setDragging(true);
      try { trackRef.current?.setPointerCapture(e.pointerId); } catch { /* ended pointer */ }
    }
    if (trackRef.current) trackRef.current.scrollLeft = drag.start - dx;
  };
  const pointerUp = (e) => {
    if (dragRef.current?.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    try {
      if (trackRef.current?.hasPointerCapture?.(e.pointerId)) trackRef.current.releasePointerCapture(e.pointerId);
    } catch { /* pointer already released */ }
  };

  return (
    <section
      className="jnr-quick-wrap"
      aria-label="More JNRmart offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}
    >
      <button type="button" className="jnr-quick-arrow jnr-quick-arrow--prev" aria-label="Previous quick offers" onClick={() => step(-1)} disabled={!canPrev}>
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <div
        className={`jnr-quick-track${dragging ? ' is-dragging' : ''}`}
        ref={trackRef}
        role="region"
        aria-label="Quick offers carousel"
        tabIndex={0}
        onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={(e) => { if (ignoreClickRef.current && e.detail !== 0) { e.preventDefault(); e.stopPropagation(); ignoreClickRef.current = false; } }}
      >
        {items.map((offer) => (
          <Link key={offer.id} to={offer.href || '/shop'} className="jnr-quick-card" draggable="false" aria-label={offer.title}>
            <span className="jnr-quick-thumb" style={{ background: offer.color || '#e9effb' }}>
              <img src={offer.image} alt="" loading="lazy" draggable="false" />
            </span>
            <span className="jnr-quick-text">{offer.title}</span>
          </Link>
        ))}
      </div>
      <button type="button" className="jnr-quick-arrow jnr-quick-arrow--next" aria-label="Next quick offers" onClick={() => step(1)} disabled={!canNext}>
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </section>
  );
}
