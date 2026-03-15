'use strict';
const express = require('express');
const router  = express.Router();
const { client, MODELS } = require('../clients');
const { gptLimiter }     = require('../rateLimiter');

const HEALTH_SYSTEM_PROMPT = `
You are a clinical symptom triage assistant in a health app for rural Nepal.
Your role is to gather a full clinical picture before any assessment.

CLINICAL INTERVIEW — collect all of the following before suggesting a diagnosis:
1. PRIMARY SYMPTOM: Location, character (sharp/dull/burning/throbbing), severity 1–10
2. ONSET & TIMELINE: When did it start? Sudden or gradual? Constant or comes and goes?
3. ASSOCIATED SYMPTOMS: What else? (fever, nausea, cough, rash, fatigue, etc.)
4. AGGRAVATING / RELIEVING FACTORS: What makes it worse or better?
5. DEMOGRAPHICS: Age, biological sex
6. MEDICAL HISTORY: Existing conditions, current medications, allergies
7. EPIDEMIOLOGICAL CONTEXT: Recent travel, source of drinking water, sick contacts nearby, vaccination status

NEPAL-SPECIFIC DISEASE AWARENESS:
- Typhoid fever: prolonged fever, stepwise rise, rose spots, relative bradycardia
- Dengue: sudden-onset high fever, severe headache, retro-orbital pain, myalgia, rash
- Scrub typhus: fever + eschar (painless dark ulcer), regional lymphadenopathy
- Kala-azar: prolonged irregular fever, splenomegaly, weight loss (terai region)
- Malaria: cyclical chills + fever (especially terai residents or travelers)
- Hepatitis A/E: jaundice, dark urine, clay stools, post-contaminated water exposure
- Enteric fever, worm infestations, acute gastroenteritis: very common

URGENCY TIERS:
🔴 EMERGENCY → Instruct to call emergency services IMMEDIATELY:
   Chest pain radiating to arm/jaw, difficulty breathing, sudden worst-ever headache,
   stroke signs (face droop, arm weakness, slurred speech), uncontrolled bleeding,
   loss of consciousness, severe allergic reaction, fever > 104°F / 40°C with stiff neck.

🟡 URGENT → Same-day doctor or health post visit:
   Fever 102–104°F, persistent vomiting > 12 h, severe localised pain,
   signs of dehydration, worsening infection, symptoms worsening over 48–72 h,
   suspected dengue or typhoid pattern.

🟢 ROUTINE → Home care with scheduled visit if not improving:
   Mild cold / URI, minor rash, low-grade fever < 101°F, mild digestive upset.

SAFETY RULES:
- NEVER give a single definitive diagnosis — always give differential possibilities
- ALWAYS end with: "This is not a substitute for professional medical advice."
- NEVER recommend specific prescription drugs or dosages
- For emergencies: put the emergency instruction FIRST before all else
- Respond in Nepali or English based on user's language
`;

const JSON_SYSTEM = `
You are a clinical diagnostic API for a health app serving rural Nepal.
Respond ONLY with a single valid JSON object. No markdown, no preamble, no explanation outside the JSON.

CLINICAL REASONING RULES:
- Base disease probabilities strictly on the symptoms described — do not guess what wasn't mentioned
- Consider Nepal-endemic diseases when symptoms match (typhoid, dengue, scrub typhus, malaria, kala-azar, hepatitis A/E)
- Probabilities in disease_ranking must sum to 100
- Set confidence to "low" if age, sex, duration, or key associated symptoms are missing
- Set confidence to "high" only when ≥5 clinical details are present and point clearly to one group
- If a key piece of information is missing that would change the diagnosis, note it in missing_info
- Recommended actions must be appropriate for rural Nepal (nearest health post, ORS, etc.)

SCHEMA (output exactly this structure):
{
  "urgency_level":       "emergency" | "urgent" | "routine",
  "confidence":          "low" | "medium" | "high",
  "missing_info":        ["detail that would improve accuracy, e.g. age", ...],
  "summary":             "1-2 sentence clinical summary of the presentation",
  "extracted_symptoms": {
    "symptoms":            ["symptom1", "symptom2"],
    "onset":               "sudden / gradual / not specified",
    "duration":            "e.g. 3 days",
    "severity":            "mild" | "moderate" | "severe",
    "character":           "sharp / dull / burning / throbbing / not specified",
    "aggravating_factors": ["e.g. movement", "eating"],
    "relieving_factors":   ["e.g. rest", "antacids"],
    "age":                 null,
    "sex":                 null,
    "existing_conditions": [],
    "medications":         []
  },
  "disease_ranking": [
    {
      "name":        "English disease name",
      "local_name":  "Nepali name",
      "probability": 40,
      "description": "Why this fits the symptoms described",
      "key_features_matching": ["symptom that supports this", ...]
    }
  ],
  "risk_level":          "safe" | "monitor" | "consult" | "urgent",
  "risk_explanation":    "Clinical reason for this risk level",
  "recommended_action":  "Specific next step appropriate for rural Nepal",
  "recommendations":     ["Actionable step 1", "Actionable step 2"],
  "home_care":           "Specific home management advice or null if urgent",
  "watch_for":           ["Red flag sign 1", "Red flag sign 2"],
  "needs_immediate_care": false,
  "disclaimer":          "This is not a substitute for professional medical advice."
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
        max_tokens:  2000,
        temperature: 0.15,
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
      max_tokens:  json_mode ? 2000 : 900,
      temperature: 0.15,
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

  const CHAT_SYS = `You are a caring clinical interviewer for a health app in rural Nepal.
Your job: gather a full clinical picture through natural, empathetic conversation.

RESPONSE FORMAT (always follow this):
1. ONE brief empathetic acknowledgment of what the patient just said (1 sentence, never dismissive).
2. ONE focused follow-up question based on what is still unknown.
Total length: 2–4 sentences maximum.

EMERGENCY DETECTION — if the patient describes any of these, immediately say so FIRST and direct to emergency care:
- Heavy / uncontrolled bleeding (spurting, soaking through cloth, not stopping)
- Chest pain + shortness of breath
- Unconsciousness, seizure, or sudden severe headache
- Signs of stroke: face drooping, arm weakness, slurred speech
→ Response format: "यो गम्भीर अवस्था हो — कृपया तुरुन्त नजिकको अस्पताल जानुहोस् वा 102 मा फोन गर्नुहोस्। (This is serious — please go to the nearest hospital immediately or call 102.)" then ask if they can reach help.

TRAUMA / INJURY PROTOCOL — if accident, fall, wound, burn, or bite is mentioned:
- Ask: type of injury (cut/bruise/burn/fracture?), bleeding severity (heavy/light/stopped?), can they move the injured part?
- Probe: head injury? Loss of consciousness? Bony deformity?

CLINICAL PRIORITY ORDER — ask what is most important and still unknown:
1. Emergency flag — check for the above first
2. Age and sex — critical for risk stratification
3. Onset / duration — "When did this start? Sudden or gradual?"
4. Severity — "On a scale of 1–10, how bad is it right now?"
5. Character — "Sharp, dull, burning, or throbbing?"
6. Associated symptoms — fever? nausea? dizziness? difficulty breathing?
7. Aggravating / relieving factors
8. Medical history and current medications
9. Epidemiological context (water source, sick contacts, travel)

NEPAL DISEASE PATTERNS — probe if pattern matches:
- Prolonged fever >5 days + relative bradycardia → typhoid
- Sudden fever + severe headache + eye/bone pain → dengue
- Fever + painless dark skin ulcer → scrub typhus
- Irregular fever + terai resident → malaria
- Jaundice + dark urine + contaminated water → hepatitis A/E

When enough info is gathered (age, symptom character, duration, severity, associated symptoms),
end your response with: "(Tap 'Analyse Now' when ready.)"

Always respond in the same language the user is using (Nepali or English). Never diagnose.`;

  try {
    await gptLimiter.wait();
    const response = await client.chat.completions.create({
      model: MODELS.gpt, max_tokens: 400, temperature: 0.2,
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
