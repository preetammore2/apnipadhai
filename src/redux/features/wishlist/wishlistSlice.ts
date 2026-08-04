import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  items: string[];
}

const initialState: WishlistState = {
  items: [],
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.items.includes(id)) {
        state.items = state.items.filter((item) => item !== id);
      } else {
        state.items.push(id);
      }
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
