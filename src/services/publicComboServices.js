import apiClient from "../Axios/axiosConfig";

/** Public listing only: /api/public/combos, not the protected Combo/get_all API. */
export async function getPublicCombos({ page = 1, perPage = 12, signal } = {}) {
  const { data: body } = await apiClient.get("/public/combos", {
    params: { page, per_page: perPage },
    signal,
    baseURL: "/api",
  });

  if (Number(body?.messageCode) !== 1200 || !Array.isArray(body?.data)) {
    throw new Error(body?.message || "Unable to load combo deals.");
  }
  return body;
}


/** Read a single available combo for the combo details page. */
export async function getPublicComboById(id, { signal } = {}) {
  if (!/^[1-9]\d*$/.test(String(id ?? ""))) {
    throw new Error("Invalid combo ID.");
  }
  const { data: body } = await apiClient.get(
    `/public/combos/${encodeURIComponent(String(id))}`,
    { signal, baseURL: "/api" }
  );
  if (Number(body?.messageCode) !== 1200 || !body?.data || Array.isArray(body.data)) {
    throw new Error(body?.message || "Combo not found.");
  }
  return body.data;
}


/** Server-authoritative combo price and inventory check. */
export async function quoteComboCheckout(items, { signal } = {}) {
  const { data: body } = await apiClient.post('/public/combo-checkout/quote', { items }, { signal, baseURL: '/api' });
  if (Number(body?.messageCode) !== 1200) throw new Error(body?.message || 'Unable to prepare checkout.');
  return body.data;
}

/** Creates pending/unpaid PICKUP order only; never processes payment. */
export async function placeComboPickupOrder(payload) {
  const { data: body } = await apiClient.post('/public/combo-checkout/place', payload, { baseURL: '/api' });
  if (Number(body?.messageCode) !== 1200) throw new Error(body?.message || 'Could not place pickup order.');
  return body.data;
}

export async function getPublicComboReviews(comboId, { page = 1, signal } = {}) {
  const { data: body } = await apiClient.get(`/public/combos/${comboId}/reviews`, { params: { page }, signal, baseURL: '/api' });
  if (Number(body?.messageCode) !== 1200) throw new Error(body?.message || 'Unable to load combo reviews.');
  return body.data;
}

export async function submitComboReview(comboId, payload) {
  const { data: body } = await apiClient.post(`/public/combos/${comboId}/reviews`, payload, { baseURL: '/api' });
  if (Number(body?.messageCode) !== 1200) throw new Error(body?.message || 'Could not submit review.');
  return body;
}
