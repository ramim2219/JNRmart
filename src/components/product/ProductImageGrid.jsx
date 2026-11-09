import { useState } from 'react';
import { ImageOff, Maximize2 } from 'lucide-react';

import ProductImageLightbox from './ProductImageLightbox';

export default function ProductImageGrid({ images = [], productName = 'Product' }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  if (!images.length) {
    return (
      <div className="jnr-pd-images__empty">
        <ImageOff size={36} aria-hidden="true" />
        <h3>No product images available</h3>
        <p>Images will appear here once they are added.</p>
      </div>
    );
  }

  return (
    <>
      <div className="jnr-pd-images__grid">
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            className="jnr-pd-images__item"
            onClick={() => setSelectedIndex(index)}
            aria-label={`View ${productName} image ${index + 1}`}
          >
            <span className="jnr-pd-images__image-wrap">
              <img
                src={image.src}
                alt={image.alt || `${productName} image ${index + 1}`}
                loading="lazy"
                decoding="async"
              />
              <span className="jnr-pd-images__zoom" aria-hidden="true">
                <Maximize2 size={17} />
              </span>
            </span>
            <span className="jnr-pd-images__label">Image {index + 1}</span>
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <ProductImageLightbox
          images={images}
          index={selectedIndex}
          productName={productName}
          onIndexChange={setSelectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}
