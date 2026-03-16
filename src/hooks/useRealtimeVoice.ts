import { useState, useRef, useCallback, useEffect } from 'react';

const REALTIME_MODEL = 'gpt-realtime-1.5';

type SessionResponse = {
    clientSecret?: string;
    error?: string;
    details?: string;
    realtimeUrl?: string;
};

type RealtimeServerEvent = {
    type?: string;
    delta?: string;
    transcript?: string;
    response?: {
        output?: Array<{
            content?: Array<{
                text?: string;
                transcript?: string;
            }>;
        }>;
    };
    item?: {
        content?: Array<{
            text?: string;
            transcript?: string;
        }>;
    };
    error?: {
        message?: string;
    };
    message?: string;
};

export type RealtimeStatus =
    | 'idle'
    | 'connecting'
    | 'ready'
    | 'speaking'
    | 'error';

export interface RealtimeVoiceState {
    status: RealtimeStatus;
    aiText: string;
    userText: string;
    isMuted: boolean;
    error: string | null;
}

export interface RealtimeVoiceActions {
    connect: () => void;
    disconnect: () => void;
    toggleMute: () => void;
}

function extractText(event: RealtimeServerEvent): string {
    if (typeof event.delta === 'string') return event.delta;
    if (typeof event.transcript === 'string') return event.transcript;

    const itemText = event.item?.content
        ?.map((content) => content.transcript ?? content.text ?? '')
        .join('')
        .trim();
    if (itemText) return itemText;

    const responseText = event.response?.output
        ?.flatMap((output) => output.content ?? [])
        .map((content) => content.transcript ?? content.text ?? '')
        .join('')
        .trim();
    if (responseText) return responseText;

    return '';
}

function toFriendlyError(err: unknown): string {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
        return 'माइक्रोफोन अनुमति अस्वीकृत भयो। ब्राउजर सेटिङमा mic allow गर्नुहोस्।';
    }
    if (err instanceof DOMException && err.name === 'NotFoundError') {
        return 'माइक्रोफोन device भेटिएन। कृपया mic जाँच्नुहोस्।';
    }
    if (err instanceof Error && err.message) {
        if (err.message === 'Failed to fetch') {
            return 'Backend सँग जडान भएन। backend server (port 8000) चलिरहेको छ कि जाँच्नुहोस्।';
        }
        return err.message;
    }
    return 'Realtime voice मा अज्ञात त्रुटि भयो।';
}

export function useRealtimeVoice(): RealtimeVoiceState & RealtimeVoiceActions {
    const [status, setStatus] = useState<RealtimeStatus>('idle');
    const [aiText, setAiText] = useState('');
    const [userText, setUserText] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const peerRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    const statusRef = useRef<RealtimeStatus>('idle');
    const manualDisconnectRef = useRef(false);
    const isMutedRef = useRef(false);
    const aiBufferRef = useRef('');
    const userBufferRef = useRef('');

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    const cleanup = useCallback(() => {
        if (dataChannelRef.current && dataChannelRef.current.readyState !== 'closed') {
            dataChannelRef.current.close();
        }
        dataChannelRef.current = null;

        if (peerRef.current && peerRef.current.connectionState !== 'closed') {
            peerRef.current.close();
        }
        peerRef.current = null;

        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;

        if (remoteAudioRef.current) {
            remoteAudioRef.current.pause();
            remoteAudioRef.current.srcObject = null;
            remoteAudioRef.current.remove();
            remoteAudioRef.current = null;
        }
    }, []);

    const handleRealtimeEvent = useCallback((event: RealtimeServerEvent) => {
        const eventType = event.type ?? '';

        if (eventType === 'input_audio_buffer.speech_started') {
            userBufferRef.current = '';
            setUserText('');
            return;
        }

        if (eventType === 'response.created') {
            aiBufferRef.current = '';
            setAiText('');
            return;
        }

        if (eventType === 'conversation.item.input_audio_transcription.delta') {
            userBufferRef.current += extractText(event);
            setUserText(userBufferRef.current);
            return;
        }

        if (
            eventType === 'conversation.item.input_audio_transcription.completed' ||
            eventType === 'conversation.item.input_audio_transcription.done'
        ) {
            const doneText = extractText(event);
            userBufferRef.current = doneText || userBufferRef.current;
            setUserText(userBufferRef.current);
            return;
        }

        if (
            eventType === 'response.text.delta' ||
            eventType === 'response.audio_transcript.delta' ||
            eventType === 'response.output_text.delta'
        ) {
            aiBufferRef.current += extractText(event);
            setAiText(aiBufferRef.current);
            setStatus('speaking');
            return;
        }

        if (
            eventType === 'response.text.done' ||
            eventType === 'response.audio_transcript.done' ||
            eventType === 'response.output_text.done'
        ) {
            const doneText = extractText(event);
            if (doneText) {
                aiBufferRef.current = doneText;
                setAiText(doneText);
            }
            setStatus('ready');
            return;
        }

        if (eventType === 'response.audio.delta') {
            setStatus('speaking');
            return;
        }

        if (eventType === 'response.audio.done' || eventType === 'response.done') {
            setStatus('ready');
            userBufferRef.current = '';
            return;
        }

        if (eventType === 'error') {
            setStatus('error');
            setError(event.error?.message ?? event.message ?? 'Realtime connection error');
        }
    }, []);

    const connect = useCallback(async () => {
        if (statusRef.current === 'connecting' || statusRef.current === 'ready' || statusRef.current === 'speaking') {
            return;
        }

        manualDisconnectRef.current = false;
        setStatus('connecting');
        setAiText('');
        setUserText('');
        setError(null);
        aiBufferRef.current = '';
        userBufferRef.current = '';

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('यो ब्राउजरले realtime voice support गर्दैन।');
            }

            const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStream.getAudioTracks().forEach((track) => {
                track.enabled = !isMutedRef.current;
            });
            localStreamRef.current = localStream;

            const sessionRes = await fetch('/api/realtime/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const rawSessionBody = await sessionRes.text();
            const sessionData = rawSessionBody
                ? (JSON.parse(rawSessionBody) as SessionResponse)
                : ({} as SessionResponse);

            if (!sessionRes.ok) {
                const backendMessage = sessionData.error || sessionData.details;
                const statusMessage = `HTTP ${sessionRes.status}`;
                const fallbackBody = rawSessionBody.slice(0, 200).trim();

                if (backendMessage) {
                    throw new Error(`${backendMessage} (${statusMessage})`);
                }

                if (fallbackBody) {
                    throw new Error(`Realtime session बनाउन सकेन। ${statusMessage}: ${fallbackBody}`);
                }

                throw new Error(`Realtime session बनाउन सकेन। ${statusMessage}`);
            }

            const clientSecret = sessionData.clientSecret;
            if (!clientSecret) {
                throw new Error('Realtime client secret प्राप्त भएन।');
            }

            const realtimeUrl = sessionData.realtimeUrl || `https://api.openai.com/v1/realtime?model=${REALTIME_MODEL}`;

            const peer = new RTCPeerConnection();
            peerRef.current = peer;
            localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

            const remoteAudio = document.createElement('audio');
            remoteAudio.autoplay = true;
            remoteAudio.setAttribute('playsinline', 'true');
            remoteAudioRef.current = remoteAudio;

            peer.ontrack = (event) => {
                const [remoteStream] = event.streams;
                if (!remoteStream) return;
                remoteAudio.srcObject = remoteStream;
                void remoteAudio.play().catch(() => {
                    // Autoplay can fail if browser policy blocks untrusted playback.
                });
            };

            peer.onconnectionstatechange = () => {
                const conn = peer.connectionState;
                if (conn === 'connected') {
                    setStatus('ready');
                    setError(null);
                    return;
                }

                if ((conn === 'failed' || conn === 'disconnected' || conn === 'closed') && !manualDisconnectRef.current) {
                    cleanup();
                    setStatus('error');
                    setError('Realtime connection drop भयो। फेरि mic थिचेर reconnect गर्नुहोस्।');
                }
            };

            const dataChannel = peer.createDataChannel('oai-events');
            dataChannelRef.current = dataChannel;

            dataChannel.onopen = () => {
                dataChannel.send(JSON.stringify({
                    type: 'session.update',
                    session: {
                        model: REALTIME_MODEL,
                        modalities: ['audio', 'text'],
                        input_audio_transcription: {
                            model: 'gpt-4o-mini-transcribe',
                        },
                        turn_detection: {
                            type: 'server_vad',
                            create_response: true,
                            interrupt_response: true,
                        },
                    },
                }));
            };

            dataChannel.onmessage = (event) => {
                try {
                    handleRealtimeEvent(JSON.parse(event.data as string) as RealtimeServerEvent);
                } catch {
                    // Ignore malformed events and keep the session alive.
                }
            };

            dataChannel.onerror = () => {
                setStatus('error');
                setError('Realtime data channel error भयो।');
            };

            const offer = await peer.createOffer({ offerToReceiveAudio: true });
            await peer.setLocalDescription(offer);

            const sdpRes = await fetch(realtimeUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${clientSecret}`,
                    'OpenAI-Beta': 'realtime=v1',
                    'Content-Type': 'application/sdp',
                },
                body: offer.sdp ?? '',
            });

            if (!sdpRes.ok) {
                const body = await sdpRes.text();
                throw new Error(body || 'Realtime SDP negotiation failed');
            }

            const answerSdp = await sdpRes.text();
            await peer.setRemoteDescription({
                type: 'answer',
                sdp: answerSdp,
            });
        } catch (err) {
            cleanup();
            setStatus('error');
            setError(toFriendlyError(err));
        }
    }, [cleanup, handleRealtimeEvent]);

    const disconnect = useCallback(() => {
        manualDisconnectRef.current = true;
        cleanup();
        setStatus('idle');
        setAiText('');
        setUserText('');
        setError(null);
        aiBufferRef.current = '';
        userBufferRef.current = '';
    }, [cleanup]);

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => {
            const next = !prev;
            isMutedRef.current = next;
            localStreamRef.current?.getAudioTracks().forEach((track) => {
                track.enabled = !next;
            });
            return next;
        });
    }, []);

    useEffect(() => () => {
        cleanup();
    }, [cleanup]);

    return { status, aiText, userText, isMuted, error, connect, disconnect, toggleMute };
}
