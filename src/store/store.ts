import { configureStore } from '@reduxjs/toolkit';
import symptomReducer from './slices/symptomSlice';
import historyReducer from './slices/historySlice';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    symptom: symptomReducer,
    history: historyReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
