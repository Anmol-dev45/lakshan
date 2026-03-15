import { configureStore } from '@reduxjs/toolkit';
import symptomReducer from './slices/symptomSlice';
import historyReducer from './slices/historySlice';

export const store = configureStore({
  reducer: {
    symptom: symptomReducer,
    history: historyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
