import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, PhoneOff, Volume2, Wifi, WifiOff } from 'lucide-react';
import { useRealtimeVoice } from '../hooks/useRealtimeVoice';
import type { RealtimeStatus } from '../hooks/useRealtimeVoice';
import { useT } from '../i18n/useT';

const STATUS_COLOR: Record<RealtimeStatus, string> = {
  idle:       'text-gray-500',
  connecting: 'text-yellow-600',
  ready:      'text-green-600',
  speaking:   'text-primary-600',
  error:      'text-red-600',
};

export default function LiveConsultation() {
  const navigate = useNavigate();
  const t = useT();

  const STATUS_LABEL: Record<RealtimeStatus, string> = {
    idle:       t('liveIdle'),
    connecting: t('liveConnecting'),
    ready:      t('liveReady'),
    speaking:   t('liveSpeaking'),
    error:      t('liveError'),
  };

  const { status, aiText, userText, isMuted, error, connect, disconnect, toggleMute } =
    useRealtimeVoice();

  const isActive = status === 'ready' || status === 'speaking';
  const isConnecting = status === 'connecting';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button
          onClick={() => { disconnect(); navigate('/home'); }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={22} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">AI डाक्टर (Live)</h1>
          <p className="text-xs text-gray-500">gpt-realtime-1.5 · सिधा आवाज परामर्श</p>
        </div>
        {/* Connection dot */}
        <div className={`flex items-center gap-1.5 text-xs font-medium ${STATUS_COLOR[status]}`}>
          {isActive ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{STATUS_LABEL[status]}</span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">

        {/* Orb / Mic button */}
        <button
          onClick={isActive ? undefined : connect}
          disabled={isConnecting}
          aria-label="connect live voice"
          className={[
            'relative w-40 h-40 rounded-full transition-all duration-300 flex items-center justify-center shadow-xl',
            isActive
              ? 'bg-primary-600 cursor-default'
              : isConnecting
              ? 'bg-yellow-400 cursor-wait'
              : status === 'error'
              ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
              : 'bg-primary-500 hover:bg-primary-600 active:scale-95 cursor-pointer',
          ].join(' ')}
        >
          {/* Pulse rings when listening */}
          {isActive && (
            <>
              <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-30" />
              <span className="absolute inset-4 rounded-full bg-primary-400 animate-ping opacity-20" style={{ animationDelay: '0.3s' }} />
            </>
          )}

          {status === 'speaking' ? (
            <Volume2 size={52} className="text-white z-10" />
          ) : (
            <Mic size={52} className="text-white z-10" />
          )}
        </button>

        <p className={`text-sm font-semibold ${STATUS_COLOR[status]}`}>
          {STATUS_LABEL[status]}
        </p>

        {/* Error */}
        {error && (
          <div className="w-full max-w-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {/* User speech transcript */}
        {userText ? (
          <div className="w-full max-w-sm bg-white border border-surface-100 rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 mb-1">{t('liveYouSaid')}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{userText}</p>
          </div>
        ) : null}

        {/* AI response text */}
        {aiText ? (
          <div className="w-full max-w-sm bg-primary-50 border border-primary-200 rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold text-primary-500 mb-1">{t('liveAiDoctor')}</p>
            <p className="text-sm text-gray-800 leading-relaxed">{aiText}</p>
          </div>
        ) : null}

        {/* Idle hint */}
        {status === 'idle' && (
          <div className="w-full max-w-sm text-center text-gray-400 text-sm space-y-1 mt-2">
            <p>{t('liveIdle')}</p>
            <p className="text-xs">AI सुन्न थाल्छ र सिधै आवाजमा जवाफ दिन्छ</p>
            <p className="text-xs text-gray-300">gpt-realtime-1.5 · full-duplex voice</p>
          </div>
        )}
      </div>

      {/* Bottom controls — only visible when active */}
      {isActive && (
        <div className="flex justify-center gap-6 pb-12 pt-4">
          {/* Mute */}
          <button
            onClick={toggleMute}
            className={[
              'w-14 h-14 rounded-full flex items-center justify-center shadow transition-colors',
              isMuted ? 'bg-red-500' : 'bg-white border border-gray-200',
            ].join(' ')}
            aria-label="mute"
          >
            {isMuted
              ? <MicOff size={22} className="text-white" />
              : <Mic    size={22} className="text-gray-600" />}
          </button>

          {/* Hang up */}
          <button
            onClick={disconnect}
            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow hover:bg-red-600 transition-colors"
            aria-label="disconnect"
          >
            <PhoneOff size={22} className="text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
