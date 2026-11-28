import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getPublicComboReviews, submitComboReview } from "../../services/publicComboServices";
import "../../styles/combo-reviews.css";

export default function ComboReviews({ comboId, summary }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ order_number: "", customer_contact: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getPublicComboReviews(comboId, { page, signal: controller.signal })
      .then(setData)
      .catch(err => { if (!controller.signal.aborted) setError(err?.response?.data?.message || err?.message || "Unable to load reviews."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [comboId, page]);

  const saveReview = async event => {
    event.preventDefault();
    setNotice("");
    setSubmitting(true);
    try {
      const result = await submitComboReview(comboId, form);
      setNotice(result.message || "Review submitted for approval.");
      setForm({ order_number: "", customer_contact: "", rating: 5, comment: "" });
    } catch (err) {
      setNotice(err?.response?.data?.message || err?.message || "Unable to submit review.");
    } finally { setSubmitting(false); }
  };
  const rating = Number(data?.summary?.average_rating ?? summary?.average_rating ?? 0);
  const count = Number(data?.summary?.count ?? summary?.count ?? 0);
  return (
    <section className="jnr-combo-reviews" aria-label="Combo reviews" id="combo-reviews">
      <h2>Customer Reviews</h2>
      <p className="jnr-combo-reviews__summary"><Star size={19} aria-hidden="true" /> {rating.toFixed(1)} / 5 · {count} approved {count === 1 ? "review" : "reviews"}</p>
      {loading && <p role="status">Loading reviews...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && !data?.reviews?.length && <p>No approved reviews yet.</p>}
      <div className="jnr-combo-reviews__list">
        {data?.reviews?.map(review => <article key={review.id}>
          <strong>{review.reviewer_name || "Verified buyer"}</strong>
          <span aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
          <p>{review.comment}</p>
          <small>Verified completed purchase · {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}</small>
        </article>)}
      </div>
      {data?.last_page > 1 && <div className="jnr-combo-reviews__pages">
        <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
        <span>Page {page} / {data.last_page}</span>
        <button type="button" onClick={() => setPage(p => Math.min(data.last_page, p + 1))} disabled={page === data.last_page}>Next</button>
      </div>}
      <form onSubmit={saveReview} className="jnr-combo-reviews__form">
        <h3>Review your completed combo order</h3>
        <p>Enter the order number and contact number used at checkout. Only completed purchases can be reviewed. Submissions appear after moderation.</p>
        <label>Order number<input required maxLength={60} value={form.order_number}
          onChange={event => setForm(old => ({ ...old, order_number: event.target.value }))} /></label>
        <label>Checkout phone number<input required maxLength={30} value={form.customer_contact}
          onChange={event => setForm(old => ({ ...old, customer_contact: event.target.value }))} /></label>
        <label>Rating<select value={form.rating} onChange={event => setForm(old => ({ ...old, rating: Number(event.target.value) }))}>
          {[5,4,3,2,1].map(i => <option value={i} key={i}>{i} / 5 stars</option>)}
        </select></label>
        <label>Review<textarea required minLength={10} maxLength={1500} rows={4} value={form.comment}
          onChange={event => setForm(old => ({ ...old, comment: event.target.value }))} /></label>
        <button disabled={submitting} type="submit">{submitting ? "Submitting..." : "Submit Review"}</button>
        {notice && <p role="status">{notice}</p>}
      </form>
    </section>
  );
}
