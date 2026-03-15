import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Language = 'ne' | 'en';

interface SettingsState {
  language: Language;
}

const stored = localStorage.getItem('app_language') as Language | null;

const initialState: SettingsState = {
  language: (stored === 'en' || stored === 'ne') ? stored : 'ne',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
      localStorage.setItem('app_language', action.payload);
    },
  },
});

export const { setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
