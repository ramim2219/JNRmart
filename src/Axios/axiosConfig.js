
import axios from "axios";

const apiUrl =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api/";

const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    Accept: "application/json",
  },
  timeout: 15000,
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(
        new Error(
          error.message || "Network error. Please try again."
        )
      );
    }

    const data = error.response.data || {};

    const firstError =
      data?.errors &&
      Object.values(data.errors)[0]?.[0];

    return Promise.reject(
      new Error(
        firstError ||
        data?.message ||
        `Request failed (${error.response.status})`
      )
    );
  }
);

export default apiClient;
