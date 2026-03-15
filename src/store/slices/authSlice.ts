import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: {
    id: string;
    email: string | null;
    name: string | null;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: true, // starts true while we check session
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      if (action.payload) {
        state.user = {
          id: action.payload.id,
          email: action.payload.email ?? null,
          name:
            (action.payload.user_metadata?.full_name as string | undefined) ??
            action.payload.email?.split('@')[0] ??
            null,
        };
      } else {
        state.user = null;
      }
      state.isLoading = false;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
});

export const { setUser, setAuthLoading, setAuthError, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
