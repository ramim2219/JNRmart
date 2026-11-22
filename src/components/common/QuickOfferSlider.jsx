
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "../../styles/quick-offer-slider.css";

const DISCOUNT_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

const QUICK_OFFERS = DISCOUNT_LEVELS.map((discount) => ({
  discount,
  image: `/images/quick_banners/quick_offer_${discount}percent.webp`,
}));

/**
 * JNRmart discount banner slider.
 *
 * Images:
 * public/images/quick_banners/
 *
 * Filename:
 * quick_offer_10percent.webp
 * quick_offer_20percent.webp
 * ...
 * quick_offer_90percent.webp
 */

export default function QuickOfferSlider({ interval = 3800 }) {
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const ignoreClickRef = useRef(false);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;

    setCanPrev(track.scrollLeft > 3);
    setCanNext(maxScroll > 3 && track.scrollLeft < maxScroll - 3);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    updateEdges();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateEdges)
        : null;

    observer?.observe(track);

    track.addEventListener("scroll", updateEdges, {
      passive: true,
    });

    window.addEventListener("resize", updateEdges);

    return () => {
      observer?.disconnect();
      track.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  const getStepDistance = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;

    const card = track.querySelector(".jnr-quick-card");

    if (!card) {
      return Math.max(220, track.clientWidth * 0.75);
    }

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 8;

    return card.getBoundingClientRect().width + gap;
  }, []);

  const step = useCallback(
    (direction) => {
      const track = trackRef.current;
      if (!track) return;

      const reduceMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches;

      track.scrollBy({
        left: getStepDistance() * direction,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [getStepDistance]
  );

  // Auto slide
  useEffect(() => {
    const track = trackRef.current;

    if (
      !track ||
      QUICK_OFFERS.length < 2 ||
      paused ||
      dragging ||
      interval <= 0
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const distance = getStepDistance();

      if (maxScroll <= 3 || distance <= 0) return;

      const reduceMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches;

      track.scrollTo({
        left:
          track.scrollLeft >= maxScroll - distance / 2
            ? 0
            : track.scrollLeft + distance,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, paused, dragging, getStepDistance]);

  // Mouse drag
  const pointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    ignoreClickRef.current = false;

    dragRef.current = {
      x: event.clientX,
      start: trackRef.current?.scrollLeft || 0,
      pointerId: event.pointerId,
      moved: false,
    };
  };

  const pointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.x;

    if (!drag.moved && Math.abs(deltaX) < 7) return;

    if (!drag.moved) {
      drag.moved = true;
      ignoreClickRef.current = true;
      setDragging(true);

      try {
        trackRef.current?.setPointerCapture(event.pointerId);
      } catch {
        // Pointer may already have ended.
      }
    }

    if (trackRef.current) {
      trackRef.current.scrollLeft = drag.start - deltaX;
    }
  };

  const pointerUp = (event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;

    dragRef.current = null;
    setDragging(false);

    try {
      if (trackRef.current?.hasPointerCapture?.(event.pointerId)) {
        trackRef.current.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer may already have been released.
    }
  };

  return (
    <section
      className="jnr-quick-wrap"
      aria-label="Shop products by discount"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        if (!dragRef.current) setPaused(false);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <button
        type="button"
        className="jnr-quick-arrow jnr-quick-arrow--prev"
        aria-label="Previous discount banners"
        onClick={() => step(-1)}
        disabled={!canPrev}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      <div
        className={`jnr-quick-track${dragging ? " is-dragging" : ""}`}
        ref={trackRef}
        role="region"
        aria-label="Discount banners"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;

          if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
          }

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
          }
        }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (ignoreClickRef.current && event.detail !== 0) {
            event.preventDefault();
            event.stopPropagation();
            ignoreClickRef.current = false;
          }
        }}
      >
        {QUICK_OFFERS.map(({ discount, image }, index) => (
          <Link
            key={discount}
            to={`/category/offer-zone?minDiscount=${discount}`}
            className="jnr-quick-card"
            draggable="false"
            aria-label={`View products with more than ${discount}% discount`}
            title={`Up to ${discount}% discount`}
          >
            <img
              src={image}
              alt=""
              loading={index < 4 ? "eager" : "lazy"}
              decoding="async"
              draggable="false"
              onLoad={updateEdges}
              onError={(event) => {
                console.error(
                  `[QuickOfferSlider] Image not found: ${image}`
                );

                event.currentTarget.classList.add("is-image-missing");
              }}
            />
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="jnr-quick-arrow jnr-quick-arrow--next"
        aria-label="Next discount banners"
        onClick={() => step(1)}
        disabled={!canNext}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </section>
  );
}
