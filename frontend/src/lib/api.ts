import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:5000/api/v1');

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
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('[API REQUEST]', {
        baseURL: config.baseURL,
        url: config.url,
        method: config.method,
      });
    }
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
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Extract human-readable error message from API response
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    if (serverMessage) {
      error.message = serverMessage;
    }

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

        const { data } = await axios.post<TokenResponse>(`${BASE_URL}/auth/refresh`, {
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
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  productType?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string;
  sizes?: string;
  fabric?: string;
  fit?: string;
  occasion?: string;
  brand?: string;
  tags?: string;
  featured?: boolean | string;
  isNew?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface AdminProductFilters extends ProductFilters {
  status?: string;
  inventory?: string;
}

export const api = {
  // Public Customer Products
  getProducts: (filters?: ProductFilters) =>
    apiClient.get<PaginatedResponse<any>>('/products', { params: filters }).then((r) => r.data),

  getProduct: (slug: string) =>
    apiClient.get<ApiResponse<any>>(`/products/${slug}`).then((r) => r.data),

  searchProducts: (query: string, filters?: ProductFilters) =>
    apiClient
      .get<PaginatedResponse<any>>('/products/search', { params: { q: query, ...filters } })
      .then((r) => r.data),

  getFeaturedProducts: () =>
    apiClient.get<ApiResponse<any[]>>('/products/featured').then((r) => r.data),

  // Categories
  getCategories: () =>
    apiClient.get<ApiResponse<any[]>>('/categories').then((r) => r.data),

  getCategory: (slug: string) =>
    apiClient.get<ApiResponse<any>>(`/categories/${slug}`).then((r) => r.data),

  getCategoryProducts: (slug: string, params?: ProductFilters) =>
    apiClient.get<ApiResponse<any>>(`/categories/${slug}/products`, { params }).then((r) => r.data),

  // Admin Product Store System
  getAdminProducts: (filters?: AdminProductFilters) =>
    apiClient.get<PaginatedResponse<any>>('/products/admin/all', { params: filters }).then((r) => r.data),

  getAdminStats: () =>
    apiClient.get<ApiResponse<any>>('/products/admin/stats').then((r) => r.data),

  createProduct: (data: any) =>
    apiClient.post<ApiResponse<any>>('/products', data).then((r) => r.data),

  updateProduct: (id: string, data: any) =>
    apiClient.put<ApiResponse<any>>(`/products/${id}`, data).then((r) => r.data),

  updateProductStock: (id: string, stock: number, variantSku?: string) =>
    apiClient.patch<ApiResponse<any>>(`/products/${id}/stock`, { stock, variantSku }).then((r) => r.data),

  updateProductStatus: (id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') =>
    apiClient.patch<ApiResponse<any>>(`/products/${id}/status`, { status }).then((r) => r.data),

  archiveProduct: (id: string) =>
    apiClient.patch<ApiResponse<any>>(`/products/${id}/archive`).then((r) => r.data),

  deleteProduct: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/products/${id}`).then((r) => r.data),

  uploadProductImage: (file: File, category?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (category) {
      formData.append('category', category);
    }
    return apiClient
      .post<ApiResponse<{ url: string; secure_url: string; publicId: string; public_id: string; width: number; height: number; format: string }>>(
        '/products/upload-image',
        formData
      )
      .then((r) => r.data);
  },

  uploadProductImages: (files: File[], category?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    if (category) {
      formData.append('category', category);
    }
    return apiClient
      .post<ApiResponse<Array<{ url: string; secure_url: string; publicId: string; public_id: string; width: number; height: number; format: string }>>>(
        '/products/upload-images',
        formData
      )
      .then((r) => r.data);
  },

  deleteProductImage: (publicId: string) =>
    apiClient.post<ApiResponse<null>>('/products/delete-image', { publicId }).then((r) => r.data),

  // Auth
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ user: any; access: string; refresh: string }>>('/auth/login', {
      email,
      password,
    }).then((r) => r.data),

  register: (data: { name: string; email: string; phone?: string; password: string }) =>
    apiClient.post<ApiResponse<{ user: any; access: string; refresh: string }>>('/auth/register', data).then((r) => r.data),

  logout: () =>
    apiClient.post<ApiResponse<null>>('/auth/logout').then((r) => r.data),

  getProfile: () =>
    apiClient.get<ApiResponse<any>>('/auth/profile').then((r) => r.data),

  updateProfile: (data: Partial<any>) =>
    apiClient.put<ApiResponse<any>>('/auth/profile', data).then((r) => r.data),

  // Orders
  createOrder: (data: any) =>
    apiClient.post<ApiResponse<any>>('/orders', data).then((r) => r.data),

  getOrders: (page?: number) =>
    apiClient.get<PaginatedResponse<any>>('/orders', { params: { page } }).then((r) => r.data),

  getOrder: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/orders/${id}`).then((r) => r.data),

  // Cart
  addToCart: (data: { productId: string; variantId: string; quantity: number }) =>
    apiClient.post<ApiResponse<any>>('/cart', data).then((r) => r.data),

  getCart: () =>
    apiClient.get<ApiResponse<any>>('/cart').then((r) => r.data),

  updateCart: (id: string, data: { quantity: number }) =>
    apiClient.put<ApiResponse<any>>(`/cart/${id}`, data).then((r) => r.data),

  removeFromCart: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/cart/${id}`).then((r) => r.data),

  // Wishlist
  addToWishlist: (productId: string) =>
    apiClient.post<ApiResponse<any>>('/wishlist', { productId }).then((r) => r.data),

  removeFromWishlist: (productId: string) =>
    apiClient.delete<ApiResponse<null>>(`/wishlist/${productId}`).then((r) => r.data),

  getWishlist: () =>
    apiClient.get<ApiResponse<any[]>>('/wishlist').then((r) => r.data),

  // Coupons
  applyCoupon: (code: string, subtotal: number) =>
    apiClient.post<ApiResponse<{ discount: number; code: string }>>('/coupons/apply', {
      code,
      subtotal,
    }).then((r) => r.data),

  validateCoupon: (code: string) =>
    apiClient.get<ApiResponse<any>>(`/coupons/${code}/validate`).then((r) => r.data),

  // Reviews
  getReviews: (productId: string, page?: number) =>
    apiClient
      .get<PaginatedResponse<any>>(`/products/${productId}/reviews`, { params: { page } })
      .then((r) => r.data),

  addReview: (productId: string, data: { rating: number; title?: string; body?: string }) =>
    apiClient
      .post<ApiResponse<any>>(`/products/${productId}/reviews`, data)
      .then((r) => r.data),
};

export default apiClient;

