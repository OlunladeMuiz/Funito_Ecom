import { apiClient } from "./client";
import type {
  AuthResponse,
  LoginPayload,
  SignupPayload,
  User,
  Address,
  Product,
  Category,
  Cart,
  CartItem,
  Order,
  WishlistItem,
  ProductReviews,
  Review,
  DashboardStats,
  CheckoutRequest,
  CheckoutResponse,
} from "./types";

// ===================
// Auth API
// ===================
export const authApi = {
  signup: (data: SignupPayload) =>
    apiClient.post<AuthResponse>("/auth/signup", data),

  login: (data: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", data),

  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
      refreshToken,
    }),

  logout: (refreshToken: string) =>
    apiClient.post<{ message: string }>("/auth/logout", { refreshToken }),
};

// ===================
// Users API
// ===================
export const usersApi = {
  getProfile: () => apiClient.get<User>("/users/profile"),

  updateProfile: (data: { name?: string; phone?: string }) =>
    apiClient.put<User>("/users/profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post<{ message: string }>("/users/profile/password", data),

  // Addresses
  listAddresses: () => apiClient.get<Address[]>("/users/addresses"),

  createAddress: (data: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">) =>
    apiClient.post<Address>("/users/addresses", data),

  updateAddress: (id: string, data: Partial<Address>) =>
    apiClient.put<Address>(`/users/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    apiClient.delete<{ message: string }>(`/users/addresses/${id}`),
};

// ===================
// Catalog API
// ===================
export const catalogApi = {
  listProducts: (params?: {
    search?: string;
    category?: string;
    min?: number;
    max?: number;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.min) searchParams.set("min", params.min.toString());
    if (params?.max) searchParams.set("max", params.max.toString());
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return apiClient.get<{ data: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/products${query ? `?${query}` : ""}`);
  },

  getProduct: (id: string) => apiClient.get<Product>(`/products/${id}`),

  listCategories: () => apiClient.get<Category[]>("/categories"),
};

// ===================
// Cart API
// ===================
export const cartApi = {
  getCart: () => apiClient.get<Cart>("/cart"),

  addItem: (productId: string, quantity = 1) =>
    apiClient.post<CartItem>("/cart/items", { productId, quantity }),

  updateItem: (itemId: string, quantity: number) =>
    apiClient.put<CartItem>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) =>
    apiClient.delete<{ message: string }>(`/cart/items/${itemId}`),
};

// ===================
// Orders API
// ===================
export const ordersApi = {
  checkout: (data: CheckoutRequest) =>
    apiClient.post<CheckoutResponse>("/orders/checkout", data),

  listOrders: () => apiClient.get<Order[]>("/orders"),

  getOrder: (id: string) => apiClient.get<Order>(`/orders/${id}`),
};

// ===================
// Wishlist API
// ===================
export const wishlistApi = {
  list: () => apiClient.get<WishlistItem[]>("/wishlist"),

  add: (productId: string) =>
    apiClient.post<WishlistItem>("/wishlist", { productId }),

  remove: (productId: string) =>
    apiClient.delete<{ message: string }>(`/wishlist/${productId}`),

  check: (productId: string) =>
    apiClient.get<{ inWishlist: boolean }>(`/wishlist/${productId}/check`),
};

// ===================
// Reviews API
// ===================
export const reviewsApi = {
  getProductReviews: (productId: string) =>
    apiClient.get<ProductReviews>(`/reviews/products/${productId}`),

  getMyReview: (productId: string) =>
    apiClient.get<Review | null>(`/reviews/products/${productId}/mine`),

  create: (productId: string, data: { rating: number; comment?: string }) =>
    apiClient.post<Review>(`/reviews/products/${productId}`, data),

  update: (productId: string, data: { rating?: number; comment?: string }) =>
    apiClient.put<Review>(`/reviews/products/${productId}`, data),

  delete: (productId: string) =>
    apiClient.delete<{ message: string }>(`/reviews/products/${productId}`),
};

// ===================
// Admin API
// ===================
export const adminApi = {
  // Dashboard
  getDashboardStats: () => apiClient.get<DashboardStats>("/admin/dashboard"),

  // Products
  listProducts: () => apiClient.get<Product[]>("/admin/products"),

  createProduct: (data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    originalPrice?: number | null;
    stock?: number;
    isActive?: boolean;
    categoryId?: string | null;
    images?: string[];
  }) => apiClient.post<Product>("/admin/products", data),

  updateProduct: (id: string, data: Partial<Product & { images?: string[] }>) =>
    apiClient.put<Product>(`/admin/products/${id}`, data),

  deleteProduct: (id: string) =>
    apiClient.delete<{ message: string }>(`/admin/products/${id}`),

  // Categories
  listCategories: () =>
    apiClient.get<(Category & { _count: { products: number } })[]>("/admin/categories"),

  createCategory: (data: { name: string; slug: string }) =>
    apiClient.post<Category>("/admin/categories", data),

  updateCategory: (id: string, data: Partial<{ name: string; slug: string }>) =>
    apiClient.put<Category>(`/admin/categories/${id}`, data),

  deleteCategory: (id: string) =>
    apiClient.delete<{ message: string }>(`/admin/categories/${id}`),

  // Orders
  listOrders: (status?: string) => {
    const query = status ? `?status=${status}` : "";
    return apiClient.get<Order[]>(`/admin/orders${query}`);
  },

  getOrder: (id: string) => apiClient.get<Order>(`/admin/orders/${id}`),

  updateOrderStatus: (id: string, status: Order["status"]) =>
    apiClient.put<Order>(`/admin/orders/${id}/status`, { status }),

  // Users
  listUsers: () =>
    apiClient.get<(User & { _count: { orders: number } })[]>("/admin/users"),

  getUser: (id: string) =>
    apiClient.get<User & { addresses: Address[]; orders: Order[] }>(
      `/admin/users/${id}`
    ),
};
