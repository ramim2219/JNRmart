import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Maximize2,
} from "lucide-react";

import {
  getProductImages,
  getVariantPricing,
} from "../../utils/productHelpers";

import ProductImageLightbox from "./ProductImageLightbox";

const INITIAL_POSITION = { x: 50, y: 50 };

export default function ProductGallery({ product }) {
  const images = getProductImages(product);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHoverZoomed, setIsHoverZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState(INITIAL_POSITION);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeImage = images[selectedIndex];

  const variants = Array.isArray(product?.variants)
    ? product.variants
    : [];

  const defaultVariant = variants.find((variant) =>
    variant.prices?.some(
      (price) => price.is_default && price.is_active
    )
  ) || variants[0];

  const pricing = getVariantPricing(defaultVariant);
  const price = pricing.price;
  const oldPrice = pricing.oldPrice;

  const discount =
    oldPrice > price && oldPrice > 0
      ? Math.round((1 - price / oldPrice) * 100)
      : 0;

  useEffect(() => {
    setSelectedIndex(0);
    setIsHoverZoomed(false);
    setZoomPosition(INITIAL_POSITION);
    setIsLightboxOpen(false);
  }, [product?.id]);

  useEffect(() => {
    if (selectedIndex >= images.length) {
      setSelectedIndex(0);
    }
  }, [images.length, selectedIndex]);

  const updateZoomPosition = (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;

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

  const selectImage = (index) => {
    setSelectedIndex(index);
    setIsHoverZoomed(false);
    setZoomPosition(INITIAL_POSITION);
  };

  const changeImage = (direction) => {
    if (images.length < 2) return;

    setSelectedIndex(
      (current) =>
        (current + direction + images.length) % images.length
    );

    setIsHoverZoomed(false);
    setZoomPosition(INITIAL_POSITION);
  };

  const handlePointerEnter = (event) => {
    if (event.pointerType !== "mouse") return;

    updateZoomPosition(event);
    setIsHoverZoomed(true);
  };

  const handlePointerLeave = () => {
    setIsHoverZoomed(false);
    setZoomPosition(INITIAL_POSITION);
  };

  return (
    <section className="jnr-pd-gallery" aria-label="Product images">
      <div className="jnr-pd-gallery__stage">
        {discount > 0 && (
          <span className="jnr-pd-gallery__discount">
            {discount}% OFF
          </span>
        )}

        {activeImage ? (
          <button
            type="button"
            className={`jnr-pd-gallery__zoom-trigger ${
              isHoverZoomed ? "is-zoomed" : ""
            }`}
            onPointerEnter={handlePointerEnter}
            onPointerMove={(event) => {
              if (isHoverZoomed) updateZoomPosition(event);
            }}
            onPointerLeave={handlePointerLeave}
            onClick={() => setIsLightboxOpen(true)}
            aria-label="Open product image in large view"
          >
            <img
              src={activeImage.src}
              alt={activeImage.alt || product.name}
              draggable="false"
              decoding="async"
              style={{
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            />

            <span className="jnr-pd-gallery__zoom-hint">
              <Maximize2 size={15} />
              Hover to zoom · Click to enlarge
            </span>
          </button>
        ) : (
          <div className="jnr-pd-gallery__empty">
            <ImageOff size={36} aria-hidden="true" />
            <span>No image available</span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="jnr-pd-gallery__nav is-prev"
              onClick={() => changeImage(-1)}
              aria-label="Previous product image"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              className="jnr-pd-gallery__nav is-next"
              onClick={() => changeImage(1)}
              aria-label="Next product image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="jnr-pd-gallery__thumbs"
          aria-label="Product thumbnails"
        >
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              className={`jnr-pd-gallery__thumb ${
                index === selectedIndex ? "is-active" : ""
              }`}
              onClick={() => selectImage(index)}
              aria-label={`Show product image ${index + 1}`}
              aria-pressed={index === selectedIndex}
            >
              <img
                src={image.src}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}

      {isLightboxOpen && activeImage && (
        <ProductImageLightbox
          images={images}
          index={selectedIndex}
          productName={product.name}
          onIndexChange={setSelectedIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </section>
  );
}
