import { useEffect, useId, useRef, useState } from 'react';
import { Send, Star } from 'lucide-react';

import {
  demoReviews,
  getDescription,
  getProductImages,
  getSpecifications,
} from '../../data/productDetailsData';

import { useToast } from '../common/ToastProvider';
import ProductImageGrid from './ProductImageGrid';

const TABS = [
  { key: 'description', label: 'Description' },
  { key: 'specifications', label: 'Specifications' },
  { key: 'images', label: 'Images' },
  { key: 'reviews', label: 'Reviews' },
];

function Stars({ rating = 0 }) {
  const numericRating = Number(rating);
  const value = Number.isFinite(numericRating)
    ? Math.max(0, Math.min(5, Math.round(numericRating)))
    : 0;

  return (
    <span className="jnr-pd-stars" aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(value)}
      <span>{'★'.repeat(5 - value)}</span>
    </span>
  );
}

function ReviewCard({ review }) {
  const initial = review.name?.trim()?.charAt(0)?.toUpperCase() || '?';

  return (
    <article className="jnr-pd-review">
      <div className="jnr-pd-review__header">
        <div className="jnr-pd-review__avatar" aria-hidden="true">
          {initial}
        </div>
        <div>
          <strong>{review.name}</strong>
          <small>{review.date}</small>
        </div>
      </div>

      <Stars rating={review.rating} />
      <h3>{review.title}</h3>
      <p>{review.comment}</p>
    </article>
  );
}

function ReviewForm({ onSubmit, notice }) {
  const formId = useId().replace(/:/g, '');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim() || !title.trim() || !comment.trim()) return;

    onSubmit({
      id: `local-${Date.now()}`,
      name: name.trim(),
      title: title.trim(),
      comment: comment.trim(),
      rating,
      date: 'Just now · frontend preview',
    });

    setName('');
    setTitle('');
    setComment('');
    setRating(5);
  };

  return (
    <form className="jnr-pd-review-form" onSubmit={handleSubmit}>
      <h3>Write a review</h3>
      <p>Frontend preview — submissions are not stored after refresh.</p>

      <span className="jnr-pd-review-form__label">Your rating</span>
      <div className="jnr-pd-review-form__stars" role="group" aria-label="Choose your rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            type="button"
            key={value}
            aria-label={`${value} stars`}
            aria-pressed={value === rating}
            onClick={() => setRating(value)}
          >
            <Star
              size={23}
              fill={value <= rating ? '#e8aa28' : 'none'}
              color={value <= rating ? '#e8aa28' : '#bcc7d9'}
            />
          </button>
        ))}
      </div>

      <label htmlFor={`${formId}-name`}>Your name</label>
      <input
        id={`${formId}-name`}
        name="name"
        maxLength={70}
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Your name"
      />

      <label htmlFor={`${formId}-title`}>Review title</label>
      <input
        id={`${formId}-title`}
        name="title"
        maxLength={100}
        required
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="A short headline"
      />

      <label htmlFor={`${formId}-comment`}>Your review</label>
      <textarea
        id={`${formId}-comment`}
        name="comment"
        rows={4}
        maxLength={1000}
        required
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="What would you like to share?"
      />

      <button type="submit" className="jnr-pd-review-form__submit">
        <Send size={16} />
        Post Demo Review
      </button>

      {notice && (
        <p className="jnr-pd-review-form__notice" role="status">{notice}</p>
      )}
    </form>
  );
}

export default function ProductDetailsTabs({ product, tab, onTabChange }) {
  const toast = useToast();
  const tabsRef = useRef([]);
  const id = useId().replace(/:/g, '');
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [notice, setNotice] = useState('');

  const images = getProductImages(product) || [];
  const reviews = [...submittedReviews, ...(demoReviews || [])];

  useEffect(() => {
    setSubmittedReviews([]);
    setNotice('');
    onTabChange('description');
  }, [product.slug, onTabChange]);

  const handleTabKeyDown = (event, currentIndex) => {
    let nextIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % TABS.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = TABS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    onTabChange(TABS[nextIndex].key);
    tabsRef.current[nextIndex]?.focus();
  };

  const handleReviewSubmit = (review) => {
    setSubmittedReviews((current) => [review, ...current]);
    setNotice('Your review appears in this preview only. It was not saved to a server.');

    toast.info('Your demo review is now visible. It was not saved to a server.', {
      id: 'review-demo',
      title: 'Review preview',
    });
  };

  return (
    <section
      className="jnr-pd-tabs"
      id="jnr-product-info"
      aria-label="Product information"
    >
      <div className="jnr-pd-tabs__nav" role="tablist" aria-label="Product information sections">
        {TABS.map((item, index) => (
          <button
            key={item.key}
            ref={(node) => { tabsRef.current[index] = node; }}
            type="button"
            role="tab"
            id={`${id}-tab-${item.key}`}
            aria-selected={tab === item.key}
            aria-controls={`${id}-panel`}
            tabIndex={tab === item.key ? 0 : -1}
            onClick={() => onTabChange(item.key)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {item.label}
            {item.key === 'images' && (
              <span className="jnr-pd-tabs__count">{images.length}</span>
            )}
            {item.key === 'reviews' && (
              <span className="jnr-pd-tabs__count">{reviews.length}</span>
            )}
          </button>
        ))}
      </div>

      <div
        className="jnr-pd-tabs__panel"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${tab}`}
        tabIndex={0}
      >
        {tab === 'description' && (
          <div className="jnr-pd-description">
            <h2>About this product</h2>
            <p>{getDescription(product)}</p>
            <p className="jnr-pd-demo-note">
              The product content is frontend demonstration data. Add accurate
              descriptions, ingredients, usage and warranty information through
              the Laravel API.
            </p>
          </div>
        )}

        {tab === 'specifications' && (
          <>
            <h2>Product specifications</h2>
            <table className="jnr-pd-spec-table">
              <tbody>
                {getSpecifications(product).map((spec, index) => (
                  <tr key={`${spec.label}-${index}`}>
                    <th scope="row">{spec.label}</th>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="jnr-pd-demo-note">
              Only details available in the current demo catalog are shown.
            </p>
          </>
        )}

        {tab === 'images' && (
          <div className="jnr-pd-images">
            <div className="jnr-pd-images__header">
              <div>
                <h2>Product images</h2>
                <p>Explore all available product images.</p>
              </div>
              <span className="jnr-pd-images__total">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </span>
            </div>
            <ProductImageGrid images={images} productName={product.name} />
          </div>
        )}

        {tab === 'reviews' && (
          <div className="jnr-pd-review-layout">
            <div>
              <h2>
                Customer Reviews{' '}
                <span className="jnr-pd-demo-pill">Demo content</span>
              </h2>
              <p className="jnr-pd-demo-note">
                The example reviews below are placeholders, not feedback from
                verified customers.
              </p>
              <div className="jnr-pd-review-list">
                {reviews.map((review, index) => (
                  <ReviewCard
                    key={review.id || `${review.name}-${index}`}
                    review={review}
                  />
                ))}
              </div>
            </div>

            <ReviewForm onSubmit={handleReviewSubmit} notice={notice} />
          </div>
        )}
      </div>
    </section>
  );
}
