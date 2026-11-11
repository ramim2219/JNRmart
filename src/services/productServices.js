import apiClient from "../Axios/axiosConfig";

const OK = 1200;

const PUBLIC_PRODUCT_ENDPOINT = "/public/products";
const PUBLIC_CATEGORY_ENDPOINT = "/Category/get_public";

async function unwrap(promise, label = "API") {
  try {
    const { data } = await promise;

    console.log(`[${label}] Response:`, data);

    if (
      data?.messageCode != null &&
      Number(data.messageCode) !== OK
    ) {
      const error = new Error(
        data.message || `Request failed (${data.messageCode})`
      );

      error.code = data.messageCode;
      error.errors = data.errors ?? null;

      console.error(`[${label}] API Error:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    if (error.response) {
      const responseData = error.response.data;

      const apiError = new Error(
        responseData?.message ||
          error.message ||
          "Something went wrong."
      );

      apiError.code =
        responseData?.messageCode ?? error.response.status;
      apiError.errors = responseData?.errors ?? null;
      apiError.status = error.response.status;

      console.error(`[${label}] HTTP Error:`, {
        status: apiError.status,
        message: apiError.message,
        errors: apiError.errors,
        response: responseData,
      });

      throw apiError;
    }

    console.error(`[${label}] Request Failed:`, error);
    throw error;
  }
}

function buildParams(params = {}) {
  const allowedParams = [
    "search",
    "company_id",
    "category_id",
    "brand_id",
    "page",
    "per_page",
    "sort",
  ];

  return Object.fromEntries(
    allowedParams
      .filter(
        (key) =>
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
      )
      .map((key) => [key, params[key]])
  );
}

export async function getPublicCategories({ signal } = {}) {
  console.log(
    "[Public Categories] Fetching:",
    PUBLIC_CATEGORY_ENDPOINT
  );

  return unwrap(
    apiClient.get(PUBLIC_CATEGORY_ENDPOINT, { signal }),
    "Public Categories"
  );
}

export async function getPublicProducts(
  params = {},
  { signal } = {}
) {
  const queryParams = buildParams(params);

  console.log("[Public Products] Fetching:", {
    endpoint: PUBLIC_PRODUCT_ENDPOINT,
    params: queryParams,
  });

  return unwrap(
    apiClient.get(PUBLIC_PRODUCT_ENDPOINT, {
      params: queryParams,
      signal,
    }),
    "Public Products"
  );
}

export async function getPublicProductById(
  id,
  { signal } = {}
) {
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw new Error("A valid product ID is required.");
  }

  const endpoint =
    `${PUBLIC_PRODUCT_ENDPOINT}/${encodeURIComponent(id)}`;

  console.log("[Public Product Details] Fetching:", {
    endpoint,
    productId: id,
  });

  return unwrap(
    apiClient.get(endpoint, { signal }),
    "Public Product Details"
  );
}

const publicProductServices = {
  getPublicCategories,
  getPublicProducts,
  getPublicProductById,
};

export default publicProductServices;
