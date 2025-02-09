import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig = error.config;

    // If there's no response or the status is not 401, reject immediately.
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // If this request hasn't been retried yet, try refreshing tokens once.
    if (!originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        // After a successful refresh, retry the original request.
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    // If already retried, reject without further attempts.
    return Promise.reject(error);
  }
);

export default api;