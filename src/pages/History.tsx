import Header from '../components/Header';
import { Activity, Calendar, Clock, ChevronRight, AlertCircle, Home as HomeIcon } from 'lucide-react';

const History = () => {
  return (
    <div className="min-h-screen bg-white pb-20 relative">
      <Header title="स्वास्थ्य इतिहास" showProfile={false} />
      
      <div className="px-6 py-6">
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 flex flex-col items-center justify-center text-center h-28">
            <Activity className="text-primary-500 mb-2" size={24}/>
            <span className="text-xs text-slate-600 mb-1">कुल जाँच</span>
            <span className="text-lg font-bold text-primary-600">१२ पटक</span>
          </div>
          
          <div className="bg-success-50 rounded-2xl p-4 border border-success-100 flex flex-col items-center justify-center text-center h-28">
            <Calendar className="text-success-500 mb-2" size={24}/>
            <span className="text-xs text-slate-600 mb-1">पछिल्लो जाँच</span>
            <span className="text-lg font-bold text-success-600">५ दिन अघि</span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={20} /> पछिल्ला रेकर्डहरू
        </h2>
        
        <div className="space-y-4 mb-24">
          
          {/* Record 1 */}
          <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Calendar size={12}/> २०८० फागुन १५ • १०:३० AM
              </span>
              <span className="text-[10px] font-bold text-slate-800">मध्यम</span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">ज्वरो र खोकी</h3>
            <p className="text-xs text-slate-500 mb-4">यस जाँचको विस्तृत विवरण र औषधि सिफारिस यहाँ</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-primary-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors hover:bg-primary-600">
                फेरि जाँच गर्ने
              </button>
              <button className="w-10 bg-white border border-surface-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-surface-50 transition-colors">
                <ChevronRight size={18}/>
              </button>
            </div>
          </div>

          {/* Record 2 */}
          <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Calendar size={12}/> २०८० माघ २८ • ०२:१५ PM
              </span>
              <span className="text-[10px] font-bold text-slate-800">सामान्य</span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">टाउको दुखाइ</h3>
            <p className="text-xs text-slate-500 mb-4">यस जाँचको विस्तृत विवरण र औषधि सिफारिस यहाँ</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-primary-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors hover:bg-primary-600">
                फेरि जाँच गर्ने
              </button>
              <button className="w-10 bg-white border border-surface-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-surface-50 transition-colors">
                <ChevronRight size={18}/>
              </button>
            </div>
          </div>

          {/* Record 3 - Severe */}
          <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-danger-500"></div>
            <div className="flex justify-between items-start mb-2 pl-2">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Calendar size={12}/> २०८० पुस १० • ०९:०० AM
              </span>
              <span className="text-[10px] font-bold text-white bg-danger-500 px-2 py-0.5 rounded-full">गम्भीर</span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2 pl-2">छातीको दुखाइ</h3>
            <p className="text-xs text-slate-500 mb-4 pl-2">यस जाँचको विस्तृत विवरण र औषधि सिफारिस यहाँ</p>
            <div className="flex gap-2 pl-2">
              <button className="flex-1 bg-primary-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors hover:bg-primary-600">
                फेरि जाँच गर्ने
              </button>
              <button className="w-10 bg-white border border-surface-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-surface-50 transition-colors">
                <ChevronRight size={18}/>
              </button>
            </div>
          </div>
        </div>
        
        {/* Suggestion banner */}
        <div className="bg-surface-50 border border-surface-200 border-dashed rounded-2xl p-4 flex gap-3 mb-6">
          <AlertCircle size={20} className="text-slate-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">सुझाव:</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              नियमित रूपमा आफ्नो लक्षणहरू रेकर्ड गर्नाले एआई (AI) लाई तपाईंको स्वास्थ्यको सही विश्लेषण गर्न सजिलो हुन्छ।
            </p>
          </div>
        </div>
      </div>
      
       {/* Floating Home Button (To mirror bottom nav UI in standalone mockup) */}
       <div className="fixed bottom-24 right-6 w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-float border-2 border-white cursor-pointer z-50">
        <HomeIcon size={24} />
      </div>

    </div>
  );
};

export default History;
