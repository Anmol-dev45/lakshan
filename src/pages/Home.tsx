import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Mic, FileText, Pill, MapPin, AlertTriangle, ChevronRight, Zap, Radio } from 'lucide-react';
import { useT } from '../i18n/useT';

const Home = () => {
  const navigate = useNavigate();
  const t = useT();
  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />

      <div className="px-6 py-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">{t('homeGreeting')}</h1>
        <p className="text-slate-500 mb-6">{t('homeSubtitle')}</p>

        {/* Main AI CTA */}
        <div className="bg-primary-50 rounded-3xl p-6 mb-8 text-center relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center text-primary-600 gap-2 font-medium">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t('homeCheckSymptoms')}
            </div>
            <span className="bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full font-semibold">
              {t('homeAiActive')}
            </span>
          </div>

          <div
            onClick={() => navigate('/chat', { state: { autoMic: true } })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/chat', { state: { autoMic: true } })}
            className="w-24 h-24 mx-auto bg-primary-500 rounded-full flex items-center justify-center text-white mb-6 shadow-float relative z-10 cursor-pointer hover:scale-105 transition-transform"
          >
            <Mic size={40} />
            <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-20 pointer-events-none"></div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2 relative z-10">{t('homeSpeakTitle')}</h2>
          <p className="text-slate-500 text-sm mb-6 relative z-10">{t('homeSpeakSub')}</p>

          <button
            onClick={() => navigate('/chat', { state: { autoMic: true } })}
            className="w-full bg-white border border-primary-200 text-primary-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors shadow-sm relative z-10"
          >
            {t('homeStartCheck')} <ChevronRight size={18} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-4">{t('homeFeatures')}</h3>

        {/* Live AI Doctor — full-width featured card */}
        <div
          onClick={() => navigate('/live')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/live')}
          className="w-full bg-gradient-to-r from-rose-500 to-primary-600 rounded-2xl p-4 mb-4 flex items-center gap-4 cursor-pointer shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Radio size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm">{t('homeLiveVoice')}</h4>
            <p className="text-white/80 text-xs truncate">{t('homeLiveVoiceSub')}</p>
          </div>
          <ChevronRight size={18} className="text-white/70 shrink-0" />
        </div>

        {/* Grid of features */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div onClick={() => navigate('/report-scan')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/report-scan')} className="bg-white border border-surface-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center text-success-500 mb-4">
              <FileText size={24} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{t('homeReportScan')}</h4>
            <p className="text-xs text-slate-500">{t('homeReportScanSub')}</p>
          </div>

          <div onClick={() => navigate('/medicine')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/medicine')} className="bg-white border border-surface-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mb-4">
              <Pill size={24} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{t('homeMedicine')}</h4>
            <p className="text-xs text-slate-500">{t('homeMedicineSub')}</p>
          </div>

          <div onClick={() => navigate('/hospital')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/hospital')} className="bg-white border border-surface-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">
              <MapPin size={24} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{t('homeHospital')}</h4>
            <p className="text-xs text-slate-500">{t('homeHospitalSub')}</p>
          </div>

          <div onClick={() => navigate('/disease-map')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/disease-map')} className="bg-white border border-surface-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-danger-50 rounded-xl flex items-center justify-center text-danger-500 mb-4">
              <AlertTriangle size={24} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{t('homeDiseaseAlert')}</h4>
            <p className="text-xs text-slate-500">{t('homeDiseaseAlertSub')}</p>
          </div>
        </div>

        {/* Health Tip */}
        <div className="bg-success-50 rounded-2xl p-4 flex gap-4 items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-success-500 shrink-0 shadow-sm">
            <Zap size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-success-600 mb-0.5">{t('homeTipTitle')}</h4>
            <p className="text-xs text-slate-700 leading-snug">{t('homeTipBody')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
