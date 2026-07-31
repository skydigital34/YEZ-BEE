import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface TokenResponse {
  access: string;
  refresh: string;
}

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('yezbee-auth-token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('yezbee-refresh-token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post<TokenResponse>(`${BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem('yezbee-auth-token', data.access);
        if (data.refresh) {
          localStorage.setItem('yezbee-refresh-token', data.refresh);
        }

        processQueue(null, data.access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('yezbee-auth-token');
        localStorage.removeItem('yezbee-refresh-token');
        localStorage.removeItem('yezbee-user');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string;
  sizes?: string;
  fabrics?: string;
  occasions?: string;
  rating?: number;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export const api = {
  // Products
  getProducts: (filters?: ProductFilters) =>
    apiClient.get<PaginatedResponse<unknown>>('/products/', { params: filters }).then((r) => r.data),

  getProduct: (slug: string) =>
    apiClient.get<ApiResponse<unknown>>(`/products/${slug}/`).then((r) => r.data),

  searchProducts: (query: string, filters?: ProductFilters) =>
    apiClient
      .get<PaginatedResponse<unknown>>('/products/search/', { params: { q: query, ...filters } })
      .then((r) => r.data),

  // Categories
  getCategories: () =>
    apiClient.get<ApiResponse<unknown[]>>('/categories/').then((r) => r.data),

  getCategory: (slug: string) =>
    apiClient.get<ApiResponse<unknown>>(`/categories/${slug}/`).then((r) => r.data),

  // Auth
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ user: unknown; access: string; refresh: string }>>('/auth/login/', {
      email,
      password,
    }).then((r) => r.data),

  register: (data: { name: string; email: string; phone?: string; password: string }) =>
    apiClient.post<ApiResponse<{ user: unknown; access: string; refresh: string }>>('/auth/register/', data).then((r) => r.data),

  logout: () =>
    apiClient.post<ApiResponse<null>>('/auth/logout/').then((r) => r.data),

  getProfile: () =>
    apiClient.get<ApiResponse<unknown>>('/auth/profile/').then((r) => r.data),

  updateProfile: (data: Partial<unknown>) =>
    apiClient.put<ApiResponse<unknown>>('/auth/profile/', data).then((r) => r.data),

  // Orders
  createOrder: (data: unknown) =>
    apiClient.post<ApiResponse<unknown>>('/orders/', data).then((r) => r.data),

  getOrders: (page?: number) =>
    apiClient.get<PaginatedResponse<unknown>>('/orders/', { params: { page } }).then((r) => r.data),

  getOrder: (id: string) =>
    apiClient.get<ApiResponse<unknown>>(`/orders/${id}/`).then((r) => r.data),

  // Cart
  addToCart: (data: { productId: string; variantId: string; quantity: number }) =>
    apiClient.post<ApiResponse<unknown>>('/cart/', data).then((r) => r.data),

  getCart: () =>
    apiClient.get<ApiResponse<unknown>>('/cart/').then((r) => r.data),

  updateCart: (id: string, data: { quantity: number }) =>
    apiClient.put<ApiResponse<unknown>>(`/cart/${id}/`, data).then((r) => r.data),

  removeFromCart: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/cart/${id}/`).then((r) => r.data),

  // Wishlist
  addToWishlist: (productId: string) =>
    apiClient.post<ApiResponse<unknown>>('/wishlist/', { productId }).then((r) => r.data),

  removeFromWishlist: (productId: string) =>
    apiClient.delete<ApiResponse<null>>(`/wishlist/${productId}/`).then((r) => r.data),

  getWishlist: () =>
    apiClient.get<ApiResponse<unknown[]>>('/wishlist/').then((r) => r.data),

  // Coupons
  applyCoupon: (code: string, subtotal: number) =>
    apiClient.post<ApiResponse<{ discount: number; code: string }>>('/coupons/apply/', {
      code,
      subtotal,
    }).then((r) => r.data),

  validateCoupon: (code: string) =>
    apiClient.get<ApiResponse<unknown>>(`/coupons/${code}/validate/`).then((r) => r.data),

  // Reviews
  getReviews: (productId: string, page?: number) =>
    apiClient
      .get<PaginatedResponse<unknown>>(`/products/${productId}/reviews/`, { params: { page } })
      .then((r) => r.data),

  addReview: (productId: string, data: { rating: number; title?: string; body?: string }) =>
    apiClient
      .post<ApiResponse<unknown>>(`/products/${productId}/reviews/`, data)
      .then((r) => r.data),
};

export default apiClient;
