'use strict';
require('dotenv').config();
const http    = require('http');
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const analyzeRouter = require('./routes/analyze');
const voiceRouter   = require('./routes/voice');
const ttsRouter     = require('./routes/tts');
const visionRouter  = require('./routes/vision');
const { setupRealtimeProxy } = require('./routes/realtime');

const app    = express();
const server = http.createServer(app);

// CORS — allow the Vite frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve generated audio files
app.use('/audio', express.static(path.join(__dirname, 'static/audio')));
app.use('/images', express.static(path.join(__dirname, 'static/images')));

// Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/voice',   voiceRouter);
app.use('/api/tts',     ttsRouter);
app.use('/api/vision',  visionRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', expires: '2026-03-17' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[server]', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// Attach realtime WebSocket proxy
setupRealtimeProxy(server);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`\n🚀 Nexalaris Health API running on http://localhost:${PORT}`);
  console.log(`   POST /api/analyze          — text symptom analysis`);
  console.log(`   POST /api/analyze/chat     — follow-up chat`);
  console.log(`   POST /api/voice/transcribe — audio → text (STT)`);
  console.log(`   POST /api/tts              — text → audio (TTS)`);
  console.log(`   POST /api/vision           — analyze photo (vision)`);
  console.log(`   WSS  /api/realtime         — live bidirectional voice\n`);
});
