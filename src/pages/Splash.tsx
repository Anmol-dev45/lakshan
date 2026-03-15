import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to Language Selection or Home after 2 seconds
    const timer = setTimeout(() => {
      navigate('/home'); // For now, navigate directly to home to test
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* Centered Logo/Icon */}
      <div className="bg-primary-500 text-white p-8 rounded-full mb-8 shadow-float">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-16 h-16">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      
      {/* Texts */}
      <div className="text-center px-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
          नेपालका लागि एआई <br/> स्वास्थ्य सहायक
        </h1>
        <p className="text-slate-500 mb-12">AI Health Assistant for Nepal</p>
        
        {/* Features dots */}
        <div className="flex justify-center gap-6 text-sm font-medium text-slate-600 mb-16">
          <div className="flex flex-col items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>
            <span>निदान</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-success-500"></div>
            <span>आवाज</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
            <span>अफलाइन</span>
          </div>
        </div>
        
        {/* Loading indicatiors */}
        <div className="flex justify-center gap-2 mb-6 text-primary-500">
           <span className="w-2 h-2 rounded-full bg-primary-300 animate-pulse"></span>
           <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse delay-75"></span>
           <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse delay-150"></span>
        </div>
        
        <p className="text-slate-500 text-sm mb-6">प्रणाली लोड हुँदैछ...</p>
        
        <div className="text-xs text-slate-400 font-semibold tracking-wider">VERSION 1.0.0 | NEPAL</div>
        <p className="text-primary-400 text-sm mt-3 font-medium cursor-pointer" onClick={() => navigate('/home')}>
          अगाडि बढ्न यहाँ ट्याप गर्नुहोस्
        </p>
      </div>
    </div>
  );
};

export default Splash;
