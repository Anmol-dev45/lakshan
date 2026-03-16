"use strict";

const express = require("express");
const OpenAI = require("openai");
const { AzureOpenAI } = require("openai");

const router = express.Router();

const REALTIME_MODEL = process.env.REALTIME_MODEL || "gpt-realtime-1.5";
const REALTIME_VOICE = process.env.REALTIME_VOICE || "alloy";

const SYSTEM_PROMPT = `You are a real-time health triage assistant for rural Nepal.
Listen to patient symptoms and respond verbally with:
1. Urgency level (emergency / urgent / routine)
2. Brief likely cause in simple language
3. Immediate action the patient should take
4. Whether they need to visit a doctor or hospital

Keep responses concise, compassionate, and easy to follow.
If symptoms sound life-threatening, say so immediately and direct the patient to emergency services.
Always end every response with: "Please consult a licensed doctor for proper diagnosis."
You may respond in Nepali or English based on what the patient uses.`;

router.post("/session", async (_req, res) => {
  const realtimeModel = REALTIME_MODEL;
  const azureEndpoint = (process.env.AZURE_OPENAI_ENDPOINT || "").trim();
  const azureApiVersion = process.env.AZURE_API_VERSION || "2025-01-01-preview";

  const buildResponse = (session, provider) => {
    const deployment = encodeURIComponent(session?.model || realtimeModel);
    const realtimeUrl =
      provider === "azure"
        ? `${azureEndpoint.replace(/\/$/, "")}/openai/realtime?api-version=${encodeURIComponent(azureApiVersion)}&deployment=${deployment}`
        : `https://api.openai.com/v1/realtime?model=${deployment}`;

    return {
      clientSecret: session?.client_secret?.value,
      expiresAt: session?.expires_at,
      sessionId: session?.id,
      model: session?.model || realtimeModel,
      provider,
      realtimeUrl,
    };
  };

  const createSessionBody = {
    model: realtimeModel,
    voice: REALTIME_VOICE,
    modalities: ["audio", "text"],
    instructions: SYSTEM_PROMPT,
    turn_detection: {
      type: "server_vad",
      create_response: true,
      interrupt_response: true,
    },
    input_audio_transcription: {
      model: "gpt-4o-mini-transcribe",
    },
  };

  try {
    const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
    const hasAzureConfig = Boolean(process.env.AZURE_API_KEY && azureEndpoint);

    if (!hasOpenAIKey && !hasAzureConfig) {
      return res.status(500).json({
        error:
          "Missing credentials. Set OPENAI_API_KEY or both AZURE_API_KEY and AZURE_OPENAI_ENDPOINT.",
      });
    }

    let session;
    let provider = "openai";
    let openAIFailure;

    if (hasOpenAIKey) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        session = await openai.beta.realtime.sessions.create(createSessionBody);
      } catch (err) {
        openAIFailure = err;
      }
    }

    if (!session && hasAzureConfig) {
      provider = "azure";
      const azure = new AzureOpenAI({
        apiKey: process.env.AZURE_API_KEY,
        endpoint: azureEndpoint,
        apiVersion: azureApiVersion,
      });
      session = await azure.beta.realtime.sessions.create(createSessionBody);
    }

    if (!session) {
      const message =
        openAIFailure?.error?.message ||
        openAIFailure?.message ||
        "Failed to create realtime session.";
      return res.status(openAIFailure?.status || 500).json({ error: message });
    }

    const payload = buildResponse(session, provider);
    if (!payload.clientSecret) {
      return res.status(502).json({
        error: `${provider} did not return a realtime client secret.`,
      });
    }

    return res.json(payload);
  } catch (err) {
    const message =
      err?.error?.message ||
      err?.message ||
      "Failed to create realtime session.";
    return res.status(err?.status || 500).json({ error: message });
  }
});

module.exports = router;
