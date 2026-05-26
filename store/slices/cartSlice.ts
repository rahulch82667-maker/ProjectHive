import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '@/services/projects.api';

export interface CartItem {
  project: Project;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const getInitialCart = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('projecthive_cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        return [];
      }
    }
  }
  return [];
};

const initialState: CartState = {
  items: [], // Start with empty to avoid SSR mismatch, loaded in client if needed
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initializeCart: (state) => {
      state.items = getInitialCart();
    },
    addToCart: (state, action: PayloadAction<Project>) => {
      const exists = state.items.find(item => item.project._id === action.payload._id);
      if (!exists) {
        state.items.push({ project: action.payload, quantity: 1 });
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('projecthive_cart', JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.project._id !== action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('projecthive_cart', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('projecthive_cart');
      }
    }
  }
});

export const { initializeCart, addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
