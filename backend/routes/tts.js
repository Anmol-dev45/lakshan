"use strict";
const express = require("express");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { client, MODELS } = require("../clients");
const { ttsLimiter } = require("../rateLimiter");

const VOICE_MAP = {
  emergency: "onyx",
  urgent: "echo",
  routine: "nova",
};

// POST /api/tts  →  { text, urgency_level?, voice? }  →  { audio_url, voice_used }
router.post("/", async (req, res) => {
  const { text, urgency_level, voice } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "text is required" });

  const selectedVoice = voice || VOICE_MAP[urgency_level] || "nova";
  const speed = urgency_level === "emergency" ? 0.95 : 1.0;
  const fname = path.join(
    __dirname,
    `../static/audio/tts_${crypto.randomUUID().slice(0, 8)}.mp3`,
  );

  try {
    await ttsLimiter.wait();
    const response = await client.audio.speech.create({
      model: MODELS.tts,
      voice: selectedVoice,
      input: text,
      response_format: "mp3",
      speed,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(fname, buffer);

    // Return relative URL
    const urlPath = "/audio/" + path.basename(fname);
    res.json({ audio_url: urlPath, voice_used: selectedVoice });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
