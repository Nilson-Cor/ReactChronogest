import React from 'react';
import { Users } from 'lucide-react';

interface UserProfileCardProps {
  userName: string;
  role: string;
  showDetails?: boolean;
  onToggle?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  userName, 
  role, 
  showDetails = false, 
  onToggle 
}) => {
  return (
    <div className="mb-8 pb-6 border-b border-gray-200">
      <button 
        onClick={onToggle}
        className="w-full text-left hover:bg-gray-50 p-3 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
            <Users className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">{userName}</p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
      </button>

      {showDetails && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
          <p className="font-semibold text-gray-800 mb-2">Información de Usuario</p>
          <div className="space-y-1 text-gray-600">
            <p><strong>Nombre:</strong> {userName}</p>
            <p><strong>Centro:</strong> Yamboro</p>
            <p><strong>Estado:</strong> Activo</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;