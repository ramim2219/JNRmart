import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const INITIAL_POSITION = { x: 50, y: 50 };

export default function ProductImageLightbox({
  images = [],
  index = 0,
  productName = "Product",
  onIndexChange,
  onClose,
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState(INITIAL_POSITION);

  const image = images[index];

  const changeImage = useCallback(
    (direction) => {
      if (images.length < 2) return;

      onIndexChange(
        (index + direction + images.length) % images.length
      );

      setIsZoomed(false);
      setZoomPosition(INITIAL_POSITION);
    },
    [images.length, index, onIndexChange]
  );

  useEffect(() => {
    setIsZoomed(false);
    setZoomPosition(INITIAL_POSITION);
  }, [index]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") changeImage(1);
      if (event.key === "ArrowLeft") changeImage(-1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeImage, onClose]);

  if (!image) return null;

  const updateZoomPosition = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    setZoomPosition({
      x: Math.max(
        0,
        Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)
      ),
      y: Math.max(
        0,
        Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)
      ),
    });
  };

  return (
    <div
      className="jnr-pd-lightbox"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="jnr-pd-lightbox__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${productName} image preview`}
      >
        <button
          type="button"
          className="jnr-pd-lightbox__close"
          onClick={onClose}
          aria-label="Close image preview"
          autoFocus
        >
          <X size={22} />
        </button>

        <button
          type="button"
          className={`jnr-pd-lightbox__image ${
            isZoomed ? "is-zoomed" : ""
          }`}
          onClick={() => setIsZoomed((current) => !current)}
          onPointerMove={updateZoomPosition}
          aria-label={isZoomed ? "Reset image zoom" : "Zoom image"}
          aria-pressed={isZoomed}
        >
          <img
            src={image.src}
            alt={image.alt || `${productName} image ${index + 1}`}
            draggable="false"
            style={{
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
            }}
          />
        </button>

        <span
          className="jnr-pd-lightbox__zoom-label"
          aria-live="polite"
        >
          {isZoomed
            ? "Move pointer to explore · Click to reset"
            : "Click image to zoom"}
        </span>

        {images.length > 1 && (
          <div className="jnr-pd-lightbox__controls">
            <button
              type="button"
              onClick={() => changeImage(-1)}
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>

            <span>
              {index + 1} / {images.length}
            </span>

            <button
              type="button"
              onClick={() => changeImage(1)}
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
