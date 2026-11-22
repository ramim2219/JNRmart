import apiClient from "../Axios/axiosConfig";

const OK = 1200;

/**
 * Keep the same API response contract used by comboServices:
 * return the response body ({ messageCode, data, message }) so existing
 * components can continue reading response.data.
 */
const unwrap = async (requestPromise) => {
  try {
    const response = await requestPromise;
    const body = response?.data;

    if (!body || Number(body.messageCode) !== OK) {
      throw new Error(body?.message || "Unexpected API response");
    }

    return body;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
      error?.response?.data?.errors && Object.values(error.response.data.errors).flat().join(" ") ||
      error?.message ||
      "Request failed"
    );
  }
};

const appendFormValue = (formData, key, value, wasProvided) => {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, value);
    return;
  }

  // Send an empty value only when the caller explicitly supplied that key.
  // If a key is absent during update, Laravel should preserve its old value.
  if (
    wasProvided &&
    ["offer_id", "combo_id", "promo_code_id", "banner_type"].includes(key)
  ) {
    formData.append(key, "");
  }
};

const toMultipart = (data, method = null) => {
  const formData = new FormData();

  if (method) formData.append("_method", method);

  Object.entries(data).forEach(([key, value]) => {
    appendFormValue(formData, key, value, Object.prototype.hasOwnProperty.call(data, key));
  });

  return formData;
};

const hasBannerFile = (data) =>
  typeof File !== "undefined" && data?.banner_image instanceof File;

export const fetchOfferBanners = (params = {}) =>
  unwrap(apiClient.get("OfferBanner/get_all", { params }));

export const fetchOfferBannerById = (id) =>
  unwrap(apiClient.get("OfferBanner/get_by_id", { params: { id } }));

export const saveOfferBanner = (data) =>
  unwrap(apiClient.post("OfferBanner/save", toMultipart(data)));

export const updateOfferBanner = (data) => {
  if (hasBannerFile(data)) {
    // Laravel multipart form updates should use POST + _method=PUT.
    return unwrap(
      apiClient.post("OfferBanner/update", toMultipart(data, "PUT"))
    );
  }

  return unwrap(apiClient.put("OfferBanner/update", data));
};

export const deleteOfferBanner = (id) =>
  unwrap(apiClient.delete("OfferBanner/delete", { data: { id } }));

// Public storefront route registered under Route::prefix('public').
export const fetchPublicOfferBanners = () =>
  unwrap(apiClient.get("public/OfferBanner/get_public"));
