import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, Image as ImageIcon, Sparkles, FileText, ArrowRight, Info, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { analyzeImage } from '../services/aiService';

interface Metric {
  name: string;
  value?: string;
  unit?: string;
  status?: string;
  explanation?: string;
}

interface ReportResult {
  report_type?: string;
  metrics?: Metric[];
  overall_summary?: string;
  doctor_note?: string;
  disclaimer?: string;
  raw_response?: string;
}

const STATUS_STYLES: Record<string, string> = {
  normal:    'border border-surface-200 bg-white text-slate-700',
  high:      'bg-danger-500 text-white',
  low:       'bg-orange-500 text-white',
  attention: 'bg-danger-500 text-white',
};

const MedicalReportScan = () => {
  const navigate       = useNavigate();
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ReportResult | null>(null);
  const [error, setError]     = useState<string | null>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('कृपया तस्वीर फाइल छान्नुहोस्।');
      return;
    }
    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    runAnalysis(file);
  }

  async function runAnalysis(file: File) {
    setLoading(true);
    try {
      const data = await analyzeImage(file, 'report') as unknown as ReportResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'विश्लेषण गर्न सकिएन।');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <header className="flex items-center gap-3 px-6 py-4 bg-white sticky top-0 z-40 border-b border-surface-100">
        <button onClick={() => navigate(-1)} className="text-slate-800 p-1 hover:bg-surface-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">रिपोर्ट स्क्यानर</h1>
      </header>

      <input ref={fileInputRef}   type="file" accept="image/*"         className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      <div className="px-6 py-6">
        {/* Scanner / Preview */}
        <div
          onClick={() => !loading && fileInputRef.current?.click()}
          className="w-full h-56 bg-primary-50 border-2 border-primary-200 border-dashed rounded-3xl flex flex-col items-center justify-center mb-6 relative overflow-hidden cursor-pointer hover:bg-primary-100 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Report" className="w-full h-full object-contain rounded-3xl" />
          ) : (
            <>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-400 opacity-50 animate-[scan_3s_ease-in-out_infinite]" />
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 mb-4"><Camera size={32} /></div>
              <h2 className="text-primary-600 font-bold text-lg mb-1">रिपोर्टको फोटो खिच्नुहोस्</h2>
              <p className="text-xs text-slate-500 text-center px-8 leading-relaxed">आफ्नो मेडिकल रिपोर्टलाई फ्रेम भित्र राख्नुहोस्</p>
            </>
          )}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-3xl">
              <Loader size={32} className="animate-spin text-primary-500 mb-2" />
              <p className="text-sm font-semibold text-primary-600">AI विश्लेषण गरिरहेको छ...</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => cameraInputRef.current?.click()} disabled={loading} className="flex-1 bg-primary-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-primary-600 transition-colors disabled:opacity-50">
            <Camera size={18} /> फोटो खिच्नुहोस्
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="flex-1 bg-white border border-surface-300 text-primary-500 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-surface-50 transition-colors disabled:opacity-50">
            <ImageIcon size={18} /> ग्यालरी
          </button>
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-2xl p-4 mb-6 flex gap-3">
            <AlertCircle size={18} className="text-danger-500 shrink-0 mt-0.5" />
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {result && !loading && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-orange-500" size={20} />
              <h3 className="text-lg font-bold text-slate-800">AI द्वारा सरल व्याख्या</h3>
              {result.report_type && (
                <span className="ml-auto text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-semibold">{result.report_type}</span>
              )}
            </div>

            <div className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm mb-6">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                <FileText size={18} className="text-primary-500" /> तपाईंको रिपोर्टको सारांश
              </h4>

              {result.overall_summary && (
                <p className="text-sm text-slate-700 leading-relaxed mb-4 bg-primary-50 rounded-2xl p-3">{result.overall_summary}</p>
              )}

              {result.metrics && result.metrics.length > 0 && (
                <div className="space-y-3">
                  {result.metrics.map((m, i) => (
                    <div key={i} className="border border-surface-200 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800 text-sm tracking-wide">{m.name}</span>
                        <div className="flex items-center gap-2">
                          {m.value && <span className="text-xs text-slate-500">{m.value}{m.unit ? ` ${m.unit}` : ''}</span>}
                          {m.status && (
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${STATUS_STYLES[m.status.toLowerCase()] ?? STATUS_STYLES.normal}`}>
                              {m.status === 'normal' ? 'सामान्य' : m.status === 'high' ? 'बढी' : m.status === 'low' ? 'कम' : 'ध्यान दिनुस्'}
                            </span>
                          )}
                        </div>
                      </div>
                      {m.explanation && (
                        <div className="flex gap-2 items-start mt-1">
                          <ArrowRight size={14} className="text-primary-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-700 leading-snug">{m.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {result.raw_response && !result.metrics && (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.raw_response}</p>
              )}

              {result.doctor_note && (
                <div className="bg-primary-50 rounded-2xl p-4 mt-4 flex gap-3">
                  <Info size={20} className="text-primary-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-primary-700 mb-1 opacity-70">डाक्टरको सल्लाह:</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{result.doctor_note}</p>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => navigate('/chat')} className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-primary-600 transition-colors mb-4">
              <CheckCircle size={18} /> लक्षण जाँच गर्नुहोस्
            </button>
          </>
        )}

        {!result && !loading && !error && (
          <div className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm mb-6 opacity-60">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <FileText size={18} className="text-primary-500" /> तपाईंको रिपोर्टको सारांश
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">माथि फोटो खिच्नुहोस् वा ग्यालरीबाट रिपोर्टको तस्वीर हाल्नुहोस्।</p>
          </div>
        )}

        <p className="text-[10px] text-slate-400 text-center mt-2">
          {result?.disclaimer ?? 'यो जानकारी केवल शैक्षिक उद्देश्यको लागि हो।'}
        </p>
      </div>
    </div>
  );
};

export default MedicalReportScan;
