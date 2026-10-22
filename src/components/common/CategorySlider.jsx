import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/category-slider.css';

const DRAG_START_DISTANCE = 6;

// Used only when a category has no `image` / `icon` of its own.
// Matches on the label, so it keeps working if the category order changes.
const EMOJI_BY_KEYWORD = [
  ['ghee', '🧈'],
  ['oil', '🧈'],
  ['organic', '🌿'],
  ['honey', '🍯'],
  ['date', '🌴'],
  ['spice', '🌶️'],
  ['nut', '🥜'],
  ['seed', '🥜'],
  ['bever', '☕'],
  ['tea', '☕'],
  ['rice', '🍚'],
  ['gift', '🎁'],
];

function fallbackEmoji(label = '') {
  const text = String(label).toLowerCase();
  const match = EMOJI_BY_KEYWORD.find(([keyword]) => text.includes(keyword));
  return match ? match[1] : '🛍️';
}

export default function CategorySlider({ title = 'Featured Categories', items = [] }) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const count = Array.isArray(items) ? items.length : 0;

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < max - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    updateEdges();
    el.addEventListener('scroll', updateEdges, { passive: true });
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateEdges) : null;
    if (observer) observer.observe(el);
    window.addEventListener('resize', updateEdges);
    return () => {
      el.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
      if (observer) observer.disconnect();
    };
  }, [updateEdges, count]);

  const scrollByPage = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // Mouse drag only. Touch uses the browser's own swipe scrolling.
  const handlePointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    suppressClickRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      started: false,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    const el = trackRef.current;
    if (!drag || !el || event.pointerId !== drag.pointerId) return;

    const dx = event.clientX - drag.startX;
    if (!drag.started) {
      if (Math.abs(dx) < DRAG_START_DISTANCE) return;
      drag.started = true;
      suppressClickRef.current = true;
      setIsDragging(true);
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        // Pointer may have already ended; the next interaction still works.
      }
    }
    el.scrollLeft = drag.startScroll - dx;
  };

  const finishDrag = (event) => {
    const drag = dragRef.current;
    const el = trackRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    if (el?.hasPointerCapture?.(event.pointerId)) el.releasePointerCapture(event.pointerId);
  };

  if (count === 0) return null;

  return (
    <section className="container jnr-cat-section" aria-label={title}>
      <h2 className="jnr-cat-title">{title}</h2>

      <div className="jnr-cat-slider">
        <button
          className="jnr-cat-arrow jnr-cat-arrow--prev"
          type="button"
          onClick={() => scrollByPage(-1)}
          disabled={!canPrev}
          aria-label="Previous categories"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <div
          ref={trackRef}
          className={`jnr-cat-track${isDragging ? ' is-dragging' : ''}`}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${title} slider`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={(event) => {
            // A drag that ends on a category must not open it.
            if (suppressClickRef.current) {
              event.preventDefault();
              event.stopPropagation();
              suppressClickRef.current = false;
            }
          }}
        >
          {items.map((category) => {
            const image = category.image || category.icon;
            return (
              <Link
                className="jnr-cat-card"
                to={`/category/${category.slug}`}
                key={category.slug ?? category.label}
                draggable="false"
              >
                <span className="jnr-cat-tile">
                  {image ? (
                    <img src={image} alt="" loading="lazy" decoding="async" draggable="false" />
                  ) : (
                    <span className="jnr-cat-emoji" aria-hidden="true">
                      {fallbackEmoji(category.label)}
                    </span>
                  )}
                </span>
                <span className="jnr-cat-label">{category.label}</span>
              </Link>
            );
          })}
        </div>

        <button
          className="jnr-cat-arrow jnr-cat-arrow--next"
          type="button"
          onClick={() => scrollByPage(1)}
          disabled={!canNext}
          aria-label="Next categories"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
