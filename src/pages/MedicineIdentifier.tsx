import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Pill, CheckCircle, AlertTriangle, Info, RefreshCw, TriangleAlert } from 'lucide-react';

const MedicineIdentifier = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 bg-white sticky top-0 z-40 border-b border-surface-100">
        <button onClick={() => navigate(-1)} className="text-slate-800 p-1 hover:bg-surface-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">औषधि पहिचान</h1>
      </header>

      <div className="px-6 py-6">
        {/* Identified Medicine Card */}
        <div className="bg-primary-100 rounded-3xl p-6 shadow-sm border border-primary-200 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
              <Pill size={28} className="-rotate-45" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary-600 border border-primary-300 rounded-full px-3 py-0.5 inline-block mb-2 bg-primary-50">पहिचान गरियो</span>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">पारासिटामोल<br/><span className="text-[19px] font-semibold text-slate-700">(Paracetamol)</span></h2>
            </div>
          </div>
          <p className="text-sm text-slate-600 flex items-center gap-2 font-medium">
             <FileTextIcon size={16} /> प्रकार: चक्की (Tablet - 500mg)
          </p>
        </div>

        {/* Usage Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-200 mb-6">
          <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-slate-800" /> यसको प्रयोग
          </h3>
          <p className="text-primary-600 font-bold text-sm mb-4">ज्वरो घटाउन र जिउ दुख्दा प्रयोग गरिन्छ।</p>
          
          <ul className="space-y-3 pl-2">
            <li className="flex gap-3 items-start relative">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-800 absolute left-0 top-1.5"></span>
               <span className="text-sm text-slate-700 pl-4 leading-snug">खाना खाएपछि मात्र सेवन गर्नुहोस्।</span>
            </li>
            <li className="flex gap-3 items-start relative">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-800 absolute left-0 top-1.5"></span>
               <span className="text-sm text-slate-700 pl-4 leading-snug">दिनको ३ पटक सम्म (आवश्यकता अनुसार)।</span>
            </li>
             <li className="flex gap-3 items-start relative">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-800 absolute left-0 top-1.5"></span>
               <span className="text-sm text-slate-700 pl-4 leading-snug">बालबालिकाको पहुँचबाट टाढा राख्नुहोस्।</span>
            </li>
          </ul>
        </div>

        {/* Precautions Section */}
        <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 mb-6">
           <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-slate-800" /> सावधानी
          </h3>
          <ul className="space-y-4">
             <li className="flex gap-3 items-start">
               <Info size={18} className="text-slate-600 shrink-0 mt-0.5" />
               <span className="text-sm text-slate-700 leading-snug">कलेजोको समस्या भएमा डाक्टरसँग सल्लाह लिनुहोस्।</span>
             </li>
             <li className="flex gap-3 items-start">
               <Info size={18} className="text-slate-600 shrink-0 mt-0.5" />
               <span className="text-sm text-slate-700 leading-snug">धेरै मात्रामा सेवन गर्दा हानिकारक हुन सक्छ।</span>
             </li>
             <li className="flex gap-3 items-start">
               <Info size={18} className="text-slate-600 shrink-0 mt-0.5" />
               <span className="text-sm text-slate-700 leading-snug">मदिरासँग सेवन नगर्नुहोस्।</span>
             </li>
          </ul>
        </div>

        {/* Check Another Button */}
        <button className="w-full bg-surface-50 border border-surface-200 text-slate-800 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-surface-100 transition-colors mb-6 shadow-sm">
          <RefreshCw size={18} /> अर्को औषधि जाँच गर्नुहोस्
        </button>

        <div className="bg-surface-100 rounded-2xl p-4 text-center border border-surface-200">
           <p className="text-xs text-slate-500 leading-relaxed tracking-wide">
             सूचना: यो AI द्वारा गरिएको पहिचान हो। औषधि सेवन गर्नु अघि सधैं चिकित्सक वा स्वास्थ्यकर्मीको सल्लाह लिनुहोस्।
           </p>
        </div>

      </div>

      {/* Floating Action Button (Decorative) */}
      <div className="fixed bottom-10 right-6 w-16 h-16 bg-danger-500 rounded-full flex flex-col items-center justify-center text-white shadow-float border-4 border-white z-50 cursor-pointer hover:bg-danger-600 transition-colors">
        <TriangleAlert size={20} />
        <span className="text-[10px] font-bold tracking-wider mt-0.5">सहायता</span>
      </div>

    </div>
  );
};

// Helper component for icon
const FileTextIcon = ({size}: {size: number}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);

export default MedicineIdentifier;
