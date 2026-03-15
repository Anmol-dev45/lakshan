import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { signIn, signUp } from '../services/authService';
import { useAppDispatch } from '../hooks/useStore';
import { setAuthError, clearAuthError } from '../store/slices/authSlice';
import { useT } from '../i18n/useT';

type Mode = 'signin' | 'signup';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const t = useT();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function switchMode(m: Mode) {
    setMode(m);
    setLocalError(null);
    setSuccessMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);
    dispatch(clearAuthError());
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        // onAuthStateChange in App.tsx will update Redux + navigate
      } else {
        const { user } = await signUp(email, password, fullName);
        if (user?.identities?.length === 0) {
          setLocalError(t('errEmailTaken'));
        } else {
          setSuccessMsg(t('msgSignupOk'));
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('errUnknown');
      setLocalError(
        msg.includes('Invalid login credentials') ? t('errBadCredentials') :
          msg.includes('Email not confirmed') ? t('errEmailUnconfirmed') :
            msg.includes('Password') ? t('errWeakPassword') : msg,
      );
      dispatch(setAuthError(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-success-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl shadow-primary-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{t('loginBrand')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('loginBrandSub')}</p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-surface-100 rounded-2xl p-1 mb-5">
          <button
            onClick={() => switchMode('signin')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'signin' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'}`}
          >
            {t('loginTab')}
          </button>
          <button
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'signup' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'}`}
          >
            {t('signupTab')}
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-surface-100 mb-5">
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">{t('labelFullName')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserPlus size={17} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={t('phFullName')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">{t('labelEmail')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={17} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">{t('labelPassword')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={17} className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('phPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {localError && (
              <div className="flex gap-2 items-start bg-danger-50 border border-danger-200 rounded-xl px-3 py-2.5">
                <AlertCircle size={15} className="text-danger-500 shrink-0 mt-0.5" />
                <p className="text-xs text-danger-700">{localError}</p>
              </div>
            )}
            {successMsg && (
              <div className="flex gap-2 items-start bg-success-50 border border-success-200 rounded-xl px-3 py-2.5">
                <CheckCircle size={15} className="text-success-500 shrink-0 mt-0.5" />
                <p className="text-xs text-success-700">{successMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-1 shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-colors disabled:opacity-60"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>{mode === 'signin' ? t('btnLogin') : t('btnSignup')} <ArrowRight size={18} /></>
              }
            </button>
          </form>

          {mode === 'signin' && (
            <>
              <div className="mt-5 mb-4 relative flex items-center justify-center">
                <div className="border-t border-surface-200 w-full absolute" />
                <span className="bg-white px-3 text-xs text-slate-400 font-medium relative z-10">{t('loginOr')}</span>
              </div>
              <button
                onClick={() => navigate('/home')}
                className="w-full bg-surface-50 border border-surface-200 text-slate-600 font-semibold py-3 rounded-2xl text-sm hover:bg-surface-100 transition-colors"
              >
                {t('loginDemo')}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-500">
          {t('loginPrivacy')}{' '}
          <span className="text-slate-400">{t('loginPrivacySub')}</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
