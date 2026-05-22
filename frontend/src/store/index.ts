import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import themeReducer from './slices/themeSlice';
import uiReducer from './slices/uiSlice';
import { baseApi } from './api/baseApi';
import './api/healthApi';
import './api/authApi';
import './api/catalogApi';
import './api/settingsApi';
import './api/orderApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    theme: themeReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
