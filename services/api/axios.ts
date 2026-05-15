import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Module-level flag to prevent infinite refresh loops
let isRefreshing = false;

// Request interceptor: Usually we don't need to do much here now that we use cookies.
// But we'll keep it for cases where we might still want to pass a token manually.
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 and refreshing tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we're not already attempting to refresh
    if (error.response && error.response.status === 401 && !isRefreshing) {
      isRefreshing = true;

      try {
        // Call refresh token endpoint through the Next.js API route
        await api.post('/auth/refresh', {}, { withCredentials: true });

        isRefreshing = false;
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError: any) {
        isRefreshing = false;
        
        // If refresh fails, user must re-authenticate
        if (refreshError.response?.status !== 401) {
          console.error('Token refresh failed:', refreshError);
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
