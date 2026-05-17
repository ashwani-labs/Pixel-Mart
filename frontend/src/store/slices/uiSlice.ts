import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  cartDrawerOpen: boolean;
}

const initialState: UiState = {
  cartDrawerOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCartDrawer(state) {
      state.cartDrawerOpen = !state.cartDrawerOpen;
    },
    setCartDrawerOpen(state, action: { payload: boolean }) {
      state.cartDrawerOpen = action.payload;
    },
  },
});

export const { toggleCartDrawer, setCartDrawerOpen } = uiSlice.actions;
export default uiSlice.reducer;
