
import apiClient from "../Axios/axiosConfig";

const OK = 1200;

/**
 * Supports both API response formats:
 *
 * 1. Standard API:
 *    { messageCode: 1200, data: [], message: "Success" }
 *
 * 2. Public API:
 *    { success: true, data: [], message: "Success" }
 *
 * Returns the complete response body so existing components
 * can continue reading response.data.
 */

const unwrap = async (requestPromise) => {
  try {
    const response = await requestPromise;
    const body = response?.data;

    const isStandardSuccess =
      Number(body?.messageCode) === OK;

    const isPublicSuccess =
      body?.success === true;

    if (!body || (!isStandardSuccess && !isPublicSuccess)) {
      throw new Error(
        body?.message || "Unexpected API response"
      );
    }

    return body;

  } catch (error) {
    // Preserve Axios cancellation errors.
    if (
      error?.code === "ERR_CANCELED" ||
      error?.name === "CanceledError"
    ) {
      throw error;
    }

    const responseData = error?.response?.data;

    const validationErrors = responseData?.errors
      ? Object.values(responseData.errors).flat().join(" ")
      : "";

    throw new Error(
      responseData?.message ||
      validationErrors ||
      error?.message ||
      "Request failed"
    );
  }
};

const appendFormValue = (
  formData,
  key,
  value,
  wasProvided
) => {
  if (
    value !== undefined &&
    value !== null &&
    value !== ""
  ) {
    formData.append(key, value);
    return;
  }

  // Send empty value only when explicitly supplied.
  // Missing fields during update preserve their old values.
  if (
    wasProvided &&
    [
      "offer_id",
      "combo_id",
      "promo_code_id",
      "banner_type",
    ].includes(key)
  ) {
    formData.append(key, "");
  }
};

const toMultipart = (data, method = null) => {
  const formData = new FormData();

  if (method) {
    formData.append("_method", method);
  }

  Object.entries(data).forEach(([key, value]) => {
    appendFormValue(
      formData,
      key,
      value,
      Object.prototype.hasOwnProperty.call(data, key)
    );
  });

  return formData;
};

const hasBannerFile = (data) =>
  typeof File !== "undefined" &&
  data?.banner_image instanceof File;


// ==========================================
// ADMIN OFFER BANNER APIs
// ==========================================

export const fetchOfferBanners = (params = {}) =>
  unwrap(
    apiClient.get("OfferBanner/get_all", { params })
  );

export const fetchOfferBannerById = (id) =>
  unwrap(
    apiClient.get("OfferBanner/get_by_id", {
      params: { id },
    })
  );

export const saveOfferBanner = (data) =>
  unwrap(
    apiClient.post(
      "OfferBanner/save",
      toMultipart(data)
    )
  );

export const updateOfferBanner = (data) => {
  if (hasBannerFile(data)) {
    // Laravel multipart update: POST + _method=PUT.
    return unwrap(
      apiClient.post(
        "OfferBanner/update",
        toMultipart(data, "PUT")
      )
    );
  }

  return unwrap(
    apiClient.put("OfferBanner/update", data)
  );
};

export const deleteOfferBanner = (id) =>
  unwrap(
    apiClient.delete("OfferBanner/delete", {
      data: { id },
    })
  );


// ==========================================
// PUBLIC STOREFRONT BANNER API
// ==========================================

export const fetchPublicOfferBanners = () =>
  unwrap(
    apiClient.get("public/OfferBanner/get_public")
  );
