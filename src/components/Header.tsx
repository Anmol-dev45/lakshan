import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showProfile?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title = "AI स्वास्थ्य सहायक", showProfile = true }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-40 border-b border-surface-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-md">
          <Plus size={18} strokeWidth={3} />
        </div>
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
      </div>
      
      {showProfile && (
        <div className="w-10 h-10 rounded-full bg-surface-200 border-2 border-white shadow-sm flex items-center justify-center relative">
           <div className="w-6 h-6 rounded-full bg-white opacity-50"></div>
           <div className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></div>
        </div>
      )}
    </header>
  );
};

export default Header;
