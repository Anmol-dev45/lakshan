import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { HealthRecord } from '../../types/health';
import {
  saveHealthRecord,
  fetchHealthRecords,
  deleteHealthRecord,
  deleteAllHealthRecords,
} from '../../services/dbService';

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
    // quota exceeded — ignore
  }
}

interface HistoryState {
  records: HealthRecord[];
  syncing: boolean;
}

const initialState: HistoryState = {
  records: loadFromStorage(),
  syncing: false,
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addRecord(state, action: PayloadAction<HealthRecord>) {
      state.records.unshift(action.payload);
      if (state.records.length > 50) state.records = state.records.slice(0, 50);
      saveToStorage(state.records);
    },
    setRecords(state, action: PayloadAction<HealthRecord[]>) {
      // Replace local cache with records fetched from Supabase
      state.records = action.payload;
      saveToStorage(action.payload);
    },
    setSyncing(state, action: PayloadAction<boolean>) {
      state.syncing = action.payload;
    },
    removeRecord(state, action: PayloadAction<string>) {
      state.records = state.records.filter((r) => r.id !== action.payload);
      saveToStorage(state.records);
    },
    clearHistory(state) {
      state.records = [];
      localStorage.removeItem(LS_KEY);
    },
  },
});

export const { addRecord, setRecords, setSyncing, removeRecord, clearHistory } = historySlice.actions;
export default historySlice.reducer;

// ─── Thunks ───────────────────────────────────────────────────────────────────

type GetState = () => { auth: { user: { id: string } | null } };
type Dispatch = (action: unknown) => void;

/** Call after addRecord to also persist to Supabase if logged in */
export function syncRecordToSupabase(record: HealthRecord) {
  return async (_dispatch: Dispatch, getState: GetState) => {
    const userId = getState().auth.user?.id;
    if (!userId) return;
    await saveHealthRecord(userId, record);
  };
}

/** Pull all health records from Supabase on login */
export function loadRecordsFromSupabase() {
  return async (dispatch: Dispatch, getState: GetState) => {
    const userId = getState().auth.user?.id;
    if (!userId) return;
    dispatch(setSyncing(true));
    try {
      const records = await fetchHealthRecords(userId);
      if (records.length > 0) {
        dispatch(setRecords(records));
      }
    } finally {
      dispatch(setSyncing(false));
    }
  };
}

export function deleteRecordEverywhere(id: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(removeRecord(id));

    const userId = getState().auth.user?.id;
    if (!userId) return;
    await deleteHealthRecord(id);
  };
}

export function clearHistoryEverywhere() {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(clearHistory());

    const userId = getState().auth.user?.id;
    if (!userId) return;
    await deleteAllHealthRecords(userId);
  };
}
