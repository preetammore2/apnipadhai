import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Book } from '@/types';

interface UIState {
  isCounselorModalOpen: boolean;
  selectedPdfBook: Book | null;
  isSearchOpen: boolean;
  searchQuery: string;
}

const initialState: UIState = {
  isCounselorModalOpen: false,
  selectedPdfBook: null,
  isSearchOpen: false,
  searchQuery: '',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCounselorModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCounselorModalOpen = action.payload;
    },
    setSelectedPdfBook: (state, action: PayloadAction<Book | null>) => {
      state.selectedPdfBook = action.payload;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchOpen = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setCounselorModalOpen,
  setSelectedPdfBook,
  setSearchOpen,
  setSearchQuery,
} = uiSlice.actions;

export default uiSlice.reducer;
