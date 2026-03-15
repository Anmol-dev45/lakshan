import Header from '../components/Header';
import { PhoneCall, Navigation, AlertCircle, Flame, Scissors, Activity, UserMinus } from 'lucide-react';

const Emergency = () => {
  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="आकस्मिक सेवा" showProfile={false} />
      
      <div className="px-6 py-6 flex flex-col items-center">
        
        {/* SOS Button */}
        <div className="w-56 h-56 rounded-full bg-danger-50 flex items-center justify-center mb-6 relative">
          <div className="w-48 h-48 rounded-full bg-danger-100 flex items-center justify-center absolute"></div>
          <button className="w-40 h-40 rounded-full bg-danger-500 text-white flex flex-col items-center justify-center shadow-[0_10px_40px_-10px_rgba(239,68,68,0.7)] z-10 hover:scale-105 transition-transform">
            <PhoneCall size={48} className="mb-2" />
            <span className="text-xl font-bold">SOS कल</span>
          </button>
        </div>

        <p className="text-slate-500 text-center mb-8 px-4 leading-relaxed">
          तुरुन्त मद्दतको लागि माथिको बटन थिच्नुहोस्।
        </p>

        {/* GPS Option */}
        <div className="w-full bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-center justify-between mb-8 cursor-pointer hover:bg-primary-100 transition-colors">
          <div>
            <h3 className="font-bold text-primary-600 mb-1">GPS पठाउनुहोस्</h3>
            <p className="text-xs text-slate-500">आफ्नो लोकेसन परिवारलाई पठाउनुहोस्।</p>
          </div>
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
            <Navigation size={20} className="ml-[-2px] mt-[2px]" />
          </div>
        </div>

        {/* First Aid Section */}
        <div className="w-full">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle size={20} /> प्राथमिक उपचार
          </h2>
          
          <div className="space-y-4">
            {/* Aid Item */}
            <div className="bg-white border border-surface-200 rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-surface-50 rounded-xl flex items-center justify-center text-danger-500 shrink-0">
                <Flame size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800">आगोले पोलेमा</h3>
                  <span className="text-[10px] bg-surface-100 text-slate-600 px-2 py-0.5 rounded-full border border-surface-200">मद्दत</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">चिसो पानी हाल्नुहोस् र घाउलाई सफा कपडाले छोप्नुहोस्।</p>
              </div>
            </div>

            <div className="bg-white border border-surface-200 rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-surface-50 rounded-xl flex items-center justify-center text-primary-500 shrink-0">
                <Scissors size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800">रगत बगेमा</h3>
                  <span className="text-[10px] bg-surface-100 text-slate-600 px-2 py-0.5 rounded-full border border-surface-200">मद्दत</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">घाउमा सफा कपडाले जोडले थिच्नुहोस् र रगत रोक्नुहोस्।</p>
              </div>
            </div>

            <div className="bg-white border border-surface-200 rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-surface-50 rounded-xl flex items-center justify-center text-success-500 shrink-0">
                <Activity size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800">बेहोस भएमा</h3>
                  <span className="text-[10px] bg-surface-100 text-slate-600 px-2 py-0.5 rounded-full border border-surface-200">मद्दत</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">बिरामीलाई समतल ठाउँमा सुताउनुहोस् र खुट्टा अलि माथि राख्नुहोस्।</p>
              </div>
            </div>

            <div className="bg-white border border-surface-200 rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-surface-50 rounded-xl flex items-center justify-center text-slate-800 shrink-0">
                <UserMinus size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800">सर्पले टोकेमा</h3>
                  <span className="text-[10px] bg-surface-100 text-slate-600 px-2 py-0.5 rounded-full border border-surface-200">मद्दत</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">टोकेको भागलाई हलचल नगर्नुहोस् र अस्पताल लैजानुहोस्।</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
