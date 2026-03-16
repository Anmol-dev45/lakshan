import { useState, useRef, useCallback, useEffect } from 'react';

function resolveBackendWsBase(): string {
  const configured = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() ?? '';

  // If configured explicitly, use it.
  if (configured) {
    if (configured.startsWith('ws://') || configured.startsWith('wss://')) {
      const wsUrl = new URL(configured);
      return `${wsUrl.protocol}//${wsUrl.host}`;
    }

    // If an HTTP URL includes a path like /api, keep only origin for websocket base.
    const httpUrl = new URL(configured);
    const wsProto = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${httpUrl.host}`;
  }

  // Local dev: connect directly to backend port to avoid proxy/path mismatches.
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'ws://localhost:8000';
  }

  // Default to same-origin /api proxy for deployed environments.
  const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProto}//${window.location.host}`;
}

const BACKEND_WS = resolveBackendWsBase();

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
  const ratio = fromRate / TARGET;
  const length = Math.floor(float32.length / ratio);
  const pcm16 = new Int16Array(length);
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
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const int16 = new Int16Array(bytes.buffer);
  const f32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) f32[i] = int16[i] / 32768.0;
  return f32;
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useRealtimeVoice(): RealtimeVoiceState & RealtimeVoiceActions {
  const [status, setStatus] = useState<RealtimeStatus>('idle');
  const [aiText, setAiText] = useState('');
  const [userText, setUserText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const statusRef = useRef<RealtimeStatus>('idle');
  const hasErrorRef = useRef(false);
  const manualDisconnectRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const micStartedRef = useRef(false);
  const connectTimeoutRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const isMutedRef = useRef(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // ── Cleanup ──────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (connectTimeoutRef.current !== null) {
      window.clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }
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

    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (isMutedRef.current) return;
      if (ws.readyState !== WebSocket.OPEN) return;
      const raw = e.inputBuffer.getChannelData(0);
      const b64 = downsampleAndEncode(raw, ctx.sampleRate);
      ws.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: b64,
      }));
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  }, []);

  // ── Connect ───────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    manualDisconnectRef.current = false;
    hasErrorRef.current = false;
    micStartedRef.current = false;
    setStatus('connecting');
    setAiText('');
    setUserText('');
    setError(null);

    const ws = new WebSocket(`${BACKEND_WS}/api/realtime`);
    wsRef.current = ws;

    const startMicIfNeeded = () => {
      if (micStartedRef.current) return;
      micStartedRef.current = true;
      setStatus('ready');
      startMic(ws).catch((err: Error) => {
        setError('माइक्रोफोन अनुमति दिनुहोस्।');
        setStatus('error');
        console.error('[Realtime] mic error:', err);
      });
    };

    ws.onopen = () => {
      console.log('[Realtime] WebSocket open — waiting for session.created/session.updated');
      connectTimeoutRef.current = window.setTimeout(() => {
        hasErrorRef.current = true;
        setError('Realtime session सुरु भएन। backend realtime config जाँच्नुहोस्।');
        setStatus('error');
        cleanup();
      }, 15000);
    };

    ws.onmessage = (evt) => {
      let data: Record<string, unknown>;
      try { data = JSON.parse(evt.data as string); }
      catch { return; }

      const type = data.type as string;

      if (type === 'session.created' || type === 'session.updated' || type === 'proxy.azure.open') {
        reconnectAttemptsRef.current = 0;
        if (connectTimeoutRef.current !== null) {
          window.clearTimeout(connectTimeoutRef.current);
          connectTimeoutRef.current = null;
        }
        startMicIfNeeded();
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
        hasErrorRef.current = true;
        const msg =
          (data as { message?: string }).message ||
          (data.error as { message?: string } | undefined)?.message ||
          'Unknown error';
        setError(msg);
        setStatus('error');
        cleanup();
      }
    };

    ws.onerror = () => {
      hasErrorRef.current = true;
      if (connectTimeoutRef.current !== null) {
        window.clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      setError('Live voice backend सँग जोडिन सकेन। backend server चलिरहेको छ र /api/realtime उपलब्ध छ कि जाँच्नुहोस्।');
      setStatus('error');
      cleanup();
    };

    ws.onclose = () => {
      if (connectTimeoutRef.current !== null) {
        window.clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      cleanup();

      if (manualDisconnectRef.current) {
        setStatus('idle');
        setError(null);
      } else if (statusRef.current === 'connecting' && !hasErrorRef.current) {
        setStatus('error');
        setError('Realtime session बन्द भयो। backend realtime credentials जाँच्नुहोस्।');
      } else if ((statusRef.current === 'ready' || statusRef.current === 'speaking') && !hasErrorRef.current) {
        if (reconnectAttemptsRef.current < 2) {
          reconnectAttemptsRef.current += 1;
          setStatus('connecting');
          setError(`Live connection drop भयो। Reconnecting... (${reconnectAttemptsRef.current}/2)`);
          reconnectTimerRef.current = window.setTimeout(() => {
            connect();
          }, 1000 * reconnectAttemptsRef.current);
        } else {
          setStatus('error');
          setError('Live connection drop भयो। फेरि mic थिचेर reconnect गर्नुहोस्।');
        }
      } else if (statusRef.current !== 'error') {
        setStatus('idle');
      }
    };
  }, [startMic, playChunk, cleanup]);

  // ── Disconnect ────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    manualDisconnectRef.current = true;
    reconnectAttemptsRef.current = 0;
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
