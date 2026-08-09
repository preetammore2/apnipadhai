import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Book } from '@/types';

export interface CartItem {
  id: string;
  type: 'course' | 'book';
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  itemData: Book;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  couponCode: string | null;
  discountAmount: number;
}

const initialState: CartState = {
  items: [],
  isCartOpen: false,
  couponCode: null,
  discountAmount: 0,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ item: Book; type: 'course' | 'book' }>) => {
      const { item, type } = action.payload;
      const existing = state.items.find((i) => i.id === item.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          id: item.id,
          type,
          title: item.title,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.coverImage,
          quantity: 1,
          itemData: item,
        });
      }
      state.isCartOpen = true;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; delta: number }>) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        const newQty = item.quantity + action.payload.delta;
        if (newQty <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload.id);
        } else {
          item.quantity = newQty;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      state.discountAmount = 0;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartOpen = action.payload;
    },
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartOpen,
  hydrateCart,
} = cartSlice.actions;

export default cartSlice.reducer;
