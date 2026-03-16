import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Search, MapPin, Navigation, Phone, Zap, LocateFixed } from 'lucide-react';
import { useT } from '../i18n/useT';

interface HospitalInfo {
  id: string;
  name: string;
  area: string;
  phone: string;
  lat: number;
  lng: number;
  image?: string;
}

const HOSPITALS: HospitalInfo[] = [
  {
    id: 'bir',
    name: 'वीर अस्पताल (Bir Hospital)',
    area: 'काठमाडौँ',
    phone: '014220198',
    lat: 27.7047,
    lng: 85.3147,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127c0f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'teaching',
    name: 'शिक्षण अस्पताल (Teaching Hospital)',
    area: 'महाराजगञ्ज',
    phone: '014411230',
    lat: 27.7366,
    lng: 85.3315,
  },
  {
    id: 'dhulikhel',
    name: 'धुलिखेल अस्पताल',
    area: 'काभ्रेपलाञ्चोक',
    phone: '011490497',
    lat: 27.6221,
    lng: 85.5447,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  },
];

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((aLat * Math.PI) / 180) *
    Math.cos((bLat * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

const Hospital = () => {
  const t = useT();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  function requestLocation() {
    if (!navigator.geolocation) {
      alert('यो browser मा location support छैन।');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Location अनुमति दिनुहोस् ताकि नजिकको अस्पताल देखाउन सकियोस्।');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  const hospitals = useMemo(() => {
    const filtered = HOSPITALS.filter((h) =>
      `${h.name} ${h.area}`.toLowerCase().includes(query.trim().toLowerCase()),
    );

    return filtered
      .map((h) => ({
        ...h,
        distanceKm: userPos ? haversineKm(userPos.lat, userPos.lng, h.lat, h.lng) : null,
      }))
      .sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
  }, [query, userPos]);

  function callHospital(phone: string) {
    window.location.href = `tel:${phone}`;
  }

  function openDirections(h: HospitalInfo) {
    const origin = userPos ? `&origin=${userPos.lat},${userPos.lng}` : '';
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}${origin}`, '_blank', 'noopener,noreferrer');
  }

  function openAllInMap() {
    const base = userPos
      ? `https://www.google.com/maps/search/hospital/@${userPos.lat},${userPos.lng},14z`
      : 'https://www.google.com/maps/search/hospital+near+Kathmandu';
    window.open(base, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      <Header title={t('hospitalTitle')} showProfile={false} />

      {/* Map Placeholder */}
      <div className="relative h-48 bg-slate-200">
        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Map" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex flex-col justify-end p-4">
          <div className="bg-white rounded-full flex items-center px-4 py-2 shadow-sm mb-[-2rem] relative z-10 mx-2">
            <Search size={20} className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('hospitalSearch')}
              className="w-full text-sm outline-none bg-transparent"
            />
            <button
              onClick={requestLocation}
              className="ml-2 text-primary-600 hover:text-primary-700 transition-colors"
              title="Use my location"
            >
              <LocateFixed size={18} className={locating ? 'animate-pulse' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-12 mb-4 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">{t('hospitalNearby')}</h2>
        <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full font-medium">{hospitals.length} फेला पर्यो</span>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {hospitals.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 border border-surface-200 text-sm text-slate-600 text-center">
            खोजसँग मिल्ने अस्पताल फेला परेन।
          </div>
        ) : hospitals.map((h) => (
          <div key={h.id} className="bg-white rounded-2xl p-4 shadow-sm border border-surface-100">
            <div className="flex gap-4 items-start mb-4">
              {h.image ? (
                <img src={h.image} alt={h.name} className="w-16 h-16 rounded-full object-cover border-4 border-surface-50 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-50 border-4 border-surface-50 flex items-center justify-center text-primary-300 shrink-0">
                  <MapPin size={26} />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-slate-800 mb-0.5 leading-tight">{h.name}</h3>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><MapPin size={12} /> {h.area}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-[10px] font-medium bg-surface-100 text-slate-600 px-2 py-1 rounded-full">
                    🚗 {h.distanceKm === null ? '—' : `${h.distanceKm.toFixed(1)} किमी`}
                  </span>
                  <span className="text-[10px] font-medium bg-success-50 text-success-600 px-2 py-1 rounded-full">
                    📞 {h.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => callHospital(h.phone)}
                className="bg-success-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-success-600 transition-colors"
              >
                <Phone size={16} /> {t('hospitalCall')}
              </button>
              <button
                onClick={() => openDirections(h)}
                className="bg-primary-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors"
              >
                <Navigation size={16} /> बाटो
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-6">
        <button
          onClick={openAllInMap}
          className="w-full bg-white border border-surface-200 border-dashed text-slate-700 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-surface-100 transition-colors"
        >
          <Navigation size={20} className="text-primary-500" />
          <div className="text-left">
            <div className="font-bold text-sm">नक्सामा सबै हेर्नुहोस्</div>
            <div className="text-xs text-slate-500">तपाईंको लोकेसन अनुसार सबैभन्दा नजिकको बाटो</div>
          </div>
        </button>
      </div>

      <div
        onClick={() => navigate('/emergency')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-danger-500 rounded-full flex items-center justify-center text-white shadow-float border-2 border-white cursor-pointer z-50"
        title="Emergency"
      >
        <Zap size={24} fill="currentColor" />
      </div>

    </div>
  );
};

export default Hospital;
