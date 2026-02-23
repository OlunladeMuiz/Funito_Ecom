import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { cartApi } from "../api";
import type { Cart, CartItem } from "../api/types";

interface LocalCartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  productImage: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  total: number;
  isLocalCart: boolean;
  addItem: (productId: string, quantity?: number, productInfo?: { name: string; price: number; image: string }) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => Promise<void>;
  syncLocalCartToBackend: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | null>(null);

// Local storage cart for when API is unavailable
const LOCAL_CART_KEY = 'furniro_local_cart';

function getLocalCart(): LocalCartItem[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [localCart, setLocalCart] = useState<LocalCartItem[]>(() => getLocalCart());
  const [loading, setLoading] = useState(true);
  const [useLocalCart, setUseLocalCart] = useState(() => getLocalCart().length > 0);

  const fetchCart = useCallback(async () => {
    const localItems = getLocalCart();
    try {
      const data = await cartApi.getCart();
      // Only switch to backend cart if it has items OR local cart is empty
      if (data && data.items && data.items.length > 0) {
        setCart(data);
        setUseLocalCart(false);
      } else if (localItems.length > 0) {
        // Backend cart empty but local has items - keep using local
        setLocalCart(localItems);
        setUseLocalCart(true);
        setCart(null);
      } else {
        // Both empty
        setCart(data);
        setUseLocalCart(false);
      }
    } catch {
      // Fall back to local cart
      setLocalCart(localItems);
      setUseLocalCart(true);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId: string, quantity = 1, productInfo?: { name: string; price: number; image: string }) => {
    // Always save to localStorage as backup first
    const items = getLocalCart();
    const existingIndex = items.findIndex(item => item.productId === productId);
    
    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        id: `local_${Date.now()}`,
        productId,
        quantity,
        unitPrice: productInfo?.price || 0,
        productName: productInfo?.name || 'Product',
        productImage: productInfo?.image || '',
      });
    }
    saveLocalCart(items);
    setLocalCart(items);

    // Try to add to backend if available
    if (!useLocalCart) {
      try {
        await cartApi.addItem(productId, quantity);
        await fetchCart();
        // Clear localStorage since backend has the item now
        saveLocalCart([]);
        setLocalCart([]);
      } catch {
        // Backend failed, keep using localStorage
        setUseLocalCart(true);
      }
    }
    
    alert('Added to cart!');
  };

  const updateItem = async (itemId: string, quantity: number) => {
    if (!useLocalCart) {
      try {
        if (quantity <= 0) {
          await cartApi.removeItem(itemId);
        } else {
          await cartApi.updateItem(itemId, quantity);
        }
        await fetchCart();
        return;
      } catch {
        setUseLocalCart(true);
      }
    }
    
    // Use local cart
    let items = getLocalCart();
    if (quantity <= 0) {
      items = items.filter(item => item.id !== itemId);
    } else {
      const index = items.findIndex(item => item.id === itemId);
      if (index >= 0) {
        items[index].quantity = quantity;
      }
    }
    saveLocalCart(items);
    setLocalCart(items);
  };

  const removeItem = async (itemId: string) => {
    if (!useLocalCart) {
      try {
        await cartApi.removeItem(itemId);
        await fetchCart();
        return;
      } catch {
        setUseLocalCart(true);
      }
    }
    
    // Use local cart
    const items = getLocalCart().filter(item => item.id !== itemId);
    saveLocalCart(items);
    setLocalCart(items);
  };

  const clearCart = async () => {
    // Clear localStorage
    saveLocalCart([]);
    setLocalCart([]);
    
    // Clear backend cart by removing all items
    if (cart?.items) {
      for (const item of cart.items) {
        try {
          await cartApi.removeItem(item.id);
        } catch {
          // Ignore errors
        }
      }
    }
    
    setCart(null);
    await fetchCart();
  };

  // Sync local cart to backend before checkout
  // Only syncs if there are local items - simplified logic
  const syncLocalCartToBackend = async (): Promise<boolean> => {
    // Read localStorage directly
    let localItems = getLocalCart();
    
    // Fallback: if localStorage is empty but state has items, use state
    if (localItems.length === 0 && localCart.length > 0) {
      console.log('localStorage empty, using state items');
      localItems = localCart;
    }
    
    // If still nothing, check if we're NOT using local cart (items may be in backend already)
    if (localItems.length === 0) {
      if (!useLocalCart) {
        console.log('Using backend cart, no local sync needed');
        return true; // Backend cart is being used, sync not needed
      }
      console.log('No items to sync');
      return true;
    }

    // Check if any products have non-UUID IDs (mock products)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const mockProducts = localItems.filter(item => !uuidRegex.test(item.productId));
    
    if (mockProducts.length > 0) {
      console.error('Cannot checkout with demo products:', mockProducts.map(p => p.productName));
      // Clear bad items from local storage
      const validItems = localItems.filter(item => uuidRegex.test(item.productId));
      saveLocalCart(validItems);
      setLocalCart(validItems);
      if (validItems.length === 0) {
        throw new Error('Your cart contains demo products that cannot be purchased. Please clear your cart and add real products from the Shop page.');
      }
      localItems = validItems;
    }

    console.log('Syncing local cart to backend:', localItems.length, 'items');
    
    try {
      // Add each local cart item to the backend
      for (const item of localItems) {
        console.log('Adding item to backend:', item.productName, item.quantity);
        await cartApi.addItem(item.productId, item.quantity);
      }
      
      // Clear local cart after successful sync
      saveLocalCart([]);
      setLocalCart([]);
      setUseLocalCart(false);
      
      // Refresh cart from backend
      await fetchCart();
      console.log('Cart synced successfully');
      return true;
    } catch (error) {
      console.error('Failed to sync local cart:', error);
      throw error; // Re-throw so caller can handle
    }
  };

  // Calculate totals from either API cart or local cart
  const cartItems = useLocalCart ? localCart : (cart?.items || []);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  // Create a unified cart object for local cart
  const effectiveCart: Cart | null = useLocalCart 
    ? {
        id: 'local',
        userId: null,
        guestId: 'guest',
        items: localCart.map(item => ({
          id: item.id,
          cartId: 'local',
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          product: {
            id: item.productId,
            name: item.productName,
            slug: '',
            description: null,
            price: item.unitPrice,
            originalPrice: null,
            stock: 999,
            isActive: true,
            categoryId: null,
            createdAt: '',
            updatedAt: '',
            images: [{ id: '1', productId: item.productId, url: item.productImage, sortOrder: 0 }],
            category: null,
          },
        })) as CartItem[],
        createdAt: '',
        updatedAt: '',
      }
    : cart;

  return (
    <CartContext.Provider
      value={{
        cart: effectiveCart,
        loading,
        itemCount,
        total,
        isLocalCart: useLocalCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refetch: fetchCart,
        syncLocalCartToBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
