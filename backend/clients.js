"use strict";
require("dotenv").config();
const { AzureOpenAI } = require("openai");
const path = require("path");
const fs = require("fs");

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_API_VERSION || "2025-01-01-preview",
});

const MODELS = {
  gpt: process.env.GPT_MODEL || "gpt-5.4",
  audio: process.env.AUDIO_MODEL || "gpt-audio-1.5",
  image: process.env.IMAGE_MODEL || "gpt-image-1.5",
  stt: process.env.STT_MODEL || "gpt-4o-transcribe",
  tts: process.env.TTS_DEPLOYMENT || "tts",
  realtime: process.env.REALTIME_MODEL || "gpt-realtime-1.5",
};

// Ensure output directories exist
["uploads", "static/audio", "static/images"].forEach((dir) => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

module.exports = { client, MODELS };
