import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import QuickOfferSlider from './QuickOfferSlider';

import { fetchPublicOfferBanners } from '../../services/offerBannerServices';

import '../../styles/hero-showcase.css';

const extractBannerRows = (response) => {

  const candidates = [

    response,

    response?.data,

    response?.data?.data,

    response?.data?.data?.data,

  ];

  return candidates.find(Array.isArray) || [];

};

// Use Vite's existing /storage proxy for Laravel-hosted banner images.
// Kept in this file so there is no additional import or utility to install.
const resolveBannerImageUrl = (value) => {
  if (!value) return '';

  const raw = String(value).trim().replace(/\\/g, '/');
  if (!raw) return '';
  if (/^(data:|blob:)/i.test(raw)) return raw;

  if (/^https?:\/\//i.test(raw) || raw.startsWith('//')) {
    try {
      const url = new URL(raw, window.location.origin);
      const backendHost = url.hostname.toLowerCase();
      const websiteHost = window.location.hostname.toLowerCase();
      const isLocalServer = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(backendHost)
        || backendHost === websiteHost;

      if (isLocalServer && /^\/storage(?:\/|$)/i.test(url.pathname)) {
        return `${url.pathname}${url.search}${url.hash}`;
      }
      return raw;
    } catch {
      return raw;
    }
  }

  const clean = raw.replace(/^\/+/, '').replace(/^public\//i, '');
  if (/^storage\//i.test(clean)) return `/${clean}`;
  if (/^(images|assets)\//i.test(clean)) return `/${clean}`;
  if (/^offer-banners\//i.test(clean)) return `/storage/${clean}`;
  if (raw.startsWith('/')) return raw;

  return `/storage/${clean}`;
};

const toShowcaseBanner = (banner) => ({

  id: banner.id,

  image: resolveBannerImageUrl(
    banner.banner_image_url || banner.image_url || banner.banner_image || banner.image || ''
  ),

  href: banner.offer_id
    ? `/offers/${encodeURIComponent(String(banner.offer_id))}`
    : (banner.href || '/category/offer-zone'),

  alt: banner.alt || banner.offer?.name || 'Explore this offer',

  title: banner.title || banner.offer?.name || 'Special offer',

});

/**

 * Remove duplicate records before deciding the layout.

 * Prefer the database ID; use the image path when an ID is unavailable.

 */

const removeDuplicateBanners = (banners) => {
  const ids = new Set();
  const fallbackImages = new Set();

  return banners.filter((banner) => {
    if (banner.id !== undefined && banner.id !== null) {
      const key = String(banner.id);
      if (ids.has(key)) return false;
      ids.add(key);
      return true;
    }

    // When there is no ID, image is a reasonable fallback key.
    const key = String(banner.image || '');
    if (!key || fallbackImages.has(key)) return false;
    fallbackImages.add(key);
    return true;
  });
};

// All promotion_1 records remain eligible. The two visible slots rotate
// deterministically so no active promotion is permanently hidden.

export default function HeroBanner({

  items,

  sideBanners,

  interval = 4500,

  offersInterval = 3800,

}) {

  const [backendBanners, setBackendBanners] = useState([]);

  const [backendPromos, setBackendPromos] = useState([]);

  useEffect(() => {

    let active = true;

    const loadBanners = async () => {

      try {

        const response = await fetchPublicOfferBanners();

        const rows = extractBannerRows(response)

          .filter((banner) => Number(banner?.status ?? 1) === 1)

          .filter((banner) =>

            Boolean(

              banner?.banner_image_url ||

                banner?.image_url ||

                banner?.banner_image ||
                banner?.image

            )

          )

          .sort(

            (a, b) =>

              (Number(b.priority) || 0) - (Number(a.priority) || 0) ||

              (Number(b.id) || 0) - (Number(a.id) || 0)

          );

        if (!active) return;

        const heroRows = removeDuplicateBanners(

          rows

            .filter(

              (banner) =>

                String(banner?.banner_type || '').trim().toLowerCase() ===

                'hero_banner'

            )

            .map(toShowcaseBanner)

        );

        const promotionRows = removeDuplicateBanners(

          rows

            .filter(

              (banner) =>

                String(banner?.banner_type || '').trim().toLowerCase() ===

                'promotion_1'

            )

            .map(toShowcaseBanner)

        );

        if (import.meta.env.DEV) {
          const byType = rows.reduce((counts, row) => {
            const type = String(row?.banner_type || '').trim().toLowerCase();
            counts[type] = (counts[type] || 0) + 1;
            return counts;
          }, {});
          console.info('[JNRmart banner counts from public API]', {
            hero_banner: byType.hero_banner || 0,
            promotion_1: byType.promotion_1 || 0,
            promotion_2: byType.promotion_2 || 0,
            shownHero: heroRows.length,
            shownPromotion1: promotionRows.length,
          });
        }

        setBackendBanners(heroRows);

        setBackendPromos(promotionRows);

      } catch (error) {

        console.error(

          '[HeroBanner] Unable to load public banners:',

          error

        );

        if (active) {

          setBackendBanners([]);

          setBackendPromos([]);

        }

      }

    };

    void loadBanners();

    return () => {

      active = false;

    };

  }, []);

  // Explicit props remain supported for pages that provide their own banners.

  const banners = Array.isArray(items) ? items : backendBanners;

  const promos = Array.isArray(sideBanners)

    ? sideBanners

    : backendPromos;

const hasHeroBanners = banners.length > 0;

  const hasPromotionBanners = promos.length > 0;

  const promosOnlyTwo = !hasHeroBanners && promos.length === 2;

  /*

   * Layout rules:

   * 1. Hero + promotions: hero carousel with up to two random side banners.

   * 2. Hero only: hero carousel takes the full width.

   * 3. No hero + one promotion: one full-width promotion.

   * 4. No hero + two promotions: show both side by side.

   * 5. No hero + more than two promotions: carousel all promotions.

   * 6. No hero and no promotions: hide this entire showcase section.

   */

  const shouldShowCarousel =

    hasHeroBanners || (!hasHeroBanners && promos.length !== 2);

  const carouselBanners = hasHeroBanners ? banners : promos;

  const [sidePromoPage, setSidePromoPage] = useState(0);
  const [sidePromoPaused, setSidePromoPaused] = useState(false);

  useEffect(() => {
    if (!hasHeroBanners || promos.length <= 2 || offersInterval <= 0 || sidePromoPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSidePromoPage((page) => page + 1);
    }, offersInterval);

    return () => window.clearInterval(timer);
  }, [hasHeroBanners, promos.length, offersInterval, sidePromoPaused]);

  const sidePromoBanners = useMemo(() => {
    if (!hasHeroBanners) return promosOnlyTwo ? promos : [];
    if (promos.length <= 2) return promos;

    // Rotate two slots through the entire list, including odd list lengths.
    const first = (sidePromoPage * 2) % promos.length;
    const second = (first + 1) % promos.length;
    return [promos[first], promos[second]];
  }, [hasHeroBanners, promosOnlyTwo, promos, sidePromoPage]);

  const gridClassName = hasHeroBanners

    ? sidePromoBanners.length > 0

      ? 'jnr-hero-grid'

      : 'jnr-hero-grid jnr-hero-grid--hero-only'

    : promosOnlyTwo

      ? 'jnr-hero-grid jnr-hero-grid--promos-only'

      : 'jnr-hero-grid jnr-hero-grid--promos-slider';

  const [index, setIndex] = useState(0);

  const [paused, setPaused] = useState(false);

  const [dragX, setDragX] = useState(0);

  const [dragging, setDragging] = useState(false);

  const carouselRef = useRef(null);

  const dragRef = useRef(null);

  const ignoreClickRef = useRef(false);

  const count = shouldShowCarousel ? carouselBanners.length : 0;

  const goTo = useCallback(

    (nextIndex) => {

      if (count > 0) {

        setIndex(((nextIndex % count) + count) % count);

      }

    },

    [count]

  );

  // Reset the active slide when the available carousel banners change.

  useEffect(() => {

    if (!count || index >= count) {

      setIndex(0);

    }

  }, [count, index]);

  // Automatic sliding is enabled only when there are at least two slides.

  useEffect(() => {

    if (count < 2 || interval <= 0 || paused || dragging) {

      return undefined;

    }

    const timer = window.setInterval(() => {

      setIndex((currentIndex) => (currentIndex + 1) % count);

    }, interval);

    return () => window.clearInterval(timer);

  }, [count, interval, paused, dragging]);

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

  // Hide the complete showcase when both backend banner types are empty.

  if (!hasHeroBanners && !hasPromotionBanners) {

    return null;

  }

  const sliderClassName = [

    'jnr-hero-slider',

    !hasHeroBanners ? 'jnr-hero-slider--promos-only' : '',

    dragging ? 'is-dragging' : '',

  ]

    .filter(Boolean)

    .join(' ');

  const carouselLabel = hasHeroBanners

    ? 'Main promotional banners'

    : 'Promotional banners';

  return (

    <section

      className="container jnr-hero-section"

      aria-label="JNRmart promotional offers"

    >

      <div className={gridClassName}>

        {shouldShowCarousel && (

          <div

            ref={carouselRef}

            className={sliderClassName}

            aria-label={carouselLabel}

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

            onPointerCancel={(event) => pointerUp(event, true)}

            onDragStart={(event) => event.preventDefault()}

            onClickCapture={(event) => {

              if (ignoreClickRef.current && event.detail !== 0) {

                event.preventDefault();

                event.stopPropagation();

                ignoreClickRef.current = false;

              }

            }}

          >

            <div

              className="jnr-hero-track"

              style={{

                transform: `translate3d(calc(-${index * 100}% + ${dragX}px), 0, 0)`,

              }}

            >

              {carouselBanners.map((banner, slideIndex) => (

                <div

                  className="jnr-hero-slide"

                  key={banner.id ?? banner.image ?? slideIndex}

                  role="group"

                  aria-label={`Banner ${slideIndex + 1} of ${count}`}

                  aria-roledescription="slide"

                  aria-hidden={slideIndex !== index}

                  inert={slideIndex !== index ? "" : undefined}

                >

                  <Link

                    className="jnr-hero-image-link"

                    to={banner.href || '/category/offer-zone'}

                    tabIndex={slideIndex === index ? 0 : -1}

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

                        src={resolveBannerImageUrl(banner.image)}

                        alt={banner.alt || ''}

                        loading={slideIndex === 0 ? 'eager' : 'lazy'}

                        fetchpriority={slideIndex === 0 ? 'high' : undefined}

                        draggable="false"
                        onError={(event) => {
                          console.error('[HeroBanner] Image failed:', event.currentTarget.currentSrc || banner.image);
                        }}

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

                  {carouselBanners.map((banner, dotIndex) => (

                    <button

                      key={banner.id ?? banner.image ?? dotIndex}

                      type="button"

                      aria-label={`Show banner ${dotIndex + 1}`}

                      aria-current={

                        dotIndex === index ? 'true' : undefined

                      }

                      className={`jnr-hero-dot${

                        dotIndex === index ? ' is-active' : ''

                      }`}

                      onClick={() => goTo(dotIndex)}

                    />

                  ))}

                </div>

              </>

            )}

          </div>

        )}

        {sidePromoBanners.length > 0 && (

          <aside

            className={[

              'jnr-hero-side',

              sidePromoBanners.length === 1

                ? 'jnr-hero-side--single'

                : '',

              !hasHeroBanners ? 'jnr-hero-side--two-only' : '',

            ]

              .filter(Boolean)

              .join(' ')}

            aria-label="Special promotions"
            onMouseEnter={() => setSidePromoPaused(true)}
            onMouseLeave={() => setSidePromoPaused(false)}
            onFocusCapture={() => setSidePromoPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setSidePromoPaused(false);
              }
            }}

          >

            {sidePromoBanners.map((banner, promoIndex) => (

              <Link

                key={banner.id ?? banner.image ?? promoIndex}

                className="jnr-hero-side-card"

                to={banner.href || '/category/offer-zone'}

                aria-label={banner.alt || 'View offer'}

                draggable="false"

              >

                <img

                  src={resolveBannerImageUrl(banner.image)}

                  alt={banner.alt || ''}

                  loading="lazy"

                  draggable="false"

                />

              </Link>

            ))}

          </aside>

        )}

      </div>

      <QuickOfferSlider interval={offersInterval} />

    </section>

  );

}
