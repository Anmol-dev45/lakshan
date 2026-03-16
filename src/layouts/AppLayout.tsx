
import { Outlet, NavLink } from 'react-router-dom';
import { Home, MapPin, Zap, History as HistoryIcon, Settings } from 'lucide-react';
import { useT } from '../i18n/useT';

const BottomNav = () => {
  const t = useT();
  const navItems = [
    { key: 'navHome'      as const, path: '/home',      icon: Home },
    { key: 'navHospital'  as const, path: '/hospital',  icon: MapPin },
    { key: 'navEmergency' as const, path: '/emergency', icon: Zap, badge: '9' },
    { key: 'navHistory'   as const, path: '/history',   icon: HistoryIcon },
    { key: 'navSettings'  as const, path: '/settings',  icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 px-2 py-2 flex justify-between items-center z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full py-1 text-xs font-medium transition-colors relative ${
                isActive ? 'text-primary-500' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative mb-1">
                  <Icon size={24} strokeWidth={1.5} className={isActive ? "stroke-primary-500" : ""} />
                 {item.badge && (
                    <span className="absolute -top-1 -right-2 bg-danger-500 text-white text-[10px] leading-tight font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{t(item.key)}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

const AppLayout = () => {
  return (
    <div className="pb-16 min-h-screen flex flex-col font-sans relative max-w-md mx-auto bg-white shadow-2xl overflow-hidden">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
