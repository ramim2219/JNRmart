import { useEffect, useId, useRef, useState } from 'react';
import { Star, Send } from 'lucide-react';
import { demoReviews, getDescription, getSpecifications } from '../../data/productDetailsData';
import { useToast } from '../common/ToastProvider';

const sections = [
  { key: 'description', label: 'Description' },
  { key: 'specifications', label: 'Specifications' },
  { key: 'reviews', label: 'Reviews' },
];

function Stars({ rating = 0 }) {
  return <span className="jnr-pd-stars" aria-label={`${rating} out of 5 stars`}>{'★'.repeat(Math.max(0, Math.min(5, rating)))}<span>{'★'.repeat(5 - Math.max(0, Math.min(5, rating)))}</span></span>;
}

export default function ProductDetailsTabs({ product, tab, onTabChange }) {
  const toast = useToast();
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [name, setName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [notice, setNotice] = useState('');
  const tabsRef = useRef([]);
  const prefix = useId().replace(/:/g, '');
  const reviews = [...submittedReviews, ...demoReviews];

  useEffect(() => { setSubmittedReviews([]); setNotice(''); setName(''); setReviewTitle(''); setComment(''); setRating(5); onTabChange('description'); }, [product.slug]);

  const onKeyDown = (event, index) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % sections.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + sections.length) % sections.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = sections.length - 1;
    else return;
    event.preventDefault();
    onTabChange(sections[next].key);
    tabsRef.current[next]?.focus();
  };

  const submitReview = (event) => {
    event.preventDefault();
    if (!name.trim() || !comment.trim() || !reviewTitle.trim()) return;
    setSubmittedReviews(previous => [{
      id: `local-${Date.now()}`, name: name.trim(), title: reviewTitle.trim(), comment: comment.trim(),
      rating, date: 'Just now · frontend preview',
    }, ...previous]);
    setNotice('Your review appears in this preview only. It was not saved to a server.');
    toast.info('Your demo review is now visible. It was not saved to a server.', { id: 'review-demo', title: 'Review Preview' });
    setName(''); setReviewTitle(''); setComment(''); setRating(5);
  };

  return (
    <section className="jnr-pd-tabs" id="jnr-product-info" aria-label="Product information">
      <div className="jnr-pd-tabs__nav" role="tablist" aria-label="Product information sections">
        {sections.map((section, index) => <button
          key={section.key} ref={node => { tabsRef.current[index] = node; }}
          type="button" role="tab" id={`${prefix}-tab-${section.key}`}
          aria-selected={tab === section.key} aria-controls={`${prefix}-panel-${section.key}`}
          tabIndex={tab === section.key ? 0 : -1} onClick={() => onTabChange(section.key)}
          onKeyDown={event => onKeyDown(event, index)}
        >{section.label}{section.key === 'reviews' && <span className="jnr-pd-tabs__count">{reviews.length}</span>}</button>)}
      </div>
      <div role="tabpanel" id={`${prefix}-panel-${tab}`} aria-labelledby={`${prefix}-tab-${tab}`} className="jnr-pd-tabs__panel" tabIndex={0}>
        {tab === 'description' && <div className="jnr-pd-description"><h2>About this product</h2><p>{getDescription(product)}</p><p className="jnr-pd-demo-note">The product content is frontend demonstration data. Add accurate descriptions, ingredients, usage and warranty information through the Laravel API.</p></div>}
        {tab === 'specifications' && <><h2>Product specifications</h2><table className="jnr-pd-spec-table"><tbody>{getSpecifications(product).map((spec, index) => <tr key={`${spec.label}-${index}`}><th scope="row">{spec.label}</th><td>{spec.value}</td></tr>)}</tbody></table><p className="jnr-pd-demo-note">Only details available in the current demo catalog are shown.</p></>}
        {tab === 'reviews' && <div className="jnr-pd-review-layout">
          <div>
            <h2>Customer Reviews <span className="jnr-pd-demo-pill">Demo content</span></h2>
            <p className="jnr-pd-demo-note">The example reviews below are placeholders, not feedback from verified customers.</p>
            <div className="jnr-pd-review-list">
              {reviews.map(review => <article className="jnr-pd-review" key={review.id}>
                <div className="jnr-pd-review__header"><div className="jnr-pd-review__avatar" aria-hidden="true">{review.name.slice(0,1).toUpperCase()}</div><div><strong>{review.name}</strong><small>{review.date}</small></div></div>
                <Stars rating={review.rating}/><h3>{review.title}</h3><p>{review.comment}</p>
              </article>)}
            </div>
          </div>
          <form className="jnr-pd-review-form" onSubmit={submitReview}>
            <h3>Write a review</h3><p>Frontend preview — submissions are not stored after refresh.</p>
            <label>Your rating</label>
            <div className="jnr-pd-review-form__stars" role="group" aria-label="Your rating">
              {[1,2,3,4,5].map(value => <button type="button" key={value} aria-label={`${value} stars`} aria-pressed={value === rating} onClick={() => setRating(value)}><Star size={24} fill={value <= rating ? '#e8aa28' : 'none'} color={value <= rating ? '#e8aa28' : '#bcc7d9'}/></button>)}
            </div>
            <label htmlFor={`${prefix}-name`}>Your name</label><input id={`${prefix}-name`} maxLength={70} required value={name} onChange={event => setName(event.target.value)} placeholder="Your name" />
            <label htmlFor={`${prefix}-review-title`}>Review title</label><input id={`${prefix}-review-title`} maxLength={100} required value={reviewTitle} onChange={event => setReviewTitle(event.target.value)} placeholder="A short headline" />
            <label htmlFor={`${prefix}-review-comment`}>Your review</label><textarea id={`${prefix}-review-comment`} rows={4} maxLength={1000} required value={comment} onChange={event => setComment(event.target.value)} placeholder="What would you like to share?" />
            <button type="submit" className="jnr-pd-review-form__submit"><Send size={16}/> Post Demo Review</button>
            {notice && <p className="jnr-pd-review-form__notice" role="status">{notice}</p>}
          </form>
        </div>}
      </div>
    </section>
  );
}
