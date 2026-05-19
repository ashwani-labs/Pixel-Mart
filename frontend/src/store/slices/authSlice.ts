import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../../types/auth';
import { clearPersistedAuth, loadPersistedAuth, persistAuth } from '../authStorage';

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
}

const persisted = loadPersistedAuth();

const initialState: AuthState = {
  accessToken: persisted?.accessToken ?? null,
  user: persisted?.user ?? null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ accessToken: string; user: AuthUser }>) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      persistAuth(action.payload.accessToken, action.payload.user);
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.user = null;
      clearPersistedAuth();
    },
    updateUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      if (state.accessToken) {
        persistAuth(state.accessToken, action.payload);
      }
    },
  },
});

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions;
export const selectIsAuthenticated = (state: { auth: AuthState }) => Boolean(state.auth.accessToken);
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectHasRole = (role: string) => (state: { auth: AuthState }) =>
  state.auth.user?.roles.includes(role) ?? false;
export default authSlice.reducer;
