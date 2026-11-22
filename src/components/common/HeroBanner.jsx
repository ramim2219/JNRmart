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

const toShowcaseBanner = (banner) => ({

  id: banner.id,

  image:

    banner.banner_image_url ||

    banner.image_url ||

    banner.banner_image ||

    '',

  href: banner.href || '/category/offer-zone',

  alt: banner.alt || banner.offer?.name || 'Explore this offer',

  title: banner.title || banner.offer?.name || 'Special offer',

});

/**

 * Remove duplicate records before deciding the layout.

 * Prefer the database ID; use the image path when an ID is unavailable.

 */

const removeDuplicateBanners = (banners) => {

  const seenIds = new Set();

  const seenImages = new Set();

  return banners.filter((banner) => {

    const idKey =

      banner.id !== undefined && banner.id !== null

        ? String(banner.id)

        : null;

    const imageKey = banner.image || null;

    if (

      (idKey !== null && seenIds.has(idKey)) ||

      (imageKey !== null && seenImages.has(imageKey))

    ) {

      return false;

    }

    if (idKey !== null) seenIds.add(idKey);

    if (imageKey !== null) seenImages.add(imageKey);

    return true;

  });

};

/**

 * Return a random sample without replacement.

 * This guarantees that the same banner cannot be selected twice.

 */

const pickRandomBanners = (banners, limit) => {

  const shuffled = [...banners];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {

    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [

      shuffled[randomIndex],

      shuffled[i],

    ];

  }

  return shuffled.slice(0, Math.min(limit, shuffled.length));

};

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

          .filter((banner) => Number(banner?.status) === 1)

          .filter((banner) =>

            Boolean(

              banner?.banner_image_url ||

                banner?.image_url ||

                banner?.banner_image

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

                String(banner?.banner_type || '').toLowerCase() ===

                'hero_banner'

            )

            .map(toShowcaseBanner)

        );

        const promotionRows = removeDuplicateBanners(

          rows

            .filter(

              (banner) =>

                String(banner?.banner_type || '').toLowerCase() ===

                'promotion_1'

            )

            .map(toShowcaseBanner)

        );

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

  const sidePromoBanners = useMemo(() => {

    if (!hasHeroBanners) {

      return promosOnlyTwo ? promos : [];

    }

    if (promos.length <= 2) {

      return promos;

    }

    return pickRandomBanners(promos, 2);

  }, [hasHeroBanners, promosOnlyTwo, promos]);

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

                  inert={slideIndex !== index}

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

                        src={banner.image}

                        alt={banner.alt || ''}

                        loading={slideIndex === 0 ? 'eager' : 'lazy'}

                        fetchPriority={

                          slideIndex === 0 ? 'high' : 'auto'

                        }

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

                  src={banner.image}

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
