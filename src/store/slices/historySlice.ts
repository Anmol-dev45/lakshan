import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { HealthRecord } from '../../types/health';

const LS_KEY = 'health_history_v2';

function loadFromStorage(): HealthRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as HealthRecord[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(records: HealthRecord[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(records));
  } catch {
    // storage quota exceeded — silently ignore
  }
}

interface HistoryState {
  records: HealthRecord[];
}

const initialState: HistoryState = {
  records: loadFromStorage(),
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addRecord(state, action: PayloadAction<HealthRecord>) {
      // Prepend so newest is first
      state.records.unshift(action.payload);
      // Cap history at 50 records
      if (state.records.length > 50) state.records = state.records.slice(0, 50);
      saveToStorage(state.records);
    },
    clearHistory(state) {
      state.records = [];
      localStorage.removeItem(LS_KEY);
    },
  },
});

export const { addRecord, clearHistory } = historySlice.actions;
export default historySlice.reducer;
