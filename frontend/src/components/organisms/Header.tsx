import React from 'react';
import { Clock, LogOut } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <button 
          onClick={onGoHome}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Clock className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">CHRONOGEST</h1>
        </button>
        
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};

export default Header;