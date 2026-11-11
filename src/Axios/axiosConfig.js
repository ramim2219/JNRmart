
import axios from "axios";

const apiUrl =
  import.meta.env.VITE_API_URL || "/api";

const apiClient = axios.create({
  baseURL: apiUrl.replace(/\/+$/, ""),
  headers: {
    Accept: "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message =
        error.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : error.message || "Network error. Please try again.";
    } else {
      const data = error.response.data || {};

      const firstError = data?.errors
        ? Object.values(data.errors).flat().find(Boolean)
        : null;

      error.message =
        firstError ||
        data?.message ||
        `Request failed (${error.response.status})`;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
