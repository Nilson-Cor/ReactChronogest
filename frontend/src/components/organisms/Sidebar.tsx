import React, { useState } from 'react';
import { Calendar, BookOpen, AlertCircle, Users, Home } from 'lucide-react';
import { UserRole } from '../../types';
import MenuItem from '../molecules/MenuItem';
import UserProfileCard from '../molecules/UserProfileCard';

interface SidebarProps {
  role: UserRole;
  activeMenu: string;
  onMenuClick: (menu: string) => void;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeMenu, onMenuClick, userName }) => {
  const [showProfile, setShowProfile] = useState(false);

  const menuItems = {
    instructor: [
      { id: 'horarios', label: 'Mis Horarios', icon: Calendar },
      { id: 'solicitar', label: 'Solicitar Cambio', icon: AlertCircle },
      { id: 'solicitudes', label: 'Mis Solicitudes', icon: BookOpen }
    ],
    aprendiz: [
      { id: 'horario', label: 'Mi Horario', icon: Calendar }
    ],
    admin: [
      { id: 'usuarios', label: 'Gestión de Usuarios', icon: Users },
      { id: 'centros', label: 'Gestión de Centros', icon: BookOpen },
      { id: 'fichas', label: 'Gestión de Fichas', icon: BookOpen },
      { id: 'horarios', label: 'Gestión de Horarios', icon: Calendar },
      { id: 'solicitudes', label: 'Solicitudes de Cambio', icon: AlertCircle },
      { id: 'programas', label: 'Gestión de Programas', icon: BookOpen },
      { id: 'ambientes', label: 'Gestión de Ambientes', icon: Home }
    ]
  };

  const items = menuItems[role];
  const sectionTitle = role === 'instructor' ? 'Instructor' : role === 'aprendiz' ? 'Aprendiz' : 'Administración';

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <UserProfileCard
        userName={userName}
        role={sectionTitle}
        showDetails={showProfile}
        onToggle={() => setShowProfile(!showProfile)}
      />

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">{sectionTitle}</h3>
        <nav className="space-y-1">
          {items.map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              active={activeMenu === item.id}
              onClick={onMenuClick}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;