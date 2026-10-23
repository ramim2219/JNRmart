import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, ImageOff } from 'lucide-react';
import { getProductImages } from '../../data/productDetailsData';

export default function ProductGallery({ product }) {
  const images = getProductImages(product);
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const active = images[Math.min(selected, Math.max(0, images.length - 1))];

  useEffect(() => { setSelected(0); setZoomed(false); }, [product.slug]);
  useEffect(() => {
    if (!zoomed) return undefined;
    const onKeyDown = event => {
      if (event.key === 'Escape') setZoomed(false);
      if (event.key === 'ArrowRight') setSelected(current => (current + 1) % images.length);
      if (event.key === 'ArrowLeft') setSelected(current => (current - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKeyDown);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = oldOverflow; };
  }, [zoomed, images.length]);

  const shift = direction => setSelected(current => (current + direction + images.length) % images.length);

  return (
    <div className="jnr-pd-gallery">
      <div className="jnr-pd-gallery__stage">
        {product.oldPrice > product.price && (
          <span className="jnr-pd-gallery__discount">{Math.round((1 - product.price / product.oldPrice) * 100)}% OFF</span>
        )}
        {active ? (
          <button type="button" className="jnr-pd-gallery__zoom-trigger" onClick={() => setZoomed(true)} aria-label="View larger product image">
            <img src={active.src} alt={active.alt} decoding="async" />
            <span className="jnr-pd-gallery__zoom-hint"><Maximize2 size={15}/> Click to enlarge</span>
          </button>
        ) : <div className="jnr-pd-gallery__empty"><ImageOff size={36}/><span>No image available</span></div>}
        {images.length > 1 && (
          <>
            <button type="button" className="jnr-pd-gallery__nav is-prev" onClick={() => shift(-1)} aria-label="Previous image"><ChevronLeft size={20}/></button>
            <button type="button" className="jnr-pd-gallery__nav is-next" onClick={() => shift(1)} aria-label="Next image"><ChevronRight size={20}/></button>
          </>
        )}
      </div>
      <div className="jnr-pd-gallery__thumbs" aria-label="Product image thumbnails">
        {images.map((image, index) => (
          <button key={`${image.src}-${index}`} type="button" className={`jnr-pd-gallery__thumb ${index === selected ? 'is-active' : ''}`} onClick={() => setSelected(index)} aria-label={`Show image ${index + 1}`} aria-pressed={index === selected}>
            <img src={image.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      {zoomed && active && (
        <div className="jnr-pd-lightbox" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setZoomed(false); }}>
          <div className="jnr-pd-lightbox__dialog" role="dialog" aria-modal="true" aria-label={`${product.name} expanded image`}>
            <button autoFocus type="button" className="jnr-pd-lightbox__close" onClick={() => setZoomed(false)} aria-label="Close image"><X size={23}/></button>
            <img src={active.src} alt={active.alt} />
            {images.length > 1 && <div className="jnr-pd-lightbox__arrows"><button onClick={() => shift(-1)} aria-label="Previous image"><ChevronLeft/></button><span>{selected + 1} / {images.length}</span><button onClick={() => shift(1)} aria-label="Next image"><ChevronRight/></button></div>}
          </div>
        </div>
      )}
    </div>
  );
}
