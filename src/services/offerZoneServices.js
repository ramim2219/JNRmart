import apiClient from "../Axios/axiosConfig";

/**
 * Shop Offer Zone only. Existing product and admin service methods are untouched.
 * The backend is authoritative for published, running offers and assignment scope.
 */
async function getPublicData(url, { params, signal } = {}) {
  const { data } = await apiClient.get(url, { params, signal });

  if (Number(data?.messageCode) !== 1200) {
    const error = new Error(data?.message || "Unable to load offer data.");
    error.code = data?.messageCode;
    throw error;
  }

  return data;
}

export async function getRunningPublicOffers({ signal } = {}) {
  const body = await getPublicData("/public/offers/active", { signal });
  return Array.isArray(body?.data) ? body.data : [];
}

export function getPublicOfferShopProducts(offerId, params = {}, { signal } = {}) {
  const id = Number(offerId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("A valid offer must be selected.");
  }
  return getPublicData(`/public/offers/${id}/products`, { params, signal });
}
