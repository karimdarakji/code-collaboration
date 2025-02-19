import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const axiosApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

axiosApi.interceptors.response.use(
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
        await api('POST', '/auth/refresh');
        // After a successful refresh, retry the original request.
        return axiosApi(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    // If already retried, reject without further attempts.
    return Promise.reject(error);
  }
);

export const api = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<T> => {
  return axiosApi
    .request<T>({ method, url, data })
    .then((res) => res.data);
};

export default api;