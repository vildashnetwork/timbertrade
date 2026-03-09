import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { WoodItem, CartItem, Order } from '@/types';

const API_URL = 'https://franca-backend-ecaz.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ShippingAddress {
  address: string;
  city: string;
  country: string;
}

interface CartStore {
  // State
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  lastOrder: Order | null;

  // Actions
  addItem: (item: WoodItem, quantity: number) => void;
  removeItem: (woodItemId: string) => void;
  updateQuantity: (woodItemId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (shippingAddress: ShippingAddress) => Promise<Order | null>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalVolume: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      lastOrder: null,

      addItem: (item: WoodItem, quantity: number) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(i => i.woodItem.id === item.id);

        if (existingItem) {
          // Check if enough stock
          if (existingItem.quantity + quantity > item.stockLevel) {
            set({ error: 'Not enough stock available' });
            return;
          }

          set({
            items: currentItems.map(i =>
              i.woodItem.id === item.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
            error: null,
          });
        } else {
          // Check stock
          if (quantity > item.stockLevel) {
            set({ error: 'Not enough stock available' });
            return;
          }

          set({
            items: [...currentItems, { woodItem: item, quantity }],
            error: null,
          });
        }
      },

      removeItem: (woodItemId: string) => {
        set({
          items: get().items.filter(i => i.woodItem.id !== woodItemId),
          error: null,
        });
      },

      updateQuantity: (woodItemId: string, quantity: number) => {
        const item = get().items.find(i => i.woodItem.id === woodItemId);

        if (!item) return;

        if (quantity > item.woodItem.stockLevel) {
          set({ error: 'Not enough stock available' });
          return;
        }

        if (quantity < 1) {
          get().removeItem(woodItemId);
          return;
        }

        set({
          items: get().items.map(i =>
            i.woodItem.id === woodItemId ? { ...i, quantity } : i
          ),
          error: null,
        });
      },

      clearCart: () => {
        set({ items: [], error: null, lastOrder: null });
      },

      checkout: async (shippingAddress: ShippingAddress) => {
        const token = localStorage.getItem('auth-token');

        if (!token) {
          set({ error: 'Please login to checkout' });
          return null;
        }

        if (get().items.length === 0) {
          set({ error: 'Cart is empty' });
          return null;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await api.post('/orders', {
            items: get().items.map(item => ({
              id: item.woodItem.id,
              quantity: item.quantity,
            })),
            shippingAddress,
          });

          const order = response.data;

          // Clear cart on successful checkout
          set({
            items: [],
            isLoading: false,
            error: null,
            lastOrder: order
          });

          return order;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Checkout failed',
          });
          return null;
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.woodItem.price * item.quantity),
          0
        );
      },

      getTotalVolume: () => {
        return get().items.reduce(
          (total, item) => total + (item.woodItem.volume * item.quantity),
          0
        );
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

// Helper hooks
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartTotal = () => useCartStore((state) => state.getTotalPrice());
export const useCartTotalVolume = () => useCartStore((state) => state.getTotalVolume());
export const useCartItemsCount = () => useCartStore((state) => state.getTotalItems());
export const useCartLoading = () => useCartStore((state) => state.isLoading);
export const useCartError = () => useCartStore((state) => state.error);
export const useLastOrder = () => useCartStore((state) => state.lastOrder);