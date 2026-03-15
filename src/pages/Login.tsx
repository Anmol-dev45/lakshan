import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-success-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

      <div className="w-full max-w-sm relative z-10">
        
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-primary-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">स्वस्थ जीवन</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">तपाईंको स्वास्थ्य, हाम्रो प्राथमिकता</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-surface-100 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">सहज पहुँच - लगइन</h2>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/home'); }}>
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">इमेल वा फोन नम्बर</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="example@email.com" 
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-medium text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">पासवर्ड</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-12 py-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-medium mb-1 text-slate-800"
                  required
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <a href="#" className="text-xs font-bold text-primary-500 hover:text-primary-600">पासवर्ड भुल्नुभयो?</a>
              </div>
            </div>

            <button type="submit" className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-colors">
              लगइन गर्नुहोस् <ArrowRight size={18} />
            </button>
          </form>
          
           {/* Divider */}
           <div className="mt-6 mb-6 relative flex items-center justify-center">
             <div className="border-t border-surface-200 w-full absolute"></div>
             <span className="bg-white px-3 text-xs text-slate-400 font-medium relative z-10">वा</span>
           </div>

           <button className="w-full bg-surface-50 border border-surface-200 text-slate-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-surface-100 transition-colors">
              <img src="https://ucarecdn.com/8f25a2ba-bd31-4ec4-aa70-fafea150aee0/googlelogo.svg" alt="Google" className="w-5 h-5"/>
              गुगलबाट लगइन
           </button>

        </div>

        {/* Register Prompt */}
        <p className="text-center text-sm font-medium text-slate-600">
          खाता छैन? <a href="#" className="text-primary-500 font-bold hover:underline">यहाँ दर्ता गर्नुहोस्</a>
        </p>

      </div>
    </div>
  );
};

export default Login;
