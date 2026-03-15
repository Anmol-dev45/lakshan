import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Globe, Mic, Volume2, UserPlus, Trash2, Zap, LogOut, Settings as SettingsIcon, Phone, Key, CheckCircle, Eye, EyeOff, User } from 'lucide-react';
import { getStoredApiKey, saveApiKey } from '../services/aiService';
import { signOut } from '../services/authService';
import { useAppSelector, useAppDispatch } from '../hooks/useStore';
import { setLanguage } from '../store/slices/settingsSlice';
import { useT } from '../i18n/useT';

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
  const lang = useAppSelector((s) => s.settings.language);
  const t = useT();
  const [voiceInput, setVoiceInput] = useState(true);
  const [aiVoice, setAiVoice] = useState(true);
  const [offline, setOffline] = useState(false);
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  function handleSaveKey() {
    saveApiKey(apiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      <Header title={t('settingsTitle')} showProfile={false} />

      <div className="px-6 py-4 space-y-6">

        {/* User Profile Card */}
        {authUser && (
          <section>
            <div className="bg-white rounded-2xl p-4 border border-surface-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <User size={24} className="text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                {authUser.name && (
                  <h3 className="font-bold text-slate-800 text-sm truncate">{authUser.name}</h3>
                )}
                <p className="text-xs text-slate-500 truncate">{authUser.email}</p>
              </div>
            </div>
          </section>
        )}

        {/* Language */}
        <section>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Globe className="text-primary-500" size={18} /> {t('settingsLang')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => dispatch(setLanguage('ne'))}
              className={`py-3 rounded-xl border flex flex-col items-center justify-center transition-colors ${lang === 'ne' ? 'bg-primary-500 border-primary-500 text-white shadow-md' : 'bg-white border-surface-200 text-slate-600'}`}>
              <span className="font-bold">{t('settingsNepali')}</span>
              <span className={`text-[10px] ${lang === 'ne' ? 'text-primary-100' : 'text-slate-400'}`}>
                {lang === 'ne' ? t('settingsActive') : t('settingsChangeNe')}
              </span>
            </button>
            <button
              onClick={() => dispatch(setLanguage('en'))}
              className={`py-3 rounded-xl border flex flex-col items-center justify-center transition-colors ${lang === 'en' ? 'bg-primary-500 border-primary-500 text-white shadow-md' : 'bg-white border-surface-200 text-slate-600'}`}>
              <span className="font-bold">{t('settingsEnglish')}</span>
              <span className={`text-[10px] ${lang === 'en' ? 'text-primary-100' : 'text-slate-400'}`}>
                {lang === 'en' ? t('settingsActive') : t('settingsChangeEn')}
              </span>
            </button>
          </div>
        </section>

        {/* Voice Settings */}
        <section>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Volume2 className="text-primary-500" size={18} /> {t('settingsVoice')}
          </h2>
          <div className="bg-primary-50 rounded-2xl p-4 mb-3 border border-primary-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-500 shrink-0">
                <Mic size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{t('settingsVoiceIn')}</h3>
                <p className="text-xs text-slate-500">{t('settingsVoiceInSub')}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${voiceInput ? 'bg-primary-500' : 'bg-surface-300'}`} onClick={() => setVoiceInput(!voiceInput)}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${voiceInput ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-50 rounded-full flex items-center justify-center text-slate-500 shrink-0 border border-surface-200">
                <Volume2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{t('settingsAiVoice')}</h3>
                <p className="text-xs text-slate-500">{t('settingsAiVoiceSub')}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${aiVoice ? 'bg-primary-500' : 'bg-surface-300'}`} onClick={() => setAiVoice(!aiVoice)}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${aiVoice ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </section>

        {/* Emergency Contacts */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Zap className="text-danger-500" size={18} /> {t('settingsEmergency')}
            </h2>
            <button className="text-xs bg-surface-100 text-slate-600 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
              {t('settingsAddContact')}
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-3 border border-surface-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&w=100&q=80" alt="Person" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">राम बहादुर</h3>
                  <p className="text-xs text-slate-500">छोरा • ९८४१******</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full border border-danger-200 text-danger-500 flex items-center justify-center hover:bg-danger-50">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-surface-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&w=100&q=80" alt="Person" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">सीता कुमारी</h3>
                  <p className="text-xs text-slate-500">श्रीमती • ९८०३******</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full border border-danger-200 text-danger-500 flex items-center justify-center hover:bg-danger-50">
                <Trash2 size={14} />
              </button>
            </div>

            <button className="w-full bg-white border border-primary-200 border-dashed text-primary-500 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-primary-50">
              <UserPlus size={16} /> {t('settingsNewContact')}
            </button>
          </div>
        </section>

        {/* AI API Key */}
        <section>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Key className="text-primary-500" size={18} /> {t('settingsApiKey')}
          </h2>
          <div className="bg-white rounded-2xl p-4 border border-surface-200 shadow-sm">
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              {t('settingsApiNote')}
            </p>
            <div className="relative mb-3">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="sk-ant-api03-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-surface-50 border border-surface-200 rounded-xl py-3 pl-4 pr-10 text-xs font-mono text-slate-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              onClick={handleSaveKey}
              className={`w-full font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors ${keySaved
                  ? 'bg-success-500 text-white'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
            >
              {keySaved ? <><CheckCircle size={16} /> {t('settingsKeySaved')}</> : <><Key size={16} /> {t('settingsSaveKey')}</>}
            </button>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              {t('settingsKeyNote')}
            </p>
          </div>
        </section>

        {/* Other Options */}
        <section>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <SettingsIcon size={18} className="text-slate-500" /> {t('settingsOther')}
          </h2>

          <div className="bg-white rounded-2xl p-4 mb-3 border border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-50 rounded-full flex items-center justify-center text-slate-600 shrink-0 border border-surface-200">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{t('settingsOffline')}</h3>
                <p className="text-xs text-slate-500">{t('settingsOfflineSub')}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${offline ? 'bg-primary-500' : 'bg-surface-300'}`} onClick={() => setOffline(!offline)}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${offline ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>

          <div className="bg-surface-100 rounded-xl p-4 mb-4 text-center cursor-pointer text-sm font-bold text-slate-700">
            {t('settingsAbout')}
          </div>

          <button onClick={handleSignOut} className="w-full bg-danger-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-sm">
            <LogOut size={18} /> {t('settingsLogout')}
          </button>
        </section>

        <div className="text-center pb-8 pt-4">
          <span className="text-[10px] font-medium text-slate-500 bg-surface-100 px-3 py-1 rounded-full border border-surface-200">Version 2.0.4 (AI Powered)</span>
          <p className="text-xs text-slate-400 mt-2">{t('settingsVersion')}</p>
        </div>

      </div>

      {/* Floating Emergency Action Button placeholder for design matching */}
      <div className="fixed bottom-20 right-4 w-14 h-14 bg-danger-400 opacity-50 rounded-full flex items-center justify-center text-white shadow-float border-2 border-white pointer-events-none z-50">
        <Phone size={24} fill="currentColor" />
      </div>
    </div>
  );
};

export default Settings;
