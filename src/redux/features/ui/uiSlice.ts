import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Book } from '@/types';

export type Language = 'en' | 'hi';

interface UIState {
  selectedPdfBook: Book | null;
  isSearchOpen: boolean;
  searchQuery: string;
  language: Language;
}

const initialState: UIState = {
  selectedPdfBook: null,
  isSearchOpen: false,
  searchQuery: '',
  language: 'en',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedPdfBook: (state, action: PayloadAction<Book | null>) => {
      state.selectedPdfBook = action.payload;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchOpen = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
  },
});

export const {
  setSelectedPdfBook,
  setSearchOpen,
  setSearchQuery,
  setLanguage,
} = uiSlice.actions;

export default uiSlice.reducer;
