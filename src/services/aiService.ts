import type { ChatMessage, DiagnosisResult, RiskLevel, UrgencyLevel, ConfidenceLevel } from '../types/health';

// ─── Backend base URL ─────────────────────────────────────────────────────────
const BACKEND = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

// ─── Local API key (kept for legacy settings page display) ────────────────────
export function getStoredApiKey(): string {
  return localStorage.getItem('anthropic_api_key') ?? '';
}
export function saveApiKey(key: string): void {
  localStorage.setItem('anthropic_api_key', key.trim());
}

// ─── Initial AI greeting message ─────────────────────────────────────────────
export const INITIAL_AI_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content:
    'नमस्ते! म तपाईंको एआई स्वास्थ्य सहायक हुँ। तपाईंलाई आज कस्तो महसुस भइरहेको छ? कृपया आफ्ना लक्षणहरू बताउनुहोस्।\n\n(Hello! I am your AI health assistant. How are you feeling today? Please describe your symptoms.)',
  timestamp: new Date().toISOString(),
};

// ─── Build messages array from chat history ───────────────────────────────────
function toMessages(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.id !== 'init' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content }));
}

// ─── analyzeSymptoms — Azure GPT-5.4 via Express backend ─────────────────────
export async function analyzeSymptoms(messages: ChatMessage[]): Promise<DiagnosisResult> {
  const claudeMessages = toMessages(messages);

  try {
    const res = await fetch(`${BACKEND}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: claudeMessages, json_mode: true }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.response) return parseDiagnosis(data.response as Record<string, unknown>);
    }
    console.warn('[aiService] Backend non-OK:', res.status);
  } catch (e) {
    console.warn('[aiService] Backend unreachable, using mock:', e);
  }

  await new Promise((r) => setTimeout(r, 1500));
  return buildMockDiagnosis(messages);
}

// ─── chatReply — follow-up question ──────────────────────────────────────────
export async function chatReply(messages: ChatMessage[]): Promise<string> {
  const claudeMessages = toMessages(messages);

  try {
    const res = await fetch(`${BACKEND}/api/analyze/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: claudeMessages }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.response) return data.response as string;
    }
  } catch (e) {
    console.warn('[aiService] chat unreachable:', e);
  }

  await new Promise((r) => setTimeout(r, 800));
  return buildMockFollowUp(messages);
}

// ─── transcribeAudio — STT via backend ───────────────────────────────────────
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  const ext = audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a') ? 'm4a'
             : audioBlob.type.includes('wav')  ? 'wav'
             : audioBlob.type.includes('ogg')  ? 'ogg'
             : 'webm';
  formData.append('audio', audioBlob, `recording.${ext}`);
  formData.append('language', 'ne');

  const res = await fetch(`${BACKEND}/api/voice/transcribe`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`STT error ${res.status}`);
  const data = await res.json();
  return (data.text as string) ?? '';
}

// ─── synthesizeSpeech — TTS via backend ──────────────────────────────────────
export async function synthesizeSpeech(
  text: string,
  urgencyLevel?: UrgencyLevel,
): Promise<string> {
  const res = await fetch(`${BACKEND}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, urgency_level: urgencyLevel }),
  });
  if (!res.ok) throw new Error(`TTS error ${res.status}`);
  const data = await res.json();
  return `${BACKEND}${data.audio_url as string}`;
}

// ─── analyzeImage — Vision via backend ───────────────────────────────────────
export async function analyzeImage(
  imageFile: File,
  mode: 'report' | 'medicine' | 'general' = 'report',
  context = '',
): Promise<Record<string, unknown>> {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('mode', mode);
  if (context) formData.append('context', context);

  const res = await fetch(`${BACKEND}/api/vision`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Vision error ${res.status}`);
  const data = await res.json();
  return (data.result ?? data) as Record<string, unknown>;
}

// ─── Parse backend JSON into DiagnosisResult ─────────────────────────────────
function parseDiagnosis(raw: Record<string, unknown>): DiagnosisResult {
  const urgencyLevel = (raw.urgency_level ?? raw.urgencyLevel) as UrgencyLevel | undefined;
  const riskLevelRaw = (raw.risk_level ?? raw.riskLevel) as string | undefined;
  const extractedRaw = (raw.extracted_symptoms ?? raw.extractedSymptoms ?? {}) as Record<string, unknown>;
  const diseaseRaw   = (raw.disease_ranking ?? raw.diseaseRanking ?? []) as Array<Record<string, unknown>>;
  const watchFor     = (raw.watch_for ?? raw.warningSignsToWatch ?? []) as string[];

  const riskLevel: RiskLevel = (riskLevelRaw as RiskLevel) ??
    (urgencyLevel === 'emergency' ? 'urgent' :
     urgencyLevel === 'urgent'    ? 'consult' : 'monitor');

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    extractedSymptoms: {
      symptoms:            (extractedRaw.symptoms as string[]) ?? [],
      onset:               (extractedRaw.onset as string) ?? 'not specified',
      duration:            (extractedRaw.duration as string) ?? 'not specified',
      severity:            (extractedRaw.severity as 'mild' | 'moderate' | 'severe') ?? 'moderate',
      character:           (extractedRaw.character as string) ?? 'not specified',
      aggravating_factors: (extractedRaw.aggravating_factors as string[]) ?? [],
      relieving_factors:   (extractedRaw.relieving_factors as string[]) ?? [],
      age:                 (extractedRaw.age as number | null) ?? null,
      sex:                 (extractedRaw.sex as string | null) ?? null,
      existing_conditions: (extractedRaw.existing_conditions as string[]) ?? [],
      medications:         (extractedRaw.medications as string[]) ?? [],
    },
    diseaseRanking: diseaseRaw.map((d) => ({
      name:               (d.name as string) ?? '',
      localName:          (d.local_name ?? d.localName ?? d.name) as string,
      probability:        (d.probability as number) ?? 0,
      description:        (d.description as string) ?? '',
      keyFeaturesMatching:(d.key_features_matching ?? d.keyFeaturesMatching ?? []) as string[],
    })),
    riskLevel,
    urgencyLevel,
    confidence:          (raw.confidence as ConfidenceLevel) ?? undefined,
    missingInfo:         (raw.missing_info ?? raw.missingInfo ?? []) as string[],
    summary:             (raw.summary as string) ?? '',
    riskExplanation:     (raw.risk_explanation ?? raw.riskExplanation ?? '') as string,
    recommendedAction:   (raw.recommended_action ?? raw.recommendedAction ?? '') as string,
    recommendations:     (raw.recommendations as string[]) ?? [],
    homeCare:            (raw.home_care ?? raw.homeCare ?? null) as string | null,
    warningSignsToWatch: watchFor,
    needsImmediateCare:  (raw.needs_immediate_care ?? raw.needsImmediateCare ?? false) as boolean,
    disclaimer:          (raw.disclaimer as string) ?? 'This is not a substitute for professional medical advice.',
  };
}

// ─── Mock fallbacks ───────────────────────────────────────────────────────────
function buildMockFollowUp(messages: ChatMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === 'user')?.content.toLowerCase() ?? '';
  if (/fever|ज्वरो/.test(last)) return 'ज्वरो कति छ नाप्नुभयो? साथै, के तपाईंलाई खोकी वा सास फेर्न गार्हो छ?';
  if (/cough|खोकी/.test(last))  return 'खोकी कति दिनदेखि छ? के कफ वा रगत आएको छ?';
  if (/head|टाउको/.test(last))  return 'टाउको दुखाइ कहाँ केन्द्रित छ? के उज्यालोमा असह्य लाग्छ?';
  if (/chest|छाती/.test(last))  return 'छातीको दुखाइ कहिलेदेखि सुरु भयो? सास फेर्दा बढ्छ?';
  return 'थप जानकारी: कति दिनदेखि यो समस्या छ? कुनै पुरानो रोग छ?';
}

function buildMockDiagnosis(messages: ChatMessage[]): DiagnosisResult {
  const text = messages.filter((m) => m.role === 'user').map((m) => m.content.toLowerCase()).join(' ');
  if (/chest|छाती/.test(text)) return mockResult('urgent', 'emergency', 'chest pain', MOCK_CHEST);
  if (/fever|ज्वरो/.test(text) && /cough|खोकी/.test(text)) return mockResult('monitor', 'routine', 'fever and cough', MOCK_FLU);
  if (/head|टाउको/.test(text))  return mockResult('safe', 'routine', 'headache', MOCK_HEADACHE);
  return mockResult('monitor', 'routine', 'general symptoms', MOCK_GENERAL);
}

const MOCK_CHEST    = [
  { name: 'Cardiac Event',   localName: 'मुटुको समस्या',       probability: 35, description: 'Chest pain can indicate a cardiac issue.',     keyFeaturesMatching: ['chest pain'] },
  { name: 'Costochondritis', localName: 'ब्रेस्टबोन सूजन',    probability: 30, description: 'Inflammation of rib cartilage.',               keyFeaturesMatching: ['chest pain'] },
  { name: 'GERD',            localName: 'अम्ल प्रवाह',         probability: 20, description: 'Stomach acid reflux causing burning chest pain.', keyFeaturesMatching: ['chest pain'] },
  { name: 'Pleuritis',       localName: 'फोक्सोको आवरण सूजन', probability: 15, description: 'Inflammation around the lungs.',                keyFeaturesMatching: ['chest pain'] },
];
const MOCK_FLU      = [
  { name: 'Influenza',   localName: 'फ्लू',      probability: 45, description: 'Viral infection causing fever, cough and fatigue.', keyFeaturesMatching: ['fever', 'cough'] },
  { name: 'COVID-19',    localName: 'कोभिड-१९', probability: 25, description: 'Coronavirus shares symptoms.',                       keyFeaturesMatching: ['fever', 'cough'] },
  { name: 'Common Cold', localName: 'रुघाखोकी', probability: 20, description: 'Mild viral respiratory illness.',                    keyFeaturesMatching: ['cough'] },
  { name: 'Pneumonia',   localName: 'निमोनिया',  probability: 10, description: 'Consider if breathing is affected.',                keyFeaturesMatching: ['cough', 'fever'] },
];
const MOCK_HEADACHE = [
  { name: 'Tension Headache', localName: 'तनाव टाउको दुखाइ', probability: 55, description: 'Most common headache type.',              keyFeaturesMatching: ['headache'] },
  { name: 'Migraine',         localName: 'माइग्रेन',          probability: 25, description: 'Recurring moderate-to-severe headaches.', keyFeaturesMatching: ['headache'] },
  { name: 'Dehydration',      localName: 'पानीको कमी',        probability: 20, description: 'Inadequate fluid intake.',               keyFeaturesMatching: ['headache'] },
];
const MOCK_GENERAL  = [
  { name: 'Viral Syndrome',         localName: 'भाइरल संक्रमण', probability: 50, description: 'General viral illness.',            keyFeaturesMatching: [] },
  { name: 'Stress / Fatigue',       localName: 'थकान',           probability: 30, description: 'Physical or mental exhaustion.',    keyFeaturesMatching: [] },
  { name: 'Nutritional Deficiency', localName: 'पोषण कमी',       probability: 20, description: 'Vitamin or mineral deficiency.',   keyFeaturesMatching: [] },
];

function mockResult(
  riskLevel: RiskLevel, urgencyLevel: UrgencyLevel,
  primarySymptom: string, diseases: DiagnosisResult['diseaseRanking'],
): DiagnosisResult {
  return {
    id: crypto.randomUUID(), timestamp: new Date().toISOString(),
    urgencyLevel, confidence: 'low',
    missingInfo: ['age', 'sex', 'symptom duration', 'associated symptoms'],
    summary: `Symptoms suggest ${primarySymptom}. Limited information available — confidence is low.`,
    extractedSymptoms: {
      symptoms: primarySymptom.split(' '), onset: 'not specified', duration: 'not specified',
      severity: riskLevel === 'safe' ? 'mild' : riskLevel === 'urgent' ? 'severe' : 'moderate',
      character: 'not specified', aggravating_factors: [], relieving_factors: [],
      age: null, sex: null, existing_conditions: [], medications: [],
    },
    diseaseRanking: diseases, riskLevel,
    riskExplanation: riskLevel === 'urgent' ? 'Symptoms may indicate a serious condition requiring immediate care.'
      : riskLevel === 'consult' ? 'Symptoms warrant a doctor visit within 24–48 hours.'
      : riskLevel === 'monitor' ? 'Symptoms should be monitored closely for 48 hours.'
      : 'Symptoms appear minor and safe for home management.',
    recommendedAction: riskLevel === 'urgent' ? 'Go to the nearest hospital emergency department immediately.'
      : riskLevel === 'consult' ? 'Visit the nearest health post within 24–48 hours.'
      : 'Rest, stay hydrated, and monitor for any worsening.',
    recommendations: ['Rest and drink plenty of fluids.', 'Track your temperature twice a day.', 'Avoid strenuous activity.'],
    homeCare: riskLevel === 'urgent' ? null : 'Rest, oral fluids, paracetamol for fever if temperature is above 38°C.',
    warningSignsToWatch: ['Fever exceeds 39.4°C (103°F)', 'Difficulty breathing', 'Symptoms worsen after 48–72 hours'],
    needsImmediateCare: riskLevel === 'urgent',
    disclaimer: 'This is not a substitute for professional medical advice.',
  };
}
