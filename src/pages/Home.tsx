import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Mic, FileText, Pill, MapPin, AlertTriangle, ChevronRight, Zap } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />

      <div className="px-6 py-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">नमस्ते!</h1>
        <p className="text-slate-500 mb-6">आज तपाईंलाई कस्तो छ?</p>

        {/* Main AI CTA */}
        <div className="bg-primary-50 rounded-3xl p-6 mb-8 text-center relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center text-primary-600 gap-2 font-medium">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              लक्षण जाँच गर्नुहोस्
            </div>
            <span className="bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full font-semibold">
              AI सक्रिय छ
            </span>
          </div>

          <div
            onClick={() => navigate('/chat')}
            className="w-24 h-24 mx-auto bg-primary-500 rounded-full flex items-center justify-center text-white mb-6 shadow-float relative z-10 cursor-pointer hover:scale-105 transition-transform"
          >
            <Mic size={40} />
            <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-20"></div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2 relative z-10">बोलेर लक्षण बताउनुहोस्</h2>
          <p className="text-slate-500 text-sm mb-6 relative z-10">तपाईंको स्वास्थ्य समस्या बारे कुरा गर्न यहाँ थिच्नुहोस्</p>

          <button
            onClick={() => navigate('/chat')}
            className="w-full bg-white border border-primary-200 text-primary-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors shadow-sm relative z-10"
          >
            जाँच सुरु गर्नुहोस् <ChevronRight size={18} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-4">मुख्य सुविधाहरू</h3>

        {/* Grid of features */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div onClick={() => navigate('/report-scan')} className="bg-white border border-surface-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center text-success-500 mb-4">
              <FileText size={24} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">रिपोर्ट स्क्यान</h4>
            <p className="text-xs text-slate-500">तपाईंको रिपोर्ट बुझ्नुहोस्</p>
          </div>

          <div onClick={() => navigate('/medicine')} className="bg-white border border-surface-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mb-4">
              <Pill size={24} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">औषधि चिन्नुहोस्</h4>
            <p className="text-xs text-slate-500">नाम र काम हेर्नुहोस्</p>
          </div>

          <div onClick={() => navigate('/hospital')} className="bg-white border border-surface-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">
              <MapPin size={24} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">नजिकैका अस्पताल</h4>
            <p className="text-xs text-slate-500">उपचार केन्द्र खोज्नुहोस्</p>
          </div>

          <div onClick={() => navigate('/disease-map')} className="bg-white border border-surface-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-danger-50 rounded-xl flex items-center justify-center text-danger-500 mb-4">
              <AlertTriangle size={24} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">रोग चेतावनी</h4>
            <p className="text-xs text-slate-500">तपाईंको क्षेत्रको जानकारी</p>
          </div>
        </div>

        {/* Health Tip */}
        <div className="bg-success-50 rounded-2xl p-4 flex gap-4 items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-success-500 shrink-0 shadow-sm">
            <Zap size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-success-600 mb-0.5">स्वास्थ्य सुझाव</h4>
            <p className="text-xs text-slate-700 leading-snug">दिनमा प्रशस्त पानी पिउनुहोस्, यसले शरीरलाई स्वस्थ राख्छ।</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
