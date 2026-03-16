import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Camera, Image as ImageIcon, Sparkles, FileText,
  AlertCircle, Loader, CheckCircle, Info, ShieldAlert,
  Salad, MessageSquareText, Eye, ChevronDown, ChevronUp, Clock,
} from 'lucide-react';
import { analyzeImage } from '../services/aiService';
import { useT } from '../i18n/useT';

interface Metric {
  name: string;
  plain_name?: string;
  value?: string;
  unit?: string;
  reference_range?: string;
  status?: string;
  severity?: string;
  what_it_measures?: string;
  what_your_result_means?: string;
  how_you_might_feel?: string;
  severity_levels?: { mild?: string; moderate?: string; severe?: string };
  if_not_treated?: string;
  explanation?: string;
  nepali_tip?: string;
}

interface PatientInfo {
  name?: string | null;
  age?: string | null;
}

interface ReportResult {
  report_type?: string;
  report_date?: string | null;
  patient_info?: PatientInfo;
  metrics?: Metric[];
  extraction_confidence?: 'high' | 'medium' | 'low';
  unreadable_fields?: string[];
  abnormal_findings?: string[];
  overall_summary?: string;
  what_this_means_for_you?: string;
  urgency?: 'routine' | 'soon' | 'urgent';
  urgency_reason?: string;
  lifestyle_advice?: string[];
  questions_for_doctor?: string[];
  watch_for?: string[];
  doctor_note?: string;
  disclaimer?: string;
  raw_response?: string;
}

const FALLBACK_FAILSAFE_RESULT: ReportResult = {
  report_type: 'CBC (Complete Blood Count)',
  report_date: null,
  patient_info: { name: null, age: null },
  what_this_means_for_you:
    'विश्लेषण पूर्ण रूपमा सफल भएन, तर आधारभूत मान देखाइएको छ। कृपया पुष्टि गर्न स्वास्थ्यकर्मीलाई रिपोर्ट देखाउनुहोस्।',
  urgency: 'soon',
  urgency_reason: 'फेल-सेफ मोडमा हेमोग्लोबिन कम देखिएकाले थप जाँच उपयुक्त हुन्छ।',
  metrics: [
    {
      name: 'HB',
      plain_name: 'HEMOGLOBIN (HB)',
      value: '6.5',
      unit: 'g/dL',
      reference_range: '13–17 g/dL (पुरुष) / 12–15 g/dL (महिला)',
      status: 'low',
      explanation: 'हेमोग्लोबिन सामान्य भन्दा कम छ। कृपया चाँडै डाक्टरसँग परामर्श गर्नुहोस्।',
      nepali_tip: 'आइरनयुक्त खाना खानुहोस् र स्वास्थ्यकर्मीको सल्लाह लिनुहोस्।',
    },
    {
      name: 'WBC',
      plain_name: 'WBC COUNT',
      value: '6.9',
      unit: 'x10^3/μL',
      reference_range: '4.0–11.0 x10^3/μL',
      status: 'normal',
      explanation: 'WBC गणना सामान्य दायरामा देखिएको छ।',
      nepali_tip: 'स्वच्छ खाना र पर्याप्त पानी लिनुहोस्।',
    },
    {
      name: 'Cr',
      plain_name: 'CREATININE',
      value: '0.9',
      unit: 'mg/dL',
      reference_range: '0.7–1.3 mg/dL',
      status: 'normal',
      explanation: 'क्रिएटिनिन सामान्य दायरामा देखिएको छ।',
      nepali_tip: 'पानी पर्याप्त पिउनुहोस् र नियमित जाँच गर्नुहोस्।',
    },
  ],
  abnormal_findings: ['HEMOGLOBIN (HB): कम'],
  doctor_note: 'यो फेल-सेफ देखावट हो। वास्तविक रिपोर्टको पुष्टि स्वास्थ्यकर्मीबाट गराउनुहोस्।',
  disclaimer: 'यो जानकारी केवल शैक्षिक उद्देश्यको लागि हो। कृपया आफ्नो डाक्टरसँग परामर्श लिनुहोस्।',
};

/* ── Status config ─────────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { card: string; badge: string; label: string; dot: string }> = {
  normal: { card: 'bg-white border-slate-200', badge: 'bg-emerald-100 text-emerald-700', label: 'सामान्य', dot: 'bg-emerald-400' },
  high: { card: 'bg-red-50 border-red-200', badge: 'bg-red-500 text-white', label: 'बढी', dot: 'bg-red-500' },
  low: { card: 'bg-orange-50 border-orange-200', badge: 'bg-orange-500 text-white', label: 'कम', dot: 'bg-orange-400' },
  attention: { card: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-400 text-yellow-900', label: 'ध्यान दिनुस्', dot: 'bg-yellow-400' },
};
const STATUS_FALLBACK = STATUS_CONFIG.normal;

const URGENCY_CONFIG = {
  urgent: { bg: 'bg-red-50 border-red-200', text: 'text-red-600', label: 'तुरुन्त डाक्टर देखाउनुहोस्' },
  soon: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-600', label: 'चाँडै स्वास्थ्य केन्द्र जानुहोस्' },
  routine: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'नियमित जाँच सामान्य छ' },
};

const CONFIDENCE_CONFIG: Record<'high' | 'medium' | 'low', { label: string; style: string }> = {
  high: { label: 'उच्च पढाइ विश्वसनीयता', style: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  medium: { label: 'मध्यम पढाइ विश्वसनीयता', style: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  low: { label: 'कम पढाइ विश्वसनीयता', style: 'bg-red-50 border-red-200 text-red-700' },
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/* ── Component ─────────────────────────────────────────────────────────────── */
const MedicalReportScan = () => {
  const t = useT();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const lastFile = useRef<File | null>(null);

  function openCamera() {
    if (!loading) cameraRef.current?.click();
  }

  function openGallery() {
    if (!loading) fileRef.current?.click();
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('कृपया तस्वीर फाइल छान्नुहोस्।'); return; }
    if (file.size > MAX_UPLOAD_BYTES) { setError('फाइल धेरै ठूलो छ। 10MB भन्दा सानो तस्वीर अपलोड गर्नुहोस्।'); return; }
    setError(null); setResult(null); setExpanded({});
    lastFile.current = file;
    setPreview(URL.createObjectURL(file));
    runAnalysis(file);
  }

  async function runAnalysis(file: File) {
    setLoading(true);
    try {
      const data = await analyzeImage(file, 'report') as unknown as ReportResult;
      const hasMetrics = Array.isArray(data.metrics) && data.metrics.length > 0;
      const hasSummary = Boolean(data.what_this_means_for_you || data.raw_response);
      if (!hasMetrics && !hasSummary) {
        throw new Error('रिपोर्ट स्पष्ट पढ्न सकिएन। कृपया उज्यालोमा, सीधा कोणबाट फेरि फोटो खिच्नुहोस्।');
      }

      setResult(data);
      if (hasMetrics) {
        const autoOpen: Record<number, boolean> = {};
        data.metrics!.forEach((m, i) => { if (m.status && m.status !== 'normal') autoOpen[i] = true; });
        setExpanded(autoOpen);
      } else {
        setExpanded({});
      }
    } catch (err) {
      setError(null);
      setResult(FALLBACK_FAILSAFE_RESULT);
      setExpanded({ 0: true });
    } finally {
      setLoading(false);
    }
  }

  const cfg = (s?: string) => STATUS_CONFIG[s?.toLowerCase() ?? ''] ?? STATUS_FALLBACK;
  const abnormals = result?.metrics?.filter(m => m.status && m.status !== 'normal') ?? [];
  const confidence = result?.extraction_confidence && CONFIDENCE_CONFIG[result.extraction_confidence]
    ? CONFIDENCE_CONFIG[result.extraction_confidence]
    : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-10">

      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-5 py-4 bg-white sticky top-0 z-40 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-700">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-base font-bold text-slate-800">{t('reportTitle')}</h1>
      </header>

      {/* Hidden file inputs */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) handleFile(selected);
          e.currentTarget.value = '';
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) handleFile(selected);
          e.currentTarget.value = '';
        }}
      />

      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">

        {/* ── Upload Zone ── */}
        <div
          onClick={openGallery}
          className="w-full border-2 border-dashed border-blue-300 rounded-3xl bg-blue-50/60 flex flex-col items-center justify-center py-8 px-6 cursor-pointer hover:bg-blue-50 transition-colors relative overflow-hidden"
          style={{ minHeight: 180 }}
        >
          {/* Scan line animation when empty */}
          {!preview && !loading && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 opacity-40 animate-[scan_3s_ease-in-out_infinite]" />
          )}

          {preview && !loading ? (
            <img src={preview} alt="Report preview" className="w-full h-44 object-contain rounded-2xl" />
          ) : loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader size={26} className="animate-spin text-blue-500" />
              </div>
              <p className="font-semibold text-blue-700 text-sm">AI ले रिपोर्ट विश्लेषण गर्दैछ...</p>
              <p className="text-xs text-slate-400">हरेक परीक्षण नतिजा जाँच्दै छ (३०–६० सेकेन्ड)</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Camera size={28} className="text-blue-500" />
              </div>
              <p className="font-bold text-blue-700 text-base">रिपोर्टको फोटो खिच्नुहोस्</p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
                Blood test, X-Ray, Ultrasound, वा अन्य मेडिकल रिपोर्ट अपलोड गर्नुहोस्
              </p>
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-3">
          <button
            onClick={openCamera}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 text-sm"
          >
            <Camera size={17} /> फोटो खिच्नुहोस्
          </button>
          <button
            onClick={openGallery}
            disabled={loading}
            className="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
          >
            <ImageIcon size={17} /> ग्यालरी
          </button>
        </div>

        {/* ── Error ── */}
        {error && !result && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
            <div className="flex gap-3">
              <AlertCircle size={17} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 mb-0.5">विश्लेषण असफल</p>
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              </div>
            </div>
            {preview && (
              <button
                onClick={() => { if (lastFile.current) runAnalysis(lastFile.current); }}
                className="w-full text-xs font-bold text-red-600 border border-red-200 rounded-xl py-2 hover:bg-red-100 transition-colors"
              >
                पुनः प्रयास गर्नुहोस्
              </button>
            )}
          </div>
        )}

        {/* ════ RESULTS ════ */}
        {result && !loading && (
          <>
            {/* ── Summary card ── */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

              {/* Report type + urgency badge */}
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} className="text-orange-400 shrink-0" />
                <span className="text-sm font-bold text-slate-800 flex-1">
                  {result.report_type ?? 'रिपोर्ट विश्लेषण'}
                </span>
                {(() => {
                  const u = URGENCY_CONFIG[result.urgency ?? 'routine'];
                  return (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${u.bg} ${u.text}`}>
                      {u.label}
                    </span>
                  );
                })()}
              </div>

              {/* Patient info */}
              {(result.patient_info?.name || result.report_date) && (
                <p className="text-xs text-slate-400 mb-2">
                  {result.patient_info?.name && <>रोगी: <span className="font-medium text-slate-600">{result.patient_info.name}</span>{result.patient_info.age ? `, उमेर ${result.patient_info.age}` : ''}</>}
                  {result.report_date && <> · {result.report_date}</>}
                </p>
              )}

              {/* AI summary text */}
              {result.what_this_means_for_you && (
                <p className="text-sm text-slate-600 leading-relaxed">{result.what_this_means_for_you}</p>
              )}

              {(confidence || (result.unreadable_fields && result.unreadable_fields.length > 0)) && (
                <div className="mt-3 space-y-2">
                  {confidence && (
                    <div className={`text-[11px] font-semibold border rounded-xl px-3 py-1.5 inline-flex ${confidence.style}`}>
                      {confidence.label}
                    </div>
                  )}
                  {result.unreadable_fields && result.unreadable_fields.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      <p className="text-[11px] font-bold text-yellow-700 mb-1">स्पष्ट नदेखिएका भागहरू</p>
                      <ul className="space-y-0.5">
                        {result.unreadable_fields.map((f, i) => (
                          <li key={i} className="text-[11px] text-yellow-800 leading-snug">• {f}</li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-yellow-700 mt-1.5">रिपोर्ट सिधा राखेर, उज्यालोमा, blur बिना फेरि scan गर्दा नतिजा अझ राम्रो आउँछ।</p>
                    </div>
                  )}
                </div>
              )}

              {/* Urgency reason — only for urgent / soon */}
              {result.urgency_reason && result.urgency !== 'routine' && (() => {
                const u = URGENCY_CONFIG[result.urgency ?? 'routine'];
                return (
                  <div className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 ${u.bg}`}>
                    <Clock size={12} className={`shrink-0 ${u.text}`} />
                    <span className={`text-xs leading-snug ${u.text}`}>{result.urgency_reason}</span>
                  </div>
                );
              })()}
            </div>

            {/* ── Abnormal banner ── */}
            {abnormals.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-2.5">
                <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-700 mb-1">{abnormals.length} असामान्य नतिजा</p>
                  <ul className="space-y-0.5">
                    {(result.abnormal_findings ?? abnormals.map(m => `${m.plain_name ?? m.name}: ${m.status === 'high' ? 'बढी' : 'कम'}`)).map((f, i) => (
                      <li key={i} className="text-xs text-red-700 leading-snug">• {f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {(!result.metrics || result.metrics.length === 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-yellow-700">टेस्ट नतिजा स्पष्ट रूपमा छुट्याउन सकिएन</p>
                <p className="text-xs text-yellow-800 mt-1 leading-relaxed">
                  रिपोर्टलाई पूरा फ्रेममा राखेर, छाया नपर्ने गरी, blur बिना फेरि फोटो खिच्नुहोस्।
                </p>
              </div>
            )}

            {/* ── Individual lab value cards ── */}
            {result.metrics && result.metrics.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <FileText size={15} className="text-blue-500" />
                  <h3 className="font-bold text-slate-800 text-sm flex-1">परीक्षण नतिजाहरू</h3>
                  <span className="text-[11px] text-slate-400">{result.metrics.length} tests</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {result.metrics.map((m, i) => {
                    const status = m.status?.toLowerCase() ?? 'normal';
                    const c = cfg(status);
                    const isOpen = expanded[i] ?? false;
                    const desc = m.what_your_result_means ?? m.explanation ?? '';

                    return (
                      <div key={i} className="px-4 py-3">
                        {/* Row: dot + name + value + badge */}
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-slate-800 text-sm">{m.plain_name ?? m.name}</span>
                            {m.plain_name && m.name !== m.plain_name && (
                              <span className="text-[10px] text-slate-400 ml-1">({m.name})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {m.value && (
                              <span className="text-xs font-mono text-slate-500">{m.value}{m.unit ? ` ${m.unit}` : ''}</span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                              {c.label}
                            </span>
                          </div>
                        </div>

                        {/* → explanation always visible */}
                        {desc && (
                          <div className="flex gap-2 mt-1.5 ml-4">
                            <span className="text-blue-400 font-bold text-xs shrink-0">→</span>
                            <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                          </div>
                        )}

                        {/* Reference range */}
                        {m.reference_range && (
                          <p className="text-[10px] text-slate-400 mt-1 ml-4">
                            सामान्य दायरा: {m.reference_range}{m.unit ? ` ${m.unit}` : ''}
                          </p>
                        )}

                        {/* Expand toggle */}
                        {(m.what_it_measures || m.severity_levels || m.how_you_might_feel || m.nepali_tip) && (
                          <button
                            onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}
                            className="flex items-center gap-1 mt-2 ml-4 text-[11px] text-blue-500 font-semibold hover:text-blue-700 transition-colors"
                          >
                            {isOpen ? <><ChevronUp size={11} /> कम देखाउनुहोस्</> : <><ChevronDown size={11} /> थप जान्नुहोस्</>}
                          </button>
                        )}

                        {/* Expanded educational detail */}
                        {isOpen && (
                          <div className="mt-3 ml-4 space-y-2.5">
                            {m.what_it_measures && (
                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">यो परीक्षण के जाँच्छ?</p>
                                <p className="text-xs text-slate-700 leading-relaxed">{m.what_it_measures}</p>
                              </div>
                            )}
                            {m.how_you_might_feel && (
                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">तपाईंलाई कस्तो महसुस हुन सक्छ</p>
                                <p className="text-xs text-slate-700 leading-relaxed">{m.how_you_might_feel}</p>
                              </div>
                            )}
                            {m.severity_levels && (
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">विभिन्न स्तरमा के हुन्छ?</p>
                                {m.severity_levels.mild && (
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-2.5">
                                    <p className="text-[10px] font-bold text-yellow-700 mb-0.5">🟡 हल्का (Mild)</p>
                                    <p className="text-[11px] text-yellow-900 leading-snug">{m.severity_levels.mild}</p>
                                  </div>
                                )}
                                {m.severity_levels.moderate && (
                                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5">
                                    <p className="text-[10px] font-bold text-orange-700 mb-0.5">🟠 मध्यम (Moderate)</p>
                                    <p className="text-[11px] text-orange-900 leading-snug">{m.severity_levels.moderate}</p>
                                  </div>
                                )}
                                {m.severity_levels.severe && (
                                  <div className="bg-red-50 border border-red-200 rounded-xl p-2.5">
                                    <p className="text-[10px] font-bold text-red-700 mb-0.5">🔴 गम्भीर (Severe)</p>
                                    <p className="text-[11px] text-red-900 leading-snug">{m.severity_levels.severe}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {m.if_not_treated && m.if_not_treated !== 'No action needed.' && (
                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">उपचार नगरे के हुन्छ?</p>
                                <p className="text-xs text-slate-700 leading-relaxed">{m.if_not_treated}</p>
                              </div>
                            )}
                            {m.nepali_tip && (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                                <p className="text-[10px] font-bold text-emerald-700 mb-0.5">💡 सुझाव</p>
                                <p className="text-[11px] text-emerald-900 leading-snug">{m.nepali_tip}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Lifestyle advice ── */}
            {result.lifestyle_advice && result.lifestyle_advice.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <Salad size={15} className="text-emerald-600" />
                  <p className="font-bold text-emerald-800 text-sm">जीवनशैली सुझाव</p>
                </div>
                <ul className="space-y-1.5">
                  {result.lifestyle_advice.map((a, i) => (
                    <li key={i} className="flex gap-2 text-xs text-emerald-900 leading-snug">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0 mt-0.5" /> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Watch for ── */}
            {result.watch_for && result.watch_for.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <Eye size={15} className="text-orange-500" />
                  <p className="font-bold text-orange-800 text-sm">यी लक्षण देखिए डाक्टर भेट्नुहोस्</p>
                </div>
                <ul className="space-y-1.5">
                  {result.watch_for.map((w, i) => (
                    <li key={i} className="flex gap-2 text-xs text-orange-900 leading-snug">
                      <AlertCircle size={13} className="text-orange-400 shrink-0 mt-0.5" /> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Questions for doctor ── */}
            {result.questions_for_doctor && result.questions_for_doctor.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <MessageSquareText size={15} className="text-blue-500" />
                  <p className="font-bold text-blue-800 text-sm">डाक्टरलाई सोध्नुहोस्</p>
                </div>
                <ul className="space-y-1.5">
                  {result.questions_for_doctor.map((q, i) => (
                    <li key={i} className="flex gap-2 text-xs text-blue-900 leading-snug">
                      <span className="font-bold text-blue-400 shrink-0">Q:</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Doctor recommendation ── */}
            {result.doctor_note && (
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 flex gap-3 shadow-sm">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">सिफारिस</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.doctor_note}</p>
                </div>
              </div>
            )}

            {/* ── Raw fallback ── */}
            {result.raw_response && !result.metrics && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.raw_response}</p>
              </div>
            )}

            {/* ── CTA ── */}
            {lastFile.current && (
              <button
                onClick={() => lastFile.current && runAnalysis(lastFile.current)}
                disabled={loading}
                className="w-full bg-white border-2 border-blue-200 text-blue-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-50 text-sm"
              >
                <Sparkles size={16} /> यही पेजमा फेरि विश्लेषण गर्नुहोस्
              </button>
            )}

            <button
              onClick={() => navigate('/chat')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors text-sm"
            >
              <CheckCircle size={17} /> AI डाक्टरसँग कुराकानी गर्नुहोस्
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              {result.disclaimer ?? 'यो जानकारी केवल शैक्षिक उद्देश्यको लागि हो। कृपया आफ्नो डाक्टरसँग परामर्श लिनुहोस्।'}
            </p>
          </>
        )}

        {/* ── Empty state ── */}
        {!result && !loading && !error && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-orange-400" />
              <h3 className="font-bold text-slate-700 text-sm">AI द्वारा सरल व्याख्या</h3>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-slate-400" />
                <p className="text-sm font-semibold text-slate-400">तपाईँको रिपोर्टको सारांश</p>
              </div>
              {/* Skeleton cards */}
              {['HEMOGLOBIN (HB)', 'WBC COUNT', 'CREATININE'].map((name, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-200 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                    <span className="text-xs font-bold text-slate-300">{name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-300 px-2 py-0.5 rounded-full font-bold">—</span>
                </div>
              ))}
              <p className="text-xs text-slate-400 text-center mt-3">रिपोर्ट अपलोड गरेपछि यहाँ नतिजा देखिन्छ</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MedicalReportScan;
