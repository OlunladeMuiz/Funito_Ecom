import { useState, useEffect, useCallback } from "react";
import { apiClient, ApiError } from "./client";
import {
  authApi,
  usersApi,
  catalogApi,
  cartApi,
  ordersApi,
  wishlistApi,
  reviewsApi,
} from "./index";
import type {
  User,
  Product,
  Category,
  Cart,
  Order,
  WishlistItem,
  ProductReviews,
  Address,
} from "./types";

// ===================
// Auth Hook
// ===================
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      usersApi
        .getProfile()
        .then(setUser)
        .catch(() => {
          apiClient.setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    apiClient.setToken(response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    setUser(response.user);
    return response.user;
  };

  const signup = async (email: string, password: string, name?: string) => {
    const response = await authApi.signup({ email, password, name });
    apiClient.setToken(response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    setUser(response.user);
    return response.user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignore logout errors
      }
    }
    apiClient.setToken(null);
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    login,
    signup,
    logout,
    setUser,
  };
}

// ===================
// Products Hook
// ===================
export function useProducts(params?: {
  search?: string;
  category?: string;
  min?: number;
  max?: number;
  page?: number;
  limit?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogApi.listProducts(params);
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [params?.search, params?.category, params?.min, params?.max, params?.page, params?.limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, pagination, loading, error, refetch: fetch };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    catalogApi
      .getProduct(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}

// ===================
// Categories Hook
// ===================
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogApi
      .listCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

// ===================
// Cart Hook
// ===================
export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addItem = async (productId: string, quantity = 1) => {
    await cartApi.addItem(productId, quantity);
    await fetch();
  };

  const updateItem = async (itemId: string, quantity: number) => {
    await cartApi.updateItem(itemId, quantity);
    await fetch();
  };

  const removeItem = async (itemId: string) => {
    await cartApi.removeItem(itemId);
    await fetch();
  };

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const total = cart?.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ?? 0;

  return {
    cart,
    loading,
    itemCount,
    total,
    addItem,
    updateItem,
    removeItem,
    refetch: fetch,
  };
}

// ===================
// Orders Hook
// ===================
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data = await ordersApi.listOrders();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const checkout = async (shippingAddressId: string) => {
    return ordersApi.checkout({ shippingAddressId });
  };

  return { orders, loading, checkout, refetch: fetch };
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getOrder(id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  return { order, loading };
}

// ===================
// Wishlist Hook
// ===================
export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data = await wishlistApi.list();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const add = async (productId: string) => {
    await wishlistApi.add(productId);
    await fetch();
  };

  const remove = async (productId: string) => {
    await wishlistApi.remove(productId);
    await fetch();
  };

  const isInWishlist = (productId: string) =>
    items.some((item) => item.productId === productId);

  return { items, loading, add, remove, isInWishlist, refetch: fetch };
}

// ===================
// Reviews Hook
// ===================
export function useProductReviews(productId: string) {
  const [data, setData] = useState<ProductReviews | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const reviews = await reviewsApi.getProductReviews(productId);
      setData(reviews);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const submitReview = async (rating: number, comment?: string) => {
    await reviewsApi.create(productId, { rating, comment });
    await fetch();
  };

  const updateReview = async (rating?: number, comment?: string) => {
    await reviewsApi.update(productId, { rating, comment });
    await fetch();
  };

  const deleteReview = async () => {
    await reviewsApi.delete(productId);
    await fetch();
  };

  return {
    reviews: data?.reviews ?? [],
    averageRating: data?.averageRating ?? 0,
    totalReviews: data?.totalReviews ?? 0,
    loading,
    submitReview,
    updateReview,
    deleteReview,
    refetch: fetch,
  };
}

// ===================
// Addresses Hook
// ===================
export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data = await usersApi.listAddresses();
      setAddresses(data);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (data: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">) => {
    await usersApi.createAddress(data);
    await fetch();
  };

  const update = async (id: string, data: Partial<Address>) => {
    await usersApi.updateAddress(id, data);
    await fetch();
  };

  const remove = async (id: string) => {
    await usersApi.deleteAddress(id);
    await fetch();
  };

  return { addresses, loading, create, update, remove, refetch: fetch };
}
