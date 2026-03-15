import { supabase } from '../lib/supabase';
import type { DiagnosisResult, HealthRecord } from '../types/health';

// ─── Save a completed health record to Supabase ───────────────────────────────

export async function saveHealthRecord(
  userId: string,
  record: HealthRecord,
): Promise<void> {
  const d = record.diagnosis;
  const { error } = await supabase.from('health_records').insert({
    id: record.id,
    user_id: userId,
    created_at: record.date,
    primary_symptom: record.primarySymptom,
    symptoms: record.symptoms,
    duration: d.extractedSymptoms.duration,
    severity: d.extractedSymptoms.severity,
    age: d.extractedSymptoms.age,
    existing_conditions: d.extractedSymptoms.existing_conditions,
    medications: d.extractedSymptoms.medications,
    risk_level: d.riskLevel,
    urgency_level: d.urgencyLevel ?? null,
    confidence: d.confidence ?? null,
    needs_immediate_care: d.needsImmediateCare,
    summary: d.summary ?? null,
    risk_explanation: d.riskExplanation,
    recommended_action: d.recommendedAction ?? null,
    home_care: d.homeCare ?? null,
    disclaimer: d.disclaimer ?? null,
    disease_ranking: d.diseaseRanking,
    recommendations: d.recommendations,
    watch_for: d.warningSignsToWatch,
  });

  if (error) {
    // Don't crash the app — log and continue (local cache still works)
    console.error('[dbService] Failed to save health record:', error.message);
  }
}

// ─── Fetch all health records for a user ─────────────────────────────────────

export async function fetchHealthRecords(userId: string): Promise<HealthRecord[]> {
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error('[dbService] Failed to fetch health records:', error?.message);
    return [];
  }

  return data.map((row) => rowToHealthRecord(row));
}

// ─── Delete a single health record ───────────────────────────────────────────

export async function deleteHealthRecord(id: string): Promise<void> {
  const { error } = await supabase.from('health_records').delete().eq('id', id);
  if (error) console.error('[dbService] Delete error:', error.message);
}

// ─── Save conversation session (server-side storage as guide recommends) ──────

export async function saveConversationSession(
  userId: string,
  sessionId: string,
  messages: Array<{ role: string; content: string }>,
  recordId?: string,
): Promise<void> {
  const { error } = await supabase.from('conversation_sessions').upsert({
    id: sessionId,
    user_id: userId,
    messages,
    updated_at: new Date().toISOString(),
    is_complete: !!recordId,
    record_id: recordId ?? null,
  });
  if (error) console.error('[dbService] Session save error:', error.message);
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function rowToHealthRecord(row: Record<string, unknown>): HealthRecord {
  const diagnosis: DiagnosisResult = {
    id: row.id as string,
    timestamp: row.created_at as string,
    extractedSymptoms: {
      symptoms: (row.symptoms as string[]) ?? [],
      duration: (row.duration as string) ?? 'not specified',
      severity: (row.severity as 'mild' | 'moderate' | 'severe') ?? 'moderate',
      age: (row.age as number | null) ?? null,
      existing_conditions: (row.existing_conditions as string[]) ?? [],
      medications: (row.medications as string[]) ?? [],
    },
    diseaseRanking: (row.disease_ranking as DiagnosisResult['diseaseRanking']) ?? [],
    riskLevel: row.risk_level as DiagnosisResult['riskLevel'],
    urgencyLevel: (row.urgency_level as DiagnosisResult['urgencyLevel']) ?? undefined,
    confidence: (row.confidence as DiagnosisResult['confidence']) ?? undefined,
    summary: (row.summary as string) ?? '',
    riskExplanation: (row.risk_explanation as string) ?? '',
    recommendedAction: (row.recommended_action as string) ?? '',
    homeCare: (row.home_care as string | null) ?? null,
    recommendations: (row.recommendations as string[]) ?? [],
    warningSignsToWatch: (row.watch_for as string[]) ?? [],
    needsImmediateCare: (row.needs_immediate_care as boolean) ?? false,
    disclaimer: (row.disclaimer as string) ?? 'This is not a substitute for professional medical advice.',
  };

  return {
    id: row.id as string,
    date: row.created_at as string,
    primarySymptom: row.primary_symptom as string,
    symptoms: (row.symptoms as string[]) ?? [],
    riskLevel: row.risk_level as HealthRecord['riskLevel'],
    diagnosis,
  };
}
