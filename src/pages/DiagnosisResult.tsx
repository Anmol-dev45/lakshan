import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertTriangle, Activity, Info, Phone, Home } from 'lucide-react';

const DiagnosisResult = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col relative pb-10">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 bg-white sticky top-0 z-40 border-b border-surface-100">
        <button onClick={() => navigate(-1)} className="text-slate-800 p-1 hover:bg-surface-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">जाँचको नतिजा</h1>
      </header>

      <div className="px-6 py-6">
        {/* Risk Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-surface-100 mb-8 mt-2">
          <div className="flex gap-4 items-start mb-6">
            <div className="w-12 h-12 bg-white border-2 border-slate-800 rounded-xl flex items-center justify-center text-slate-800 shrink-0">
               <AlertTriangle size={24} strokeWidth={2.5}/>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1 tracking-wide">स्वास्थ्य स्थिति:</p>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">मध्यम जोखिम <br/>(सावधानी)</h2>
            </div>
          </div>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            तपाईंले डाक्टरसँग परामर्श लिनु राम्रो हुनेछ। स्वास्थ्यमा ध्यान दिनुहोस्।
          </p>
        </div>

        {/* Possible Issues Section */}
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-primary-500" /> सम्भावित समस्याहरू
        </h3>

        <div className="space-y-4 mb-8">
          {/* Issue 1 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-l-primary-500 border border-surface-100">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900 text-xl leading-tight">मौसमी<br/>रुघाखोकी</h4>
              <span className="text-xs font-bold text-slate-800">८५% सम्भावना</span>
            </div>
            <p className="text-sm text-slate-500 mb-5">यो सामान्यतया भाइरसको कारणले हुने गर्दछ।</p>
            
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 leading-snug">प्रशस्त झोलिलो कुरा पिउनुहोस् र आराम गर्नुहोस्।</span>
              </li>
              <li className="flex gap-3 items-start">
                <Activity size={16} className="text-slate-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 leading-snug">यदि ज्वरो १००.४°F भन्दा बढी भएमा डाक्टरलाई देखाउनुहोस्।</span>
              </li>
            </ul>
          </div>

          {/* Issue 2 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-l-primary-300 border border-surface-100 opacity-90">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900 text-xl leading-tight">एलर्जी<br/><span className="text-lg font-medium text-slate-600">(Allergy)</span></h4>
              <span className="text-xs font-bold text-slate-600 bg-surface-100 px-3 py-1 rounded-full">१५% सम्भावना</span>
            </div>
            <p className="text-sm text-slate-500">वातावरणीय धुलो वा परागकणको कारण हुन सक्छ।</p>
          </div>
        </div>

        {/* Action Items Section */}
        <h3 className="text-lg font-bold text-slate-800 mb-4">तपाईंले गर्नुपर्ने कार्यहरू:</h3>

        <div className="space-y-3 mb-8">
          <button className="w-full bg-surface-50 border border-surface-200 text-slate-800 font-bold py-4 px-4 rounded-2xl flex items-center justify-between hover:bg-surface-100 transition-colors shadow-sm">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600"><Home size={18}/></div>
              घरमा उपचार
            </div>
            <ChevronRight size={20} className="text-slate-400"/>
          </button>
          
          <button className="w-full bg-primary-500 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 shadow-md hover:bg-primary-600 transition-colors text-lg">
             डाक्टरकहाँ जानुहोस्
          </button>

          <button className="w-full bg-danger-500 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-between hover:bg-danger-600 transition-colors shadow-md">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white"><Phone size={18}/></div>
              अस्पताल (Emergency)
            </div>
            <ChevronRight size={20} className="text-white/80"/>
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-surface-100 rounded-2xl p-4 flex gap-3 text-slate-600 mb-8 border border-surface-200">
           <Info size={16} className="shrink-0 mt-0.5" />
           <p className="text-xs leading-relaxed">
             सूचना: यो नतिजा एआई (AI) द्वारा तयार गरिएको हो। यसलाई अन्तिम चिकित्सा सल्लाह मान्नु हुँदैन। गम्भीर अवस्थामा सधैं दक्ष चिकित्सकको परामर्श लिनुहोस्।
           </p>
        </div>

      </div>
      
       {/* Floating Action Button (Decorative, matching the design mockups visual flair) */}
       <div className="fixed bottom-10 right-6 w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-float border-4 border-surface-50 z-50">
        <Activity size={24} />
      </div>
    </div>
  );
};

export default DiagnosisResult;
