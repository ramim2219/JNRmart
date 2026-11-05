
import apiClient from "../Axios/axiosConfig";

const OK = 1200;

// Handle API response and errors
async function unwrap(promise) {
  try {
    const response = await promise;
    const body = response.data;

    if (
      body?.messageCode != null &&
      Number(body.messageCode) !== OK
    ) {
      throw new Error(
        body.message || `Request failed (${body.messageCode})`
      );
    }

    return body;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
}

// Fetch public categories created by Super Admin
export const fetchPublicCategories = (opts = {}) => {
  const params = {};

  if (opts.tree) {
    params.tree = 1;
  }

  return unwrap(
    apiClient.get("Category/get_public", { params })
  );
};
