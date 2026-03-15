import type { ChatMessage, DiagnosisResult, RiskLevel } from '../types/health';

// ─── Anthropic API config ─────────────────────────────────────────────────────

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

// ─── Retrieves user-stored API key from localStorage ─────────────────────────

export function getStoredApiKey(): string {
  return localStorage.getItem('anthropic_api_key') ?? '';
}

export function saveApiKey(key: string): void {
  localStorage.setItem('anthropic_api_key', key.trim());
}

// ─── System prompt: medical risk analysis (NOT diagnosis) ─────────────────────

const SYSTEM_PROMPT = `You are a medical AI health assistant focused on helping people in rural and remote areas access basic health guidance.

CRITICAL GUIDELINES:
- You provide RISK ANALYSIS and PROBABILITY-BASED SUGGESTIONS only — NOT medical diagnosis.
- Always recommend consulting a healthcare professional for definitive diagnosis.
- Never claim certainty about any diagnosis.
- Avoid gender or geographic bias without clear evidence.
- Present all findings probabilistically.
- Consider common conditions first before rare ones.
- Be culturally sensitive to South Asian / Nepali health context.

When the user describes symptoms, analyze the full conversation and respond with ONLY a valid JSON object (no markdown, no extra text) in this exact schema:

{
  "extractedSymptoms": {
    "symptoms": ["list of identified symptoms in English"],
    "duration": "duration from conversation, or 'not specified'",
    "severity": "mild" | "moderate" | "severe",
    "age": null or integer,
    "existing_conditions": [],
    "medications": []
  },
  "diseaseRanking": [
    {
      "name": "Disease name in English",
      "localName": "Nepali name if known, otherwise same as name",
      "probability": 45,
      "description": "One sentence explanation of why this fits the symptoms"
    }
  ],
  "riskLevel": "safe" | "monitor" | "consult" | "urgent",
  "riskExplanation": "Plain language explanation of the risk level and why",
  "recommendations": ["Actionable step 1", "Actionable step 2"],
  "warningSignsToWatch": ["Warning sign 1", "Warning sign 2"],
  "needsImmediateCare": false
}

Risk Level Definitions:
- "safe"    → Minor issue, safe for home care, no doctor needed immediately
- "monitor" → Monitor symptoms 48–72 hrs; see doctor if worsening
- "consult" → Should consult a doctor within 24–48 hours
- "urgent"  → Seek immediate medical attention

Rules:
- Include 2–5 diseases in diseaseRanking. Probabilities should total approximately 100.
- severity is based on user's description ("mild"/"moderate"/"severe").
- Respond ONLY with the JSON. Do not include any other text.`;

// ─── Mock diagnosis for demos without an API key ──────────────────────────────

function buildMockDiagnosis(messages: ChatMessage[]): DiagnosisResult {
  const userText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content.toLowerCase())
    .join(' ');

  const hasChestPain = /chest|छाती/.test(userText);
  const hasFever = /fever|ज्वरो|तापक्रम/.test(userText);
  const hasCough = /cough|खोकी/.test(userText);
  const hasHeadache = /head|टाउको/.test(userText);

  if (hasChestPain) {
    return mockResult('urgent', 'chest pain', [
      { name: 'Cardiac Event', localName: 'मुटुको समस्या', probability: 35, description: 'Chest pain can indicate a cardiac issue requiring immediate evaluation.' },
      { name: 'Costochondritis', localName: 'ब्रेस्टबोन दुखाइ', probability: 30, description: 'Inflammation of rib cartilage, common cause of chest wall pain.' },
      { name: 'GERD / Acid Reflux', localName: 'अम्ल प्रवाह', probability: 20, description: 'Stomach acid reflux can cause burning chest discomfort.' },
      { name: 'Pleuritis', localName: 'फोक्सोको आवरण सूजन', probability: 15, description: 'Inflammation around the lungs causing sharp chest pain.' },
    ]);
  }
  if (hasFever && hasCough) {
    return mockResult('monitor', 'fever and cough', [
      { name: 'Influenza', localName: 'फ्लू', probability: 45, description: 'Common viral infection causing fever, cough and body aches.' },
      { name: 'COVID-19', localName: 'कोभिड-१९', probability: 25, description: 'Coronavirus infection; shares symptoms with influenza.' },
      { name: 'Common Cold', localName: 'रुघाखोकी', probability: 20, description: 'Mild respiratory viral illness.' },
      { name: 'Pneumonia', localName: 'निमोनिया', probability: 10, description: 'Lung infection; consider if fever is high and breathing is affected.' },
    ]);
  }
  if (hasHeadache) {
    return mockResult('safe', 'headache', [
      { name: 'Tension Headache', localName: 'तनाव टाउको दुखाइ', probability: 55, description: 'Most common headache type caused by stress or muscle tension.' },
      { name: 'Migraine', localName: 'माइग्रेन', probability: 25, description: 'Recurring moderate-to-severe headaches, often one-sided.' },
      { name: 'Dehydration', localName: 'पानीको कमी', probability: 20, description: 'Inadequate fluid intake can cause headaches.' },
    ]);
  }
  // default generic mock
  return mockResult('monitor', 'general symptoms', [
    { name: 'Viral Syndrome', localName: 'भाइरल संक्रमण', probability: 50, description: 'General viral illness causing fatigue and mild symptoms.' },
    { name: 'Stress / Fatigue', localName: 'थकान', probability: 30, description: 'Physical or mental exhaustion presenting as multiple symptoms.' },
    { name: 'Nutritional Deficiency', localName: 'पोषण कमी', probability: 20, description: 'Vitamin or mineral deficiency can cause varied symptoms.' },
  ]);
}

function mockResult(
  riskLevel: RiskLevel,
  primarySymptom: string,
  diseases: DiagnosisResult['diseaseRanking'],
): DiagnosisResult {
  const configs: Record<RiskLevel, { riskExplanation: string; recommendations: string[]; warningSigns: string[] }> = {
    safe: {
      riskExplanation: 'Symptoms suggest a minor issue that can be managed at home with rest and hydration.',
      recommendations: ['Rest and drink plenty of fluids.', 'Take OTC pain relief if needed.', 'Monitor symptoms for 2–3 days.'],
      warningSigns: ['Fever exceeds 103°F (39.4°C)', 'Symptoms worsen after 3 days', 'Difficulty breathing'],
    },
    monitor: {
      riskExplanation: 'Symptoms are moderate. Monitor closely for 48 hours. See a doctor if they worsen.',
      recommendations: ['Rest at home and stay hydrated.', 'Track your temperature twice daily.', 'Avoid strenuous activity.'],
      warningSigns: ['Fever above 102°F (38.9°C)', 'Difficulty breathing', 'Persistent vomiting or inability to eat'],
    },
    consult: {
      riskExplanation: 'Symptoms suggest you should see a healthcare provider within 24–48 hours for proper evaluation.',
      recommendations: ['Visit the nearest health post or clinic.', 'Bring a list of your current medications.', 'Rest and avoid self-medicating with antibiotics.'],
      warningSigns: ['Difficulty breathing', 'Severe pain', 'High fever above 103°F', 'Loss of consciousness'],
    },
    urgent: {
      riskExplanation: 'Symptoms may indicate a serious condition requiring immediate medical attention.',
      recommendations: ['Go to the nearest hospital emergency immediately.', 'Do not drive — ask someone to take you.', 'If alone, call emergency services.'],
      warningSigns: ['Chest tightness or pressure', 'Difficulty breathing', 'Sudden severe pain', 'Fainting or confusion'],
    },
  };

  const c = configs[riskLevel];

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    extractedSymptoms: {
      symptoms: primarySymptom.split(' ').filter(Boolean),
      duration: 'not specified',
      severity: riskLevel === 'safe' ? 'mild' : riskLevel === 'monitor' ? 'moderate' : 'severe',
      age: null,
      existing_conditions: [],
      medications: [],
    },
    diseaseRanking: diseases,
    riskLevel,
    riskExplanation: c.riskExplanation,
    recommendations: c.recommendations,
    warningSignsToWatch: c.warningSigns,
    needsImmediateCare: riskLevel === 'urgent',
  };
}

// ─── AI greeting message ──────────────────────────────────────────────────────

export const INITIAL_AI_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content:
    'नमस्ते! म तपाईंको एआई स्वास्थ्य सहायक हुँ। तपाईंलाई आज कस्तो महसुस भइरहेको छ? कृपया आफ्ना लक्षणहरू बताउनुहोस्।\n\n(Hello! I am your AI health assistant. How are you feeling today? Please describe your symptoms.)',
  timestamp: new Date().toISOString(),
};

// ─── Call Claude to analyze the full conversation ─────────────────────────────

export async function analyzeSymptoms(messages: ChatMessage[]): Promise<DiagnosisResult> {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    // No API key — use intelligent mock based on message content
    await new Promise((r) => setTimeout(r, 1800)); // simulate network latency
    return buildMockDiagnosis(messages);
  }

  // Build Claude messages array from chat history (skip the initial AI greeting)
  const claudeMessages = messages
    .filter((m) => m.id !== 'init')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  // Append a final instruction to trigger the JSON analysis
  claudeMessages.push({
    role: 'user',
    content:
      'Based on all the symptoms I have described above, please now provide your full medical risk analysis in the required JSON format.',
  });

  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: claudeMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const rawText: string = data.content?.[0]?.text ?? '';

  // Extract JSON from the response (handle possible markdown fence wrapping)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI response did not contain valid JSON.');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    extractedSymptoms: parsed.extractedSymptoms,
    diseaseRanking: parsed.diseaseRanking,
    riskLevel: parsed.riskLevel as RiskLevel,
    riskExplanation: parsed.riskExplanation,
    recommendations: parsed.recommendations ?? [],
    warningSignsToWatch: parsed.warningSignsToWatch ?? [],
    needsImmediateCare: parsed.needsImmediateCare ?? false,
  };
}

// ─── Send a single conversational message to Claude ──────────────────────────
// Used for multi-turn follow-up questions before final analysis.

export async function chatReply(messages: ChatMessage[]): Promise<string> {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    // Mock follow-up questions when no API key
    await new Promise((r) => setTimeout(r, 900));
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    if (/fever|ज्वरो/i.test(lastUser)) return 'ज्वरो कति छ नाप्नुभयो? साथै, के तपाईंलाई खोकी वा सास फेर्न गार्हो भएको छ?';
    if (/cough|खोकी/i.test(lastUser)) return 'खोकी कति दिनदेखि छ? के खोकीमा कफ वा रगत आएको छ?';
    if (/head|टाउको/i.test(lastUser)) return 'टाउको दुखाइ कहाँ केन्द्रित छ? के उज्यालोमा वा आवाजमा असह्य लाग्छ?';
    if (/chest|छाती/i.test(lastUser)) return 'छातीको दुखाइ कहिलेदेखि सुरु भयो? के सास फेर्दा दुखाइ बढ्छ?';
    return 'थप जानकारीको लागि: कति दिनदेखि यो समस्या छ? के तपाईंलाई कुनै पुरानो रोग छ?';
  }

  const claudeMessages = messages
    .filter((m) => m.id !== 'init')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const CHAT_SYSTEM = `You are a friendly, empathetic AI health assistant for rural Nepal.
Ask one focused follow-up question at a time to gather symptom details (duration, severity, age, existing conditions).
Respond in a mix of Nepali and English since the user may prefer either.
Keep responses concise (1–2 sentences). Do NOT provide diagnosis yet — just gather information.`;

  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      system: CHAT_SYSTEM,
      messages: claudeMessages,
    }),
  });

  if (!response.ok) throw new Error(`Chat API error ${response.status}`);

  const data = await response.json();
  return data.content?.[0]?.text ?? 'म बुझें। अरु कुनै लक्षण छन्?';
}
