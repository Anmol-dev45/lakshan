import { useState, useRef, useCallback, useEffect } from 'react';

const BACKEND_WS = (import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000')
  .replace(/^http/, 'ws');

export type RealtimeStatus =
  | 'idle'
  | 'connecting'
  | 'ready'
  | 'speaking'
  | 'error';

export interface RealtimeVoiceState {
  status: RealtimeStatus;
  aiText: string;          // AI response text (streaming)
  userText: string;        // User speech transcription
  isMuted: boolean;
  error: string | null;
}

export interface RealtimeVoiceActions {
  connect: () => void;
  disconnect: () => void;
  toggleMute: () => void;
}

// ── PCM helpers ─────────────────────────────────────────────────────────────

function downsampleAndEncode(float32: Float32Array, fromRate: number): string {
  const TARGET = 24000;
  const ratio  = fromRate / TARGET;
  const length = Math.floor(float32.length / ratio);
  const pcm16  = new Int16Array(length);
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, float32[Math.floor(i * ratio)]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToFloat32(b64: string): Float32Array {
  const bin   = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const int16 = new Int16Array(bytes.buffer);
  const f32   = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) f32[i] = int16[i] / 32768.0;
  return f32;
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useRealtimeVoice(): RealtimeVoiceState & RealtimeVoiceActions {
  const [status,   setStatus]   = useState<RealtimeStatus>('idle');
  const [aiText,   setAiText]   = useState('');
  const [userText, setUserText] = useState('');
  const [isMuted,  setIsMuted]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const wsRef          = useRef<WebSocket | null>(null);
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const processorRef   = useRef<ScriptProcessorNode | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const isMutedRef     = useRef(false);

  // ── Cleanup ──────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    nextPlayTimeRef.current = 0;
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }
    wsRef.current = null;
  }, []);

  // ── Schedule AI audio chunk for playback ─────────────────────────────────
  const playChunk = useCallback((b64: string) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const f32 = base64ToFloat32(b64);
    const buf = ctx.createBuffer(1, f32.length, 24000);
    buf.copyToChannel(f32 as Float32Array<ArrayBuffer>, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    const when = Math.max(ctx.currentTime + 0.05, nextPlayTimeRef.current);
    src.start(when);
    nextPlayTimeRef.current = when + buf.duration;
  }, []);

  // ── Start microphone capture and streaming ────────────────────────────────
  const startMic = useCallback(async (ws: WebSocket) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    nextPlayTimeRef.current = ctx.currentTime;

    const source    = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (isMutedRef.current) return;
      if (ws.readyState !== WebSocket.OPEN) return;
      const raw = e.inputBuffer.getChannelData(0);
      const b64 = downsampleAndEncode(raw, ctx.sampleRate);
      ws.send(JSON.stringify({
        type:  'input_audio_buffer.append',
        audio: b64,
      }));
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  }, []);

  // ── Connect ───────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (status !== 'idle' && status !== 'error') return;
    setStatus('connecting');
    setAiText('');
    setUserText('');
    setError(null);

    const ws = new WebSocket(`${BACKEND_WS}/api/realtime`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Realtime] WebSocket open — waiting for session.created');
    };

    ws.onmessage = (evt) => {
      let data: Record<string, unknown>;
      try { data = JSON.parse(evt.data as string); }
      catch { return; }

      const type = data.type as string;

      if (type === 'session.created' || type === 'session.updated') {
        setStatus('ready');
        // Start mic after session is configured
        startMic(ws).catch((err: Error) => {
          setError('माइक्रोफोन अनुमति दिनुहोस्।');
          setStatus('error');
          console.error('[Realtime] mic error:', err);
        });
      }

      if (type === 'response.audio.delta') {
        setStatus('speaking');
        playChunk(data.delta as string);
      }

      if (type === 'response.audio.done') {
        setStatus('ready');
      }

      if (type === 'response.text.delta') {
        setAiText((prev) => prev + (data.delta as string ?? ''));
      }

      if (type === 'response.done') {
        setAiText('');     // clear for next turn
        setUserText('');
        setStatus('ready');
      }

      if (type === 'conversation.item.input_audio_transcription.completed') {
        const transcript = (data.transcript as string) ?? '';
        setUserText(transcript);
      }

      if (type === 'error') {
        const msg = (data as { message?: string }).message ?? 'Unknown error';
        setError(msg);
        setStatus('error');
        cleanup();
      }
    };

    ws.onerror = () => {
      setError('Backend सँग जोडिन सकिएन। Backend चलाउनुहोस्।');
      setStatus('error');
      cleanup();
    };

    ws.onclose = () => {
      if (status !== 'error') setStatus('idle');
      cleanup();
    };
  }, [status, startMic, playChunk, cleanup]);

  // ── Disconnect ────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    cleanup();
    setStatus('idle');
    setAiText('');
    setUserText('');
    setError(null);
  }, [cleanup]);

  // ── Mute toggle ───────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      isMutedRef.current = !prev;
      return !prev;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { cleanup(); }, [cleanup]);

  return { status, aiText, userText, isMuted, error, connect, disconnect, toggleMute };
}
