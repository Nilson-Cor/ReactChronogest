import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'admin' | 'instructor' | 'aprendiz' | 'default' | 'sistema' | 'registrado';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const variants = {
    admin: 'bg-purple-100 text-purple-700',
    instructor: 'bg-blue-100 text-blue-700',
    aprendiz: 'bg-green-100 text-green-700',
    sistema: 'bg-gray-100 text-gray-700',
    registrado: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-100 text-gray-700'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;