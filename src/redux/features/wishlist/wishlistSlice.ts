import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
  id: string;
  type: 'course' | 'book';
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const target = action.payload;
      const existing = state.items.find(
        (item) => item.id === target.id && item.type === target.type
      );
      if (existing) {
        state.items = state.items.filter((item) => item !== existing);
      } else {
        state.items.push(target);
      }
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    hydrateWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { toggleWishlist, clearWishlist, hydrateWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
