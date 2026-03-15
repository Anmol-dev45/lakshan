import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, Image as ImageIcon, Sparkles, FileText, ArrowRight, Info, CheckCircle } from 'lucide-react';

const MedicalReportScan = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 bg-white sticky top-0 z-40 border-b border-surface-100">
        <button onClick={() => navigate(-1)} className="text-slate-800 p-1 hover:bg-surface-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">रिपोर्ट स्क्यानर</h1>
      </header>

      <div className="px-6 py-6">
        {/* Scanner Area */}
        <div className="w-full h-64 bg-primary-50 border-2 border-primary-200 border-dashed rounded-3xl flex flex-col items-center justify-center mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary-400 opacity-50 shadow-[0_5px_20px_rgba(59,130,246,0.6)] animate-[scan_3s_ease-in-out_infinite]"></div>
          
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 mb-4 shadow-sm">
            <Camera size={32} />
          </div>
          <h2 className="text-primary-600 font-bold text-lg mb-2">रिपोर्टको फोटो खिच्नुहोस्</h2>
          <p className="text-xs text-slate-500 text-center px-8 leading-relaxed">
            आफ्नो मेडिकल रिपोर्टलाई फ्रेम भित्र राख्नुहोस् र स्पष्ट फोटो खिच्नुहोस्।
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mb-8">
          <button className="flex-1 bg-primary-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-primary-600 transition-colors">
            <Camera size={18} /> फोटो खिच्नुहोस्
          </button>
          <button className="flex-1 bg-white border border-surface-300 text-primary-500 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-surface-50 transition-colors">
            <ImageIcon size={18} /> ग्यालरी
          </button>
        </div>

        {/* AI Analysis Result */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-orange-500" size={20} />
          <h3 className="text-lg font-bold text-slate-800">AI द्वारा सरल व्याख्या</h3>
        </div>

        <div className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm mb-6">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
            <FileText size={18} className="text-primary-500" /> तपाईंको रिपोर्टको सारांश
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">हाम्रो AI ले तपाईंको रिपोर्टका जटिल शब्दहरूलाई सजिलो नेपालीमा बुझाएको छ:</p>

          <div className="space-y-4">
            {/* Metric 1 */}
            <div className="border border-surface-200 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-800 text-sm tracking-wide">HEMOGLOBIN (HB)</span>
                <span className="text-[10px] font-bold border border-surface-200 bg-white text-slate-700 px-3 py-1 rounded-full">सामान्य</span>
              </div>
              <div className="flex gap-2 items-start mt-2">
                <ArrowRight size={14} className="text-primary-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-700 leading-snug">तपाईंको रगतमा आइरनको मात्रा ठीक छ, यसले शरीरमा अक्सिजन पुऱ्याउन मद्दत गर्छ।</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="border border-surface-200 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-800 text-sm tracking-wide">WBC COUNT</span>
                <span className="text-[10px] font-bold bg-danger-500 text-white px-3 py-1 rounded-full shadow-sm">ध्यान दिनुहोस्</span>
              </div>
              <div className="flex gap-2 items-start mt-2">
                <ArrowRight size={14} className="text-primary-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-700 leading-snug">सेतो रक्त कोशिका अलि बढी देखिएको छ, यसको मतलब शरीरमा सामान्य संक्रमण (Infection) हुन सक्छ।</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="border border-surface-200 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-800 text-sm tracking-wide">CREATININE</span>
                <span className="text-[10px] font-bold border border-surface-200 bg-white text-slate-700 px-3 py-1 rounded-full">सामान्य</span>
              </div>
              <div className="flex gap-2 items-start mt-2">
                <ArrowRight size={14} className="text-primary-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-700 leading-snug">मृगौला (Kidney) को कार्य प्रणाली सामान्य र स्वस्थ अवस्थामा छ।</p>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 rounded-2xl p-4 mt-6 flex gap-3">
            <Info size={20} className="text-primary-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-primary-700 mb-1 opacity-70">डाक्टरको सल्लाह:</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                रिपोर्ट सामान्य भए तापनि थप स्पष्ट जानकारीका लागि आफ्नो नजिकैको स्वास्थ्य चौकीमा देखाउनुहोला।
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-surface-50 border border-surface-200 text-slate-800 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-surface-100 transition-colors">
          <CheckCircle size={18} /> इतिहासमा सुरक्षित गर्नुहोस्
        </button>

        <p className="text-[10px] text-slate-400 text-center mt-4">
           यो जानकारी केवल शैक्षिक उद्देश्यको लागि हो।
        </p>

      </div>
    </div>
  );
};

export default MedicalReportScan;
