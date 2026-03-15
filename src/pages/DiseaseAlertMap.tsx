import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Map, AlertTriangle, Thermometer, ShieldAlert, ChevronRight, Droplets } from 'lucide-react';

const DiseaseAlertMap = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-40 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-800 p-1 hover:bg-surface-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">रोगको सचेतना</h1>
        </div>
        <button className="text-primary-500 p-1 hover:bg-surface-100 rounded-full transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </button>
      </header>

      <div className="px-6 py-6">
        {/* Map Section */}
        <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Map className="text-primary-500" size={24} /> जिल्लागत स्वास्थ्य नक्सा
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">तपाईंको क्षेत्रमा फैलिएका रोगहरू र स्वास्थ्य चेतावनीहरू यहाँ हेर्न सक्नुहुन्छ।</p>

        <div className="bg-surface-50 rounded-3xl p-4 border border-surface-200 mb-8 relative">
           {/* Map graphic placeholder */}
           <div className="h-48 relative rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-surface-200">
             {/* Map decorative blocks */}
             <div className="absolute top-4 left-4 w-12 h-12 bg-danger-400 opacity-50 rounded-lg"></div>
             <div className="absolute bottom-6 left-1/3 w-16 h-12 bg-danger-300 opacity-60 rounded-lg"></div>
             <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Map size={100} />
             </div>
             
             {/* Legend overlay */}
             <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-white shadow-sm">
                <p className="text-[10px] font-bold text-slate-800 mb-2 flex items-center gap-1"><InfoIcon size={12}/> संकेत सूची</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-danger-500"></span><span className="text-[10px] text-slate-600">उच्च जोखिम</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span><span className="text-[10px] text-slate-600">मध्यम जोखिम</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-surface-300"></span><span className="text-[10px] text-slate-600">सामान्य</span></div>
                </div>
             </div>
             
             {/* Note */}
             <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-slate-500 flex items-center gap-1">
               <Map size={10}/> नेपाल जिल्ला नक्सा (Heatmap)
             </div>
           </div>
        </div>

        {/* Alerts Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-danger-500" size={20} /> प्रमुख सचेतनाहरू
          </h2>
          <span className="text-xs font-semibold text-slate-500 underline cursor-pointer hover:text-primary-500">सबै हेर्नुहोस्</span>
        </div>

        <div className="space-y-4 mb-8">
          
          {/* Alert 1 */}
          <div className="bg-white rounded-3xl shadow-sm border border-surface-200 overflow-hidden">
            <div className="bg-white border-l-4 border-l-danger-500 p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-danger-50 rounded-full flex items-center justify-center text-danger-500 shrink-0">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">काठमाडौँ</h3>
                    <p className="text-[10px] text-slate-400">२ घण्टा अगाडि</p>
                  </div>
                </div>
                <span className="bg-danger-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">उच्च</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-surface-100 pb-3 mb-3">
                 <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                   <Droplets size={16} className="text-slate-400" /> डेङ्गु (Dengue)
                 </div>
                 <div className="flex items-center gap-1 text-danger-500 text-sm font-bold">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-45"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                   १२४ रिपोर्ट
                 </div>
              </div>

              <div className="bg-surface-50 rounded-xl p-3 flex items-start gap-2 mb-4">
                <InfoIcon size={16} className="text-primary-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">सुझाव: झुलको प्रयोग गर्नुहोस् र पानी जम्न नदिनुहोस्।</p>
              </div>

              <button className="w-full bg-white border border-surface-200 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-between px-4 hover:bg-surface-50 transition-colors">
                <span className="text-sm">नजिकैको अस्पताल हेर्नुहोस्</span>
                <ChevronRight size={18} className="text-slate-400"/>
              </button>
            </div>
          </div>

          {/* Alert 2 */}
          <div className="bg-white rounded-3xl shadow-sm border border-surface-200 overflow-hidden">
            <div className="bg-white border-l-4 border-l-surface-300 p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-50 rounded-full flex items-center justify-center text-slate-700 shrink-0 border border-surface-200">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">चितवन</h3>
                    <p className="text-[10px] text-slate-400">५ घण्टा अगाडि</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b border-surface-100 pb-3 mb-3">
                 <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                   <Thermometer size={16} className="text-slate-400" /> भाइरल ज्वरो
                 </div>
                 <div className="flex items-center gap-1 text-danger-400 text-sm font-bold">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-45"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                   ८५ रिपोर्ट
                 </div>
              </div>

              <div className="bg-surface-50 rounded-xl p-3 flex items-start gap-2 mb-4">
                <InfoIcon size={16} className="text-primary-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">सुझाव: प्रशस्त पानी पिउनुहोस् र आराम गर्नुहोस्।</p>
              </div>

               <button className="w-full bg-white border border-surface-200 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-between px-4 hover:bg-surface-50 transition-colors">
                <span className="text-sm">नजिकैको अस्पताल हेर्नुहोस्</span>
                <ChevronRight size={18} className="text-slate-400"/>
              </button>
            </div>
          </div>
          
           {/* Alert 3 */}
          <div className="bg-white rounded-3xl shadow-sm border border-surface-200 overflow-hidden">
            <div className="bg-white border-l-4 border-l-surface-300 p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-50 rounded-full flex items-center justify-center text-slate-700 shrink-0 border border-surface-200">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">कास्की</h3>
                    <p className="text-[10px] text-slate-400">१ दिन अगाडि</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b border-surface-100 pb-3 mb-3">
                 <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                   <Thermometer size={16} className="text-slate-400" /> झाडापखाला
                 </div>
                 <div className="flex items-center gap-1 text-danger-400 text-sm font-bold">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-45"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                   ४२ रिपोर्ट
                 </div>
              </div>

               <div className="bg-surface-50 rounded-xl p-3 flex items-start gap-2 mb-4">
                <InfoIcon size={16} className="text-primary-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">सुझाव: उमालेको पानी मात्र पिउनुहोस्।</p>
              </div>

               <button className="w-full bg-white border border-surface-200 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-between px-4 hover:bg-surface-50 transition-colors">
                <span className="text-sm">नजिकैको अस्पताल हेर्नुहोस्</span>
                <ChevronRight size={18} className="text-slate-400"/>
              </button>
            </div>
          </div>

        </div>

        {/* Emergency SOS Banner */}
        <div className="bg-danger-50 rounded-3xl p-5 border border-danger-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-danger-100 rounded-full blur-3xl opacity-50"></div>
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 bg-danger-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="font-bold text-danger-600 text-[15px]">आकस्मिक सहयोग चाहिएमा?</h3>
              <p className="text-[11px] text-danger-500/80 leading-snug">यदि तपाईंलाई गम्भीर लक्षणहरू देखिएका छन् भने तुरुन्तै सहायता बटन थिच्नुहोस्।</p>
            </div>
          </div>

          <button className="w-full bg-danger-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center relative z-10 shadow-md hover:bg-danger-600 transition-colors">
            आकस्मिक सेवा (SOS)
          </button>
        </div>

      </div>
    </div>
  );
};

const InfoIcon = ({size, className}: {size:number, className?:string}) => (
<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

export default DiseaseAlertMap;
