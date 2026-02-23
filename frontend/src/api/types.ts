// API Types - matches backend Prisma schema

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "USER" | "ADMIN";
  isVerified: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  isActive: boolean;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  category: Category | null;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string | null;
  guestId: string | null;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
  stripePaymentIntentId: string | null;
  shippingAddressId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress?: Address;
  user?: User;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: Product;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string | null };
}

export interface ProductReviews {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export interface CheckoutRequest {
  shippingAddressId: string;
}

export interface CheckoutResponse {
  orderId: string;
  clientSecret: string;
  deprecatedFallbackUsed?: boolean;
}

// Auth types
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name?: string;
}

// Dashboard stats (admin)
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
