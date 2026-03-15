import Header from '../components/Header';
import { Search, MapPin, Navigation, Phone, Zap } from 'lucide-react';

const Hospital = () => {
  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      <Header title="नजिकैका अस्पताल" showProfile={false} />
      
      {/* Map Placeholder */}
      <div className="relative h-48 bg-slate-200">
        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Map" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex flex-col justify-end p-4">
          <div className="bg-white rounded-full flex items-center px-4 py-2 shadow-sm mb-[-2rem] relative z-10 mx-2">
            <Search size={20} className="text-slate-400 mr-2 shrink-0" />
            <input type="text" placeholder="अस्पताल खोज्नुहोस्..." className="w-full text-sm outline-none bg-transparent" />
          </div>
        </div>
      </div>
      
      <div className="px-4 mt-12 mb-4 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">तपाईंको नजिकका अस्पतालहरू</h2>
        <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full font-medium">३ फेला पर्यो</span>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Hospital Card 1 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-surface-100">
          <div className="flex gap-4 items-start mb-4">
            <img src="https://images.unsplash.com/photo-1582750433449-648ed127c0f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Bir Hospital" className="w-16 h-16 rounded-full object-cover object-top border-4 border-surface-50 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-800 mb-0.5">वीर अस्पताल (Bir Hospital)</h3>
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><MapPin size={12}/> काठमाडौँ</p>
              <div className="flex gap-2">
                <span className="text-[10px] font-medium bg-surface-100 text-slate-600 px-2 py-1 rounded-full">🚗 १.५ किमी</span>
                <span className="text-[10px] font-medium bg-success-50 text-success-600 px-2 py-1 rounded-full">⏱ १० मिनेट</span>
              </div>
            </div>
          </div>
          <button className="w-full bg-success-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-success-600 transition-colors">
            <Phone size={18} /> फोन गर्नुहोस्
          </button>
        </div>

        {/* Hospital Card 2 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-surface-100">
          <div className="flex gap-4 items-start mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-50 border-4 border-surface-50 flex items-center justify-center text-primary-300 shrink-0">
               <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-0.5 leading-tight">शिक्षण अस्पताल<br/><span className="text-sm font-medium">(Teaching Hospital)</span></h3>
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1 mt-1"><MapPin size={12}/> महाराजगञ्ज</p>
              <div className="flex gap-2">
                <span className="text-[10px] font-medium bg-surface-100 text-slate-600 px-2 py-1 rounded-full">🚗 ३.८ किमी</span>
                <span className="text-[10px] font-medium bg-success-50 text-success-600 px-2 py-1 rounded-full">⏱ २० मिनेट</span>
              </div>
            </div>
          </div>
          <button className="w-full bg-success-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-success-600 transition-colors">
            <Phone size={18} /> फोन गर्नुहोस्
          </button>
        </div>
        {/* Hospital Card 3 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-surface-100">
          <div className="flex gap-4 items-start mb-4">
            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Dhulikhel Hospital" className="w-16 h-16 rounded-full object-cover border-4 border-surface-50 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-800 mb-0.5">धुलिखेल अस्पताल</h3>
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><MapPin size={12}/> काभ्रेपलाञ्चोक</p>
              <div className="flex gap-2">
                <span className="text-[10px] font-medium bg-surface-100 text-slate-600 px-2 py-1 rounded-full">🚗 २८ किमी</span>
                <span className="text-[10px] font-medium bg-success-50 text-success-600 px-2 py-1 rounded-full">⏱ ५५ मिनेट</span>
              </div>
            </div>
          </div>
          <button className="w-full bg-success-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-success-600 transition-colors">
            <Phone size={18} /> फोन गर्नुहोस्
          </button>
        </div>
      </div>

      <div className="px-4 mt-6">
        <button className="w-full bg-white border border-surface-200 border-dashed text-slate-700 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-surface-100 transition-colors">
          <Navigation size={20} className="text-primary-500"/>
          <div className="text-left">
            <div className="font-bold text-sm">नक्सामा सबै हेर्नुहोस्</div>
            <div className="text-xs text-slate-500">तपाईंको लोकेसन अनुसार सबैभन्दा नजिकको बाटो</div>
          </div>
        </button>
      </div>

      {/* Floating Emergency Action Button placeholder for design matching */}
      <div className="fixed bottom-20 right-4 w-14 h-14 bg-danger-500 rounded-full flex items-center justify-center text-white shadow-float border-2 border-white cursor-pointer z-50">
        <Zap size={24} fill="currentColor" />
      </div>

    </div>
  );
};

export default Hospital;
