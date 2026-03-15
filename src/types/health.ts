// ─── Core symptom data extracted from user conversation ───────────────────────

export interface ExtractedSymptoms {
  symptoms: string[];
  onset: string;
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  character: string;
  aggravating_factors: string[];
  relieving_factors: string[];
  age: number | null;
  sex: string | null;
  existing_conditions: string[];
  medications: string[];
}

// ─── Disease probability entry ─────────────────────────────────────────────────

export interface DiseaseCandidate {
  name: string;
  localName: string;
  probability: number; // 0–100
  description: string;
  keyFeaturesMatching: string[];
}

// ─── Risk / urgency levels ─────────────────────────────────────────────────────

/** 4-tier risk level — maps cleanly to UI colours */
export type RiskLevel = 'safe' | 'monitor' | 'consult' | 'urgent';

/** 3-tier urgency — from the Claude Health API Guide */
export type UrgencyLevel = 'routine' | 'urgent' | 'emergency';

/** AI confidence in the analysis */
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export const RISK_LABELS: Record<RiskLevel, { ne: string; en: string; color: string; bg: string }> = {
  safe:    { ne: 'घरमा उपचार गर्न सकिन्छ', en: 'Safe for Home Care',     color: 'text-success-600', bg: 'bg-success-50 border-success-200' },
  monitor: { ne: 'लक्षण निगरानी गर्नुहोस्',  en: 'Monitor Symptoms',      color: 'text-yellow-600',  bg: 'bg-yellow-50 border-yellow-200' },
  consult: { ne: 'डाक्टरकहाँ जानुहोस्',       en: 'Consult Doctor Soon',   color: 'text-orange-600',  bg: 'bg-orange-50 border-orange-200' },
  urgent:  { ne: 'तुरुन्त चिकित्सा चाहिन्छ', en: 'Seek Urgent Care',      color: 'text-danger-600',  bg: 'bg-danger-50 border-danger-200' },
};

export const URGENCY_EMOJI: Record<UrgencyLevel, string> = {
  routine:   '🟢',
  urgent:    '🟡',
  emergency: '🔴',
};

// ─── Full diagnosis result from AI ────────────────────────────────────────────

export interface DiagnosisResult {
  id: string;
  timestamp: string;

  extractedSymptoms: ExtractedSymptoms;

  urgencyLevel?: UrgencyLevel;
  confidence?: ConfidenceLevel;
  missingInfo: string[];       // info that would improve accuracy
  summary?: string;
  recommendedAction?: string;
  homeCare?: string | null;
  disclaimer?: string;

  diseaseRanking: DiseaseCandidate[];
  riskLevel: RiskLevel;
  riskExplanation: string;
  recommendations: string[];
  warningSignsToWatch: string[];
  needsImmediateCare: boolean;
}

// ─── Chat message ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUrl?: string;   // object URL for display — not sent to AI
}

// ─── Health history record (one per consultation session) ─────────────────────

export interface HealthRecord {
  id: string;
  date: string;            // ISO string
  primarySymptom: string;  // Short label for list view
  symptoms: string[];
  riskLevel: RiskLevel;
  diagnosis: DiagnosisResult;
}
