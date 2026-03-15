import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage, DiagnosisResult } from '../../types/health';
import { INITIAL_AI_MESSAGE } from '../../services/aiService';

interface SymptomState {
  messages: ChatMessage[];
  currentDiagnosis: DiagnosisResult | null;
  isAnalyzing: boolean;
  isChatting: boolean; // waiting for follow-up AI reply
  error: string | null;
  turnCount: number; // how many user turns — trigger analysis after threshold
}

const initialState: SymptomState = {
  messages: [INITIAL_AI_MESSAGE],
  currentDiagnosis: null,
  isAnalyzing: false,
  isChatting: false,
  error: null,
  turnCount: 0,
};

export const symptomSlice = createSlice({
  name: 'symptom',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
      if (action.payload.role === 'user') {
        state.turnCount += 1;
      }
    },
    setAnalyzing(state, action: PayloadAction<boolean>) {
      state.isAnalyzing = action.payload;
      if (action.payload) state.error = null;
    },
    setChatting(state, action: PayloadAction<boolean>) {
      state.isChatting = action.payload;
    },
    setDiagnosis(state, action: PayloadAction<DiagnosisResult>) {
      state.currentDiagnosis = action.payload;
      state.isAnalyzing = false;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isAnalyzing = false;
      state.isChatting = false;
    },
    clearChat(state) {
      state.messages = [INITIAL_AI_MESSAGE];
      state.currentDiagnosis = null;
      state.isAnalyzing = false;
      state.isChatting = false;
      state.error = null;
      state.turnCount = 0;
    },
  },
});

export const {
  addMessage,
  setAnalyzing,
  setChatting,
  setDiagnosis,
  setError,
  clearChat,
} = symptomSlice.actions;

export default symptomSlice.reducer;
