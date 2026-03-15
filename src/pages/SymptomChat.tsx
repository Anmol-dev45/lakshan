import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Mic, Send, Thermometer, Wind, Target } from 'lucide-react';

const SymptomChat = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col relative h-[100dvh]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-40 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-800 p-1 hover:bg-surface-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">एआई परामर्श</h1>
        </div>
        <button className="text-slate-800 p-1 hover:bg-surface-100 rounded-full transition-colors">
          <MoreVertical size={20} />
        </button>
      </header>
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-48 relative">
        {/* Decorative background watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%233b82f6\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M22 12h-4l-3 9L9 3l-3 9H2\'/%3E%3C/svg%3E")', backgroundSize: '80px 80px', backgroundRepeat: 'repeat' }}></div>
        
        <div className="flex justify-center mb-6 pt-4 relative z-10">
          <span className="text-xs bg-white text-slate-500 font-medium px-4 py-1.5 rounded-full border border-surface-200">
            अफलाइन उपलब्ध छ
          </span>
        </div>

        {/* AI Message */}
        <div className="flex gap-3 relative z-10 w-4/5">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
             <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary-500">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
             </svg>
          </div>
          <div>
            <div className="bg-primary-100 text-slate-800 p-4 rounded-2xl rounded-tl-sm shadow-sm text-[15px] leading-relaxed">
              नमस्ते! म तपाईंको एआई स्वास्थ्य सहायक हुँ। तपाईंलाई आज कस्तो महसुस भइरहेको छ? कृपया मलाई आफ्ना लक्षणहरू बताउनुहोस्।
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">10:00 AM</span>
          </div>
        </div>

        {/* User Message */}
        <div className="flex gap-3 relative z-10 justify-end w-full">
          <div className="w-4/5 flex flex-col items-end">
            <div className="bg-primary-500 text-white p-4 rounded-2xl rounded-tr-sm shadow-sm text-[15px] leading-relaxed">
              मलाई दुई दिनदेखि ज्वरो आएको छ र टाउको धेरै दुखिरहेको छ।
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block pr-1">10:02 AM</span>
          </div>
          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&w=100&q=80" alt="Avatar" className="w-8 h-8 rounded-full shrink-0 object-cover" />
        </div>

        {/* AI Message 2 */}
        <div className="flex gap-3 relative z-10 w-4/5">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
             <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary-500">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
             </svg>
          </div>
          <div>
            <div className="bg-primary-100 text-slate-800 p-4 rounded-2xl rounded-tl-sm shadow-sm text-[15px] leading-relaxed">
              बुझें। ज्वरो कति छ नाप्नुभयो? साथै, के अरु कुनै खोकी वा सास फेर्न गार्हो....
            </div>
            {/* Loading dots... */}
            <div className="flex gap-1 mt-2 mb-1">
               <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse delay-75"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area Group */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50 rounded-t-3xl max-w-md mx-auto">
        <h3 className="text-sm text-slate-500 mb-3 px-1">छिटो चयन गर्नुहोस्</h3>
        
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 px-1">
          <button className="flex flex-col items-center justify-center bg-surface-50 border border-surface-100 rounded-2xl p-3 min-w-[90px] hover:border-primary-300 transition-colors shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
              <Thermometer size={20} />
            </div>
            <span className="text-sm font-bold text-slate-700">ज्वरो</span>
          </button>
          
          <button className="flex flex-col items-center justify-center bg-surface-50 border border-surface-100 rounded-2xl p-3 min-w-[90px] hover:border-primary-300 transition-colors shrink-0">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-2">
              <Target size={20} />
            </div>
            <span className="text-sm font-bold text-slate-700">टाउको दुखाइ</span>
          </button>

          <button className="flex flex-col items-center justify-center bg-surface-50 border border-surface-100 rounded-2xl p-3 min-w-[90px] hover:border-primary-300 transition-colors shrink-0">
            <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500 mb-2">
              <Wind size={20} />
            </div>
            <span className="text-sm font-bold text-slate-700">खोकी</span>
          </button>
        </div>

        {/* Input Field */}
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-1 flex items-center p-1.5">
            <button className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center shadow-sm hover:bg-primary-600 transition-colors focus:outline-none">
              <Mic size={20} />
            </button>
          </div>
          <input 
            type="text" 
            placeholder="यहाँ लेख्नुहोस् वा बोल्नुहोस्..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-white border border-surface-300 rounded-2xl py-4 pl-14 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all font-medium"
          />
          <div className="absolute inset-y-0 right-2 flex items-center p-2">
             <button onClick={() => navigate('/diagnosis')} className="text-slate-400 hover:text-primary-500 transition-colors focus:outline-none p-1">
              <Send size={22} className="rotate-45" />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-400 mt-4 tracking-wide font-medium">तपाईंको डेटा सुरक्षित र अफलाइन भण्डारण गरिएको छ।</p>
      </div>
    </div>
  );
};

export default SymptomChat;
