import { useState } from 'react';
import Header from '../components/Header';
import { PhoneCall, Navigation, AlertCircle, Flame, Scissors, Activity, UserMinus } from 'lucide-react';
import { useT } from '../i18n/useT';

const EMERGENCY_NUMBER = '102';

const FIRST_AID_GUIDES = [
  {
    key: 'burn',
    titleKey: 'emergencyBurn' as const,
    icon: Flame,
    iconColor: 'text-danger-500',
    summary: 'चिसो पानी हाल्नुहोस् र घाउलाई सफा कपडाले छोप्नुहोस्।',
    details: [
      'पोलेको भागमा 10-20 मिनेट चिसो पानी बगाउनुहोस्।',
      'बर्फ सिधै नलगाउनुहोस्।',
      'घाउमा तेल, मल्हम, टूथपेस्ट नलगाउनुहोस्।',
      'सफा कपडाले हल्का छोपेर अस्पताल जानुहोस्।',
    ],
  },
  {
    key: 'bleeding',
    titleKey: 'emergencyBleeding' as const,
    icon: Scissors,
    iconColor: 'text-primary-500',
    summary: 'घाउमा सफा कपडाले जोडले थिच्नुहोस् र रगत रोक्नुहोस्।',
    details: [
      'सफा कपडा/पट्टीले घाउमा निरन्तर दबाब दिनुहोस्।',
      'हात/खुट्टा घाइते भए सम्भव भएसम्म माथि उठाउनुहोस्।',
      'पट्टी भिजे पनि हटाउनु हुँदैन; माथिबाट अर्को थप्नुहोस्।',
      'रगत धेरै बगेमा तुरुन्त एम्बुलेन्स बोलाउनुहोस्।',
    ],
  },
  {
    key: 'unconscious',
    titleKey: 'emergencyUnconscious' as const,
    icon: Activity,
    iconColor: 'text-success-500',
    summary: 'बिरामीलाई समतल ठाउँमा सुताउनुहोस् र खुट्टा अलि माथि राख्नुहोस्।',
    details: [
      'सास फेरेको छ कि छैन जाँच गर्नुहोस्।',
      'टाइट कपडा खुकुलो बनाउनुहोस्।',
      'बिरामी होसमा नआएसम्म पानी/खाना नदिनुहोस्।',
      'सास छैन भने CPR जान्ने व्यक्तिले सुरु गर्नुपर्छ।',
    ],
  },
  {
    key: 'snake',
    titleKey: 'emergencySnakeBite' as const,
    icon: UserMinus,
    iconColor: 'text-slate-800',
    summary: 'टोकेको भागलाई हलचल नगर्नुहोस् र अस्पताल लैजानुहोस्।',
    details: [
      'बिरामीलाई शान्त राख्नुहोस् र कम चलाउनुहोस्।',
      'टोकेको भागमा कसिलो बाँध्ने, काट्ने वा चुस्ने काम नगर्नुहोस्।',
      'सम्भव भए टोकेको समय याद गर्नुहोस्।',
      'तुरुन्त नजिकको अस्पताल/सर्पदंश उपचार केन्द्र जानुहोस्।',
    ],
  },
];

const Emergency = () => {
  const t = useT();
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [sharingLocation, setSharingLocation] = useState(false);

  function triggerSOS() {
    const ok = window.confirm('तुरुन्त आपतकालीन सेवामा फोन गर्ने?');
    if (!ok) return;
    window.location.href = `tel:${EMERGENCY_NUMBER}`;
  }

  function handleShareLocation() {
    if (!navigator.geolocation) {
      alert('यो browser मा location support छैन।');
      return;
    }

    setSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setSharingLocation(false);
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
        const shareText = `Emergency location: ${lat}, ${lng}\n${mapUrl}`;

        try {
          if (navigator.share) {
            await navigator.share({ text: shareText });
            return;
          }
          await navigator.clipboard.writeText(shareText);
          alert('Location copy भयो। अब परिवार/अस्पताललाई send गर्नुहोस्।');
        } catch {
          window.open(mapUrl, '_blank', 'noopener,noreferrer');
        }
      },
      () => {
        setSharingLocation(false);
        alert('Location पाउन सकेन। GPS on गरी फेरि प्रयास गर्नुहोस्।');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title={t('emergencyTitle')} showProfile={false} />

      <div className="px-6 py-6 flex flex-col items-center">

        {/* SOS Button */}
        <div className="w-56 h-56 rounded-full bg-danger-50 flex items-center justify-center mb-6 relative">
          <div className="w-48 h-48 rounded-full bg-danger-100 flex items-center justify-center absolute"></div>
          <button
            onClick={triggerSOS}
            className="w-40 h-40 rounded-full bg-danger-500 text-white flex flex-col items-center justify-center shadow-[0_10px_40px_-10px_rgba(239,68,68,0.7)] z-10 hover:scale-105 transition-transform"
          >
            <PhoneCall size={48} className="mb-2" />
            <span className="text-xl font-bold">{t('emergencySOS')}</span>
          </button>
        </div>

        <p className="text-slate-500 text-center mb-8 px-4 leading-relaxed">
          तुरुन्त मद्दतको लागि माथिको बटन थिच्नुहोस्।
        </p>

        {/* GPS Option */}
        <div
          onClick={handleShareLocation}
          className="w-full bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-center justify-between mb-8 cursor-pointer hover:bg-primary-100 transition-colors"
        >
          <div>
            <h3 className="font-bold text-primary-600 mb-1">{t('emergencyGPS')}</h3>
            <p className="text-xs text-slate-500">
              {sharingLocation ? 'Location निकाल्दै छ...' : 'आफ्नो लोकेसन परिवारलाई पठाउनुहोस्।'}
            </p>
          </div>
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
            <Navigation size={20} className="ml-[-2px] mt-[2px]" />
          </div>
        </div>

        {/* First Aid Section */}
        <div className="w-full">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle size={20} /> {t('emergencyFirstAid')}
          </h2>

          <div className="space-y-4">
            {FIRST_AID_GUIDES.map((guide) => {
              const Icon = guide.icon;
              const isOpen = activeGuide === guide.key;
              return (
                <div
                  key={guide.key}
                  onClick={() => setActiveGuide(isOpen ? null : guide.key)}
                  className="bg-white border border-surface-200 rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <div className={`w-12 h-12 bg-surface-50 rounded-xl flex items-center justify-center ${guide.iconColor} shrink-0`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-800">{t(guide.titleKey)}</h3>
                      <span className="text-[10px] bg-surface-100 text-slate-600 px-2 py-0.5 rounded-full border border-surface-200">{isOpen ? 'लुकाउनुहोस्' : 'मद्दत'}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">{guide.summary}</p>

                    {isOpen && (
                      <ul className="mt-2.5 space-y-1.5">
                        {guide.details.map((d) => (
                          <li key={d} className="text-xs text-slate-700 leading-snug">• {d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
