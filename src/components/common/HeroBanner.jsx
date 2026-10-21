import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { banners as defaultBanners } from '../../data/banners';

export default function HeroBanner({ items = defaultBanners, interval = 4000 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);
  const count = items.length;
  const goTo = useCallback((next) => {
    if (count) setIndex(((next % count) + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1 || paused || interval <= 0) return;
    const timer = window.setInterval(() => {
      setIndex(current => (current + 1) % count);
    }, interval);
    return () => window.clearInterval(timer);
  }, [count, paused, interval]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  if (!count) return null;

  return (
    <div className="container">
    <section
      className="offer-carousel"
      aria-label="Latest JNRmart offers"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
      onTouchStart={event => { touchStart.current = event.touches[0].clientX; }}
      onTouchEnd={event => {
        if (touchStart.current == null) return;
        const delta = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(delta) > 45) goTo(index + (delta < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className="offer-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {items.map((banner, position) => (
          <div
            className={`offer-slide offer-slide--${banner.background || 'navy'}`}
            key={banner.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${position + 1} of ${count}: ${banner.title}`}
            aria-hidden={position !== index}
            inert={position !== index}
          >
            <div className="offer-slide-inner">
              <div className="offer-content">
                <span className="offer-tag">{banner.tag}</span>
                <h1>{banner.title}</h1>
                <p>{banner.description}</p>
                <Link className="offer-cta" to={banner.href}>{banner.action} <span aria-hidden="true">→</span></Link>
              </div>
              <div className="offer-visual" aria-hidden="true">
                <span className="offer-emoji">{banner.emoji}</span>
                <span className="offer-discount">{banner.discount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {count > 1 && (
        <>
          <button className="offer-arrow offer-prev" type="button" onClick={() => goTo(index - 1)} aria-label="Previous offer">‹</button>
          <button className="offer-arrow offer-next" type="button" onClick={() => goTo(index + 1)} aria-label="Next offer">›</button>
          <div className="offer-dots" aria-label="Select offer">
            {items.map((banner, position) => (
              <button type="button" className={`offer-dot ${position === index ? 'active' : ''}`} key={banner.id} onClick={() => goTo(position)} aria-label={`Show offer ${position + 1}`} aria-current={position === index ? 'true' : undefined} />
            ))}
          </div>
        </>
      )}
    </section>
    </div>
  );
}
