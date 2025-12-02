import React from 'react';
import Icon from '../atoms/Icon';

interface MenuItemProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: (id: string) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ id, label, icon, active, onClick }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        active ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon icon={icon} size="md" />
      <span className="text-sm">{label}</span>
    </button>
  );
};

export default MenuItem;