'use strict';
const WebSocket = require('ws');

const REALTIME_URL = [
  `wss://nexalaris-tech.openai.azure.com/openai/realtime`,
  `?api-version=2025-01-01-preview`,
  `&deployment=${process.env.REALTIME_MODEL || 'gpt-realtime-1.5'}`
].join('');

const SYSTEM_PROMPT = `You are a real-time health triage assistant for rural Nepal.
Listen to patient symptoms and respond verbally with:
1. Urgency level (emergency / urgent / routine)
2. Brief likely cause in simple language
3. Immediate action the patient should take
4. Whether they need to visit a doctor or hospital

Keep responses under 30 seconds. Speak clearly and compassionately.
If symptoms sound life-threatening, say so immediately and direct them to emergency services.
Always end every response with: "Please consult a licensed doctor for proper diagnosis."
You may respond in Nepali or English based on what the patient uses.`;

function setupRealtimeProxy(httpServer) {
  const wss = new WebSocket.Server({ server: httpServer, path: '/api/realtime' });

  wss.on('connection', (clientWs) => {
    console.log('[Realtime] Client connected');

    const azureWs = new WebSocket(REALTIME_URL, {
      headers: {
        'api-key':     process.env.AZURE_API_KEY,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    azureWs.on('open', () => {
      console.log('[Realtime] Azure connected — configuring session');
      azureWs.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: SYSTEM_PROMPT,
          voice: 'nova',
          input_audio_format:  'pcm16',
          output_audio_format: 'pcm16',
          turn_detection: {
            type:                'server_vad',
            threshold:           0.5,
            silence_duration_ms: 700,
          },
        },
      }));
    });

    // Azure → browser: forward all events
    azureWs.on('message', (msg) => {
      if (clientWs.readyState === WebSocket.OPEN) clientWs.send(msg);
    });

    // Browser → Azure: forward audio chunks and events
    clientWs.on('message', (msg) => {
      if (azureWs.readyState === WebSocket.OPEN) azureWs.send(msg);
    });

    clientWs.on('close', () => {
      console.log('[Realtime] Client disconnected');
      if (azureWs.readyState !== WebSocket.CLOSED) azureWs.close();
    });

    azureWs.on('error', (err) => {
      console.error('[Realtime] Azure error:', err.message);
      if (clientWs.readyState === WebSocket.OPEN)
        clientWs.send(JSON.stringify({ type: 'error', message: err.message }));
    });

    azureWs.on('close', () => {
      if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
    });
  });

  return wss;
}

module.exports = { setupRealtimeProxy };
