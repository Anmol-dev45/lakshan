'use strict';
const express = require('express');
const router  = express.Router();
const { client, MODELS } = require('../clients');
const { gptLimiter }     = require('../rateLimiter');

const HEALTH_SYSTEM_PROMPT = `
You are a clinical symptom triage assistant in a health diagnosis app targeting rural Nepal.

INFORMATION TO COLLECT (ask if not provided):
- Age and biological sex
- Symptom duration (hours / days / weeks)
- Severity on a scale of 1–10
- Existing conditions and current medications

URGENCY TIERS:
🔴 EMERGENCY → Instruct to call emergency services IMMEDIATELY:
   Chest pain, difficulty breathing, sudden worst-ever headache,
   stroke signs, uncontrolled bleeding, loss of consciousness,
   severe allergic reaction, fever > 104°F / 40°C.

🟡 URGENT → Advise same-day doctor visit:
   Fever 102–104°F, persistent vomiting > 12h, severe localized pain,
   spreading infection, worsening over 48–72h.

🟢 ROUTINE → Home care and scheduled visit if needed:
   Mild cold or flu, minor rash, low-grade fever < 101°F, mild digestive upset.

SAFETY RULES:
- NEVER provide a single definitive diagnosis
- ALWAYS end with: "This is not a substitute for professional medical advice."
- NEVER recommend specific prescription medications or dosages
- For emergencies: put the emergency instruction FIRST
- Respond in Nepali or English based on user's language
`;

const JSON_SYSTEM = `
You are a clinical symptom analysis API for a health app in rural Nepal.
Respond ONLY with a valid JSON object. No preamble, no markdown fences.

Schema:
{
  "urgency_level":      "emergency" | "urgent" | "routine",
  "confidence":         "low" | "medium" | "high",
  "summary":            "one sentence overview",
  "extracted_symptoms": {
    "symptoms": ["symptom1", "symptom2"],
    "duration": "e.g. 2 days",
    "severity": "mild" | "moderate" | "severe",
    "age": null,
    "existing_conditions": [],
    "medications": []
  },
  "disease_ranking": [
    { "name": "English name", "local_name": "Nepali name", "probability": 45, "description": "brief description" }
  ],
  "risk_level":         "safe" | "monitor" | "consult" | "urgent",
  "risk_explanation":   "why this risk level",
  "recommended_action": "what to do now",
  "recommendations":    ["step 1", "step 2"],
  "home_care":          "home tips or null",
  "watch_for":          ["warning sign 1", "warning sign 2"],
  "needs_immediate_care": false,
  "disclaimer":         "This is not a substitute for professional medical advice."
}
`;

// In-memory session store
const sessions = new Map();

function safeParseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    // Extract JSON object from the string
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('No valid JSON in response');
  }
}

// POST /api/analyze  — text symptom analysis (JSON mode by default)
router.post('/', async (req, res) => {
  const { message, messages, session_id, json_mode = true } = req.body;

  // Accept either a single message or a messages array
  const userContent = message || (Array.isArray(messages) && messages.length
    ? messages[messages.length - 1]?.content
    : null);

  if (!userContent?.trim())
    return res.status(400).json({ error: 'message or messages array is required' });

  const sid     = session_id || crypto.randomUUID();
  const history = sessions.get(sid) || [];

  // If caller passes a full messages array (multi-turn), use it directly
  if (Array.isArray(messages) && messages.length > 1) {
    sessions.set(sid, messages.filter(m => m.role !== 'system'));
    const fullHistory = messages.filter(m => m.role !== 'system');
    try {
      await gptLimiter.wait();
      const sysPrompt = json_mode ? JSON_SYSTEM : HEALTH_SYSTEM_PROMPT;
      const response = await client.chat.completions.create({
        model:       MODELS.gpt,
        max_tokens:  1500,
        temperature: 0.3,
        top_p:       0.9,
        messages: [
          { role: 'system', content: sysPrompt },
          ...fullHistory,
        ],
      });
      const raw   = response.choices[0].message.content;
      const reply = json_mode ? safeParseJSON(raw) : raw;
      return res.json({ session_id: sid, response: reply, stop_reason: response.choices[0].finish_reason });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  // Single-turn
  history.push({ role: 'user', content: userContent });

  try {
    await gptLimiter.wait();
    const sysPrompt = json_mode ? JSON_SYSTEM : HEALTH_SYSTEM_PROMPT;
    const response = await client.chat.completions.create({
      model:       MODELS.gpt,
      max_tokens:  json_mode ? 1500 : 900,
      temperature: 0.3,
      top_p:       0.9,
      messages: [
        { role: 'system', content: sysPrompt },
        ...history,
      ],
    });

    const raw   = response.choices[0].message.content;
    const reply = json_mode ? safeParseJSON(raw) : raw;

    history.push({ role: 'assistant', content: raw });
    sessions.set(sid, history);

    res.json({ session_id: sid, response: reply, stop_reason: response.choices[0].finish_reason });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/analyze/chat  — follow-up question (plain text, not JSON)
router.post('/chat', async (req, res) => {
  const { messages, session_id } = req.body;
  if (!Array.isArray(messages) || !messages.length)
    return res.status(400).json({ error: 'messages array required' });

  const sid     = session_id || crypto.randomUUID();
  const history = messages.filter(m => m.role !== 'system');

  const CHAT_SYS = `You are a friendly AI health assistant for rural Nepal.
Ask ONE focused follow-up question per message to gather symptom details.
Be brief (1-2 sentences). Respond in Nepali or English based on user preference.
Do NOT diagnose yet.`;

  try {
    await gptLimiter.wait();
    const response = await client.chat.completions.create({
      model: MODELS.gpt, max_tokens: 200, temperature: 0.4,
      messages: [{ role: 'system', content: CHAT_SYS }, ...history],
    });
    const reply = response.choices[0].message.content;
    res.json({ session_id: sid, response: reply });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/analyze/reset
router.post('/reset', (req, res) => {
  sessions.delete(req.body.session_id);
  res.json({ status: 'cleared' });
});

module.exports = router;
