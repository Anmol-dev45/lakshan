# Lakshan AI Health Assistant

Lakshan is a mobile-first web application that helps people in Nepal get early health guidance through AI-powered symptom triage, voice consultation, medical report understanding, and medicine identification.

The app is bilingual (Nepali and English), designed for accessibility, and optimized for practical rural healthcare use-cases.

## What This App Does

- AI symptom chat with follow-up questioning
- Structured triage output with urgency and risk levels
- Real-time live voice consultation (WebRTC)
- Voice-to-text (STT) and text-to-speech (TTS)
- Medical report photo analysis
- Medicine image identification
- Nearby hospital and emergency utility screens
- User authentication and history persistence with Supabase

## Who This Is For

- Patients and families seeking first-level health guidance
- Community health workers and field volunteers
- Developers building AI-assisted public health experiences

## Important Medical Disclaimer

This project is an educational and decision-support tool. It is not a replacement for licensed medical diagnosis or treatment.

In emergencies, contact local emergency services and go to the nearest hospital immediately.

## Tech Stack

Frontend:

- React 19 + TypeScript
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS

Backend:

- Node.js + Express
- OpenAI/Azure OpenAI integrations
- Multer for file uploads
- WebRTC session bootstrap endpoint

Data/Auth:

- Supabase Auth
- Supabase Postgres (RLS enabled)

## Project Structure

- src: React frontend
- backend: Express API server
- supabase: SQL migration and edge-function related files
- public: static frontend assets

## Core User Flows

1. Symptom Chat

- User describes symptoms via text or voice.
- Backend returns structured triage JSON with probable conditions and recommended action.

2. Live Consultation

- User starts real-time voice session.
- Frontend requests an ephemeral realtime session from backend.
- Session streams speech and AI responses in near real time.

3. Report Scan

- User uploads a report photo.
- Vision pipeline extracts metrics, compares with ranges, and explains in simple language.

4. Medicine Identifier

- User uploads medicine photo.
- Vision model attempts identification and returns usage and precautions.

## API Overview

Backend base URL in local development is usually http://localhost:8000.

- POST /api/analyze: symptom triage analysis
- POST /api/analyze/chat: conversational follow-up
- POST /api/voice/transcribe: audio to text
- POST /api/tts: text to speech
- POST /api/vision: image analysis (report, medicine, symptom/general)
- POST /api/realtime/session: ephemeral realtime session for WebRTC
- GET /health: health check

## Local Development Setup

### 1. Prerequisites

- Node.js 20+ recommended
- npm 9+ recommended
- Supabase project (for auth/history features)
- OpenAI or Azure OpenAI credentials

### 2. Install Dependencies

Frontend:

```bash
npm install
```

Backend:

```bash
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables

Create a frontend env file at project root, for example .env.local:

```bash
VITE_BACKEND_PROXY_TARGET=http://localhost:8000
VITE_BACKEND_URL=
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ENABLE_VISION_DEMO=false
```

Create a backend env file at backend/.env:

```bash
PORT=8000

# Realtime session flow (preferred)
OPENAI_API_KEY=your_openai_key

# Azure OpenAI (used by backend client and optional realtime fallback)
AZURE_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_API_VERSION=2025-01-01-preview

# Optional model overrides
GPT_MODEL=gpt-5.4
STT_MODEL=gpt-4o-transcribe
TTS_DEPLOYMENT=tts
REALTIME_MODEL=gpt-realtime-1.5
REALTIME_VOICE=alloy
```

Notes:

- Frontend calls /api through Vite proxy in development.
- If VITE_BACKEND_URL is empty, the app uses relative URLs.

### 4. Run the App

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
npm run dev
```

Frontend should run at http://localhost:5173 and proxy API calls to backend.

## Build for Production

Frontend build:

```bash
npm run build
```

Frontend preview:

```bash
npm run preview
```

Backend production start:

```bash
cd backend
npm start
```

## Supabase Setup

The migration in supabase/migrations/001_initial.sql creates:

- health_records
- conversation_sessions
- user_profiles

It also enables row-level security and user-scoped policies.

Apply the migration using your Supabase workflow before testing persistence features.

## Current Localization

- Nepali (default)
- English

Language selection persists in local storage.

## Security and Privacy Notes

- Supabase auth sessions are persisted client-side.
- Sensitive operations are performed server-side.
- Keep API keys only in backend environment files.
- Do not expose backend secrets in frontend env variables.

## Known Behavior

- If backend is unavailable, some features use fallback behavior (for example demo report result when enabled).
- Realtime voice requires microphone permission and a valid realtime session credential.

## Contributing

1. Create a feature branch.
2. Keep changes focused and test affected flows.
3. Open a pull request with screenshots or request/response examples for UI/API changes.

## License

Add your preferred license in this repository (for example MIT) and update this section accordingly.
