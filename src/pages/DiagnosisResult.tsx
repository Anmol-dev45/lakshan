import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, Activity, Info, Phone, Home, CheckCircle, Eye } from 'lucide-react';
import { useAppSelector } from '../hooks/useStore';
import { RISK_LABELS } from '../types/health';

// Colour coding for probability bars
function probColor(p: number): string {
  if (p >= 50) return 'bg-primary-500';
  if (p >= 25) return 'bg-yellow-400';
  return 'bg-slate-300';
}

const DiagnosisResult = () => {
  const navigate = useNavigate();
  const diagnosis = useAppSelector((s) => s.symptom.currentDiagnosis);

  // No diagnosis yet — shouldn't normally happen but guard gracefully
  if (!diagnosis) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-slate-500 text-center">कुनै विश्लेषण भेटिएन। पहिले लक्षण प्रविष्ट गर्नुहोस्।</p>
        <button
          onClick={() => navigate('/chat')}
          className="bg-primary-500 text-white font-bold px-6 py-3 rounded-2xl"
        >
          लक्षण जाँच सुरु गर्नुहोस्
        </button>
      </div>
    );
  }

  const riskMeta = RISK_LABELS[diagnosis.riskLevel];
  const riskBorderColor: Record<string, string> = {
    safe: 'border-l-success-500',
    monitor: 'border-l-yellow-400',
    consult: 'border-l-orange-500',
    urgent: 'border-l-danger-500',
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col pb-10">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-4 bg-white sticky top-0 z-40 border-b border-surface-100">
        <button onClick={() => navigate(-1)} className="text-slate-800 p-1 hover:bg-surface-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">जाँचको नतिजा</h1>
          <p className="text-[10px] text-slate-400">
            {new Date(diagnosis.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </header>

      <div className="px-5 py-5 space-y-6">

        {/* ── Risk Card ───────────────────────────────────────────────────── */}
        <div className={`rounded-2xl p-5 border-2 ${riskMeta.bg} flex gap-4 items-start`}>
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle size={22} className={riskMeta.color} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mb-0.5">Risk Level</p>
            <h2 className={`text-lg font-extrabold ${riskMeta.color} leading-tight`}>{riskMeta.en}</h2>
            <p className="text-sm font-semibold text-slate-700 mb-2">{riskMeta.ne}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{diagnosis.riskExplanation}</p>
          </div>
        </div>

        {/* ── Extracted symptoms pills ────────────────────────────────────── */}
        {diagnosis.extractedSymptoms.symptoms.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Eye size={16} className="text-slate-400" /> पहिचान गरिएका लक्षणहरू
            </h3>
            <div className="flex flex-wrap gap-2">
              {diagnosis.extractedSymptoms.symptoms.map((s) => (
                <span key={s} className="text-xs bg-white border border-surface-200 text-slate-700 px-3 py-1 rounded-full font-medium capitalize">
                  {s}
                </span>
              ))}
              {diagnosis.extractedSymptoms.duration !== 'not specified' && (
                <span className="text-xs bg-white border border-surface-200 text-slate-500 px-3 py-1 rounded-full">
                  ⏱ {diagnosis.extractedSymptoms.duration}
                </span>
              )}
              {diagnosis.extractedSymptoms.severity && (
                <span className="text-xs bg-white border border-surface-200 text-slate-500 px-3 py-1 rounded-full capitalize">
                  {diagnosis.extractedSymptoms.severity} severity
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Disease probability ranking ─────────────────────────────────── */}
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Activity size={18} className="text-primary-500" /> सम्भावित समस्याहरू
          </h3>
          <div className="space-y-3">
            {diagnosis.diseaseRanking.map((disease, idx) => (
              <div
                key={disease.name}
                className={`bg-white rounded-2xl p-4 shadow-sm border border-surface-100 border-l-4 ${riskBorderColor[diagnosis.riskLevel] ?? 'border-l-slate-300'} ${idx > 0 ? 'opacity-90' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base leading-tight">{disease.localName}</h4>
                    {disease.localName !== disease.name && (
                      <p className="text-xs text-slate-400">{disease.name}</p>
                    )}
                  </div>
                  <span className="text-sm font-extrabold text-slate-700 shrink-0 ml-2">{disease.probability}%</span>
                </div>

                {/* Probability bar */}
                <div className="w-full bg-surface-100 rounded-full h-1.5 mb-2.5">
                  <div
                    className={`${probColor(disease.probability)} h-1.5 rounded-full transition-all`}
                    style={{ width: `${Math.min(disease.probability, 100)}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500 leading-snug">{disease.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recommendations ─────────────────────────────────────────────── */}
        {diagnosis.recommendations.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-success-500" /> सिफारिसहरू
            </h3>
            <div className="bg-white rounded-2xl p-4 border border-surface-100 shadow-sm space-y-3">
              {diagnosis.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-success-100 text-success-600 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-700 leading-snug">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Warning signs ────────────────────────────────────────────────── */}
        {diagnosis.warningSignsToWatch.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" /> ध्यान दिनुपर्ने संकेतहरू
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-2">
              {diagnosis.warningSignsToWatch.map((sign, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-orange-500 shrink-0 mt-0.5">•</span>
                  <p className="text-sm text-slate-700 leading-snug">{sign}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action buttons ───────────────────────────────────────────────── */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/chat')}
            className="w-full bg-surface-100 border border-surface-200 text-slate-800 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-between hover:bg-surface-200 transition-colors"
          >
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-500 shadow-sm">
                <Home size={16} />
              </div>
              <span className="text-sm">थप लक्षण थप्नुहोस्</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/hospital')}
            className="w-full bg-primary-500 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-primary-600 transition-colors"
          >
            डाक्टरकहाँ जानुहोस् →
          </button>

          {diagnosis.needsImmediateCare && (
            <button
              onClick={() => navigate('/emergency')}
              className="w-full bg-danger-500 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-between hover:bg-danger-600 transition-colors shadow-md"
            >
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <Phone size={16} />
                </div>
                <span>तुरुन्त अस्पताल (Emergency)</span>
              </div>
            </button>
          )}
        </div>

        {/* ── Disclaimer ──────────────────────────────────────────────────── */}
        <div className="bg-surface-100 rounded-2xl p-4 flex gap-3 border border-surface-200">
          <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <strong>सूचना:</strong> यो नतिजा एआई द्वारा तयार गरिएको हो र केवल जोखिम विश्लेषणको लागि हो।
            यसलाई अन्तिम चिकित्सा सल्लाह मान्नु हुँदैन।
            गम्भीर अवस्थामा सधैं दक्ष चिकित्सकको परामर्श लिनुहोस्।
          </p>
        </div>

      </div>
    </div>
  );
};

export default DiagnosisResult;
