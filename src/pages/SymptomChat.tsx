import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, MicOff, Send, Thermometer, Wind, Target, Zap, Activity, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import {
  addMessage,
  setAnalyzing,
  setChatting,
  setDiagnosis,
  setError,
  clearChat,
} from '../store/slices/symptomSlice';
import { addRecord, syncRecordToSupabase } from '../store/slices/historySlice';
import { analyzeSymptoms, chatReply } from '../services/aiService';
import { useVoiceInput } from '../hooks/useVoiceInput';
import type { ChatMessage } from '../types/health';

// ─── Number of user turns before we show "Analyse now" button ─────────────────
const MIN_TURNS_FOR_ANALYSIS = 3;

// ─── Quick-select symptom chips ───────────────────────────────────────────────
const QUICK_SYMPTOMS = [
  { label: 'ज्वरो', icon: Thermometer, hint: 'Fever' },
  { label: 'टाउको दुखाइ', icon: Target, hint: 'Headache' },
  { label: 'खोकी', icon: Wind, hint: 'Cough' },
  { label: 'थकान', icon: Activity, hint: 'Fatigue' },
  { label: 'छाती दुखाइ', icon: Zap, hint: 'Chest pain' },
];

function makeMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content, timestamp: new Date().toISOString() };
}

const SymptomChat = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { messages, isAnalyzing, isChatting, error, turnCount } = useAppSelector((s) => s.symptom);
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const voice = useVoiceInput();

  const pendingVoiceText = useRef('');

  // Store transcript when it arrives
  useEffect(() => {
    if (voice.transcript) {
      pendingVoiceText.current = voice.transcript.trim();
      voice.resetTranscript();
    }
  }, [voice.transcript, voice.resetTranscript]);

  // Send once transcribing is fully done (isTranscribing → false)
  useEffect(() => {
    if (!voice.isTranscribing && pendingVoiceText.current) {
      const text = pendingVoiceText.current;
      pendingVoiceText.current = '';
      sendMessage(text);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.isTranscribing]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing, isChatting]);

  const isBlocked = isAnalyzing || isChatting || voice.isTranscribing;

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBlocked) return;

    setInputText('');
    const userMsg = makeMessage('user', trimmed);
    dispatch(addMessage(userMsg));

    // After enough turns, offer analysis; until then ask follow-up questions
    const newTurnCount = turnCount + 1; // +1 because addMessage hasn't updated the store yet

    if (newTurnCount >= MIN_TURNS_FOR_ANALYSIS) {
      // Enough info — proceed to analysis
      dispatch(setAnalyzing(true));
      try {
        const allMsgs = [...messages, userMsg];
        const diagnosis = await analyzeSymptoms(allMsgs);
        dispatch(setDiagnosis(diagnosis));

        // Save to history
        const primarySymptom =
          diagnosis.extractedSymptoms.symptoms[0] ??
          trimmed.split(' ').slice(0, 3).join(' ');

        const healthRecord = {
          id: diagnosis.id,
          date: diagnosis.timestamp,
          primarySymptom,
          symptoms: diagnosis.extractedSymptoms.symptoms,
          riskLevel: diagnosis.riskLevel,
          diagnosis,
        };
        dispatch(addRecord(healthRecord));
        dispatch(syncRecordToSupabase(healthRecord) as never);

        navigate('/diagnosis');
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : 'Analysis failed.'));
      }
    } else {
      // Ask a follow-up question
      dispatch(setChatting(true));
      try {
        const allMsgs = [...messages, userMsg];
        const reply = await chatReply(allMsgs);
        dispatch(addMessage(makeMessage('assistant', reply)));
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : 'Could not get AI reply.'));
      } finally {
        dispatch(setChatting(false));
      }
    }
  }

  async function runAnalysis() {
    if (isBlocked || messages.filter((m) => m.role === 'user').length === 0) return;
    dispatch(setAnalyzing(true));
    try {
      const diagnosis = await analyzeSymptoms(messages);
      dispatch(setDiagnosis(diagnosis));

      const primarySymptom = diagnosis.extractedSymptoms.symptoms[0] ?? 'general symptoms';
      const healthRecord = {
        id: diagnosis.id,
        date: diagnosis.timestamp,
        primarySymptom,
        symptoms: diagnosis.extractedSymptoms.symptoms,
        riskLevel: diagnosis.riskLevel,
        diagnosis,
      };
      dispatch(addRecord(healthRecord));
      dispatch(syncRecordToSupabase(healthRecord) as never);

      navigate('/diagnosis');
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Analysis failed.'));
    }
  }

  function handleVoiceToggle() {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening();
    }
  }

  const canAnalyse = !isBlocked && messages.filter((m) => m.role === 'user').length >= MIN_TURNS_FOR_ANALYSIS;

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col h-[100dvh]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-40 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-800 p-1 hover:bg-surface-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">एआई परामर्श</h1>
            <p className="text-[10px] text-slate-400 leading-none">AI Health Consultation</p>
          </div>
        </div>
        <button
          onClick={() => dispatch(clearChat())}
          className="text-slate-500 p-1.5 hover:bg-surface-100 rounded-full transition-colors"
          title="Clear chat"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-52">
        <div className="flex justify-center">
          <span className="text-[10px] bg-white text-slate-400 font-medium px-3 py-1 rounded-full border border-surface-100">
            {new Date().toLocaleDateString('ne-NP')} • AI सहायक
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-1">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-primary-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-tr-sm'
                    : 'bg-white border border-surface-100 text-slate-800 rounded-tl-sm shadow-sm'
                  }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 px-1">
                {new Date(msg.timestamp).toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicators */}
        {(isChatting || isAnalyzing) && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-primary-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div className="bg-white border border-surface-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              {isAnalyzing ? (
                <p className="text-xs text-primary-600 font-semibold animate-pulse">
                  विश्लेषण गरिरहेको छ... (Analyzing symptoms…)
                </p>
              ) : (
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-xl px-4 py-3 text-sm text-danger-700">
            ⚠ {error}
          </div>
        )}

        {/* Analyse now button (appears after min turns) */}
        {canAnalyse && !isAnalyzing && (
          <div className="flex justify-center">
            <button
              onClick={runAnalysis}
              className="bg-primary-500 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <Activity size={16} /> विश्लेषण गर्नुहोस् (Analyse Now)
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input dock */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-surface-200 px-4 pt-3 pb-5 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)] rounded-t-2xl z-50">
        {/* Quick symptom chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
          {QUICK_SYMPTOMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => sendMessage(label)}
              disabled={isBlocked}
              className="flex items-center gap-1.5 shrink-0 bg-surface-50 border border-surface-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-full hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-40"
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Text + voice input */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceToggle}
            disabled={!voice.isSupported || isBlocked}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm ${
              voice.isTranscribing
                ? 'bg-yellow-500 text-white animate-pulse'
                : voice.isListening
                ? 'bg-danger-500 text-white animate-pulse'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            } disabled:opacity-40`}
            title={voice.isTranscribing ? 'प्रक्रियागत...' : voice.isListening ? 'रोक्नुहोस्' : 'बोल्नुहोस्'}
          >
            {voice.isTranscribing ? <RefreshCw size={18} className="animate-spin" /> : voice.isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              placeholder={voice.isTranscribing ? 'AI सुनिरहेको छ...' : voice.isListening ? 'बोलिरहेको छु... (रोक्न थिच्नुस्)' : 'यहाँ लेख्नुहोस् वा बोल्नुहोस्...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(inputText)}
              disabled={isBlocked}
              className="w-full bg-surface-50 border border-surface-200 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 disabled:opacity-40"
            />
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isBlocked}
              className="absolute inset-y-0 right-2 flex items-center justify-center w-8 text-slate-400 hover:text-primary-500 disabled:opacity-30 transition-colors"
            >
              <Send size={18} className="-rotate-45" />
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-2">
          यो एआई सल्लाह हो, अन्तिम चिकित्सा निर्णय होइन। • Not a medical diagnosis.
        </p>
        {voice.error && (
          <p className="text-center text-[10px] text-red-500 mt-1">⚠ {voice.error}</p>
        )}
      </div>
    </div>
  );
};

export default SymptomChat;
