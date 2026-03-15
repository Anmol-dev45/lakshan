import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Pill, CheckCircle, AlertTriangle, Info, RefreshCw, Camera, Image as ImageIcon, Loader, AlertCircle } from 'lucide-react';
import { analyzeImage } from '../services/aiService';

interface MedicineResult {
  identified: boolean;
  name?: string;
  local_name?: string;
  type?: string;
  strength?: string;
  uses?: string;
  usage_instructions?: string[];
  precautions?: string[];
  disclaimer?: string;
  raw_response?: string;
}

const MedicineIdentifier = () => {
  const navigate       = useNavigate();
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<MedicineResult | null>(null);
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
      const data = await analyzeImage(file, 'medicine') as unknown as MedicineResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'पहिचान गर्न सकिएन।');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <header className="flex items-center gap-3 px-6 py-4 bg-white sticky top-0 z-40 border-b border-surface-100">
        <button onClick={() => navigate(-1)} className="text-slate-800 p-1 hover:bg-surface-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">औषधि पहिचान</h1>
      </header>

      <input ref={fileInputRef}   type="file" accept="image/*"         className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      <div className="px-6 py-6">
        {/* Upload area */}
        {!result && (
          <div
            onClick={() => !loading && fileInputRef.current?.click()}
            className="w-full h-48 bg-orange-50 border-2 border-orange-200 border-dashed rounded-3xl flex flex-col items-center justify-center mb-6 cursor-pointer hover:bg-orange-100 transition-colors relative overflow-hidden"
          >
            {preview ? (
              <img src={preview} alt="Medicine" className="w-full h-full object-contain" />
            ) : (
              <>
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-3"><Pill size={28} className="-rotate-45" /></div>
                <h2 className="text-orange-600 font-bold text-base mb-1">औषधिको फोटो खिच्नुहोस्</h2>
                <p className="text-xs text-slate-500 text-center px-8">औषधिको प्याकेट वा चक्कीको तस्वीर हाल्नुहोस्</p>
              </>
            )}
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-3xl">
                <Loader size={28} className="animate-spin text-orange-500 mb-2" />
                <p className="text-sm font-semibold text-orange-600">AI पहिचान गरिरहेको छ...</p>
              </div>
            )}
          </div>
        )}

        {!result && (
          <div className="flex gap-4 mb-6">
            <button onClick={() => cameraInputRef.current?.click()} disabled={loading} className="flex-1 bg-orange-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-orange-600 transition-colors disabled:opacity-50">
              <Camera size={18} /> फोटो खिच्नुहोस्
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="flex-1 bg-white border border-surface-300 text-orange-500 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-surface-50 transition-colors disabled:opacity-50">
              <ImageIcon size={18} /> ग्यालरी
            </button>
          </div>
        )}

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-2xl p-4 mb-6 flex gap-3">
            <AlertCircle size={18} className="text-danger-500 shrink-0 mt-0.5" />
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <>
            {result.identified && result.name ? (
              <>
                {/* Identified medicine card */}
                <div className="bg-primary-100 rounded-3xl p-6 shadow-sm border border-primary-200 mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
                      <Pill size={28} className="-rotate-45" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-primary-600 border border-primary-300 rounded-full px-3 py-0.5 inline-block mb-2 bg-primary-50">पहिचान गरियो</span>
                      <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                        {result.local_name || result.name}
                        {result.local_name && result.local_name !== result.name && (
                          <span className="block text-[19px] font-semibold text-slate-700">({result.name})</span>
                        )}
                      </h2>
                    </div>
                  </div>
                  {(result.type || result.strength) && (
                    <p className="text-sm text-slate-600 font-medium">
                      प्रकार: {[result.type, result.strength].filter(Boolean).join(' — ')}
                    </p>
                  )}
                </div>

                {result.uses && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-200 mb-6">
                    <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                      <CheckCircle size={20} className="text-slate-800" /> यसको प्रयोग
                    </h3>
                    <p className="text-primary-600 font-bold text-sm mb-4">{result.uses}</p>
                    {result.usage_instructions && result.usage_instructions.length > 0 && (
                      <ul className="space-y-3 pl-2">
                        {result.usage_instructions.map((inst, i) => (
                          <li key={i} className="flex gap-3 items-start relative">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800 absolute left-0 top-1.5" />
                            <span className="text-sm text-slate-700 pl-4 leading-snug">{inst}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {result.precautions && result.precautions.length > 0 && (
                  <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 mb-6">
                    <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-slate-800" /> सावधानी
                    </h3>
                    <ul className="space-y-4">
                      {result.precautions.map((p, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <Info size={18} className="text-slate-600 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700 leading-snug">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-surface-50 border border-surface-200 rounded-3xl p-6 mb-6">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {result.raw_response || 'औषधि पहिचान हुन सकेन। अर्को स्पष्ट तस्वीर प्रयास गर्नुहोस्।'}
                </p>
              </div>
            )}

            <button onClick={reset} className="w-full bg-surface-50 border border-surface-200 text-slate-800 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-surface-100 transition-colors mb-6 shadow-sm">
              <RefreshCw size={18} /> अर्को औषधि जाँच गर्नुहोस्
            </button>
          </>
        )}

        {!result && !loading && !error && (
          <div className="bg-surface-100 rounded-2xl p-4 text-center border border-surface-200">
            <p className="text-xs text-slate-500 leading-relaxed">औषधिको प्याकेट, चक्की वा बोतलको स्पष्ट तस्वीर खिच्नुहोस्।</p>
          </div>
        )}

        <div className="bg-surface-100 rounded-2xl p-4 text-center border border-surface-200 mt-4">
          <p className="text-xs text-slate-500 leading-relaxed tracking-wide">
            {result?.disclaimer ?? 'सूचना: यो AI द्वारा गरिएको पहिचान हो। औषधि सेवन गर्नु अघि सधैं चिकित्सकको सल्लाह लिनुहोस्।'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicineIdentifier;
